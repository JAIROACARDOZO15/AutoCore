import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AutoCoreSidebar from '../components/AutoCoreSidebar'
import {
  obtenerClientePorUsuario,
  obtenerEquipos,
  obtenerReparaciones,
  obtenerCotizaciones
} from '../services/api'
import './EstadoVehiculo.css'

const pasos = [
  'Recibido',
  'Diagnóstico',
  'Cotización',
  'En reparación',
  'Listo para recoger',
  'Entregado'
]

const pasoPorEstado = {
  RECIBIDO: 0,
  EN_DIAGNOSTICO: 1,
  COTIZACION_PENDIENTE: 2,
  ESPERANDO_APROBACION: 2,
  EN_REPARACION: 3,
  FINALIZADA: 4,
  ENTREGADO: 5
}

const etiquetaEstado = {
  RECIBIDO: 'Recibido en el taller',
  EN_DIAGNOSTICO: 'En diagnóstico',
  COTIZACION_PENDIENTE: 'Preparando cotización',
  ESPERANDO_APROBACION: 'Esperando tu aprobación',
  EN_REPARACION: 'En reparación',
  FINALIZADA: 'Listo para recoger',
  ENTREGADO: 'Vehículo entregado',
  RECHAZADO: 'Servicio detenido'
}

const dinero = valor => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
}).format(Number(valor || 0))

const fecha = valor => {
  if (!valor) return 'Pendiente'
  const parsed = new Date(valor)
  return Number.isNaN(parsed.getTime())
    ? 'Pendiente'
    : parsed.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

const fechaHora = valor => {
  if (!valor) return 'Hora no disponible'
  const parsed = new Date(valor)
  return Number.isNaN(parsed.getTime())
    ? 'Hora no disponible'
    : parsed.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    })
}

function construirHistorial(reparacion, cotizacion) {
  const historial = [...(reparacion.historial || [])]
  const tipos = new Set(historial.map(evento => evento.tipo))
  const agregarEventoAnterior = (tipo, fechaEvento, descripcion) => {
    if (fechaEvento && !tipos.has(tipo)) {
      historial.push({
        tipo,
        fecha: fechaEvento,
        descripcion,
        actorNombre: 'Autor no registrado',
        actorRol: 'Actividad anterior al historial'
      })
    }
  }

  agregarEventoAnterior('REPARACION_CREADA', reparacion.fechaIngreso, 'Vehículo recibido y reparación registrada.')
  agregarEventoAnterior('DIAGNOSTICO_REGISTRADO', reparacion.diagnostico?.fechaDiagnostico,
    'El taller registró el diagnóstico del vehículo.')
  agregarEventoAnterior('COTIZACION_ENVIADA', cotizacion?.fechaCotizacion,
    `Cotización${cotizacion?.id ? ` #${cotizacion.id}` : ''} enviada para revisión.`)
  if (cotizacion?.aprobada != null) {
    agregarEventoAnterior(
      cotizacion.aprobada ? 'COTIZACION_APROBADA' : 'COTIZACION_RECHAZADA',
      cotizacion.fechaRespuesta,
      `El cliente ${cotizacion.aprobada ? 'aprobó' : 'rechazó'} la cotización${cotizacion.id ? ` #${cotizacion.id}` : ''}.`
    )
  }
  agregarEventoAnterior('VEHICULO_ENTREGADO', reparacion.fechaEntrega, 'Vehículo entregado al cliente.')

  return historial.sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0))
}

function EstadoVehiculo() {
  const navigate = useNavigate()
  const [vehiculos, setVehiculos] = useState([])
  const [reparaciones, setReparaciones] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState('TODOS')
  const [usuario, setUsuario] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarEstado() {
      try {
        const guardado = localStorage.getItem('usuario')
        if (!guardado) {
          navigate('/')
          return
        }

        const usuarioActual = JSON.parse(guardado)
        if (String(usuarioActual?.rol || '').toUpperCase() !== 'CLIENTE') {
          navigate('/dashboard')
          return
        }
        if (!usuarioActual.id) {
          throw new Error('No se encontró el usuario de la sesión. Cierra sesión e ingresa de nuevo.')
        }

        if (activo) setUsuario(usuarioActual)
        const cliente = await obtenerClientePorUsuario(usuarioActual.id)
        const [equipos, todasReparaciones, todasCotizaciones] = await Promise.all([
          obtenerEquipos(),
          obtenerReparaciones(),
          obtenerCotizaciones()
        ])

        if (!activo) return

        const misVehiculos = (equipos || []).filter(equipo =>
          Number(equipo.clienteId ?? equipo.cliente?.id) === Number(cliente.id)
        )
        const idsVehiculos = new Set(misVehiculos.map(equipo => Number(equipo.id)))
        const misReparaciones = (todasReparaciones || []).filter(reparacion => {
          const equipoId = reparacion.equipoId ?? reparacion.equipo?.id
          return equipoId != null && idsVehiculos.has(Number(equipoId))
        }).sort((a, b) => new Date(b.fechaIngreso || 0) - new Date(a.fechaIngreso || 0))
        const idsReparaciones = new Set(misReparaciones.map(reparacion => Number(reparacion.id)))
        const misCotizaciones = (todasCotizaciones || []).filter(cotizacion =>
          idsReparaciones.has(Number(cotizacion.reparacionId ?? cotizacion.reparacion?.id))
        )

        setVehiculos(misVehiculos)
        setReparaciones(misReparaciones)
        setCotizaciones(misCotizaciones)
      } catch (e) {
        if (activo) setError(e.message || 'No se pudo consultar el estado de tus vehículos.')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarEstado()
    return () => { activo = false }
  }, [navigate])

  const vehiculosPorId = useMemo(() => new Map(
    vehiculos.map(vehiculo => [Number(vehiculo.id), vehiculo])
  ), [vehiculos])

  const reparacionesVisibles = useMemo(() => reparaciones.filter(reparacion => {
    if (vehiculoSeleccionado === 'TODOS') return true
    return Number(reparacion.equipoId ?? reparacion.equipo?.id) === Number(vehiculoSeleccionado)
  }), [reparaciones, vehiculoSeleccionado])

  const cotizacionPorReparacion = useMemo(() => {
    const mapa = new Map()
    cotizaciones.forEach(cotizacion => {
      const reparacionId = Number(cotizacion.reparacionId ?? cotizacion.reparacion?.id)
      const existente = mapa.get(reparacionId)
      if (!existente || new Date(cotizacion.fechaCotizacion || 0) > new Date(existente.fechaCotizacion || 0)) {
        mapa.set(reparacionId, cotizacion)
      }
    })
    return mapa
  }, [cotizaciones])

  const activas = reparaciones.filter(reparacion =>
    !['FINALIZADA', 'ENTREGADO', 'RECHAZADO'].includes(String(reparacion.estado).toUpperCase())
  ).length
  const pendientes = cotizaciones.filter(cotizacion => cotizacion.aprobada == null).length
  const listas = reparaciones.filter(reparacion => reparacion.estado === 'FINALIZADA').length

  const nombreUsuario = usuario.nombre || usuario.email || 'Cliente'

  return (
    <div className="client-dashboard vehicle-status-page">
      <AutoCoreSidebar active="vehicleStatus" />

      <main className="client-main vehicle-status-main">
        <header className="client-header">
          <div>
            <span className="client-header-label">PORTAL DEL CLIENTE</span>
            <h1>Estado de mi vehículo</h1>
            <p>Consulta el avance del taller, el diagnóstico y las cotizaciones de tus vehículos.</p>
          </div>
          <div className="client-user">
            <div className="client-avatar">{nombreUsuario.charAt(0).toUpperCase()}</div>
            <div className="client-user-info">
              <strong>{nombreUsuario}</strong>
              <small>CLIENTE</small>
            </div>
          </div>
        </header>

        <section className="vehicle-status-hero">
          <div className="vehicle-status-hero-copy">
            <span>SEGUIMIENTO DEL TALLER</span>
            <h2>Tu vehículo, siempre al tanto.</h2>
            <p>Revisa en qué etapa está cada servicio y qué información ha registrado el equipo del taller.</p>
          </div>
          <div className="vehicle-status-hero-art" aria-hidden="true">🚘</div>
        </section>

        {cargando ? (
          <section className="vehicle-status-message" aria-live="polite">
            <span className="vehicle-status-spinner" />
            <strong>Cargando el estado de tus vehículos…</strong>
          </section>
        ) : error ? (
          <section className="vehicle-status-message vehicle-status-error" role="alert">
            <strong>No se pudo cargar la información</strong>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>Intentar de nuevo</button>
          </section>
        ) : (
          <>
            <section className="vehicle-status-stats" aria-label="Resumen de servicios">
              <article><span>Vehículos</span><strong>{vehiculos.length}</strong><small>En tu cuenta</small></article>
              <article><span>En proceso</span><strong>{activas}</strong><small>En atención del taller</small></article>
              <article><span>Cotizaciones</span><strong>{pendientes}</strong><small>Pendientes de respuesta</small></article>
              <article><span>Listos para recoger</span><strong>{listas}</strong><small>Esperando entrega</small></article>
            </section>

            {vehiculos.length > 0 && (
              <nav className="vehicle-status-filters" aria-label="Filtrar por vehículo">
                <button
                  type="button"
                  className={vehiculoSeleccionado === 'TODOS' ? 'selected' : ''}
                  onClick={() => setVehiculoSeleccionado('TODOS')}
                >Todos mis vehículos</button>
                {vehiculos.map(vehiculo => (
                  <button
                    type="button"
                    key={vehiculo.id}
                    className={String(vehiculoSeleccionado) === String(vehiculo.id) ? 'selected' : ''}
                    onClick={() => setVehiculoSeleccionado(String(vehiculo.id))}
                  >
                    {[vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' ') || vehiculo.tipo || 'Vehículo'}
                    {vehiculo.serial ? ` · ${vehiculo.serial}` : ''}
                  </button>
                ))}
              </nav>
            )}

            {vehiculos.length === 0 ? (
              <section className="vehicle-status-message">
                <span className="vehicle-status-empty-icon">🚗</span>
                <strong>Aún no tienes vehículos registrados</strong>
                <p>Registra tu vehículo para consultar aquí su historial y el avance de sus servicios.</p>
                <button type="button" onClick={() => navigate('/mis-vehiculos')}>Registrar vehículo <span>→</span></button>
              </section>
            ) : reparacionesVisibles.length === 0 ? (
              <section className="vehicle-status-message">
                <span className="vehicle-status-empty-icon">🔧</span>
                <strong>No hay servicios para este vehículo todavía</strong>
                <p>Cuando el taller registre una reparación, aquí verás sus etapas, diagnóstico y repuestos utilizados.</p>
                <button type="button" onClick={() => navigate('/mis-reparaciones')}>Solicitar reparación <span>→</span></button>
              </section>
            ) : (
              <section className="vehicle-status-list" aria-label="Seguimiento de reparaciones">
                {reparacionesVisibles.map(reparacion => {
                  const equipoId = Number(reparacion.equipoId ?? reparacion.equipo?.id)
                  const vehiculo = vehiculosPorId.get(equipoId)
                  const estado = String(reparacion.estado || '').toUpperCase()
                  const indiceActual = pasoPorEstado[estado] ?? 0
                  const cotizacion = cotizacionPorReparacion.get(Number(reparacion.id))
                  const eventos = construirHistorial(reparacion, cotizacion)
                  const nombreVehiculo = [
                    reparacion.equipoMarca ?? vehiculo?.marca,
                    reparacion.equipoModelo ?? vehiculo?.modelo
                  ].filter(Boolean).join(' ') || vehiculo?.tipo || 'Vehículo'

                  return (
                    <article className="vehicle-repair-card" key={reparacion.id}>
                      <div className="vehicle-repair-heading">
                        <div className="vehicle-repair-icon" aria-hidden="true">🚘</div>
                        <div className="vehicle-repair-title">
                          <span>REPARACIÓN #{reparacion.id} · {vehiculo?.serial || 'Vehículo registrado'}</span>
                          <h2>{nombreVehiculo}</h2>
                          <p>{reparacion.fallaReportada || 'Servicio de mantenimiento'}</p>
                        </div>
                        <span className={`vehicle-repair-badge ${estado.toLowerCase()}`}>
                          {etiquetaEstado[estado] || estado.replaceAll('_', ' ')}
                        </span>
                      </div>

                      {estado === 'RECHAZADO' ? (
                        <div className="vehicle-repair-rejected">
                          Este servicio fue detenido. Comunícate con el taller si necesitas más información.
                        </div>
                      ) : (
                        <ol className="vehicle-progress" aria-label={`Avance: ${etiquetaEstado[estado] || estado}`}>
                          {pasos.map((paso, index) => (
                            <li
                              key={paso}
                              className={`${index < indiceActual ? 'done' : ''} ${index === indiceActual ? 'current' : ''}`}
                              aria-current={index === indiceActual ? 'step' : undefined}
                            >
                              <span className="vehicle-progress-marker">{index < indiceActual ? '✓' : index + 1}</span>
                              <small>{paso}</small>
                            </li>
                          ))}
                        </ol>
                      )}

                      <section className="vehicle-activity" aria-label="Historial de cambios">
                        <div className="vehicle-activity-heading">
                          <div>
                            <span className="vehicle-detail-label">ACTUALIZACIONES DEL SERVICIO</span>
                            <h3>Actividad del taller</h3>
                          </div>
                          <small>Hora local de Colombia</small>
                        </div>
                        {eventos.length ? (
                          <ol className="vehicle-activity-list">
                            {eventos.map((evento, index) => (
                              <li key={`${evento.tipo}-${evento.fecha}-${index}`}>
                                <span className="vehicle-activity-dot" aria-hidden="true" />
                                <div className="vehicle-activity-copy">
                                  <strong>{evento.descripcion}</strong>
                                  <span>
                                    {evento.actorNombre || evento.actorCorreo || 'Usuario del taller'}
                                    {evento.actorRol ? ` · ${String(evento.actorRol).replaceAll('_', ' ')}` : ''}
                                  </span>
                                </div>
                                <time dateTime={evento.fecha}>{fechaHora(evento.fecha)}</time>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="vehicle-detail-muted">Todavía no hay cambios registrados para este servicio.</p>
                        )}
                        {eventos.some(evento => evento.actorNombre === 'Autor no registrado') && (
                          <p className="vehicle-activity-note">Las actividades antiguas muestran la fecha disponible, pero el sistema anterior no guardaba quién realizó cada cambio.</p>
                        )}
                      </section>

                      <div className="vehicle-repair-details">
                        <section>
                          <span className="vehicle-detail-label">INFORMACIÓN DEL SERVICIO</span>
                          <p><strong>Ingreso:</strong> {fecha(reparacion.fechaIngreso)}</p>
                          <p><strong>Técnico:</strong> {reparacion.tecnicoNombre || 'Aún sin asignar'}</p>
                          {reparacion.observaciones && <p><strong>Nota del taller:</strong> {reparacion.observaciones}</p>}
                        </section>

                        <section>
                          <span className="vehicle-detail-label">DIAGNÓSTICO</span>
                          {reparacion.diagnostico ? (
                            <>
                              <p><strong>Hallazgos:</strong> {reparacion.diagnostico.hallazgos || 'Pendientes de detalle'}</p>
                              <p><strong>Solución:</strong> {reparacion.diagnostico.solucionPropuesta || 'Pendiente de definir'}</p>
                            </>
                          ) : <p className="vehicle-detail-muted">El taller aún no registra el diagnóstico.</p>}
                        </section>

                        <section>
                          <span className="vehicle-detail-label">REPUESTOS UTILIZADOS</span>
                          {reparacion.repuestosUsados?.length ? (
                            <ul className="vehicle-used-parts">
                              {reparacion.repuestosUsados.map(parte => (
                                <li key={parte.id ?? `${parte.repuestoId}-${parte.repuestoNombre}`}>
                                  <span>{parte.repuestoNombre || 'Repuesto'}</span>
                                  <strong>× {parte.cantidadUsada || 1}</strong>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="vehicle-detail-muted">Aún no se han registrado repuestos.</p>}
                        </section>

                        <section className="vehicle-quote-detail">
                          <span className="vehicle-detail-label">COTIZACIÓN</span>
                          {cotizacion ? (
                            <>
                              <strong className="vehicle-quote-total">{dinero(cotizacion.total)}</strong>
                              <p className={`vehicle-quote-state ${cotizacion.aprobada == null ? 'pending' : cotizacion.aprobada ? 'approved' : 'declined'}`}>
                                {cotizacion.aprobada == null ? 'Pendiente de tu respuesta' : cotizacion.aprobada ? 'Aprobada' : 'Rechazada'}
                              </p>
                              <button type="button" onClick={() => navigate('/mis-cotizaciones')}>
                                {cotizacion.aprobada == null ? 'Revisar cotización' : 'Ver cotización'} <span>→</span>
                              </button>
                            </>
                          ) : <p className="vehicle-detail-muted">El taller aún no ha creado una cotización.</p>}
                        </section>
                      </div>

                      {estado === 'FINALIZADA' && (
                        <div className="vehicle-ready-note">✅ Tu vehículo está listo para recoger. Coordina la entrega con el taller.</div>
                      )}
                      {estado === 'ENTREGADO' && (
                        <div className="vehicle-delivered-note">Servicio entregado el {fecha(reparacion.fechaEntrega)}.</div>
                      )}
                    </article>
                  )
                })}
              </section>
            )}
            <p className="vehicle-status-footnote">Los datos se consultan directamente desde el taller cada vez que abres esta pantalla.</p>
          </>
        )}
      </main>
    </div>
  )
}

export default EstadoVehiculo
