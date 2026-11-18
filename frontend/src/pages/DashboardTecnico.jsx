import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AutoCoreSidebar from '../components/AutoCoreSidebar'
import { obtenerReparaciones } from '../services/api'

import './DashboardTecnicoC.css'

function DashboardTecnico() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [reparaciones, setReparaciones] = useState([])
  const [cargando, setCargando] = useState(true)

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

  useEffect(() => {
    if (!usuario?.id) return

    let activo = true
    obtenerReparaciones()
      .then(datos => {
        if (!activo) return
        setReparaciones((datos || []).filter(item =>
          Number(item.tecnicoId ?? item.tecnico?.id) === Number(usuario.id)
        ))
      })
      .catch(() => {
        if (activo) setReparaciones([])
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => { activo = false }
  }, [usuario])

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const nombre =
    usuario?.nombre ||
    usuario?.email ||
    'Técnico'

  const finalizadas = reparaciones.filter(item =>
    ['FINALIZADA', 'ENTREGADO'].includes(String(item.estado || '').toUpperCase())
  ).length
  const enProceso = reparaciones.filter(item =>
    String(item.estado || '').toUpperCase().includes('REPARACION')
  ).length
  const pendientes = Math.max(reparaciones.length - finalizadas - enProceso, 0)

  return (
    <div className="tech-dashboard">

      <AutoCoreSidebar active="dashboard" onLogout={cerrarSesion} />

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
              {pendientes}
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
              {enProceso}
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
              {finalizadas}
            </strong>

            <small>
              Completadas
            </small>

          </div>

        </section>

        <section className="tech-workspace">
        <div className="tech-panel">

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

          {cargando ? (
            <p className="tech-empty">Cargando trabajos asignados…</p>
          ) : reparaciones.length ? reparaciones.slice(0, 6).map(item => (
            <div className="tech-repair" key={item.id}>
              <div>
                <strong>Reparación #{item.id}</strong>
                <span>{item.clienteNombre || item.cliente?.nombre || 'Cliente'}</span>
              </div>
              <div className="tech-vehicle">
                {[item.equipoMarca, item.equipoModelo].filter(Boolean).join(' ') || item.equipoTipo || 'Vehículo'}
              </div>
              <b className={`tech-status ${String(item.estado || '').toUpperCase().includes('REPARACION') ? 'progress' : 'pending'}`}>
                {String(item.estado || 'Pendiente').replaceAll('_', ' ')}
              </b>
            </div>
          )) : (
            <div className="tech-empty-state">
              <span>🧰</span>
              <strong>Sin trabajos asignados</strong>
              <p>Cuando te asignen una reparación aparecerá aquí.</p>
            </div>
          )}
        </div>

        <aside className="tech-progress-panel">
          <span className="tech-progress-kicker">RESUMEN DE HOY</span>
          <h2>Mi jornada</h2>
          <div className="tech-progress-ring" style={{ '--progress': `${reparaciones.length ? Math.round((finalizadas / reparaciones.length) * 100) : 0}%` }}>
            <strong>{reparaciones.length ? Math.round((finalizadas / reparaciones.length) * 100) : 0}%</strong>
          </div>
          <p>{finalizadas} de {reparaciones.length} trabajos finalizados</p>
          <button onClick={() => navigate('/reparaciones')}>Abrir mis reparaciones →</button>
        </aside>
        </section>

      </main>

    </div>
  )
}

export default DashboardTecnico
