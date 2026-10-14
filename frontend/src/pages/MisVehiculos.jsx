
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  obtenerClientePorUsuario,
  obtenerEquipos,
  crearEquipo,
  actualizarEquipo
} from '../services/api'
import './DashboardClienteC.css'

const formularioInicial = {
  tipo: 'Automóvil',
  marca: '',
  modelo: '',
  serial: '',
  descripcion: ''
}

function MisVehiculos() {
  const navigate = useNavigate()
  const [vehiculos, setVehiculos] = useState([])
  const [cliente, setCliente] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [vehiculoEditando, setVehiculoEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  async function cargarVehiculos() {
    const guardado = localStorage.getItem('usuario')

    if (!guardado) {
      navigate('/')
      return
    }

    const usuarioActual = JSON.parse(guardado)

    if (String(usuarioActual?.rol || '').toUpperCase() !== 'CLIENTE') {
      navigate('/dashboard')
      return
    }

    if (!usuarioActual.id) {
      throw new Error('No se encontró el usuario de la sesión.')
    }

    const clienteActual = await obtenerClientePorUsuario(usuarioActual.id)
    const equipos = await obtenerEquipos()

    setCliente(clienteActual)

    setVehiculos(
      equipos.filter(
        equipo =>
          Number(equipo.clienteId ?? equipo.cliente?.id) ===
          Number(clienteActual.id)
      )
    )
  }

  useEffect(() => {
    let activo = true

    async function iniciar() {
      try {
        await cargarVehiculos()
      } catch (e) {
        if (activo) {
          setError(e.message || 'No se pudieron cargar los vehículos.')
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    iniciar()

    return () => {
      activo = false
    }
  }, [navigate])

  function abrirNuevo() {
    setVehiculoEditando(null)
    setFormulario(formularioInicial)
    setError('')
    setMensaje('')
    setMostrarFormulario(true)
  }

  function abrirEdicion(vehiculo) {
    setVehiculoEditando(vehiculo)
    setFormulario({
      tipo: vehiculo.tipo || 'Automóvil',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      serial: vehiculo.serial || '',
      descripcion: vehiculo.descripcion || ''
    })
    setError('')
    setMensaje('')
    setMostrarFormulario(true)
  }

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setVehiculoEditando(null)
    setFormulario(formularioInicial)
    setError('')
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setFormulario(actual => ({ ...actual, [name]: value }))
  }

  async function guardarVehiculo(evento) {
    evento.preventDefault()
    setError('')
    setMensaje('')

    if (!cliente?.id) {
      setError('No se pudo identificar al cliente de la sesión.')
      return
    }

    setGuardando(true)

    try {
      const datos = {
        ...formulario,
        tipo: formulario.tipo.trim(),
        marca: formulario.marca.trim(),
        modelo: formulario.modelo.trim(),
        serial: formulario.serial.trim() || null,
        descripcion: formulario.descripcion.trim(),
        clienteId: cliente.id
      }

      if (vehiculoEditando) {
        await actualizarEquipo(vehiculoEditando.id, datos)
        setMensaje('Vehículo actualizado correctamente.')
      } else {
        await crearEquipo(datos)
        setMensaje('Vehículo registrado correctamente.')
      }

      await cargarVehiculos()
      cerrarFormulario()
      setMensaje(
        vehiculoEditando
          ? 'Vehículo actualizado correctamente.'
          : 'Vehículo registrado correctamente.'
      )
    } catch (e) {
      setError(e.message || 'No se pudo guardar el vehículo.')
    } finally {
      setGuardando(false)
    }
  }

  const volver = () => navigate('/dashboard')

  return (
    <div className="client-dashboard">
      <aside className="client-sidebar">
        <div className="client-logo">
          <img src="/logo.png" alt="AutoCore" />
          <span>AutoCore</span>
        </div>

        <nav className="client-navigation">
          <p className="client-menu-title">MI CUENTA</p>

          <button className="client-menu" onClick={volver}>
            <span>⌂</span> Inicio
          </button>

          <button
            className="client-menu active"
            onClick={() => navigate('/mis-vehiculos')}
          >
            <span>🚗</span> Mis vehículos
          </button>

          <button
            className="client-menu"
            onClick={() => navigate('/mis-reparaciones')}
          >
            <span>🔧</span> Mis reparaciones
          </button>

          <button
            className="client-menu"
            onClick={() => navigate('/mis-cotizaciones')}
          >
            <span>▤</span> Mis cotizaciones
          </button>

          <button
            className="client-menu"
            onClick={() => navigate('/mis-ordenes')}
          >
            <span>▧</span> Mis órdenes
          </button>
        </nav>

        <button
          className="client-logout"
          onClick={() => {
            localStorage.removeItem('usuario')
            navigate('/')
          }}
        >
          <span>↪</span> Cerrar sesión
        </button>
      </aside>

      <main className="client-main">
        <header className="client-header">
          <div>
            <span className="client-header-label">PORTAL DEL CLIENTE</span>
            <h1>Mis vehículos</h1>
            <p>Administra los vehículos registrados en AutoCore.</p>
          </div>

          <div className="client-user">
            <div className="client-avatar">
              {(usuario.nombre || usuario.email || 'C')
                .charAt(0).toUpperCase()}
            </div>
            <div className="client-user-info">
              <strong>{usuario.nombre || usuario.email || 'Cliente'}</strong>
              <small>CLIENTE</small>
            </div>
          </div>
        </header>

        <section className="client-panel">
          <div className="client-panel-header">
            <div>
              <span>MI GARAJE</span>
              <h2>Vehículos registrados</h2>
            </div>
            <strong>{vehiculos.length}</strong>
          </div>

          <div style={{ padding: '16px 24px' }}>
            <button
              type="button"
              onClick={abrirNuevo}
              style={{
                background: '#1764d8',
                color: 'white',
                border: 0,
                borderRadius: 8,
                padding: '11px 16px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              + Registrar vehículo
            </button>
          </div>

          {mensaje && (
            <p role="status" style={{ padding: '0 24px', color: '#167443' }}>
              {mensaje}
            </p>
          )}

          {cargando ? (
            <p style={{ padding: 24 }}>Cargando vehículos...</p>
          ) : error && !mostrarFormulario ? (
            <div style={{ padding: 24 }}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          ) : vehiculos.length === 0 ? (
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 42 }}>🚗</div>
              <h3>Aún no tienes vehículos registrados</h3>
              <p>Usa «Registrar vehículo» para agregar el primero.</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {vehiculos.map(vehiculo => {
                const marcaNormalizada = String(vehiculo.marca || '').toLowerCase()
                const marcaClase = marcaNormalizada.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
                const marcaTexto = vehiculo.marca || 'Vehículo'
                const iniciales = marcaTexto.trim().slice(0, 3).toUpperCase()

                return (
                  <article className="vehicle-card" key={vehiculo.id}>
                    <div className={`vehicle-brand-art vehicle-brand-${marcaClase || 'generica'}`}>
                      <span className="vehicle-brand-mark">{iniciales}</span>
                      <span className="vehicle-brand-caption">{marcaTexto}</span>
                    </div>

                    <div className="vehicle-card-content">
                      <div className="vehicle-card-heading">
                        <div>
                          <span className="vehicle-eyebrow">VEHÍCULO REGISTRADO</span>
                          <h3>{[vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' ') || vehiculo.tipo || 'Vehículo'}</h3>
                        </div>
                        <span className="vehicle-id">#{vehiculo.id}</span>
                      </div>

                      <div className="vehicle-details">
                        <div className="vehicle-detail">
                          <span className="vehicle-detail-icon">🚘</span>
                          <div><small>Tipo</small><strong>{vehiculo.tipo || 'No especificado'}</strong></div>
                        </div>
                        <div className="vehicle-detail">
                          <span className="vehicle-detail-icon">🔖</span>
                          <div><small>Placa o serial</small><strong>{vehiculo.serial || 'No registrado'}</strong></div>
                        </div>
                      </div>

                      {vehiculo.descripcion && (
                        <p className="vehicle-description">{vehiculo.descripcion}</p>
                      )}

                      <div className="vehicle-card-actions">
                        <span className="vehicle-record-label"><span className="vehicle-record-dot" /> Registrado en AutoCore</span>
                        <button
                          type="button"
                          className="vehicle-edit-button"
                          onClick={() => abrirEdicion(vehiculo)}
                        >
                          <span aria-hidden="true">✎</span> Editar vehículo
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {mostrarFormulario && (
          <div
            className="vehicle-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(4, 18, 39, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              zIndex: 1000
            }}
          >
            <form
              className="vehicle-modal"
              onSubmit={guardarVehiculo}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                width: '100%',
                maxWidth: 520,
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'grid',
                gap: 14
              }}
            >
              <h2 id="titulo-formulario">
                {vehiculoEditando ? 'Editar vehículo' : 'Registrar vehículo'}
              </h2>

              <label>
                Tipo de vehículo *
                <select
                  name="tipo"
                  value={formulario.tipo}
                  onChange={cambiarCampo}
                  required
                  style={estiloCampo}
                >
                  <option value="Automóvil">Automóvil</option>
                  <option value="Motocicleta">Motocicleta</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Camión">Camión</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>

              <label>
                Marca
                <input
                  name="marca"
                  value={formulario.marca}
                  onChange={cambiarCampo}
                  maxLength={100}
                  placeholder="Ej. Chevrolet"
                  style={estiloCampo}
                />
              </label>

              <label>
                Modelo
                <input
                  name="modelo"
                  value={formulario.modelo}
                  onChange={cambiarCampo}
                  maxLength={100}
                  placeholder="Ej. Onix"
                  style={estiloCampo}
                />
              </label>

              <label>
                Placa o serial
                <input
                  name="serial"
                  value={formulario.serial}
                  onChange={cambiarCampo}
                  maxLength={100}
                  placeholder="Ej. ABC123"
                  style={estiloCampo}
                />
              </label>

              <label>
                Descripción
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={cambiarCampo}
                  rows={3}
                  placeholder="Detalles adicionales del vehículo"
                  style={estiloCampo}
                />
              </label>

              {error && (
                <p role="alert" style={{ color: '#b42318' }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                  style={estiloSecundario}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={estiloPrimario}
                >
                  {guardando
                    ? 'Guardando...'
                    : vehiculoEditando
                      ? 'Guardar cambios'
                      : 'Registrar vehículo'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

const estiloCampo = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 6,
  padding: 10,
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  font: 'inherit'
}

const estiloPrimario = {
  background: '#1764d8',
  color: 'white',
  border: 0,
  borderRadius: 8,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 600
}

const estiloSecundario = {
  background: 'white',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '10px 14px',
  cursor: 'pointer'
}

export default MisVehiculos
