import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AutoCoreSidebar from '../components/AutoCoreSidebar'
import {
  obtenerClientes,
  obtenerReparaciones,
  obtenerRepuestos,
  obtenerPedidos
} from '../services/api'

import './DashboardAdminC.css'

function DashboardAdmin() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [resumen, setResumen] = useState({ clientes: [], reparaciones: [], repuestos: [], pedidos: [] })

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

      if (
        String(datos?.rol || '').toUpperCase() !==
        'ADMIN'
      ) {
        navigate('/dashboard')
        return
      }

      setUsuario(datos)

    } catch {
      localStorage.removeItem('usuario')
      navigate('/')
    }

  }, [navigate])

  useEffect(() => {
    let activo = true
    Promise.all([
      obtenerClientes(),
      obtenerReparaciones(),
      obtenerRepuestos(),
      obtenerPedidos()
    ]).then(([clientes, reparaciones, repuestos, pedidos]) => {
      if (activo) setResumen({
        clientes: clientes || [],
        reparaciones: reparaciones || [],
        repuestos: repuestos || [],
        pedidos: pedidos || []
      })
    }).catch(() => {
      if (activo) setResumen({ clientes: [], reparaciones: [], repuestos: [], pedidos: [] })
    })
    return () => { activo = false }
  }, [])

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const nombre =
    usuario?.nombre ||
    usuario?.email ||
    'Administrador'

  const reparacionesActivas = resumen.reparaciones.filter(item =>
    !['FINALIZADA', 'ENTREGADO', 'RECHAZADO'].includes(String(item.estado || '').toUpperCase())
  )
  const inventarioBajo = resumen.repuestos.filter(item => Number(item.stock || 0) <= 10)
  const ingresos = resumen.pedidos.reduce((total, item) => total + Number(item.total || 0), 0)
  const formatoDinero = valor => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(valor)

  return (
    <div className="dashboard-page">

      <AutoCoreSidebar active="dashboard" onLogout={cerrarSesion} />

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <p className="header-label">
              PANEL DE ADMINISTRACIÓN
            </p>

            <h1>
              Dashboard
            </h1>
          </div>

          <div className="header-user">

            <button className="notification-button">
              🔔
              <span></span>
            </button>

            <div className="user-info">

              <div className="user-avatar">
                {nombre
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {nombre}
                </strong>

                <small>
                  ADMINISTRADOR
                </small>
              </div>

            </div>

          </div>

        </header>

        <section className="welcome-card">

          <div>

            <span className="welcome-badge">
              AUTOCORE
            </span>

            <h2>
              Bienvenido, {nombre} 👋
            </h2>

            <p>
              Este es el panel administrativo
              de AutoCore.
            </p>

          </div>

          <div className="welcome-car">
            🚗
          </div>

        </section>

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              👥
            </div>

            <div>
              <span>
                Clientes
              </span>

              <strong>
                {resumen.clientes.length}
              </strong>

              <small>
                Registrados
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              📦
            </div>

            <div>
              <span>
                Repuestos
              </span>

              <strong>
                {resumen.repuestos.length}
              </strong>

              <small>
                Registrados
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              🔧
            </div>

            <div>
              <span>
                Reparaciones
              </span>

              <strong>
                {reparacionesActivas.length}
              </strong>

              <small>
                En proceso
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              💰
            </div>

            <div>
              <span>
                Ventas
              </span>

              <strong>
                {formatoDinero(ingresos)}
              </strong>

              <small>
                Este mes
              </small>
            </div>
          </div>

        </section>

        <section className="admin-overview-grid">
          <div className="admin-overview-panel">
            <div className="admin-overview-heading">
              <div>
                <span>SEGUIMIENTO DEL TALLER</span>
                <h2>Reparaciones recientes</h2>
              </div>
              <button onClick={() => navigate('/reparaciones')}>Ver todas →</button>
            </div>
            {resumen.reparaciones.slice(0, 4).map(item => (
              <div className="admin-overview-row" key={item.id}>
                <span className="admin-row-icon">🔧</span>
                <div className="admin-row-main">
                  <strong>Reparación #{item.id}</strong>
                  <small>{item.equipoMarca || item.equipo?.marca || 'Vehículo'} {item.equipoModelo || item.equipo?.modelo || ''}</small>
                </div>
                <b className={`admin-state ${String(item.estado || '').toUpperCase().includes('REPARACION') ? 'in-progress' : 'waiting'}`}>
                  {String(item.estado || 'Recibido').replaceAll('_', ' ')}
                </b>
              </div>
            ))}
            {!resumen.reparaciones.length && <p className="admin-overview-empty">Aún no hay reparaciones registradas.</p>}
          </div>

          <div className="admin-overview-panel stock-panel">
            <div className="admin-overview-heading">
              <div>
                <span>ALERTA DE EXISTENCIAS</span>
                <h2>Inventario bajo</h2>
              </div>
              <button onClick={() => navigate('/inventario')}>Inventario →</button>
            </div>
            {inventarioBajo.slice(0, 4).map(item => (
              <div className="stock-overview-row" key={item.id}>
                <span className="stock-dot" />
                <strong>{item.nombre || item.descripcion || `Repuesto #${item.id}`}</strong>
                <b>{Number(item.stock || 0)} uds.</b>
              </div>
            ))}
            {!inventarioBajo.length && <p className="admin-overview-empty">No hay repuestos con stock bajo.</p>}
          </div>
        </section>

        <section className="dashboard-grid">

          <div className="panel recent-panel">

            <div className="panel-header">

              <div>
                <span>
                  ADMINISTRACIÓN
                </span>

                <h3>
                  Accesos administrativos
                </h3>
              </div>

            </div>

            <div className="orders-table">

              <div className="table-row">

                <strong>
                  👥 Clientes
                </strong>

                <span>
                  Gestionar clientes y vehículos
                </span>

                <button
                  onClick={() =>
                    navigate('/clientes')
                  }
                >
                  Abrir →
                </button>
              </div>

              <div className="table-row">
                <strong>
                  📦 Inventario
                </strong>

                <span>
                  Controlar existencias
                </span>

                <button
                  onClick={() =>
                    navigate('/inventario')
                  }
                >
                  Abrir →
                </button>
              </div>

              <div className="table-row">
                <strong>
                  📊 Reportes
                </strong>

                <span>
                  Consultar información del taller
                </span>

                <button
                  onClick={() =>
                    navigate('/reportes')
                  }
                >
                  Abrir →
                </button>
              </div>

            </div>

          </div>

          <div className="panel quick-panel">

            <div className="panel-header">

              <div>
                <span>
                  ACCIONES
                </span>

                <h3>
                  Acciones rápidas
                </h3>
              </div>

            </div>

            <button
              className="quick-action"
              onClick={() =>
                navigate('/clientes')
              }
            >
              <span>
                ➕
              </span>

              <div>
                <strong>
                  Nuevo cliente
                </strong>

                <small>
                  Registrar un cliente
                </small>
              </div>

              <b>
                →
              </b>
            </button>

            <button
              className="quick-action"
              onClick={() =>
                navigate('/reparaciones')
              }
            >
              <span>
                🔧
              </span>

              <div>
                <strong>
                  Nueva reparación
                </strong>

                <small>
                  Crear una reparación
                </small>
              </div>

              <b>
                →
              </b>
            </button>

            <button
              className="quick-action"
              onClick={() =>
                navigate('/repuestos')
              }
            >
              <span>
                📦
              </span>

              <div>
                <strong>
                  Nuevo repuesto
                </strong>

                <small>
                  Registrar un repuesto
                </small>
              </div>

              <b>
                →
              </b>
            </button>

          </div>

        </section>

      </main>

    </div>
  )
}

export default DashboardAdmin
