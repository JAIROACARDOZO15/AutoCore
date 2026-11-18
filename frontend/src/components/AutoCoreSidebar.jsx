import { useNavigate } from 'react-router-dom'
import './AutoCoreSidebar.css'

const menuPorRol = {
  ADMIN: {
    seccion: 'ADMINISTRACIÓN',
    enlaces: [
      { id: 'dashboard', texto: 'Inicio', icono: '⌂', ruta: '/dashboard' },
      { id: 'clients', texto: 'Clientes', icono: '👥', ruta: '/clientes' },
      { id: 'inventory', texto: 'Repuestos e inventario', icono: '📦', ruta: '/inventario' },
      { id: 'repairs', texto: 'Reparaciones', icono: '🔧', ruta: '/reparaciones' },
      { id: 'orders', texto: 'Órdenes', icono: '▤', ruta: '/ordenes' },
      { id: 'sales', texto: 'Ventas', icono: '▥', ruta: '/ventas' },
      { id: 'reports', texto: 'Reportes', icono: '▦', ruta: '/reportes' }
    ],
    sistema: []
  },
  TECNICO: {
    seccion: 'MI TALLER',
    enlaces: [
      { id: 'dashboard', texto: 'Inicio', icono: '⌂', ruta: '/dashboard' },
      { id: 'repairs', texto: 'Mis reparaciones', icono: '🔧', ruta: '/reparaciones' },
      { id: 'inventory', texto: 'Repuestos e inventario', icono: '📦', ruta: '/inventario' }
    ],
    sistema: []
  },
  CLIENTE: {
    seccion: 'MI CUENTA',
    enlaces: [
      { id: 'dashboard', texto: 'Inicio', icono: '⌂', ruta: '/dashboard' },
      { id: 'vehicles', texto: 'Mis vehículos', icono: '🚗', ruta: '/mis-vehiculos' },
      { id: 'vehicleStatus', texto: 'Estado de mi vehículo', icono: '🧭', ruta: '/estado-vehiculo' },
      { id: 'myRepairs', texto: 'Mis reparaciones', icono: '🔧', ruta: '/mis-reparaciones' },
      { id: 'quotes', texto: 'Mis cotizaciones', icono: '▤', ruta: '/mis-cotizaciones' },
      { id: 'clientOrders', texto: 'Mis órdenes', icono: '▧', ruta: '/mis-ordenes' }
    ],
    sistema: []
  }
}

function AutoCoreSidebar({ active, onLogout }) {
  const navigate = useNavigate()
  const rol = (() => {
    try {
      return String(JSON.parse(localStorage.getItem('usuario') || '{}')?.rol || 'ADMIN').toUpperCase()
    } catch {
      return 'ADMIN'
    }
  })()

  const menu = menuPorRol[rol] || menuPorRol.ADMIN
  const cerrarSesion = () => {
    if (onLogout) {
      onLogout()
      return
    }
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <aside className="autocore-sidebar">
      <div className="autocore-sidebar-brand">
        <img src="/logo.png" alt="" />
        <span>AutoCore</span>
      </div>

      <nav className="autocore-sidebar-navigation" aria-label={menu.seccion}>
        <p className="autocore-sidebar-section">{menu.seccion}</p>
        {menu.enlaces.map(enlace => (
          <button
            className={`autocore-sidebar-link ${active === enlace.id ? 'active' : ''}`}
            key={enlace.id}
            onClick={() => navigate(enlace.ruta)}
            title={enlace.texto}
          >
            <span className="autocore-sidebar-icon" aria-hidden="true">{enlace.icono}</span>
            <span className="autocore-sidebar-label">{enlace.texto}</span>
          </button>
        ))}

        {menu.sistema.length > 0 && (
          <>
            <p className="autocore-sidebar-section autocore-sidebar-system">SISTEMA</p>
            {menu.sistema.map(enlace => (
              <button
                className={`autocore-sidebar-link ${active === enlace.id ? 'active' : ''}`}
                key={enlace.id}
                onClick={() => navigate(enlace.ruta)}
                title={enlace.texto}
              >
                <span className="autocore-sidebar-icon" aria-hidden="true">{enlace.icono}</span>
                <span className="autocore-sidebar-label">{enlace.texto}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      <button className="autocore-sidebar-logout" onClick={cerrarSesion}>
        <span aria-hidden="true">↪</span>
        <span className="autocore-sidebar-label">Cerrar sesión</span>
      </button>
    </aside>
  )
}

export default AutoCoreSidebar
