import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './DashboardAdminC.css'

function DashboardAdmin() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

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

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const nombre =
    usuario?.nombre ||
    usuario?.email ||
    'Administrador'

  return (
    <div className="dashboard-page">

      <aside className="sidebar">

        <div className="sidebar-logo">
          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>
        </div>

        <nav className="sidebar-menu">

          <p className="menu-title">
            ADMINISTRACIÓN
          </p>

          <button className="menu-item active">
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate('/clientes')
            }
          >
            <span>👥</span>
            Clientes
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Repuestos
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate('/inventario')
            }
          >
            <span>📦</span>
            Inventario
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate('/reparaciones')
            }
          >
            <span>🔧</span>
            Reparaciones
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate('/ordenes')
            }
          >
            <span>▤</span>
            Órdenes
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate('/ventas')
            }
          >
            <span>▥</span>
            Ventas
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate('/reportes')
            }
          >
            <span>▦</span>
            Reportes
          </button>

          <p className="menu-title menu-title-bottom">
            SISTEMA
          </p>

          <button
            className="menu-item"
            onClick={() =>
              navigate('/configuracion')
            }
          >
            <span>⚙</span>
            Configuración
          </button>

        </nav>

        <button
          className="logout-button"
          onClick={cerrarSesion}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

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
                45
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
                128
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
                17
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
                $2.8M
              </strong>

              <small>
                Este mes
              </small>
            </div>
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

                <button
                  onClick={() =>
                    navigate('/usuarios')
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