import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './DashboardTecnicoC.css'

function DashboardTecnico() {
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

      if (rol !== 'TECNICO') {
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
    'Técnico'

  return (
    <div className="tech-dashboard">

      <aside className="tech-sidebar">

        <div className="tech-logo">
          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>
        </div>

        <nav className="tech-navigation">

          <p className="tech-menu-title">
            MI TALLER
          </p>

          <button
            className="tech-menu active"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="tech-menu"
            onClick={() =>
              navigate('/reparaciones')
            }
          >
            <span>🔧</span>
            Mis reparaciones
          </button>

          <button
            className="tech-menu"
            onClick={() =>
              navigate('/clientes')
            }
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className="tech-menu"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Repuestos
          </button>

          <p className="tech-menu-title tech-system">
            CUENTA
          </p>

          <button className="tech-menu">
            <span>♙</span>
            Mi perfil
          </button>

        </nav>

        <button
          className="tech-logout"
          onClick={cerrarSesion}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

      <main className="tech-main">

        <header className="tech-header">

          <div>
            <span className="tech-header-label">
              PANEL DEL TÉCNICO
            </span>

            <h1>
              Mis reparaciones
            </h1>

            <p>
              Consulta y gestiona las reparaciones
              asignadas.
            </p>
          </div>

          <div className="tech-user">

            <div className="tech-avatar">
              {nombre
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="tech-user-info">

              <strong>
                {nombre}
              </strong>

              <small>
                TÉCNICO
              </small>

            </div>

          </div>

        </header>

        <section className="tech-welcome">

          <div>

            <span>
              AUTOCORE
            </span>

            <h2>
              Hola, {nombre} 🔧
            </h2>

            <p>
              Aquí encontrarás las reparaciones
              que tienes asignadas.
            </p>

          </div>

          <div className="tech-welcome-icon">
            🛠️
          </div>

        </section>

        <section className="tech-stats">

          <div className="tech-card">

            <span>
              Pendientes
            </span>

            <strong>
              3
            </strong>

            <small>
              Por iniciar
            </small>

          </div>

          <div className="tech-card">

            <span>
              En proceso
            </span>

            <strong>
              2
            </strong>

            <small>
              Actualmente
            </small>

          </div>

          <div className="tech-card">

            <span>
              Finalizadas
            </span>

            <strong>
              8
            </strong>

            <small>
              Completadas
            </small>

          </div>

        </section>

        <section className="tech-panel">

          <div className="tech-panel-header">

            <div>

              <span>
                TRABAJO
              </span>

              <h2>
                Reparaciones recientes
              </h2>

            </div>

            <button
              onClick={() =>
                navigate('/reparaciones')
              }
            >
              Ver todas →
            </button>

          </div>

          <div className="tech-repair">

            <div>
              <strong>
                #REP-001
              </strong>

              <span>
                Juan García
              </span>
            </div>

            <div className="tech-vehicle">
              Toyota Corolla
            </div>

            <b className="tech-status progress">
              En proceso
            </b>

          </div>

          <div className="tech-repair">

            <div>
              <strong>
                #REP-002
              </strong>

              <span>
                Ana Rodríguez
              </span>
            </div>

            <div className="tech-vehicle">
              Mazda 3
            </div>

            <b className="tech-status pending">
              Pendiente
            </b>

          </div>

        </section>

      </main>

    </div>
  )
}

export default DashboardTecnico