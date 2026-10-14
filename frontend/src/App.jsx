import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Clientes from './pages/Clientes'
import Reparaciones from './pages/Reparaciones'
import Ordenes from './pages/Ordenes'
import Ventas from './pages/Ventas'
import Reportes from './pages/Reportes'
import MisVehiculos from './pages/MisVehiculos'
import MisReparaciones from './pages/MisReparaciones'
import MisCotizaciones from './pages/MisCotizaciones'
import MisOrdenes from './pages/MisOrdenes'

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
<Route
  path="/mis-vehiculos"
  element={<MisVehiculos />}
/>

<Route
  path="/mis-reparaciones"
  element={<MisReparaciones />}
/>

<Route
  path="/mis-cotizaciones"
  element={<MisCotizaciones />}
/>

<Route
  path="/mis-ordenes"
  element={<MisOrdenes />}
/>

      </Routes>
    </BrowserRouter>
  )
}

export default App