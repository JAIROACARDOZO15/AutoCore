import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  obtenerClientes,
  obtenerRepuestos,
  obtenerReparaciones,
  obtenerCotizaciones
} from '../services/api'

import './ReportesC.css'

function Reportes() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(null)

  const [clientes, setClientes] = useState([])
  const [repuestos, setRepuestos] = useState([])
  const [reparaciones, setReparaciones] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [periodo, setPeriodo] = useState('TODO')

  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      navigate('/')
      return
    }

    try {
      const datos =
        JSON.parse(usuarioGuardado)

      const rol =
        String(datos?.rol || '').toUpperCase()

      if (rol !== 'ADMIN') {
        navigate('/dashboard')
        return
      }

      setUsuario(datos)

      cargarDatos()

    } catch {
      localStorage.removeItem('usuario')
      navigate('/')
    }

  }, [navigate])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError('')

      const [
        clientesData,
        repuestosData,
        reparacionesData,
        cotizacionesData
      ] = await Promise.all([
        obtenerClientes(),
        obtenerRepuestos(),
        obtenerReparaciones(),
        obtenerCotizaciones()
      ])

      setClientes(
        Array.isArray(clientesData)
          ? clientesData
          : clientesData?.data || []
      )

      setRepuestos(
        Array.isArray(repuestosData)
          ? repuestosData
          : repuestosData?.data || []
      )

      setReparaciones(
        Array.isArray(reparacionesData)
          ? reparacionesData
          : reparacionesData?.data || []
      )

      setCotizaciones(
        Array.isArray(cotizacionesData)
          ? cotizacionesData
          : cotizacionesData?.data || []
      )

    } catch (error) {
      console.error(
        'Error cargando reportes:',
        error
      )

      setError(
        error.message ||
        'No fue posible cargar los reportes.'
      )

    } finally {
      setCargando(false)
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const nombre =
    usuario?.nombre ||
    usuario?.email ||
    'Administrador'

  const formatoDinero = (valor) => {
    return new Intl.NumberFormat(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
      }
    ).format(Number(valor) || 0)
  }

  const formatoFecha = (fecha) => {
    if (!fecha) {
      return '—'
    }

    const fechaObjeto =
      new Date(fecha)

    if (
      Number.isNaN(
        fechaObjeto.getTime()
      )
    ) {
      return '—'
    }

    return fechaObjeto.toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    )
  }

  const obtenerEstadoCotizacion = (
    cotizacion
  ) => {

    if (
      cotizacion.aprobada === true
    ) {
      return 'APROBADA'
    }

    if (
      cotizacion.aprobada === false
    ) {
      return 'RECHAZADA'
    }

    return 'PENDIENTE'
  }

  const fechaDentroDelPeriodo = (
    fecha
  ) => {

    if (periodo === 'TODO') {
      return true
    }

    if (!fecha) {
      return true
    }

    const fechaRegistro =
      new Date(fecha)

    if (
      Number.isNaN(
        fechaRegistro.getTime()
      )
    ) {
      return true
    }

    const ahora = new Date()

    if (periodo === 'MES') {

      return (
        fechaRegistro.getMonth() ===
          ahora.getMonth() &&
        fechaRegistro.getFullYear() ===
          ahora.getFullYear()
      )
    }

    if (periodo === '30') {

      const limite =
        new Date()

      limite.setDate(
        limite.getDate() - 30
      )

      return fechaRegistro >= limite
    }

    if (periodo === '90') {

      const limite =
        new Date()

      limite.setDate(
        limite.getDate() - 90
      )

      return fechaRegistro >= limite
    }

    return true
  }

  const cotizacionesFiltradas =
    useMemo(() => {

      return cotizaciones.filter(
        cotizacion =>
          fechaDentroDelPeriodo(
            cotizacion.fechaCotizacion
          )
      )

    }, [
      cotizaciones,
      periodo
    ])

  const estadisticas = useMemo(() => {

    const pendientes =
      cotizacionesFiltradas.filter(
        cotizacion =>
          obtenerEstadoCotizacion(
            cotizacion
          ) === 'PENDIENTE'
      ).length

    const aprobadas =
      cotizacionesFiltradas.filter(
        cotizacion =>
          obtenerEstadoCotizacion(
            cotizacion
          ) === 'APROBADA'
      )

    const rechazadas =
      cotizacionesFiltradas.filter(
        cotizacion =>
          obtenerEstadoCotizacion(
            cotizacion
          ) === 'RECHAZADA'
      ).length

    const ventas =
      aprobadas.reduce(
        (total, cotizacion) =>
          total +
          Number(
            cotizacion.total || 0
          ),
        0
      )

    const disponibles =
      repuestos.filter(
        repuesto =>
          Number(
            repuesto.stock ?? 0
          ) > 5
      ).length

    const stockBajo =
      repuestos.filter(
        repuesto => {

          const stock =
            Number(
              repuesto.stock ?? 0
            )

          return (
            stock > 0 &&
            stock <= 5
          )
        }
      ).length

    const agotados =
      repuestos.filter(
        repuesto =>
          Number(
            repuesto.stock ?? 0
          ) === 0
      ).length

    return {
      clientes:
        clientes.length,

      repuestos:
        repuestos.length,

      reparaciones:
        reparaciones.length,

      cotizaciones:
        cotizacionesFiltradas.length,

      pendientes,

      aprobadas:
        aprobadas.length,

      rechazadas,

      ventas,

      disponibles,

      stockBajo,

      agotados
    }

  }, [
    clientes,
    repuestos,
    reparaciones,
    cotizacionesFiltradas
  ])

  const reparacionesPorEstado =
    useMemo(() => {

      const resultado = {
        PENDIENTE: 0,
        EN_PROCESO: 0,
        FINALIZADA: 0,
        OTROS: 0
      }

      reparaciones.forEach(
        reparacion => {

          const estado =
            String(
              reparacion.estado || ''
            )
              .toUpperCase()
              .replaceAll(' ', '_')

          if (
            estado === 'PENDIENTE'
          ) {
            resultado.PENDIENTE++
          } else if (
            estado === 'EN_PROCESO' ||
            estado === 'EN PROCESO'
          ) {
            resultado.EN_PROCESO++
          } else if (
            estado === 'FINALIZADA' ||
            estado === 'FINALIZADO' ||
            estado === 'COMPLETADA'
          ) {
            resultado.FINALIZADA++
          } else {
            resultado.OTROS++
          }

        }
      )

      return resultado

    }, [reparaciones])

  const porcentaje = (
    valor,
    total
  ) => {

    if (!total) {
      return 0
    }

    return Math.round(
      (valor / total) * 100
    )
  }

  return (
    <div className="reportes-page">

      <aside className="reportes-sidebar">

        <div className="reportes-logo">

          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>

        </div>

        <nav className="reportes-menu">

          <p className="reportes-menu-title">
            ADMINISTRACIÓN
          </p>

          <button
            className="reportes-menu-item"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="reportes-menu-item"
            onClick={() =>
              navigate('/clientes')
            }
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className="reportes-menu-item"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Repuestos
          </button>

          <button
            className="reportes-menu-item"
            onClick={() =>
              navigate('/inventario')
            }
          >
            <span>▣</span>
            Inventario
          </button>

          <button
            className="reportes-menu-item"
            onClick={() =>
              navigate('/reparaciones')
            }
          >
            <span>🔧</span>
            Reparaciones
          </button>

          <button
            className="reportes-menu-item"
            onClick={() =>
              navigate('/ordenes')
            }
          >
            <span>▤</span>
            Órdenes
          </button>

          <button
            className="reportes-menu-item"
            onClick={() =>
              navigate('/ventas')
            }
          >
            <span>▥</span>
            Ventas
          </button>

          <button
            className="reportes-menu-item active"
          >
            <span>▦</span>
            Reportes
          </button>

          <p className="reportes-menu-title reportes-system">
            SISTEMA
          </p>

          <button
            className="reportes-menu-item"
            onClick={() =>
              navigate('/configuracion')
            }
          >
            <span>⚙</span>
            Configuración
          </button>

        </nav>

        <button
          className="reportes-logout"
          onClick={cerrarSesion}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

      <main className="reportes-main">

        <header className="reportes-header">

          <div>

            <p className="reportes-header-label">
              ANÁLISIS DEL TALLER
            </p>

            <h1>
              Reportes
            </h1>

            <p className="reportes-header-description">
              Consulta el comportamiento general
              de AutoCore.
            </p>

          </div>

          <div className="reportes-user">

            <div className="reportes-avatar">
              {nombre
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {nombre}
              </strong>

              <small>
                ADMIN
              </small>

            </div>

          </div>

        </header>

        <section className="reportes-toolbar">

          <div>

            <span>
              PERÍODO
            </span>

            <select
              value={periodo}
              onChange={e =>
                setPeriodo(
                  e.target.value
                )
              }
            >
              <option value="TODO">
                Todo el historial
              </option>

              <option value="MES">
                Este mes
              </option>

              <option value="30">
                Últimos 30 días
              </option>

              <option value="90">
                Últimos 90 días
              </option>

            </select>

          </div>

          <button
            className="reportes-refresh"
            onClick={cargarDatos}
            disabled={cargando}
          >
            ↻
            {cargando
              ? ' Actualizando...'
              : ' Actualizar datos'}
          </button>

        </section>

        {error && (

          <div className="reportes-error">
            <strong>
              No se pudieron cargar todos
              los datos.
            </strong>

            <span>
              {error}
            </span>

            <button
              onClick={cargarDatos}
            >
              Reintentar
            </button>
          </div>

        )}

        {cargando ? (

          <div className="reportes-loading">

            <div className="loading-spinner">
              ↻
            </div>

            <h2>
              Generando reportes...
            </h2>

            <p>
              Consultando la información
              del taller.
            </p>

          </div>

        ) : (

          <>

            <section className="reportes-stats">

              <div className="report-stat">

                <div className="report-stat-icon blue">
                  ♙
                </div>

                <div>
                  <span>
                    Clientes
                  </span>

                  <strong>
                    {estadisticas.clientes}
                  </strong>

                  <small>
                    Registrados
                  </small>
                </div>

              </div>

              <div className="report-stat">

                <div className="report-stat-icon purple">
                  ⚙
                </div>

                <div>
                  <span>
                    Repuestos
                  </span>

                  <strong>
                    {estadisticas.repuestos}
                  </strong>

                  <small>
                    En catálogo
                  </small>
                </div>

              </div>

              <div className="report-stat">

                <div className="report-stat-icon orange">
                  🔧
                </div>

                <div>
                  <span>
                    Reparaciones
                  </span>

                  <strong>
                    {estadisticas.reparaciones}
                  </strong>

                  <small>
                    Registradas
                  </small>
                </div>

              </div>

              <div className="report-stat">

                <div className="report-stat-icon green">
                  $
                </div>

                <div>
                  <span>
                    Ventas aprobadas
                  </span>

                  <strong className="money-value">
                    {formatoDinero(
                      estadisticas.ventas
                    )}
                  </strong>

                  <small>
                    Cotizaciones aprobadas
                  </small>
                </div>

              </div>

            </section>

            <section className="reportes-grid">

              <div className="report-panel">

                <div className="report-panel-header">

                  <div>
                    <span>
                      COTIZACIONES
                    </span>

                    <h2>
                      Estado comercial
                    </h2>
                  </div>

                  <span className="panel-total">
                    {estadisticas.cotizaciones}
                  </span>

                </div>

                <div className="quote-summary">

                  <div className="quote-row">

                    <div className="quote-label">
                      <i className="dot pending"></i>
                      Pendientes
                    </div>

                    <strong>
                      {estadisticas.pendientes}
                    </strong>

                  </div>

                  <div className="quote-bar">
                    <span
                      style={{
                        width: `${porcentaje(
                          estadisticas.pendientes,
                          estadisticas.cotizaciones
                        )}%`
                      }}
                      className="bar-pending"
                    ></span>
                  </div>

                  <div className="quote-row">

                    <div className="quote-label">
                      <i className="dot approved"></i>
                      Aprobadas
                    </div>

                    <strong>
                      {estadisticas.aprobadas}
                    </strong>

                  </div>

                  <div className="quote-bar">
                    <span
                      style={{
                        width: `${porcentaje(
                          estadisticas.aprobadas,
                          estadisticas.cotizaciones
                        )}%`
                      }}
                      className="bar-approved"
                    ></span>
                  </div>

                  <div className="quote-row">

                    <div className="quote-label">
                      <i className="dot rejected"></i>
                      Rechazadas
                    </div>

                    <strong>
                      {estadisticas.rechazadas}
                    </strong>

                  </div>

                  <div className="quote-bar">
                    <span
                      style={{
                        width: `${porcentaje(
                          estadisticas.rechazadas,
                          estadisticas.cotizaciones
                        )}%`
                      }}
                      className="bar-rejected"
                    ></span>
                  </div>

                </div>

              </div>

              <div className="report-panel">

                <div className="report-panel-header">

                  <div>
                    <span>
                      INVENTARIO
                    </span>

                    <h2>
                      Estado de repuestos
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      navigate('/inventario')
                    }
                  >
                    Ver inventario →
                  </button>

                </div>

                <div className="inventory-report">

                  <div className="inventory-report-card available">

                    <strong>
                      {estadisticas.disponibles}
                    </strong>

                    <span>
                      Disponibles
                    </span>

                  </div>

                  <div className="inventory-report-card low">

                    <strong>
                      {estadisticas.stockBajo}
                    </strong>

                    <span>
                      Stock bajo
                    </span>

                  </div>

                  <div className="inventory-report-card empty">

                    <strong>
                      {estadisticas.agotados}
                    </strong>

                    <span>
                      Agotados
                    </span>

                  </div>

                </div>

                <div className="inventory-warning">

                  <span>
                    ⚠
                  </span>

                  <div>

                    <strong>
                      Atención de inventario
                    </strong>

                    <p>
                      Hay {estadisticas.stockBajo}
                      {' '}repuestos con stock
                      bajo y {estadisticas.agotados}
                      {' '}agotados.
                    </p>

                  </div>

                </div>

              </div>

            </section>

            <section className="reportes-grid">

              <div className="report-panel">

                <div className="report-panel-header">

                  <div>
                    <span>
                      REPARACIONES
                    </span>

                    <h2>
                      Estado del taller
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      navigate('/reparaciones')
                    }
                  >
                    Ver reparaciones →
                  </button>

                </div>

                <div className="repair-report">

                  <div className="repair-report-item">

                    <div>
                      <i className="repair-dot pending"></i>
                    </div>

                    <div className="repair-report-info">

                      <strong>
                        Pendientes
                      </strong>

                      <span>
                        Por iniciar
                      </span>

                    </div>

                    <b>
                      {reparacionesPorEstado.PENDIENTE}
                    </b>

                  </div>

                  <div className="repair-report-item">

                    <div>
                      <i className="repair-dot progress"></i>
                    </div>

                    <div className="repair-report-info">

                      <strong>
                        En proceso
                      </strong>

                      <span>
                        Actualmente en taller
                      </span>

                    </div>

                    <b>
                      {reparacionesPorEstado.EN_PROCESO}
                    </b>

                  </div>

                  <div className="repair-report-item">

                    <div>
                      <i className="repair-dot completed"></i>
                    </div>

                    <div className="repair-report-info">

                      <strong>
                        Finalizadas
                      </strong>

                      <span>
                        Servicios completados
                      </span>

                    </div>

                    <b>
                      {reparacionesPorEstado.FINALIZADA}
                    </b>

                  </div>

                  <div className="repair-report-item">

                    <div>
                      <i className="repair-dot other"></i>
                    </div>

                    <div className="repair-report-info">

                      <strong>
                        Otros estados
                      </strong>

                      <span>
                        Estados registrados
                      </span>

                    </div>

                    <b>
                      {reparacionesPorEstado.OTROS}
                    </b>

                  </div>

                </div>

              </div>

              <div className="report-panel">

                <div className="report-panel-header">

                  <div>
                    <span>
                      RESUMEN
                    </span>

                    <h2>
                      Indicadores
                    </h2>
                  </div>

                </div>

                <div className="indicator-list">

                  <div className="indicator-item">

                    <span>
                      Tasa de aprobación
                    </span>

                    <strong>
                      {porcentaje(
                        estadisticas.aprobadas,
                        estadisticas.cotizaciones
                      )}%
                    </strong>

                  </div>

                  <div className="indicator-item">

                    <span>
                      Tasa de rechazo
                    </span>

                    <strong>
                      {porcentaje(
                        estadisticas.rechazadas,
                        estadisticas.cotizaciones
                      )}%
                    </strong>

                  </div>

                  <div className="indicator-item">

                    <span>
                      Cotizaciones pendientes
                    </span>

                    <strong>
                      {estadisticas.pendientes}
                    </strong>

                  </div>

                  <div className="indicator-item">

                    <span>
                      Repuestos agotados
                    </span>

                    <strong className={
                      estadisticas.agotados > 0
                        ? 'danger-number'
                        : ''
                    }>
                      {estadisticas.agotados}
                    </strong>

                  </div>

                </div>

              </div>

            </section>

            <section className="report-panel report-table-panel">

              <div className="report-panel-header">

                <div>
                  <span>
                    COMERCIAL
                  </span>

                  <h2>
                    Últimas cotizaciones
                  </h2>
                </div>

                <button
                  onClick={() =>
                    navigate('/ventas')
                  }
                >
                  Ir a ventas →
                </button>

              </div>

              {cotizacionesFiltradas.length === 0 ? (

                <div className="report-empty">

                  <span>
                    📊
                  </span>

                  <strong>
                    No hay cotizaciones
                  </strong>

                  <p>
                    No existen cotizaciones
                    para el período seleccionado.
                  </p>

                </div>

              ) : (

                <div className="report-table-wrapper">

                  <table className="report-table">

                    <thead>

                      <tr>
                        <th>COTIZACIÓN</th>
                        <th>REPARACIÓN</th>
                        <th>FECHA</th>
                        <th>TOTAL</th>
                        <th>ESTADO</th>
                      </tr>

                    </thead>

                    <tbody>

                      {cotizacionesFiltradas
                        .slice(0, 8)
                        .map(cotizacion => {

                          const estado =
                            obtenerEstadoCotizacion(
                              cotizacion
                            )

                          return (
                            <tr
                              key={
                                cotizacion.id
                              }
                            >

                              <td>
                                <strong>
                                  #COT-
                                  {String(
                                    cotizacion.id
                                  ).padStart(
                                    3,
                                    '0'
                                  )}
                                </strong>
                              </td>

                              <td>
                                #
                                {cotizacion.reparacionId ||
                                  '—'}
                              </td>

                              <td>
                                {formatoFecha(
                                  cotizacion.fechaCotizacion
                                )}
                              </td>

                              <td>
                                <strong>
                                  {formatoDinero(
                                    cotizacion.total
                                  )}
                                </strong>
                              </td>

                              <td>

                                <span
                                  className={
                                    `report-status ${estado.toLowerCase()}`
                                  }
                                >
                                  {estado}
                                </span>

                              </td>

                            </tr>
                          )

                        })}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </>

        )}

      </main>

    </div>
  )
}

export default Reportes