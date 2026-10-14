
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  obtenerClientePorUsuario,
  obtenerReparaciones,
  obtenerEquipos,
  crearReparacion
} from '../services/api'
import './DashboardClienteC.css'

const formularioInicial = {
  equipoId: '',
  fallaReportada: '',
  observaciones: ''
}

function MisReparaciones() {
  const navigate = useNavigate()
  const [reparaciones, setReparaciones] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [clienteId, setClienteId] = useState(null)

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const cargarDatos = useCallback(async () => {
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
      throw new Error('No se encontró el usuario de la sesión.')
    }

    const cliente = await obtenerClientePorUsuario(usuarioActual.id)

    const [todas, equipos] = await Promise.all([
      obtenerReparaciones(),
      obtenerEquipos()
    ])

    const misVehiculos = equipos.filter(
      equipo =>
        Number(equipo.clienteId ?? equipo.cliente?.id) ===
        Number(cliente.id)
    )

    const idsEquipos = new Set(
      misVehiculos.map(equipo => Number(equipo.id))
    )

    const propias = todas.filter(reparacion => {
      const equipoId = reparacion.equipoId ?? reparacion.equipo?.id
      return equipoId != null && idsEquipos.has(Number(equipoId))
    })

    setClienteId(cliente.id)
    setVehiculos(misVehiculos)
    setReparaciones(propias)
  }, [navigate])

  useEffect(() => {
    let activo = true

    async function iniciar() {
      try {
        await cargarDatos()
      } catch (e) {
        if (activo) {
          setError(e.message || 'No se pudieron cargar las reparaciones.')
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    iniciar()

    return () => {
      activo = false
    }
  }, [cargarDatos])

  const nombreEstado = estado => ({
    RECIBIDO: 'Solicitud recibida',
    EN_DIAGNOSTICO: 'En diagnóstico',
    COTIZACION_PENDIENTE: 'Cotización pendiente',
    ESPERANDO_APROBACION: 'Esperando aprobación',
    EN_REPARACION: 'En reparación',
    FINALIZADA: 'Lista para recoger',
    ENTREGADO: 'Vehículo entregado',
    RECHAZADO: 'Solicitud rechazada',
    APROBADO: 'Solicitud aprobada',
    APROBADA: 'Solicitud aprobada',
    ACEPTADO: 'Solicitud aprobada',
    ACEPTADA: 'Solicitud aprobada'
  }[estado] || estado || 'Sin estado')

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setFormulario(actual => ({ ...actual, [name]: value }))
  }

  function abrirFormulario() {
    setFormulario({
      ...formularioInicial,
      equipoId: vehiculos.length === 1 ? String(vehiculos[0].id) : ''
    })
    setError('')
    setMensaje('')
    setMostrarFormulario(true)
  }

  async function enviarSolicitud(evento) {
    evento.preventDefault()
    setError('')
    setMensaje('')

    if (!clienteId) {
      setError('No se pudo identificar tu cuenta de cliente.')
      return
    }

    if (!formulario.equipoId) {
      setError('Selecciona el vehículo que necesita reparación.')
      return
    }

    if (!formulario.fallaReportada.trim()) {
      setError('Describe qué problema presenta tu vehículo.')
      return
    }

    setGuardando(true)

    try {
      await crearReparacion({
        equipoId: Number(formulario.equipoId),
        fallaReportada: formulario.fallaReportada.trim(),
        observaciones: formulario.observaciones.trim() || null
      })

      await cargarDatos()

      setMostrarFormulario(false)
      setFormulario(formularioInicial)
      setMensaje(
        'Tu solicitud se registró correctamente. El taller revisará el vehículo.'
      )
    } catch (e) {
      setError(e.message || 'No se pudo registrar la solicitud.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="client-dashboard">
      <aside className="client-sidebar">
        <div className="client-logo">
          <img src="/logo.png" alt="AutoCore" />
          <span>AutoCore</span>
        </div>

        <nav className="client-navigation">
          <p className="client-menu-title">MI CUENTA</p>
          <button className="client-menu" onClick={() => navigate('/dashboard')}>
            <span>⌂</span> Inicio
          </button>
          <button className="client-menu" onClick={() => navigate('/mis-vehiculos')}>
            <span>🚗</span> Mis vehículos
          </button>
          <button className="client-menu active">
            <span>🔧</span> Mis reparaciones
          </button>
          <button className="client-menu" onClick={() => navigate('/mis-cotizaciones')}>
            <span>▤</span> Mis cotizaciones
          </button>
          <button className="client-menu" onClick={() => navigate('/mis-ordenes')}>
            <span>▧</span> Mis órdenes
          </button>
        </nav>

        <button
          className="client-logout"
          onClick={() => {
            localStorage.removeItem('usuario')
            navigate('/')
          }}
        >
          <span>↪</span> Cerrar sesión
        </button>
      </aside>

      <main className="client-main repairs-main">
        <header className="client-header">
          <div>
            <span className="client-header-label">PORTAL DEL CLIENTE</span>
            <h1>Mis reparaciones</h1>
            <p>Solicita un servicio y sigue los avances del taller.</p>
          </div>

          <div className="client-user">
            <div className="client-avatar">
              {(usuario.nombre || usuario.email || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="client-user-info">
              <strong>{usuario.nombre || usuario.email || 'Cliente'}</strong>
              <small>CLIENTE</small>
            </div>
          </div>
        </header>

        <section className="repairs-summary" aria-label="Resumen de reparaciones">
          <article className="repairs-stat">
            <span className="repairs-stat-icon" aria-hidden="true">🔧</span>
            <div>
              <p>Total de reparaciones</p>
              <strong>{reparaciones.length}</strong>
            </div>
          </article>

          <article className="repairs-stat">
            <span className="repairs-stat-icon" aria-hidden="true">⚙️</span>
            <div>
              <p>En proceso</p>
              <strong>
                {reparaciones.filter(r =>
                  ['RECIBIDO', 'EN_DIAGNOSTICO', 'COTIZACION_PENDIENTE',
                    'ESPERANDO_APROBACION', 'EN_REPARACION'].includes(r.estado)
                ).length}
              </strong>
            </div>
          </article>

          <article className="repairs-stat">
            <span className="repairs-stat-icon" aria-hidden="true">🚘</span>
            <div>
              <p>Listas para recoger</p>
              <strong>{reparaciones.filter(r => r.estado === 'FINALIZADA').length}</strong>
            </div>
          </article>
        </section>

        <section className="client-panel repairs-panel">
          <div className="client-panel-header">
            <div>
              <span>SEGUIMIENTO</span>
              <h2>Historial de reparaciones</h2>
            </div>
            <strong>{reparaciones.length}</strong>
          </div>

          <div className="repairs-actions">
            <button
              type="button"
              onClick={abrirFormulario}
              disabled={vehiculos.length === 0}
              style={estiloPrimario}
            >
              + Solicitar reparación
            </button>
            {vehiculos.length === 0 && !cargando && (
              <p style={{ color: '#64748b', fontSize: 13 }}>
                Primero debes registrar un vehículo en «Mis vehículos».
              </p>
            )}
          </div>

          {mensaje && (
            <p role="status" style={{ padding: '0 24px', color: '#167443' }}>
              {mensaje}
            </p>
          )}

          {cargando ? (
            <p style={{ padding: 24 }}>Cargando reparaciones...</p>
          ) : error && !mostrarFormulario ? (
            <div style={{ padding: 24 }}>
              <p role="alert">{error}</p>
              <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
          ) : reparaciones.length === 0 ? (
            <div className="repairs-empty">
              <div className="repairs-empty-icon" aria-hidden="true">🔧</div>
              <h3>Aún no tienes reparaciones registradas</h3>
              <p>Solicita una reparación y aquí podrás consultar los avances del taller.</p>
            </div>
          ) : (
            reparaciones.map(reparacion => (
              <div className="client-repair repair-card" key={reparacion.id}>
                <div className="client-car-icon">🔧</div>
                <div style={{ flex: 1 }}>
                  <strong>
                    {[reparacion.equipoMarca, reparacion.equipoModelo]
                      .filter(Boolean).join(' ') || 'Vehículo'}
                  </strong>
                  <span>Reparación #{reparacion.id}</span>
                  <small>
                    Falla reportada: {reparacion.fallaReportada || 'Sin descripción'}
                  </small>
                  <span className={`repair-status repair-status-${(reparacion.estado || 'sin_estado').toLowerCase()}`}>
                    {nombreEstado(reparacion.estado)}
                  </span>

                  {reparacion.fechaIngreso && (
                    <small>
                      Ingreso: {new Date(reparacion.fechaIngreso).toLocaleDateString('es-CO')}
                    </small>
                  )}

                  {reparacion.fechaEntrega && (
                    <small>
                      Fecha de entrega: {new Date(reparacion.fechaEntrega).toLocaleDateString('es-CO')}
                    </small>
                  )}

                  {reparacion.diagnostico && (
                    <small>
                      Diagnóstico: {reparacion.diagnostico.descripcion || 'Registrado por el taller'}
                    </small>
                  )}

                  {reparacion.observaciones && (
                    <small>Informe del taller: {reparacion.observaciones}</small>
                  )}

                  {reparacion.estado === 'FINALIZADA' && (
                    <strong style={{ color: '#167443', marginTop: 6 }}>
                      Tu vehículo está listo para recoger.
                    </strong>
                  )}

                  {reparacion.estado === 'ENTREGADO' && (
                    <strong style={{ color: '#64748b', marginTop: 6 }}>
                      El vehículo ya fue entregado.
                    </strong>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {mostrarFormulario && (
        <div style={estiloFondoModal} className="repairs-modal-backdrop">
          <form onSubmit={enviarSolicitud} style={estiloFormulario} className="repairs-modal">
            <h2 style={{ marginTop: 0 }}>Solicitar reparación</h2>
            <p style={{ color: '#64748b', marginTop: -6 }}>
              Cuéntanos qué le ocurre a tu carro o moto.
            </p>

            <label>
              Vehículo *
              <select
                name="equipoId"
                value={formulario.equipoId}
                onChange={cambiarCampo}
                required
                style={estiloCampo}
              >
                <option value="">Selecciona tu vehículo</option>
                {vehiculos.map(vehiculo => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {[vehiculo.marca, vehiculo.modelo, vehiculo.serial]
                      .filter(Boolean).join(' · ')}
                  </option>
                ))}
              </select>
            </label>

            <label>
              ¿Qué problema presenta? *
              <textarea
                name="fallaReportada"
                value={formulario.fallaReportada}
                onChange={cambiarCampo}
                required
                minLength={5}
                maxLength={2000}
                rows={4}
                placeholder="Ej. Siento vibración al frenar y escucho un ruido en las ruedas delanteras."
                style={estiloCampo}
              />
            </label>

            <label>
              Observaciones adicionales (opcional)
              <textarea
                name="observaciones"
                value={formulario.observaciones}
                onChange={cambiarCampo}
                maxLength={2000}
                rows={3}
                placeholder="¿Cuándo comenzó? ¿Ocurre en frío o al conducir?"
                style={estiloCampo}
              />
            </label>

            {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false)
                  setError('')
                }}
                disabled={guardando}
                style={estiloSecundario}
              >
                Cancelar
              </button>
              <button type="submit" disabled={guardando} style={estiloPrimario}>
                {guardando ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const estiloPrimario = {
  background: '#1764d8',
  color: 'white',
  border: 0,
  borderRadius: 8,
  padding: '11px 16px',
  cursor: 'pointer',
  fontWeight: 600
}

const estiloSecundario = {
  background: 'white',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '10px 14px',
  cursor: 'pointer'
}

const estiloFondoModal = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(4, 18, 39, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000
}

const estiloFormulario = {
  background: 'white',
  borderRadius: 16,
  padding: 24,
  width: '100%',
  maxWidth: 560,
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'grid',
  gap: 16,
  color: '#10233f'
}

const estiloCampo = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 6,
  padding: 11,
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  font: 'inherit'
}

export default MisReparaciones
