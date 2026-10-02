import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Clientes from './pages/Clientes'
import Reparaciones from './pages/Reparaciones'
import Ordenes from './pages/Ordenes'
import Ventas from './pages/Ventas'
import Reportes from './pages/Reportes'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/inventario"
          element={<Inventario />}
        />

        <Route
          path="/repuestos"
          element={<Inventario />}
        />

        <Route
          path="/clientes"
          element={<Clientes />}
        />

        <Route
          path="/reparaciones"
          element={<Reparaciones />}
        />

        <Route
          path="/ordenes"
          element={<Ordenes />}
        />

        <Route
  path="/ventas"
  element={<Ventas />}
/>

<Route
  path="/reportes"
  element={<Reportes />}
/>

      </Routes>
    </BrowserRouter>
  )
}

export default App