import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  obtenerOrdenes,
  cambiarEstadoReparacion
} from '../services/api'

import './OrdenesC.css'

function Ordenes() {

  const navigate = useNavigate()

  const [ordenes, setOrdenes] = useState([])
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

    cargarOrdenes()

  }, [navigate])

  const cargarOrdenes = async () => {

    try {

      setCargando(true)

      const datos = await obtenerOrdenes()

      setOrdenes(datos || [])

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible cargar las órdenes.'
      )

    } finally {

      setCargando(false)

    }
  }

  const cambiarEstado = async (orden, nuevoEstado) => {

    try {

      await cambiarEstadoReparacion(
        orden.id,
        nuevoEstado
      )

      await cargarOrdenes()

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible actualizar el estado.'
      )
    }
  }

  const obtenerNombreEquipo = (orden) => {

    const partes = [
      orden.equipoMarca,
      orden.equipoModelo
    ].filter(Boolean)

    return partes.length
      ? partes.join(' ')
      : orden.equipoTipo || 'Equipo'
  }

  const obtenerClaseEstado = (estado) => {

    const estados = {
      RECIBIDO: 'received',
      EN_DIAGNOSTICO: 'diagnostic',
      COTIZACION_PENDIENTE: 'pending',
      ESPERANDO_APROBACION: 'waiting',
      EN_REPARACION: 'repairing',
      FINALIZADO: 'finished',
      ENTREGADO: 'delivered',
      RECHAZADO: 'rejected'
    }

    return estados[estado] || 'received'
  }

  const obtenerTextoEstado = (estado) => {

    const estados = {
      RECIBIDO: 'Recibido',
      EN_DIAGNOSTICO: 'En diagnóstico',
      COTIZACION_PENDIENTE: 'Cotización pendiente',
      ESPERANDO_APROBACION: 'Esperando aprobación',
      EN_REPARACION: 'En reparación',
      FINALIZADO: 'Finalizado',
      ENTREGADO: 'Entregado',
      RECHAZADO: 'Rechazado'
    }

    return estados[estado] || estado
  }

  const formatearFecha = (fecha) => {

    if (!fecha) {
      return '—'
    }

    return new Date(fecha).toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    )
  }

  const ordenesFiltradas = ordenes.filter(
    orden => {

      const texto =
        `${orden.clienteNombre || ''}
        ${obtenerNombreEquipo(orden)}
        ${orden.fallaReportada || ''}
        ${orden.tecnicoNombre || ''}
        ${orden.id || ''}`
          .toLowerCase()

      const coincideBusqueda =
        texto.includes(
          busqueda.toLowerCase()
        )

      const coincideEstado =
        filtroEstado === 'TODOS' ||
        orden.estado === filtroEstado

      return (
        coincideBusqueda &&
        coincideEstado
      )
    }
  )

  const totalOrdenes = ordenes.length

  const recibidas = ordenes.filter(
    orden => orden.estado === 'RECIBIDO'
  ).length

  const enProceso = ordenes.filter(
    orden =>
      [
        'EN_DIAGNOSTICO',
        'COTIZACION_PENDIENTE',
        'ESPERANDO_APROBACION',
        'EN_REPARACION'
      ].includes(orden.estado)
  ).length

  const finalizadas = ordenes.filter(
    orden =>
      [
        'FINALIZADO',
        'ENTREGADO'
      ].includes(orden.estado)
  ).length

  return (

    <div className="ordenes-page">

      <aside className="ordenes-sidebar">

        <div className="ordenes-sidebar-logo">
          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>
        </div>

        <nav className="ordenes-menu">

          <p className="ordenes-menu-title">
            MENÚ PRINCIPAL
          </p>

          <button
            className="ordenes-menu-item"
            onClick={() => navigate('/dashboard')}
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="ordenes-menu-item"
            onClick={() => navigate('/inventario')}
          >
            <span>▣</span>
            Inventario
          </button>

          <button
            className="ordenes-menu-item"
            onClick={() => navigate('/reparaciones')}
          >
            <span>🔧</span>
            Reparaciones
          </button>

          <button
            className="ordenes-menu-item"
            onClick={() => navigate('/clientes')}
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className="ordenes-menu-item"
            onClick={() => navigate('/inventario')}
          >
            <span>⚙</span>
            Repuestos
          </button>

          <button className="ordenes-menu-item active">
            <span>▤</span>
            Órdenes
          </button>

          <button
            className="ordenes-menu-item"
            onClick={() => navigate('/ventas')}
          >
            <span>▥</span>
            Ventas
          </button>

          <button
            className="ordenes-menu-item"
            onClick={() => navigate('/reportes')}
          >
            <span>▦</span>
            Reportes
          </button>

          <p className="ordenes-menu-title ordenes-system">
            SISTEMA
          </p>

          <button
            className="ordenes-menu-item"
            onClick={() => navigate('/configuracion')}
          >
            <span>⚙</span>
            Configuración
          </button>

        </nav>

        <button
          className="ordenes-logout"
          onClick={() => {
            localStorage.removeItem('usuario')
            navigate('/')
          }}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

      <main className="ordenes-main">

        <header className="ordenes-header">

          <div>

            <p className="ordenes-header-label">
              GESTIÓN DEL TALLER
            </p>

            <h1>
              Órdenes
            </h1>

            <p className="ordenes-header-description">
              Consulta y controla las órdenes de servicio del taller.
            </p>

          </div>

          <div className="ordenes-user">

            <div className="ordenes-notification">
              🔔
              <span></span>
            </div>

            <div className="ordenes-avatar">
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

        <section className="ordenes-stats">

          <div className="orden-stat-card">

            <div className="orden-stat-icon blue">
              ▤
            </div>

            <div>
              <span>
                Total órdenes
              </span>

              <strong>
                {totalOrdenes}
              </strong>

              <small>
                Registradas
              </small>
            </div>

          </div>

          <div className="orden-stat-card">

            <div className="orden-stat-icon orange">
              ↓
            </div>

            <div>
              <span>
                Recibidas
              </span>

              <strong>
                {recibidas}
              </strong>

              <small>
                Pendientes
              </small>
            </div>

          </div>

          <div className="orden-stat-card">

            <div className="orden-stat-icon purple">
              🔧
            </div>

            <div>
              <span>
                En proceso
              </span>

              <strong>
                {enProceso}
              </strong>

              <small>
                En atención
              </small>
            </div>

          </div>

          <div className="orden-stat-card">

            <div className="orden-stat-icon green">
              ✓
            </div>

            <div>
              <span>
                Finalizadas
              </span>

              <strong>
                {finalizadas}
              </strong>

              <small>
                Completadas
              </small>
            </div>

          </div>

        </section>

        <section className="ordenes-panel">

          <div className="ordenes-panel-header">

            <div>

              <span>
                SERVICIO
              </span>

              <h2>
                Órdenes registradas
              </h2>

            </div>

            <button
              className="nueva-orden-button"
              onClick={() =>
                navigate('/reparaciones')
              }
            >
              + Nueva orden
            </button>

          </div>

          <div className="ordenes-filtros">

            <div className="ordenes-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar cliente, vehículo, técnico o falla..."
                value={busqueda}
                onChange={e =>
                  setBusqueda(e.target.value)
                }
              />

            </div>

            <select
              value={filtroEstado}
              onChange={e =>
                setFiltroEstado(e.target.value)
              }
            >

              <option value="TODOS">
                Todos los estados
              </option>

              <option value="RECIBIDO">
                Recibido
              </option>

              <option value="EN_DIAGNOSTICO">
                En diagnóstico
              </option>

              <option value="COTIZACION_PENDIENTE">
                Cotización pendiente
              </option>

              <option value="ESPERANDO_APROBACION">
                Esperando aprobación
              </option>

              <option value="EN_REPARACION">
                En reparación
              </option>

              <option value="FINALIZADO">
                Finalizado
              </option>

              <option value="ENTREGADO">
                Entregado
              </option>

              <option value="RECHAZADO">
                Rechazado
              </option>

            </select>

          </div>

          <div className="ordenes-table-wrapper">

            <table className="ordenes-table">

              <thead>

                <tr>
                  <th>ORDEN</th>
                  <th>CLIENTE</th>
                  <th>VEHÍCULO / EQUIPO</th>
                  <th>TÉCNICO</th>
                  <th>FECHA</th>
                  <th>ESTADO</th>
                  <th>ACCIÓN</th>
                </tr>

              </thead>

              <tbody>

                {cargando ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="ordenes-loading"
                    >
                      Cargando órdenes...
                    </td>

                  </tr>

                ) : ordenesFiltradas.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="ordenes-empty"
                    >

                      <div>
                        <span>📋</span>

                        <strong>
                          No hay órdenes
                        </strong>

                        <small>
                          No se encontraron órdenes con los filtros seleccionados.
                        </small>
                      </div>

                    </td>

                  </tr>

                ) : (

                  ordenesFiltradas.map(
                    orden => (

                      <tr key={orden.id}>

                        <td>

                          <strong className="orden-number">
                            #ORD-{String(
                              orden.id
                            ).padStart(3, '0')}
                          </strong>

                        </td>

                        <td>

                          <div className="orden-cliente">

                            <div className="orden-cliente-avatar">
                              {(
                                orden.clienteNombre ||
                                'C'
                              ).charAt(0)}
                            </div>

                            <div>

                              <strong>
                                {orden.clienteNombre ||
                                  'Sin cliente'}
                              </strong>

                              <small>
                                Cliente #{orden.clienteId}
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>

                          <div className="orden-equipo">

                            <strong>
                              {obtenerNombreEquipo(
                                orden
                              )}
                            </strong>

                            <small>
                              {orden.equipoTipo ||
                                'Equipo'}
                            </small>

                          </div>

                        </td>

                        <td>

                          {orden.tecnicoNombre ? (

                            <div className="orden-tecnico">

                              <span>
                                {orden.tecnicoNombre.charAt(0)}
                              </span>

                              <strong>
                                {orden.tecnicoNombre}
                              </strong>

                            </div>

                          ) : (

                            <span className="sin-tecnico">
                              Sin asignar
                            </span>

                          )}

                        </td>

                        <td>
                          {formatearFecha(
                            orden.fechaIngreso
                          )}
                        </td>

                        <td>

                          <span
                            className={`orden-status ${obtenerClaseEstado(
                              orden.estado
                            )}`}
                          >
                            <i></i>

                            {obtenerTextoEstado(
                              orden.estado
                            )}

                          </span>

                        </td>

                        <td>

                          <select
                            className="orden-action-select"
                            value=""
                            onChange={e => {

                              if (
                                e.target.value
                              ) {

                                cambiarEstado(
                                  orden,
                                  e.target.value
                                )
                              }

                            }}
                          >

                            <option value="">
                              Acciones
                            </option>

                            {orden.estado !== 'EN_DIAGNOSTICO' && (
                              <option value="EN_DIAGNOSTICO">
                                Pasar a diagnóstico
                              </option>
                            )}

                            {orden.estado !== 'EN_REPARACION' && (
                              <option value="EN_REPARACION">
                                En reparación
                              </option>
                            )}

                            {orden.estado !== 'FINALIZADO' && (
                              <option value="FINALIZADO">
                                Finalizar
                              </option>
                            )}

                            {orden.estado !== 'ENTREGADO' && (
                              <option value="ENTREGADO">
                                Entregar
                              </option>
                            )}

                          </select>

                        </td>

                      </tr>

                    )
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

export default Ordenes