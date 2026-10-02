import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  obtenerClientes,
  crearUsuario,
  crearCliente,
  actualizarUsuario,
  actualizarCliente,
  eliminarCliente
} from '../services/api'

import './ClientesC.css'

function Clientes() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(null)
  const [clientes, setClientes] = useState([])

  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)

  const [clienteSeleccionado, setClienteSeleccionado] =
    useState(null)

  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    password: '',
    documento: '',
    telefono: '',
    direccion: ''
  })

  /* =========================
     USUARIO LOGUEADO
  ========================= */

  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      navigate('/')
      return
    }

    setUsuario(JSON.parse(usuarioGuardado))
  }, [navigate])

  /* =========================
     CARGAR CLIENTES
  ========================= */

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      setCargando(true)

      const datos = await obtenerClientes()

      setClientes(datos)

    } catch (error) {
      console.error(
        'Error cargando clientes:',
        error
      )

      alert(
        error.message ||
        'No fue posible cargar los clientes.'
      )

    } finally {
      setCargando(false)
    }
  }

  /* =========================
     FORMULARIO
  ========================= */

  const manejarCambio = (e) => {
    const {
      name,
      value
    } = e.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }))
  }

  /* =========================
     ABRIR AGREGAR
  ========================= */

  const abrirAgregar = () => {
    setModoEdicion(false)

    setClienteSeleccionado(null)

    setFormulario({
      nombre: '',
      email: '',
      password: '',
      documento: '',
      telefono: '',
      direccion: ''
    })

    setModalAbierto(true)
  }

  /* =========================
     ABRIR EDITAR
  ========================= */

  const abrirEditar = (cliente) => {
    setModoEdicion(true)

    setClienteSeleccionado(cliente)

    setFormulario({
      nombre: cliente.nombre || '',
      email: cliente.email || '',
      password: '',
      documento: cliente.documento || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || ''
    })

    setModalAbierto(true)
  }

  /* =========================
     CERRAR
  ========================= */

  const cerrarModal = () => {
    if (guardando) {
      return
    }

    setModalAbierto(false)
    setModoEdicion(false)
    setClienteSeleccionado(null)

    setFormulario({
      nombre: '',
      email: '',
      password: '',
      documento: '',
      telefono: '',
      direccion: ''
    })
  }

  /* =========================
     GUARDAR
  ========================= */

  const guardarCliente = async (e) => {
    e.preventDefault()

    if (
      !formulario.nombre.trim() ||
      !formulario.email.trim() ||
      !formulario.documento.trim()
    ) {
      alert(
        'Nombre, correo y documento son obligatorios.'
      )

      return
    }

    if (
      !modoEdicion &&
      !formulario.password.trim()
    ) {
      alert(
        'La contraseña es obligatoria para crear el cliente.'
      )

      return
    }

    try {
      setGuardando(true)

      if (modoEdicion) {

        /* =========================
           ACTUALIZAR USUARIO
        ========================= */

        await actualizarUsuario(
          clienteSeleccionado.usuarioId,
          {
            nombre:
              formulario.nombre.trim(),

            email:
              formulario.email.trim(),

            password:
              formulario.password.trim(),

            rol: 'CLIENTE',

            activo: true
          }
        )

        /* =========================
           ACTUALIZAR CLIENTE
        ========================= */

        await actualizarCliente(
          clienteSeleccionado.id,
          {
            usuarioId:
              clienteSeleccionado.usuarioId,

            telefono:
              formulario.telefono.trim(),

            direccion:
              formulario.direccion.trim(),

            documento:
              formulario.documento.trim()
          }
        )

        alert(
          'Cliente actualizado correctamente.'
        )

      } else {

        /* =========================
           CREAR USUARIO
        ========================= */

        const nuevoUsuario =
          await crearUsuario({
            nombre:
              formulario.nombre.trim(),

            email:
              formulario.email.trim(),

            password:
              formulario.password,

            rol: 'CLIENTE',

            activo: true
          })

        /* =========================
           CREAR CLIENTE
        ========================= */

        await crearCliente({
          usuarioId:
            nuevoUsuario.id,

          telefono:
            formulario.telefono.trim(),

          direccion:
            formulario.direccion.trim(),

          documento:
            formulario.documento.trim()
        })

        alert(
          'Cliente registrado correctamente.'
        )
      }

      cerrarModal()

      await cargarClientes()

    } catch (error) {
      console.error(
        'Error guardando cliente:',
        error
      )

      alert(
        error.message ||
        'No fue posible guardar el cliente.'
      )

    } finally {
      setGuardando(false)
    }
  }

  /* =========================
     ELIMINAR
  ========================= */

  const borrarCliente = async (cliente) => {

    const confirmar =
      window.confirm(
        `¿Deseas eliminar al cliente "${cliente.nombre}"?\n\nEsta acción también puede eliminar sus equipos y reparaciones asociadas.`
      )

    if (!confirmar) {
      return
    }

    try {

      await eliminarCliente(
        cliente.id
      )

      alert(
        'Cliente eliminado correctamente.'
      )

      await cargarClientes()

    } catch (error) {

      console.error(
        'Error eliminando cliente:',
        error
      )

      alert(
        error.message ||
        'No fue posible eliminar el cliente.'
      )
    }
  }

  /* =========================
     FILTRO
  ========================= */

  const clientesFiltrados =
    clientes.filter((cliente) => {

      const texto =
        busqueda
          .toLowerCase()
          .trim()

      return (
        cliente.nombre
          ?.toLowerCase()
          .includes(texto) ||

        cliente.email
          ?.toLowerCase()
          .includes(texto) ||

        cliente.documento
          ?.toLowerCase()
          .includes(texto) ||

        cliente.telefono
          ?.toLowerCase()
          .includes(texto)
      )
    })

  /* =========================
     ESTADÍSTICAS
  ========================= */

  const totalClientes =
    clientes.length

  const clientesConTelefono =
    clientes.filter(
      (cliente) =>
        cliente.telefono &&
        cliente.telefono.trim()
    ).length

  const clientesConDireccion =
    clientes.filter(
      (cliente) =>
        cliente.direccion &&
        cliente.direccion.trim()
    ).length

  const nombre =
    usuario?.nombre ||
    usuario?.email ||
    'Usuario'

  const rol =
    usuario?.rol ||
    'ADMIN'

  /* =========================
     CERRAR SESIÓN
  ========================= */

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <div className="clientes-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="clientes-sidebar">

        <div className="clientes-logo">

          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>

        </div>

        <nav className="clientes-menu">

          <p className="clientes-menu-title">
            MENÚ PRINCIPAL
          </p>

          <button
            className="clientes-menu-item"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="clientes-menu-item"
            onClick={() =>
              navigate('/inventario')
            }
          >
            <span>▣</span>
            Inventario
          </button>

          <button
            className="clientes-menu-item"
            onClick={() =>
              navigate('/reparaciones')
            }
          >
            <span>🔧</span>
            Reparaciones
          </button>

          <button
            className="clientes-menu-item active"
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className="clientes-menu-item"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Repuestos
          </button>

          <button
            className="clientes-menu-item"
            onClick={() =>
              navigate('/ordenes')
            }
          >
            <span>▤</span>
            Órdenes
          </button>

          <button
            className="clientes-menu-item"
            onClick={() =>
              navigate('/ventas')
            }
          >
            <span>▥</span>
            Ventas
          </button>

          <button
            className="clientes-menu-item"
            onClick={() =>
              navigate('/reportes')
            }
          >
            <span>▦</span>
            Reportes
          </button>

          <p className="clientes-menu-title clientes-system">
            SISTEMA
          </p>

          <button
            className="clientes-menu-item"
            onClick={() =>
              navigate('/configuracion')
            }
          >
            <span>⚙</span>
            Configuración
          </button>

        </nav>

        <button
          className="clientes-logout"
          onClick={cerrarSesion}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="clientes-main">

        <header className="clientes-header">

          <div>

            <p className="clientes-label">
              GESTIÓN DEL TALLER
            </p>

            <h1>
              Clientes
            </h1>

            <p className="clientes-description">
              Administra los clientes registrados en AutoCore.
            </p>

          </div>

          <div className="clientes-header-right">

            <button className="clientes-notification">
              🔔
              <span></span>
            </button>

            <div className="clientes-user">

              <div className="clientes-avatar">
                {nombre
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <strong>
                  {nombre}
                </strong>

                <small>
                  {rol}
                </small>

              </div>

            </div>

          </div>

        </header>

        {/* =========================
            ESTADÍSTICAS
        ========================= */}

        <section className="clientes-summary">

          <div className="cliente-summary-card">

            <div className="cliente-summary-icon blue">
              👥
            </div>

            <div>

              <span>
                Total clientes
              </span>

              <strong>
                {totalClientes}
              </strong>

              <small>
                Registrados
              </small>

            </div>

          </div>

          <div className="cliente-summary-card">

            <div className="cliente-summary-icon green">
              ✓
            </div>

            <div>

              <span>
                Con teléfono
              </span>

              <strong>
                {clientesConTelefono}
              </strong>

              <small>
                Contactables
              </small>

            </div>

          </div>

          <div className="cliente-summary-card">

            <div className="cliente-summary-icon orange">
              📍
            </div>

            <div>

              <span>
                Con dirección
              </span>

              <strong>
                {clientesConDireccion}
              </strong>

              <small>
                Registradas
              </small>

            </div>

          </div>

          <div className="cliente-summary-card">

            <div className="cliente-summary-icon purple">
              🚗
            </div>

            <div>

              <span>
                Gestión
              </span>

              <strong>
                24/7
              </strong>

              <small>
                AutoCore
              </small>

            </div>

          </div>

        </section>

        {/* =========================
            CONTENIDO
        ========================= */}

        <section className="clientes-content">

          <div className="clientes-content-header">

            <div>

              <span className="cliente-section-label">
                DIRECTORIO
              </span>

              <h2>
                Clientes registrados
              </h2>

            </div>

            <button
              className="add-client-button"
              onClick={abrirAgregar}
            >
              <span>
                ＋
              </span>

              Nuevo cliente
            </button>

          </div>

          {/* BUSCADOR */}

          <div className="clientes-tools">

            <div className="cliente-search-box">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar por nombre, documento, correo o teléfono..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* TABLA */}

          <div className="clientes-table-container">

            <table className="clientes-table">

              <thead>

                <tr>

                  <th>
                    CLIENTE
                  </th>

                  <th>
                    DOCUMENTO
                  </th>

                  <th>
                    TELÉFONO
                  </th>

                  <th>
                    CORREO
                  </th>

                  <th>
                    DIRECCIÓN
                  </th>

                  <th>
                    ACCIÓN
                  </th>

                </tr>

              </thead>

              <tbody>

                {cargando ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="clientes-loading"
                    >
                      Cargando clientes...
                    </td>

                  </tr>

                ) : clientesFiltrados.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="clientes-empty"
                    >

                      <div>
                        👥
                      </div>

                      <strong>
                        No hay clientes
                      </strong>

                      <p>
                        {busqueda
                          ? 'No encontramos clientes con esa búsqueda.'
                          : 'Agrega el primer cliente de AutoCore.'}
                      </p>

                    </td>

                  </tr>

                ) : (

                  clientesFiltrados.map(
                    (cliente) => (

                      <tr
                        key={
                          cliente.id
                        }
                      >

                        <td>

                          <div className="cliente-name">

                            <div className="cliente-table-avatar">
                              {cliente.nombre
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {
                                  cliente.nombre
                                }
                              </strong>

                              <small>
                                CLIENTE-
                                {String(
                                  cliente.id
                                ).padStart(
                                  3,
                                  '0'
                                )}
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>
                          <span className="cliente-document">
                            {
                              cliente.documento
                            }
                          </span>
                        </td>

                        <td>
                          {
                            cliente.telefono ||
                            '—'
                          }
                        </td>

                        <td>
                          <span className="cliente-email">
                            {
                              cliente.email
                            }
                          </span>
                        </td>

                        <td>
                          {
                            cliente.direccion ||
                            '—'
                          }
                        </td>

                        <td>

                          <div className="cliente-actions">

                            <button
                              className="cliente-action edit"
                              onClick={() =>
                                abrirEditar(
                                  cliente
                                )
                              }
                              title="Modificar cliente"
                            >
                              ✎
                            </button>

                            <button
                              className="cliente-action delete"
                              onClick={() =>
                                borrarCliente(
                                  cliente
                                )
                              }
                              title="Eliminar cliente"
                            >
                              🗑
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          <div className="clientes-footer">

            Mostrando{' '}

            <strong>
              {
                clientesFiltrados.length
              }
            </strong>

            {' '}de{' '}

            <strong>
              {clientes.length}
            </strong>

            {' '}clientes

          </div>

        </section>

      </main>

      {/* =========================
          MODAL
      ========================= */}

      {modalAbierto && (

        <div
          className="clientes-modal-overlay"
          onClick={cerrarModal}
        >

          <div
            className="clientes-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="clientes-modal-header">

              <div>

                <span>
                  {modoEdicion
                    ? 'ACTUALIZAR CLIENTE'
                    : 'NUEVO CLIENTE'}
                </span>

                <h2>
                  {modoEdicion
                    ? 'Modificar cliente'
                    : 'Registrar cliente'}
                </h2>

              </div>

              <button
                type="button"
                className="clientes-modal-close"
                onClick={cerrarModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                guardarCliente
              }
            >

              <div className="clientes-form-grid">

                <div className="cliente-form-group">

                  <label>
                    Nombre completo *
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    placeholder="Ej: Juan Pérez"
                    value={
                      formulario.nombre
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="cliente-form-group">

                  <label>
                    Documento *
                  </label>

                  <input
                    type="text"
                    name="documento"
                    placeholder="Ej: 1098765432"
                    value={
                      formulario.documento
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="cliente-form-group">

                  <label>
                    Correo electrónico *
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="cliente@correo.com"
                    value={
                      formulario.email
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="cliente-form-group">

                  <label>
                    Teléfono
                  </label>

                  <input
                    type="text"
                    name="telefono"
                    placeholder="Ej: 3001234567"
                    value={
                      formulario.telefono
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                {!modoEdicion && (

                  <div className="cliente-form-group full">

                    <label>
                      Contraseña *
                    </label>

                    <input
                      type="password"
                      name="password"
                      placeholder="Contraseña para acceder al sistema"
                      value={
                        formulario.password
                      }
                      onChange={
                        manejarCambio
                      }
                    />

                    <small>
                      Se creará automáticamente un usuario con rol CLIENTE.
                    </small>

                  </div>

                )}

                {modoEdicion && (

                  <div className="cliente-form-group full">

                    <label>
                      Nueva contraseña
                    </label>

                    <input
                      type="password"
                      name="password"
                      placeholder="Dejar vacío para conservar la actual"
                      value={
                        formulario.password
                      }
                      onChange={
                        manejarCambio
                      }
                    />

                  </div>

                )}

                <div className="cliente-form-group full">

                  <label>
                    Dirección
                  </label>

                  <input
                    type="text"
                    name="direccion"
                    placeholder="Ej: Calle 45 # 20-30"
                    value={
                      formulario.direccion
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

              </div>

              <div className="clientes-modal-info">

                <span>
                  👤
                </span>

                <div>

                  <strong>
                    Cuenta de cliente
                  </strong>

                  <p>
                    {modoEdicion
                      ? 'Los datos se actualizarán en la cuenta y en el perfil del cliente.'
                      : 'El cliente podrá utilizar su correo y contraseña para ingresar a AutoCore.'}
                  </p>

                </div>

              </div>

              <div className="clientes-modal-actions">

                <button
                  type="button"
                  className="clientes-cancel-button"
                  onClick={
                    cerrarModal
                  }
                  disabled={
                    guardando
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="clientes-save-button"
                  disabled={
                    guardando
                  }
                >
                  {guardando
                    ? 'Guardando...'
                    : modoEdicion
                    ? 'Guardar cambios'
                    : 'Registrar cliente'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Clientes