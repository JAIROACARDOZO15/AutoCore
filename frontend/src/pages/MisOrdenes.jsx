import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  obtenerClientePorUsuario,
  obtenerReparaciones,
  obtenerEquipos,
  obtenerPedidos
} from '../services/api'
import './MisOrdenes.css'

function MisOrdenes() {
  const navigate = useNavigate()
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        setCargando(true)
        setError('')

        const guardado = localStorage.getItem('usuario')
        if (!guardado) {
          navigate('/')
          return
        }

        const usuario = JSON.parse(guardado)
        if (String(usuario?.rol || '').toUpperCase() !== 'CLIENTE') {
          navigate('/dashboard')
          return
        }

        if (!usuario.id) {
          throw new Error('No se encontró el usuario de la sesión. Cierra sesión e inicia nuevamente.')
        }

        const cliente = await obtenerClientePorUsuario(usuario.id)
        const [pedidos, reparaciones, equipos] = await Promise.all([
          obtenerPedidos(),
          obtenerReparaciones(),
          obtenerEquipos()
        ])

        if (!activo) return

        const misEquipos = equipos.filter(equipo =>
          Number(equipo.clienteId ?? equipo.cliente?.id) === Number(cliente.id)
        )
        const idsEquipos = new Set(misEquipos.map(equipo => Number(equipo.id)))
        const misReparaciones = reparaciones.filter(reparacion => {
          const equipoId = reparacion.equipoId ?? reparacion.equipo?.id
          return equipoId != null && idsEquipos.has(Number(equipoId))
        })
        const idsReparaciones = new Set(misReparaciones.map(item => Number(item.id)))

        const propias = pedidos.filter(pedido => {
          const clienteId = pedido.clienteId ?? pedido.cliente?.id
          if (clienteId != null) return Number(clienteId) === Number(cliente.id)

          const reparacionId =
            pedido.reparacionId ??
            pedido.reparacion?.id ??
            pedido.cotizacion?.reparacionId ??
            pedido.cotizacion?.reparacion?.id

          return reparacionId != null && idsReparaciones.has(Number(reparacionId))
        })

        setOrdenes(propias.sort((a, b) => {
          const fechaA = new Date(a.fechaPedido || 0).getTime()
          const fechaB = new Date(b.fechaPedido || 0).getTime()
          return fechaB - fechaA
        }))
      } catch (e) {
        if (activo) setError(e.message || 'No se pudieron cargar las órdenes.')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()
    return () => { activo = false }
  }, [navigate])

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}')
    } catch {
      return {}
    }
  }, [])

  const normalizarEstado = estado => String(estado || '').trim().toUpperCase()

  const nombreEstado = estado => ({
    PENDIENTE: 'Pendiente',
    CONFIRMADO: 'Confirmada',
    PROCESANDO: 'En proceso',
    EN_PROCESO: 'En proceso',
    EN_REPARACION: 'En reparación',
    COMPLETADO: 'Completada',
    FINALIZADO: 'Finalizada',
    FINALIZADA: 'Finalizada',
    CANCELADO: 'Cancelada',
    CANCELADA: 'Cancelada'
  }[normalizarEstado(estado)] || estado || 'Sin estado')

  const claseEstado = estado => {
    const valor = normalizarEstado(estado)
    if (['COMPLETADO', 'FINALIZADO', 'FINALIZADA'].includes(valor)) return 'done'
    if (['CANCELADO', 'CANCELADA'].includes(valor)) return 'cancelled'
    if (['PENDIENTE'].includes(valor)) return 'pending'
    return 'progress'
  }

  const dinero = valor => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(valor || 0))

  const obtenerVehiculo = orden => {
    const reparacion =
      orden.reparacion ??
      orden.cotizacion?.reparacion ??
      null
    const equipo =
      orden.equipo ??
      reparacion?.equipo ??
      orden.cotizacion?.equipo ??
      null

    const marca = equipo?.marca ?? reparacion?.equipoMarca ?? orden.equipoMarca
    const modelo = equipo?.modelo ?? reparacion?.equipoModelo ?? orden.equipoModelo
    const placa = equipo?.placa ?? equipo?.serial ?? reparacion?.equipoSerial ?? orden.placa

    return {
      nombre: [marca, modelo].filter(Boolean).join(' ') || 'Vehículo asociado al servicio',
      placa: placa || '',
      reparacionId: reparacion?.id ?? orden.reparacionId ?? orden.cotizacion?.reparacionId ?? orden.cotizacion?.reparacion?.id
    }
  }

  const conteos = {
    total: ordenes.length,
    activas: ordenes.filter(o => !['COMPLETADO', 'FINALIZADO', 'FINALIZADA', 'CANCELADO', 'CANCELADA'].includes(normalizarEstado(o.estado))).length,
    completadas: ordenes.filter(o => ['COMPLETADO', 'FINALIZADO', 'FINALIZADA'].includes(normalizarEstado(o.estado))).length,
    totalAutorizado: ordenes.reduce((suma, orden) => suma + Number(orden.total || 0), 0)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <div className="client-dashboard orders-page">
      <aside className="client-sidebar">
        <div className="client-logo">
          <img src="/logo.png" alt="AutoCore" />
          <span>AutoCore</span>
        </div>

        <nav className="client-navigation">
          <p className="client-menu-title">MI CUENTA</p>
          <button className="client-menu" onClick={() => navigate('/dashboard')}><span>⌂</span> Inicio</button>
          <button className="client-menu" onClick={() => navigate('/mis-vehiculos')}><span>🚗</span> Mis vehículos</button>
          <button className="client-menu" onClick={() => navigate('/mis-reparaciones')}><span>🔧</span> Mis reparaciones</button>
          <button className="client-menu" onClick={() => navigate('/mis-cotizaciones')}><span>▤</span> Mis cotizaciones</button>
          <button className="client-menu active" onClick={() => navigate('/mis-ordenes')}><span>▧</span> Mis órdenes</button>
        </nav>

        <button className="client-logout" onClick={cerrarSesion}><span>↪</span> Cerrar sesión</button>
      </aside>

      <main className="client-main orders-main">
        <header className="client-header">
          <div>
            <span className="client-header-label">PORTAL DEL CLIENTE</span>
            <h1>Mis órdenes</h1>
            <p>Haz seguimiento al trabajo autorizado para tus vehículos.</p>
          </div>
          <div className="client-user">
            <div className="client-avatar">{(usuario.nombre || usuario.email || 'C').charAt(0).toUpperCase()}</div>
            <div className="client-user-info">
              <strong>{usuario.nombre || usuario.email || 'Cliente'}</strong>
              <small>CLIENTE</small>
            </div>
          </div>
        </header>

        <section className="orders-hero">
          <div className="orders-hero-copy">
            <span className="orders-kicker">AUTOCORE · CENTRO DE SERVICIO</span>
            <h2>Tu vehículo, en buenas manos.</h2>
            <p>Consulta tus órdenes, el valor autorizado y el estado del servicio en el taller.</p>
            <button onClick={() => navigate('/mis-reparaciones')}>Ver mis reparaciones <span>→</span></button>
          </div>
          <div className="orders-hero-car" aria-hidden="true">
            <div className="orders-orbit orders-orbit-one" />
            <div className="orders-orbit orders-orbit-two" />
            <span>🚘</span>
            <small>Servicio con seguimiento</small>
          </div>
        </section>

        <section className="orders-stats">
          <article className="orders-stat">
            <div className="orders-stat-icon blue">▤</div>
            <div><span>Órdenes registradas</span><strong>{conteos.total}</strong><small>Historial de tu cuenta</small></div>
          </article>
          <article className="orders-stat">
            <div className="orders-stat-icon amber">⚙</div>
            <div><span>Servicios activos</span><strong>{conteos.activas}</strong><small>En seguimiento por el taller</small></div>
          </article>
          <article className="orders-stat">
            <div className="orders-stat-icon green">✓</div>
            <div><span>Servicios completados</span><strong>{conteos.completadas}</strong><small>Órdenes finalizadas</small></div>
          </article>
          <article className="orders-stat orders-stat-total">
            <div className="orders-stat-icon navy">$</div>
            <div><span>Total autorizado</span><strong>{dinero(conteos.totalAutorizado)}</strong><small>Suma de las órdenes registradas</small></div>
          </article>
        </section>

        <section className="client-panel orders-panel">
          <div className="client-panel-header orders-panel-header">
            <div><span>SEGUIMIENTO DEL TALLER</span><h2>Historial de órdenes</h2><p>Las órdenes se crean cuando apruebas una cotización.</p></div>
            <strong>{ordenes.length}</strong>
          </div>

          {cargando ? (
            <div className="orders-message"><div className="orders-spinner" /><h3>Cargando tus órdenes</h3><p>Estamos consultando la información del taller.</p></div>
          ) : error ? (
            <div className="orders-message orders-error">
              <div className="orders-empty-icon">!</div><h3>No pudimos cargar las órdenes</h3><p>{error}</p>
              <button onClick={() => window.location.reload()}>Intentar de nuevo</button>
            </div>
          ) : ordenes.length === 0 ? (
            <div className="orders-message">
              <div className="orders-empty-icon">🚗</div>
              <h3>Aún no tienes órdenes</h3>
              <p>Cuando apruebes una cotización y el taller genere la orden, podrás consultar aquí el estado, la fecha y el valor autorizado.</p>
              <button onClick={() => navigate('/mis-cotizaciones')}>Revisar mis cotizaciones <span>→</span></button>
            </div>
          ) : (
            <div className="orders-list">
              {ordenes.map(orden => {
                const vehiculo = obtenerVehiculo(orden)
                const estado = normalizarEstado(orden.estado)
                return (
                  <article className="order-card" key={orden.id}>
                    <div className="order-card-top">
                      <div className="order-number-wrap">
                        <div className="order-car-art"><span>🚘</span></div>
                        <div><span className="order-overline">ORDEN DE SERVICIO</span><h3>Orden #{orden.id}</h3><p>{vehiculo.nombre}</p></div>
                      </div>
                      <span className={`order-status ${claseEstado(orden.estado)}`}><i />{nombreEstado(orden.estado)}</span>
                    </div>

                    <div className="order-details-grid">
                      <div className="order-detail"><span className="order-detail-icon">🚗</span><div><small>Vehículo</small><strong>{vehiculo.nombre}</strong></div></div>
                      <div className="order-detail"><span className="order-detail-icon">▦</span><div><small>Placa / serial</small><strong>{vehiculo.placa || 'No registrado'}</strong></div></div>
                      <div className="order-detail"><span className="order-detail-icon">📅</span><div><small>Fecha de orden</small><strong>{orden.fechaPedido ? new Date(orden.fechaPedido).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : 'No disponible'}</strong></div></div>
                      <div className="order-detail"><span className="order-detail-icon">💳</span><div><small>Valor autorizado</small><strong className="order-price">{dinero(orden.total)}</strong></div></div>
                    </div>

                    <div className="order-progress">
                      <div className={`order-progress-step ${estado !== 'PENDIENTE' ? 'is-done' : 'is-current'}`}><span>1</span><small>Orden creada</small></div>
                      <div className={`order-progress-line ${['CONFIRMADO', 'PROCESANDO', 'COMPLETADO'].includes(estado) ? 'is-done' : ''}`} />
                      <div className={`order-progress-step ${['CONFIRMADO', 'PROCESANDO', 'COMPLETADO'].includes(estado) ? (estado === 'COMPLETADO' ? 'is-done' : 'is-current') : ''}`}><span>2</span><small>Trabajo en taller</small></div>
                      <div className={`order-progress-line ${estado === 'COMPLETADO' ? 'is-done' : ''}`} />
                      <div className={`order-progress-step ${estado === 'COMPLETADO' ? 'is-done' : ''}`}><span>3</span><small>Lista para entrega</small></div>
                    </div>

                    {orden.observaciones && <div className="order-notes"><strong>Nota del taller</strong><p>{orden.observaciones}</p></div>}
                    <div className="order-card-footer">
                      <span>AutoCore · Seguimiento de servicio</span>
                      {vehiculo.reparacionId && <span>Reparación #{vehiculo.reparacionId}</span>}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default MisOrdenes
