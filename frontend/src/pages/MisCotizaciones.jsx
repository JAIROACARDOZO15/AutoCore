import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  obtenerClientePorUsuario,
  obtenerReparaciones,
  obtenerEquipos,
  obtenerCotizaciones,
  aprobarCotizacion,
  rechazarCotizacion
} from '../services/api'
import './DashboardClienteC.css'
import './MisCotizacionesC.css'

const dinero = valor =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(valor || 0))

const fecha = valor => {
  if (!valor) return '—'
  const date = new Date(valor)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-CO')
}

function MisCotizaciones() {
  const navigate = useNavigate()
  const [cotizaciones, setCotizaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [actualizandoId, setActualizandoId] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const cargarCotizaciones = useCallback(async () => {
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
    if (!usuarioActual.id) throw new Error('No se encontró el usuario de la sesión.')

    const cliente = await obtenerClientePorUsuario(usuarioActual.id)
    const [cotizacionesData, reparacionesData, equiposData] = await Promise.all([
      obtenerCotizaciones(),
      obtenerReparaciones(),
      obtenerEquipos()
    ])

    const misEquipos = equiposData.filter(
      equipo => Number(equipo.clienteId ?? equipo.cliente?.id) === Number(cliente.id)
    )
    const idsEquipos = new Set(misEquipos.map(equipo => Number(equipo.id)))
    const idsReparaciones = new Set(
      reparacionesData
        .filter(reparacion => {
          const equipoId = reparacion.equipoId ?? reparacion.equipo?.id
          return equipoId != null && idsEquipos.has(Number(equipoId))
        })
        .map(reparacion => Number(reparacion.id))
    )

    setCotizaciones(
      cotizacionesData.filter(cotizacion => {
        const reparacionId = cotizacion.reparacionId ?? cotizacion.reparacion?.id
        return reparacionId != null && idsReparaciones.has(Number(reparacionId))
      }).sort((a, b) => Number(b.id) - Number(a.id))
    )
  }, [navigate])

  useEffect(() => {
    let activo = true
    async function iniciar() {
      try {
        await cargarCotizaciones()
      } catch (e) {
        if (activo) setError(e.message || 'No se pudieron cargar las cotizaciones.')
      } finally {
        if (activo) setCargando(false)
      }
    }
    iniciar()
    return () => { activo = false }
  }, [cargarCotizaciones])

  const estadoCotizacion = cotizacion => {
    if (cotizacion.aprobada === true) return { texto: 'Aprobada', clase: 'aprobada' }
    if (cotizacion.aprobada === false) return { texto: 'Rechazada', clase: 'rechazada' }
    return { texto: 'Pendiente de aprobación', clase: 'pendiente' }
  }

  const responderCotizacion = async (cotizacion, accion) => {
    setError('')
    setMensaje('')
    setActualizandoId(cotizacion.id)
    try {
      if (accion === 'aprobar') {
        await aprobarCotizacion(cotizacion.id)
        setMensaje(`Aprobaste la cotización #${cotizacion.id}. El taller ya puede iniciar la reparación.`)
      } else {
        await rechazarCotizacion(cotizacion.id)
        setMensaje(`Rechazaste la cotización #${cotizacion.id}. La reparación no debe comenzar.`)
      }
      setConfirmacion(null)
      setCotizacionDetalle(null)
      await cargarCotizaciones()
    } catch (e) {
      setError(e.message || 'No se pudo registrar tu respuesta.')
    } finally {
      setActualizandoId(null)
    }
  }

  const cotizacionesPendientes = cotizaciones.filter(c => c.aprobada == null).length
  const cotizacionesAprobadas = cotizaciones.filter(c => c.aprobada === true).length
  const cotizacionesRechazadas = cotizaciones.filter(c => c.aprobada === false).length

  return (
    <div className="client-dashboard">
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
          <button className="client-menu active"><span>▤</span> Mis cotizaciones</button>
          <button className="client-menu" onClick={() => navigate('/mis-ordenes')}><span>▧</span> Mis órdenes</button>
        </nav>
        <button className="client-logout" onClick={() => {
          localStorage.removeItem('usuario')
          navigate('/')
        }}><span>↪</span> Cerrar sesión</button>
      </aside>

      <main className="client-main quotes-main">
        <header className="client-header">
          <div>
            <span className="client-header-label">PORTAL DEL CLIENTE</span>
            <h1>Mis cotizaciones</h1>
            <p>Revisa los repuestos, los costos y decide si autorizas la reparación.</p>
          </div>
          <div className="client-user">
            <div className="client-avatar">{(usuario.nombre || usuario.email || 'C').charAt(0).toUpperCase()}</div>
            <div className="client-user-info">
              <strong>{usuario.nombre || usuario.email || 'Cliente'}</strong>
              <small>CLIENTE</small>
            </div>
          </div>
        </header>

        <section className="quotes-intro">
          <div className="quotes-intro-icon">▤</div>
          <div>
            <span>PRESUPUESTO DEL TALLER</span>
            <h2>Tu aprobación es necesaria</h2>
            <p>El técnico registra el diagnóstico y los repuestos recomendados. El administrador prepara la cotización y tú revisas el detalle antes de autorizar el inicio del trabajo.</p>
          </div>
        </section>

        <section className="quotes-summary" aria-label="Resumen de cotizaciones">
          <article><span className="quotes-summary-icon pending">◷</span><div><small>Pendientes de decisión</small><strong>{cotizacionesPendientes}</strong></div></article>
          <article><span className="quotes-summary-icon approved">✓</span><div><small>Aprobadas</small><strong>{cotizacionesAprobadas}</strong></div></article>
          <article><span className="quotes-summary-icon rejected">×</span><div><small>Rechazadas</small><strong>{cotizacionesRechazadas}</strong></div></article>
        </section>

        {mensaje && <div className="quotes-alert success" role="status">{mensaje}</div>}
        {error && <div className="quotes-alert error" role="alert">{error}<button type="button" onClick={() => setError('')}>Cerrar</button></div>}

        <section className="client-panel quotes-panel">
          <div className="client-panel-header">
            <div><span>DETALLE ECONÓMICO</span><h2>Historial de cotizaciones</h2></div>
            <strong>{cotizaciones.length}</strong>
          </div>

          {cargando ? (
            <div className="quotes-empty"><div className="quotes-loader" /><p>Cargando tus cotizaciones...</p></div>
          ) : error && cotizaciones.length === 0 ? (
            <div className="quotes-empty"><h3>No pudimos cargar las cotizaciones</h3><button className="quotes-button secondary" onClick={() => window.location.reload()}>Reintentar</button></div>
          ) : cotizaciones.length === 0 ? (
            <div className="quotes-empty">
              <div className="quotes-empty-icon">▤</div>
              <h3>Aún no tienes cotizaciones</h3>
              <p>Cuando el administrador prepare el presupuesto de una reparación, aparecerá aquí para que puedas revisar los repuestos y los costos.</p>
            </div>
          ) : (
            <div className="quotes-list">
              {cotizaciones.map(cotizacion => {
                const estado = estadoCotizacion(cotizacion)
                const detalles = cotizacion.detalles || []
                return (
                  <article className={`quote-card quote-card-${estado.clase}`} key={cotizacion.id}>
                    <div className="quote-card-top">
                      <div className="quote-document-icon">▤</div>
                      <div className="quote-card-title">
                        <span className="quote-eyebrow">COTIZACIÓN #{cotizacion.id}</span>
                        <h3>Reparación #{cotizacion.reparacionId ?? cotizacion.reparacion?.id ?? '—'}</h3>
                        <small>Emitida el {fecha(cotizacion.fechaCotizacion)}</small>
                      </div>
                      <span className={`quote-status ${estado.clase}`}><i />{estado.texto}</span>
                    </div>

                    <div className="quote-card-total">
                      <div><small>Total cotizado</small><strong>{dinero(cotizacion.total)}</strong></div>
                      <button type="button" className="quotes-button secondary" onClick={() => setCotizacionDetalle(cotizacion)}>Ver cotización / factura</button>
                    </div>

                    {cotizacion.aprobada == null ? (
                      <div className="quote-pending-note"><strong>Acción requerida</strong><span>Revisa el documento completo. La reparación no debe iniciar hasta que tomes una decisión.</span></div>
                    ) : cotizacion.aprobada === true ? (
                      <div className="quote-result-note approved"><strong>Autorizada por ti</strong><span>La reparación puede avanzar al estado “En reparación”.</span></div>
                    ) : (
                      <div className="quote-result-note rejected"><strong>No autorizada</strong><span>El taller no debe iniciar la reparación con esta cotización.</span></div>
                    )}

                    {cotizacion.aprobada == null && (
                      <div className="quote-card-actions">
                        <button type="button" className="quotes-button approve" onClick={() => { setCotizacionDetalle(cotizacion); setConfirmacion({ id: cotizacion.id, accion: 'aprobar' }) }} disabled={actualizandoId === cotizacion.id}>✓ Aprobar cotización</button>
                        <button type="button" className="quotes-button reject" onClick={() => { setCotizacionDetalle(cotizacion); setConfirmacion({ id: cotizacion.id, accion: 'rechazar' }) }} disabled={actualizandoId === cotizacion.id}>Rechazar</button>
                      </div>
                    )}
                    {actualizandoId === cotizacion.id && <p className="quote-processing">Registrando tu respuesta...</p>}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {cotizacionDetalle && (
        <div className="quote-modal-backdrop" role="presentation" onMouseDown={e => {
          if (e.target === e.currentTarget) { setCotizacionDetalle(null); setConfirmacion(null) }
        }}>
          <section className="quote-invoice" role="dialog" aria-modal="true" aria-labelledby="quote-invoice-title">
            <div className="quote-invoice-header">
              <div><span>DOCUMENTO DE PRESUPUESTO</span><h2 id="quote-invoice-title">Cotización #{cotizacionDetalle.id}</h2><p>AutoCore · Servicio de mantenimiento y reparación</p></div>
              <button type="button" className="quote-modal-close" aria-label="Cerrar" onClick={() => { setCotizacionDetalle(null); setConfirmacion(null) }}>×</button>
            </div>
            <div className="quote-invoice-meta">
              <div><small>Reparación</small><strong>#{cotizacionDetalle.reparacionId ?? cotizacionDetalle.reparacion?.id ?? '—'}</strong></div>
              <div><small>Fecha de emisión</small><strong>{fecha(cotizacionDetalle.fechaCotizacion)}</strong></div>
              <div><small>Estado</small><strong className={`quote-invoice-state ${estadoCotizacion(cotizacionDetalle).clase}`}>{estadoCotizacion(cotizacionDetalle).texto}</strong></div>
            </div>
            <div className="quote-invoice-section-title"><h3>Repuestos y servicios</h3><p>Verifica las cantidades y los precios antes de decidir.</p></div>
            <div className="quote-table-wrap">
              <table className="quote-table">
                <thead><tr><th>Descripción</th><th>Cant.</th><th>Precio unitario</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {(cotizacionDetalle.detalles || []).length ? cotizacionDetalle.detalles.map((item, index) => (
                    <tr key={item.id ?? `${item.repuestoId}-${index}`}>
                      <td><strong>{item.repuestoNombre || `Repuesto #${item.repuestoId}`}</strong></td>
                      <td>{item.cantidad}</td><td>{dinero(item.precioUnitario)}</td><td>{dinero(item.subtotal)}</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="quote-no-parts">Esta cotización no tiene repuestos detallados; revisa el valor de mano de obra.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="quote-invoice-totals">
              <div><span>Repuestos y mano de obra (subtotal)</span><strong>{dinero(cotizacionDetalle.subtotal)}</strong></div>
              <div><span>Mano de obra incluida</span><strong>{dinero(cotizacionDetalle.manoObra)}</strong></div>
              <div><span>IVA ({Number(cotizacionDetalle.ivaPorcentaje || 0)}%)</span><strong>{dinero(cotizacionDetalle.valorIva)}</strong></div>
              <div className="quote-grand-total"><span>Total a pagar</span><strong>{dinero(cotizacionDetalle.total)}</strong></div>
            </div>
            <p className="quote-invoice-disclaimer">Este documento es la cotización previa del servicio. La reparación solo debe comenzar después de tu aprobación.</p>

            {confirmacion?.id === cotizacionDetalle.id && cotizacionDetalle.aprobada == null && (
              <div className={`quote-confirmation ${confirmacion.accion}`}>
                <strong>{confirmacion.accion === 'aprobar' ? '¿Autorizas esta reparación?' : '¿Deseas rechazar esta cotización?'}</strong>
                <p>{confirmacion.accion === 'aprobar' ? 'Al confirmar, el taller podrá comenzar el trabajo según los repuestos y valores mostrados.' : 'Al confirmar, la solicitud quedará rechazada y el taller no deberá iniciar este trabajo.'}</p>
                <div>
                  <button type="button" className="quotes-button secondary" onClick={() => setConfirmacion(null)} disabled={actualizandoId === cotizacionDetalle.id}>Volver a revisar</button>
                  <button type="button" className={`quotes-button ${confirmacion.accion === 'aprobar' ? 'approve' : 'reject'}`} onClick={() => responderCotizacion(cotizacionDetalle, confirmacion.accion)} disabled={actualizandoId === cotizacionDetalle.id}>
                    {actualizandoId === cotizacionDetalle.id ? 'Procesando...' : confirmacion.accion === 'aprobar' ? 'Sí, aprobar' : 'Sí, rechazar'}
                  </button>
                </div>
              </div>
            )}
            {cotizacionDetalle.aprobada == null && !confirmacion && (
              <div className="quote-invoice-actions">
                <button type="button" className="quotes-button reject" onClick={() => setConfirmacion({ id: cotizacionDetalle.id, accion: 'rechazar' })}>Rechazar cotización</button>
                <button type="button" className="quotes-button approve" onClick={() => setConfirmacion({ id: cotizacionDetalle.id, accion: 'aprobar' })}>✓ Aprobar y autorizar reparación</button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default MisCotizaciones
