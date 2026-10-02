import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardAdmin from './DashboardAdmin'
import DashboardTecnico from './DashboardTecnico'
import DashboardCliente from './DashboardCliente'

function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      navigate('/')
    }
  }, [navigate])

  const usuarioGuardado =
    localStorage.getItem('usuario')

  if (!usuarioGuardado) {
    return null
  }

  let usuario

  try {
    usuario = JSON.parse(usuarioGuardado)
  } catch {
    localStorage.removeItem('usuario')
    navigate('/')
    return null
  }

  const rol = String(
    usuario?.rol || ''
  ).toUpperCase()

  if (rol === 'ADMIN') {
    return <DashboardAdmin />
  }

  if (rol === 'TECNICO') {
    return <DashboardTecnico />
  }

  if (rol === 'CLIENTE') {
    return <DashboardCliente />
  }

  localStorage.removeItem('usuario')
  navigate('/')

  return null
}

export default Dashboard