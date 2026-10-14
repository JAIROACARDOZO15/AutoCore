
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  obtenerClientePorUsuario,
  obtenerEquipos,
  obtenerReparaciones,
  obtenerCotizaciones,
  obtenerPedidos
} from '../services/api'

import './DashboardClienteC.css'

function DashboardCliente() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [reparaciones, setReparaciones] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarPortal() {
      try {
        const guardado = localStorage.getItem('usuario')

        if (!guardado) {
          navigate('/')
          return
        }

        const datosUsuario = JSON.parse(guardado)
        const rol = String(datosUsuario?.rol || '').toUpperCase()

        if (rol !== 'CLIENTE') {
          navigate('/dashboard')
          return
        }

        if (activo) setUsuario(datosUsuario)

        if (!datosUsuario.id) {
          throw new Error(
            'No se encontró el identificador del usuario. Cierra sesión e inicia nuevamente.'
          )
        }

        // Buscar el registro de cliente asociado al usuario que inició sesión.
        const datosCliente = await obtenerClientePorUsuario(datosUsuario.id)

        if (!activo) return

        setCliente(datosCliente)

        // Consultar los módulos del taller.
        const [
          todosVehiculos,
          todasReparaciones,
          todasCotizaciones,
          todosPedidos
        ] = await Promise.all([
          obtenerEquipos(),
          obtenerReparaciones(),
          obtenerCotizaciones(),
          obtenerPedidos()
        ])

        if (!activo) return

        // Mostrar en el portal únicamente los registros asociados
        // al cliente que inició sesión.
        const misVehiculos = todosVehiculos.filter(
          item => Number(item.clienteId) === Number(datosCliente.id)
        )

        const misReparaciones = todasReparaciones.filter(
          item => Number(item.clienteId) === Number(datosCliente.id)
        )

        const idsReparaciones = new Set(
          misReparaciones.map(item => Number(item.id))
        )

        const misCotizaciones = todasCotizaciones.filter(
          item => idsReparaciones.has(Number(item.reparacionId))
        )

        const misOrdenes = todosPedidos.filter(
          item => Number(item.cliente?.id ?? item.clienteId) ===
            Number(datosCliente.id)
        )

        setVehiculos(misVehiculos)
        setReparaciones(misReparaciones)
        setCotizaciones(misCotizaciones)
        setOrdenes(misOrdenes)

      } catch (e) {
        if (activo) {
          setError(
            e.message ||
            'No fue posible cargar la información de tu cuenta.'
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarPortal()

    return () => {
      activo = false
    }
  }, [navigate])

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const nombre =
    cliente?.nombre ||
    usuario?.nombre ||
    usuario?.email ||
    'Cliente'

  const reparacionesActivas = reparaciones.filter(item => {
    const estado = String(item.estado || '').toUpperCase()

    return !['FINALIZADA', 'ENTREGADO', 'RECHAZADO'].includes(estado)
  })

  const reparacionActual = [...reparaciones]
    .sort((a, b) => {
      const fechaA = new Date(a.fechaIngreso || 0).getTime()
      const fechaB = new Date(b.fechaIngreso || 0).getTime()
      return fechaB - fechaA
    })[0]

  const cotizacionesPendientes = cotizaciones.filter(
    item => item.aprobada == null
  )

  const formatoEstado = estado =>
    String(estado || 'SIN ESTADO')
      .replaceAll('_', ' ')

  const dinero = valor =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(Number(valor || 0))

  return (
    <div className="client-dashboard">
      <aside className="client-sidebar">
        <div className="client-logo">
          <img src="/logo.png" alt="AutoCore" />
          <span>AutoCore</span>
        </div>

        <nav className="client-navigation">
          <p className="client-menu-title">MI CUENTA</p>

          <button
            className="client-menu active"
            onClick={() => navigate('/dashboard')}
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="client-menu"
            onClick={() => navigate('/mis-vehiculos')}
          >
            <span>🚗</span>
            Mis vehículos
          </button>

          <button
            className="client-menu"
            onClick={() => navigate('/mis-reparaciones')}
          >
            <span>🔧</span>
            Mis reparaciones
          </button>

          <button
            className="client-menu"
            onClick={() => navigate('/mis-cotizaciones')}
          >
            <span>▤</span>
            Mis cotizaciones
          </button>

          <button
            className="client-menu"
            onClick={() => navigate('/mis-ordenes')}
          >
            <span>▧</span>
            Mis órdenes
          </button>

          <button
            className="client-menu"
            onClick={() => navigate('/catalogo')}
          >
            <span>⚙</span>
            Catálogo
          </button>

          <p className="client-menu-title client-system">CUENTA</p>

          <button
            className="client-menu"
            onClick={() => navigate('/mi-perfil')}
          >
            <span>♙</span>
            Mi perfil
          </button>
        </nav>

        <button className="client-logout" onClick={cerrarSesion}>
          <span>↪</span>
          Cerrar sesión
        </button>
      </aside>

      <main className="client-main">
        <header className="client-header">
          <div>
            <span className="client-header-label">
              PORTAL DEL CLIENTE
            </span>

            <h1>Mi cuenta</h1>

            <p>
              Consulta tus vehículos, reparaciones y cotizaciones.
            </p>
          </div>

          <div className="client-user">
            <div className="client-avatar">
              {nombre.charAt(0).toUpperCase()}
            </div>

            <div className="client-user-info">
              <strong>{nombre}</strong>
              <small>CLIENTE</small>
            </div>
          </div>
        </header>

        <section className="client-welcome">
          <div>
            <span>AUTOCORE</span>
            <h2>Hola, {nombre} 👋</h2>
            <p>
              Aquí puedes consultar el estado de tus servicios en el taller.
            </p>
          </div>

          <div className="client-welcome-icon">🚗</div>
        </section>

        {cargando ? (
          <section className="client-panel">
            <div className="client-panel-header">
              <h2>Cargando tu información...</h2>
            </div>
          </section>
        ) : error ? (
          <section className="client-panel">
            <div className="client-panel-header">
              <div>
                <span>NO SE PUDO CARGAR</span>
                <h2>Tu información</h2>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="client-stats">
              <div className="client-card">
                <span>Mis vehículos</span>
                <strong>{vehiculos.length}</strong>
                <small>Registrados</small>
              </div>

              <div className="client-card">
                <span>Reparaciones</span>
                <strong>{reparacionesActivas.length}</strong>
                <small>En proceso</small>
              </div>

              <div className="client-card">
                <span>Cotizaciones</span>
                <strong>{cotizaciones.length}</strong>
                <small>
                  {cotizacionesPendientes.length} pendientes de respuesta
                </small>
              </div>

              <div className="client-card">
                <span>Órdenes</span>
                <strong>{ordenes.length}</strong>
                <small>Registradas</small>
              </div>
            </section>

            <section className="client-panel">
              <div className="client-panel-header">
                <div>
                  <span>SERVICIO</span>
                  <h2>Mi reparación actual</h2>
                </div>

                <button onClick={() => navigate('/mis-reparaciones')}>
                  Ver detalle →
                </button>
              </div>

              {reparacionActual ? (
                <div className="client-repair">
                  <div className="client-car-icon">🔧</div>

                  <div>
                    <strong>
                      {[
                        reparacionActual.equipoMarca,
                        reparacionActual.equipoModelo
                      ].filter(Boolean).join(' ') ||
                        reparacionActual.equipoTipo ||
                        'Vehículo registrado'}
                    </strong>

                    <span>
                      {reparacionActual.fallaReportada ||
                        'Sin descripción registrada'}
                    </span>

                    <small>
                      Reparación #{reparacionActual.id}
                    </small>
                  </div>

                  <b className={`client-status ${
                    ['FINALIZADA', 'ENTREGADO'].includes(
                      String(reparacionActual.estado || '').toUpperCase()
                    ) ? 'completed' : 'progress'
                  }`}>
                    {formatoEstado(reparacionActual.estado)}
                  </b>
                </div>
              ) : (
                <div style={{ padding: 24 }}>
                  <p>No tienes reparaciones registradas actualmente.</p>
                </div>
              )}
            </section>

            <section className="client-panel" style={{ marginTop: 24 }}>
              <div className="client-panel-header">
                <div>
                  <span>VEHÍCULOS</span>
                  <h2>Mis vehículos registrados</h2>
                </div>

                <button onClick={() => navigate('/mis-vehiculos')}>
                  Ver todos →
                </button>
              </div>

              {vehiculos.length ? (
                vehiculos.map(vehiculo => (
                  <div className="client-repair" key={vehiculo.id}>
                    <div className="client-car-icon">🚗</div>

                    <div>
                      <strong>
                        {[vehiculo.marca, vehiculo.modelo]
                          .filter(Boolean).join(' ') ||
                          vehiculo.tipo ||
                          'Vehículo'}
                      </strong>

                      <span>
                        Tipo: {vehiculo.tipo || 'No especificado'}
                      </span>

                      <small>
                        {vehiculo.serial
                          ? `Placa o serial: ${vehiculo.serial}`
                          : `Registro #${vehiculo.id}`}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 24 }}>
                  <p>No tienes vehículos registrados.</p>
                </div>
              )}
            </section>

            <section className="client-panel" style={{ marginTop: 24 }}>
              <div className="client-panel-header">
                <div>
                  <span>COTIZACIONES</span>
                  <h2>Mis cotizaciones recientes</h2>
                </div>

                <button onClick={() => navigate('/mis-cotizaciones')}>
                  Ver todas →
                </button>
              </div>

              {cotizaciones.length ? (
                cotizaciones.map(cotizacion => (
                  <div className="client-repair" key={cotizacion.id}>
                    <div className="client-car-icon">📄</div>

                    <div>
                      <strong>
                        Cotización #{cotizacion.id}
                      </strong>

                      <span>
                        Total: {dinero(cotizacion.total)}
                      </span>

                      <small>
                        {cotizacion.fechaCotizacion
                          ? new Date(cotizacion.fechaCotizacion)
                              .toLocaleDateString('es-CO')
                          : 'Fecha no disponible'}
                      </small>
                    </div>

                    <b className={`client-status ${
                      cotizacion.aprobada === true
                        ? 'completed'
                        : cotizacion.aprobada === false
                          ? 'pending'
                          : 'progress'
                    }`}>
                      {cotizacion.aprobada === true
                        ? 'APROBADA'
                        : cotizacion.aprobada === false
                          ? 'RECHAZADA'
                          : 'PENDIENTE'}
                    </b>
                  </div>
                ))
              ) : (
                <div style={{ padding: 24 }}>
                  <p>No tienes cotizaciones registradas.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default DashboardCliente
