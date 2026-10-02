import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  obtenerCotizaciones,
  aprobarCotizacion,
  rechazarCotizacion
} from '../services/api'

import { obtenerReparaciones } from '../services/api'

import './VentasC.css'

function Ventas() {

  const navigate = useNavigate()

  const [cotizaciones, setCotizaciones] = useState([])
  const [reparaciones, setReparaciones] = useState([])

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  const [cargando, setCargando] = useState(true)

  useEffect(() => {

    const usuarioGuardado =
      localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      navigate('/')
      return
    }

    cargarDatos()

  }, [navigate])

  const cargarDatos = async () => {

    try {

      setCargando(true)

      const [cotizacionesData, reparacionesData] =
        await Promise.all([
          obtenerCotizaciones(),
          obtenerReparaciones()
        ])

      setCotizaciones(
        cotizacionesData || []
      )

      setReparaciones(
        reparacionesData || []
      )

    } catch (error) {

      console.error(
        'Error cargando ventas:',
        error
      )

      alert(
        error.message ||
        'No fue posible cargar las ventas.'
      )

    } finally {

      setCargando(false)

    }
  }

  const obtenerReparacion = (id) => {

    return reparaciones.find(
      reparacion =>
        reparacion.id === id
    )
  }

  const obtenerEstado = (cotizacion) => {

    if (cotizacion.aprobada === true) {
      return 'APROBADA'
    }

    if (cotizacion.aprobada === false) {
      return 'RECHAZADA'
    }

    return 'PENDIENTE'
  }

  const obtenerTextoEstado = (cotizacion) => {

    const estado =
      obtenerEstado(cotizacion)

    if (estado === 'APROBADA') {
      return 'Aprobada'
    }

    if (estado === 'RECHAZADA') {
      return 'Rechazada'
    }

    return 'Pendiente'
  }

  const obtenerClaseEstado = (cotizacion) => {

    const estado =
      obtenerEstado(cotizacion)

    if (estado === 'APROBADA') {
      return 'approved'
    }

    if (estado === 'RECHAZADA') {
      return 'rejected'
    }

    return 'pending'
  }

  const aprobar = async (cotizacion) => {

    const confirmar =
      window.confirm(
        '¿Deseas aprobar esta cotización?'
      )

    if (!confirmar) {
      return
    }

    try {

      await aprobarCotizacion(
        cotizacion.id
      )

      await cargarDatos()

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible aprobar la cotización.'
      )
    }
  }

  const rechazar = async (cotizacion) => {

    const confirmar =
      window.confirm(
        '¿Deseas rechazar esta cotización?'
      )

    if (!confirmar) {
      return
    }

    try {

      await rechazarCotizacion(
        cotizacion.id
      )

      await cargarDatos()

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible rechazar la cotización.'
      )
    }
  }

  const formatoDinero = (valor) => {

    return new Intl.NumberFormat(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
      }
    ).format(valor || 0)

  }

  const formatoFecha = (fecha) => {

    if (!fecha) {
      return '—'
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    )
  }

  const cotizacionesFiltradas =
    cotizaciones.filter(
      cotizacion => {

        const reparacion =
          obtenerReparacion(
            cotizacion.reparacionId
          )

        const texto = `
          ${cotizacion.id || ''}
          ${cotizacion.reparacionId || ''}
          ${reparacion?.clienteNombre || ''}
          ${reparacion?.equipoMarca || ''}
          ${reparacion?.equipoModelo || ''}
          ${reparacion?.fallaReportada || ''}
        `.toLowerCase()

        const coincideBusqueda =
          texto.includes(
            busqueda.toLowerCase()
          )

        const coincideEstado =
          filtroEstado === 'TODOS' ||
          obtenerEstado(cotizacion) ===
            filtroEstado

        return (
          coincideBusqueda &&
          coincideEstado
        )
      }
    )

  const total =
    cotizaciones.length

  const pendientes =
    cotizaciones.filter(
      cotizacion =>
        cotizacion.aprobada === null
    ).length

  const aprobadas =
    cotizaciones.filter(
      cotizacion =>
        cotizacion.aprobada === true
    ).length

  const rechazadas =
    cotizaciones.filter(
      cotizacion =>
        cotizacion.aprobada === false
    ).length

  const ventasAprobadas =
    cotizaciones
      .filter(
        cotizacion =>
          cotizacion.aprobada === true
      )
      .reduce(
        (acumulado, cotizacion) =>
          acumulado +
          Number(
            cotizacion.total || 0
          ),
        0
      )

  return (

    <div className="ventas-page">

      <aside className="ventas-sidebar">

        <div className="ventas-sidebar-logo">

          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>

        </div>

        <nav className="ventas-menu">

          <p className="ventas-menu-title">
            MENÚ PRINCIPAL
          </p>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/inventario')
            }
          >
            <span>▣</span>
            Inventario
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/reparaciones')
            }
          >
            <span>🔧</span>
            Reparaciones
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/clientes')
            }
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Repuestos
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/ordenes')
            }
          >
            <span>▤</span>
            Órdenes
          </button>

          <button
            className="ventas-menu-item active"
          >
            <span>▥</span>
            Ventas
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/reportes')
            }
          >
            <span>▦</span>
            Reportes
          </button>

          <p className="ventas-menu-title ventas-system">
            SISTEMA
          </p>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/configuracion')
            }
          >
            <span>⚙</span>
            Configuración
          </button>

        </nav>

        <button
          className="ventas-logout"
          onClick={() => {

            localStorage.removeItem(
              'usuario'
            )

            navigate('/')

          }}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

      <main className="ventas-main">

        <header className="ventas-header">

          <div>

            <p className="ventas-header-label">
              GESTIÓN COMERCIAL
            </p>

            <h1>
              Ventas
            </h1>

            <p className="ventas-header-description">
              Administra cotizaciones y ventas generadas por el taller.
            </p>

          </div>

          <div className="ventas-user">

            <div className="ventas-notification">
              🔔
              <span></span>
            </div>

            <div className="ventas-avatar">
              U
            </div>

            <div>

              <strong>
                Usuario
              </strong>

              <small>
                ADMIN
              </small>

            </div>

          </div>

        </header>

        <section className="ventas-stats">

          <div className="venta-stat-card">

            <div className="venta-stat-icon blue">
              $
            </div>

            <div>

              <span>
                Ventas aprobadas
              </span>

              <strong>
                {formatoDinero(
                  ventasAprobadas
                )}
              </strong>

              <small>
                Valor generado
              </small>

            </div>

          </div>

          <div className="venta-stat-card">

            <div className="venta-stat-icon orange">
              ◷
            </div>

            <div>

              <span>
                Pendientes
              </span>

              <strong>
                {pendientes}
              </strong>

              <small>
                Por responder
              </small>

            </div>

          </div>

          <div className="venta-stat-card">

            <div className="venta-stat-icon green">
              ✓
            </div>

            <div>

              <span>
                Aprobadas
              </span>

              <strong>
                {aprobadas}
              </strong>

              <small>
                Confirmadas
              </small>

            </div>

          </div>

          <div className="venta-stat-card">

            <div className="venta-stat-icon red">
              !
            </div>

            <div>

              <span>
                Rechazadas
              </span>

              <strong>
                {rechazadas}
              </strong>

              <small>
                No aprobadas
              </small>

            </div>

          </div>

        </section>

        <section className="ventas-panel">

          <div className="ventas-panel-header">

            <div>

              <span>
                COMERCIAL
              </span>

              <h2>
                Cotizaciones y ventas
              </h2>

            </div>

            <button
              className="nueva-venta-button"
              onClick={() =>
                navigate('/reparaciones')
              }
            >
              + Nueva cotización
            </button>

          </div>

          <div className="ventas-filtros">

            <div className="ventas-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar cliente, reparación o equipo..."
                value={busqueda}
                onChange={e =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              value={filtroEstado}
              onChange={e =>
                setFiltroEstado(
                  e.target.value
                )
              }
            >

              <option value="TODOS">
                Todos los estados
              </option>

              <option value="PENDIENTE">
                Pendientes
              </option>

              <option value="APROBADA">
                Aprobadas
              </option>

              <option value="RECHAZADA">
                Rechazadas
              </option>

            </select>

          </div>

          <div className="ventas-table-wrapper">

            <table className="ventas-table">

              <thead>

                <tr>
                  <th>COTIZACIÓN</th>
                  <th>CLIENTE</th>
                  <th>REPARACIÓN</th>
                  <th>MANO DE OBRA</th>
                  <th>TOTAL</th>
                  <th>ESTADO</th>
                  <th>ACCIÓN</th>
                </tr>

              </thead>

              <tbody>

                {cargando ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="ventas-loading"
                    >
                      Cargando ventas...
                    </td>

                  </tr>

                ) : cotizacionesFiltradas.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="ventas-empty"
                    >

                      <div>

                        <span>
                          💰
                        </span>

                        <strong>
                          No hay ventas registradas
                        </strong>

                        <small>
                          Las cotizaciones aparecerán aquí cuando se creen desde una reparación.
                        </small>

                      </div>

                    </td>

                  </tr>

                ) : (

                  cotizacionesFiltradas.map(
                    cotizacion => {

                      const reparacion =
                        obtenerReparacion(
                          cotizacion.reparacionId
                        )

                      return (

                        <tr
                          key={
                            cotizacion.id
                          }
                        >

                          <td>

                            <strong className="venta-number">
                              #COT-{String(
                                cotizacion.id
                              ).padStart(
                                3,
                                '0'
                              )}
                            </strong>

                            <small className="venta-date">
                              {formatoFecha(
                                cotizacion.fechaCotizacion
                              )}
                            </small>

                          </td>

                          <td>

                            <div className="venta-cliente">

                              <div className="venta-cliente-avatar">
                                {(
                                  reparacion?.clienteNombre ||
                                  'C'
                                ).charAt(0)}
                              </div>

                              <div>

                                <strong>
                                  {reparacion?.clienteNombre ||
                                    'Sin cliente'}
                                </strong>

                                <small>
                                  Cliente #
                                  {reparacion?.clienteId ||
                                    '—'}
                                </small>

                              </div>

                            </div>

                          </td>

                          <td>

                            <div className="venta-reparacion">

                              <strong>
                                #
                                {cotizacion.reparacionId}
                              </strong>

                              <small>
                                {reparacion
                                  ? `${reparacion.equipoMarca || ''} ${reparacion.equipoModelo || ''}`
                                  : 'Reparación'}
                              </small>

                            </div>

                          </td>

                          <td>

                            <strong className="venta-money">
                              {formatoDinero(
                                cotizacion.manoObra
                              )}
                            </strong>

                          </td>

                          <td>

                            <strong className="venta-total">
                              {formatoDinero(
                                cotizacion.total
                              )}
                            </strong>

                          </td>

                          <td>

                            <span
                              className={`venta-status ${obtenerClaseEstado(
                                cotizacion
                              )}`}
                            >

                              <i></i>

                              {obtenerTextoEstado(
                                cotizacion
                              )}

                            </span>

                          </td>

                          <td>

                            {cotizacion.aprobada === null ? (

                              <div className="venta-actions">

                                <button
                                  className="approve-button"
                                  onClick={() =>
                                    aprobar(
                                      cotizacion
                                    )
                                  }
                                >
                                  ✓
                                </button>

                                <button
                                  className="reject-button"
                                  onClick={() =>
                                    rechazar(
                                      cotizacion
                                    )
                                  }
                                >
                                  ×
                                </button>

                              </div>

                            ) : (

                              <span className="venta-completed">
                                —
                              </span>

                            )}

                          </td>

                        </tr>

                      )

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  )
}

export default Ventas