import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './DashboardClienteC.css'

function DashboardCliente() {
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

      const rol =
        String(datos?.rol || '').toUpperCase()

      if (rol !== 'CLIENTE') {
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
    'Cliente'

  return (
    <div className="client-dashboard">

      <aside className="client-sidebar">

        <div className="client-logo">

          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>

        </div>

        <nav className="client-navigation">

          <p className="client-menu-title">
            MI CUENTA
          </p>

          <button
            className="client-menu active"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Inicio
          </button>

          <button className="client-menu">
            <span>🚗</span>
            Mis vehículos
          </button>

          <button
            className="client-menu"
            onClick={() =>
              navigate('/reparaciones')
            }
          >
            <span>🔧</span>
            Mis reparaciones
          </button>

          <button className="client-menu">
            <span>▤</span>
            Mis cotizaciones
          </button>

          <button className="client-menu">
            <span>▧</span>
            Mis órdenes
          </button>

          <button
            className="client-menu"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Catálogo
          </button>

          <p className="client-menu-title client-system">
            CUENTA
          </p>

          <button className="client-menu">
            <span>♙</span>
            Mi perfil
          </button>

        </nav>

        <button
          className="client-logout"
          onClick={cerrarSesion}
        >
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

            <h1>
              Mi cuenta
            </h1>

            <p>
              Consulta tus vehículos,
              reparaciones y cotizaciones.
            </p>

          </div>

          <div className="client-user">

            <div className="client-avatar">
              {nombre
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="client-user-info">

              <strong>
                {nombre}
              </strong>

              <small>
                CLIENTE
              </small>

            </div>

          </div>

        </header>

        <section className="client-welcome">

          <div>

            <span>
              AUTOCORE
            </span>

            <h2>
              Hola, {nombre} 👋
            </h2>

            <p>
              Aquí puedes consultar el estado
              de tus servicios en el taller.
            </p>

          </div>

          <div className="client-welcome-icon">
            🚗
          </div>

        </section>

        <section className="client-stats">

          <div className="client-card">

            <span>
              Mis vehículos
            </span>

            <strong>
              2
            </strong>

            <small>
              Registrados
            </small>

          </div>

          <div className="client-card">

            <span>
              Reparaciones
            </span>

            <strong>
              1
            </strong>

            <small>
              En proceso
            </small>

          </div>

          <div className="client-card">

            <span>
              Cotizaciones
            </span>

            <strong>
              1
            </strong>

            <small>
              Pendiente
            </small>

          </div>

          <div className="client-card">

            <span>
              Órdenes
            </span>

            <strong>
              0
            </strong>

            <small>
              Registradas
            </small>

          </div>

        </section>

        <section className="client-panel">

          <div className="client-panel-header">

            <div>

              <span>
                SERVICIO
              </span>

              <h2>
                Mi reparación actual
              </h2>

            </div>

            <button
              onClick={() =>
                navigate('/reparaciones')
              }
            >
              Ver detalle →
            </button>

          </div>

          <div className="client-repair">

            <div className="client-car-icon">
              🚗
            </div>

            <div>

              <strong>
                Toyota Corolla
              </strong>

              <span>
                Cambio de sistema de frenos
              </span>

              <small>
                Orden #REP-001
              </small>

            </div>

            <b className="client-status progress">
              EN PROCESO
            </b>

          </div>

        </section>

      </main>

    </div>
  )
}

export default DashboardCliente