import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  obtenerRepuestos,
  crearRepuesto,
  actualizarRepuesto,
  eliminarRepuesto
} from '../services/api'

import './InventarioC.css'

function Inventario() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(null)

  const [repuestos, setRepuestos] = useState([])

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('Todos')

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)

  const [repuestoSeleccionado, setRepuestoSeleccionado] =
    useState(null)

  const [formulario, setFormulario] = useState({
    nombre: '',
    categoria: '',
    marca: '',
    precio: '',
    stock: '',
    descripcion: ''
  })

  /* =========================
     USUARIO
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
     CARGAR INVENTARIO
  ========================= */

  useEffect(() => {
    cargarRepuestos()
  }, [])

  const cargarRepuestos = async () => {
    try {
      setCargando(true)

      const datos = await obtenerRepuestos()

      const datosFormateados = datos.map(
        transformarRepuesto
      )

      setRepuestos(datosFormateados)

    } catch (error) {
      console.error(
        'Error cargando repuestos:',
        error
      )

      alert(
        'No fue posible cargar el inventario.'
      )

    } finally {
      setCargando(false)
    }
  }

  /* =========================
     TRANSFORMAR REPUESTO
  ========================= */

  const transformarRepuesto = (repuesto) => {
    const metadata =
      extraerDatosDescripcion(
        repuesto.descripcion
      )

    return {
      ...repuesto,

      categoria:
        metadata.categoria ||
        'Sin categoría',

      marca:
        metadata.marca ||
        'Sin marca',

      descripcionOriginal:
        metadata.descripcion ||
        repuesto.descripcion ||
        '',

      estado:
        calcularEstado(repuesto.stock)
    }
  }

  /* =========================
     DESCRIPCIÓN
  ========================= */

  const extraerDatosDescripcion = (
    descripcion
  ) => {
    if (!descripcion) {
      return {
        categoria: '',
        marca: '',
        descripcion: ''
      }
    }

    const categoriaMatch =
      descripcion.match(
        /\[CATEGORIA:(.*?)\]/
      )

    const marcaMatch =
      descripcion.match(
        /\[MARCA:(.*?)\]/
      )

    const descripcionLimpia =
      descripcion
        .replace(
          /\[CATEGORIA:.*?\]/,
          ''
        )
        .replace(
          /\[MARCA:.*?\]/,
          ''
        )
        .trim()

    return {
      categoria:
        categoriaMatch
          ? categoriaMatch[1].trim()
          : '',

      marca:
        marcaMatch
          ? marcaMatch[1].trim()
          : '',

      descripcion:
        descripcionLimpia
    }
  }

  const construirDescripcion = () => {
    return [
      `[CATEGORIA:${formulario.categoria}]`,
      `[MARCA:${formulario.marca}]`,
      formulario.descripcion.trim()
    ]
      .filter(Boolean)
      .join(' ')
  }

  /* =========================
     ESTADO STOCK
  ========================= */

  const calcularEstado = (stock) => {
    const cantidad = Number(stock)

    if (cantidad <= 0) {
      return 'Agotado'
    }

    if (cantidad <= 10) {
      return 'Stock bajo'
    }

    return 'Disponible'
  }

  /* =========================
     FORMATEAR PRECIO
  ========================= */

  const formatearPrecio = (precio) => {
    const numero = Number(precio)

    if (Number.isNaN(numero)) {
      return '$0'
    }

    return new Intl.NumberFormat(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
      }
    ).format(numero)
  }

  const convertirPrecio = (precio) => {
    if (!precio) {
      return 0
    }

    const limpio =
      String(precio)
        .replace(/\$/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '')
        .trim()

    return Number(limpio)
  }

  /* =========================
     AGREGAR
  ========================= */

  const abrirAgregar = () => {
    setModoEdicion(false)

    setRepuestoSeleccionado(null)

    setFormulario({
      nombre: '',
      categoria: '',
      marca: '',
      precio: '',
      stock: '',
      descripcion: ''
    })

    setModalAbierto(true)
  }

  /* =========================
     EDITAR
  ========================= */

  const abrirEditar = (repuesto) => {
    setModoEdicion(true)

    setRepuestoSeleccionado(repuesto)

    setFormulario({
      nombre: repuesto.nombre || '',
      categoria:
        repuesto.categoria ===
        'Sin categoría'
          ? ''
          : repuesto.categoria || '',
      marca:
        repuesto.marca === 'Sin marca'
          ? ''
          : repuesto.marca || '',
      precio:
        repuesto.precio ?? '',
      stock:
        repuesto.stock ?? '',
      descripcion:
        repuesto.descripcionOriginal ||
        ''
    })

    setModalAbierto(true)
  }

  /* =========================
     CERRAR MODAL
  ========================= */

  const cerrarModal = () => {
    if (guardando) {
      return
    }

    setModalAbierto(false)

    setModoEdicion(false)

    setRepuestoSeleccionado(null)

    setFormulario({
      nombre: '',
      categoria: '',
      marca: '',
      precio: '',
      stock: '',
      descripcion: ''
    })
  }

  /* =========================
     CAMBIAR FORMULARIO
  ========================= */

  const manejarCambio = (e) => {
    const {
      name,
      value
    } = e.target

    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value
      })
    )
  }

  /* =========================
     GUARDAR
  ========================= */

  const guardarRepuesto = async (e) => {
    e.preventDefault()

    if (
      !formulario.nombre.trim() ||
      !formulario.categoria ||
      !formulario.marca.trim() ||
      formulario.precio === '' ||
      formulario.stock === ''
    ) {
      alert(
        'Completa todos los campos obligatorios.'
      )

      return
    }

    const stock =
      Number(formulario.stock)

    const precio =
      convertirPrecio(
        formulario.precio
      )

    if (Number.isNaN(stock) || stock < 0) {
      alert(
        'El stock debe ser un número válido.'
      )

      return
    }

    if (
      Number.isNaN(precio) ||
      precio < 0
    ) {
      alert(
        'El precio debe ser válido.'
      )

      return
    }

    const datos = {
      nombre:
        formulario.nombre.trim(),

      descripcion:
        construirDescripcion(),

      precio: precio,

      stock: stock,

      activo: true
    }

    try {
      setGuardando(true)

      if (modoEdicion) {

        await actualizarRepuesto(
          repuestoSeleccionado.id,
          datos
        )

        alert(
          'Repuesto actualizado correctamente.'
        )

      } else {

        await crearRepuesto(datos)

        alert(
          'Repuesto agregado correctamente.'
        )
      }

      cerrarModal()

      await cargarRepuestos()

    } catch (error) {

      console.error(
        'Error guardando repuesto:',
        error
      )

      alert(
        error.message ||
        'No fue posible guardar el repuesto.'
      )

    } finally {
      setGuardando(false)
    }
  }

  /* =========================
     ELIMINAR
  ========================= */

  const eliminarRepuesto = async (
    repuesto
  ) => {

    const confirmar =
      window.confirm(
        `¿Deseas desactivar "${repuesto.nombre}" del inventario?`
      )

    if (!confirmar) {
      return
    }

    try {

      await eliminarRepuesto(
        repuesto.id
      )

      alert(
        'Repuesto desactivado correctamente.'
      )

      await cargarRepuestos()

    } catch (error) {

      console.error(
        'Error eliminando repuesto:',
        error
      )

      alert(
        error.message ||
        'No fue posible desactivar el repuesto.'
      )
    }
  }

  /* =========================
     FILTRAR
  ========================= */

  const repuestosFiltrados =
    repuestos.filter(
      (repuesto) => {

        const texto =
          busqueda
            .toLowerCase()
            .trim()

        const coincideBusqueda =
          repuesto.nombre
            ?.toLowerCase()
            .includes(texto) ||

          String(repuesto.id)
            .toLowerCase()
            .includes(texto) ||

          repuesto.marca
            ?.toLowerCase()
            .includes(texto) ||

          repuesto.categoria
            ?.toLowerCase()
            .includes(texto) ||

          repuesto.descripcion
            ?.toLowerCase()
            .includes(texto)

        const coincideFiltro =
          filtro === 'Todos' ||
          repuesto.estado === filtro

        return (
          coincideBusqueda &&
          coincideFiltro
        )
      }
    )

  /* =========================
     ESTADÍSTICAS
  ========================= */

  const totalRepuestos =
    repuestos.length

  const disponibles =
    repuestos.filter(
      (repuesto) =>
        repuesto.estado ===
        'Disponible'
    ).length

  const stockBajo =
    repuestos.filter(
      (repuesto) =>
        repuesto.estado ===
        'Stock bajo'
    ).length

  const agotados =
    repuestos.filter(
      (repuesto) =>
        repuesto.estado ===
        'Agotado'
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
    localStorage.removeItem(
      'usuario'
    )

    navigate('/')
  }

  return (
    <div className="inventario-page">

      {/* SIDEBAR */}

      <aside className="inventory-sidebar">

        <div className="inventory-logo">

          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>

        </div>

        <nav className="inventory-menu">

          <p className="inventory-menu-title">
            MENÚ PRINCIPAL
          </p>

          <button
            className="inventory-menu-item"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="inventory-menu-item active"
          >
            <span>▣</span>
            Inventario
          </button>

          <button
            className="inventory-menu-item"
            onClick={() =>
              navigate('/reparaciones')
            }
          >
            <span>🔧</span>
            Reparaciones
          </button>

          <button
            className="inventory-menu-item"
            onClick={() =>
              navigate('/clientes')
            }
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className="inventory-menu-item"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Repuestos
          </button>

          <button
            className="inventory-menu-item"
            onClick={() =>
              navigate('/ordenes')
            }
          >
            <span>▤</span>
            Órdenes
          </button>

          <button
            className="inventory-menu-item"
            onClick={() =>
              navigate('/ventas')
            }
          >
            <span>▥</span>
            Ventas
          </button>

          <button
            className="inventory-menu-item"
            onClick={() =>
              navigate('/reportes')
            }
          >
            <span>▦</span>
            Reportes
          </button>

          <p className="inventory-menu-title inventory-system">
            SISTEMA
          </p>

          <button
            className="inventory-menu-item"
            onClick={() =>
              navigate('/configuracion')
            }
          >
            <span>⚙</span>
            Configuración
          </button>

        </nav>

        <button
          className="inventory-logout"
          onClick={cerrarSesion}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

      {/* MAIN */}

      <main className="inventory-main">

        <header className="inventory-header">

          <div>

            <p className="inventory-label">
              GESTIÓN DEL TALLER
            </p>

            <h1>
              Inventario
            </h1>

            <p className="inventory-description">
              Administra y controla los repuestos disponibles en tu taller.
            </p>

          </div>

          <div className="inventory-header-right">

            <button className="inventory-notification">
              🔔
              <span></span>
            </button>

            <div className="inventory-user">

              <div className="inventory-avatar">
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

        {/* ESTADÍSTICAS */}

        <section className="inventory-summary">

          <div className="inventory-summary-card">

            <div className="summary-icon blue">
              📦
            </div>

            <div>

              <span>
                Total repuestos
              </span>

              <strong>
                {totalRepuestos}
              </strong>

              <small>
                Registrados
              </small>

            </div>

          </div>

          <div className="inventory-summary-card">

            <div className="summary-icon green">
              ✓
            </div>

            <div>

              <span>
                Disponibles
              </span>

              <strong>
                {disponibles}
              </strong>

              <small>
                En stock
              </small>

            </div>

          </div>

          <div className="inventory-summary-card">

            <div className="summary-icon orange">
              ⚠
            </div>

            <div>

              <span>
                Stock bajo
              </span>

              <strong>
                {stockBajo}
              </strong>

              <small>
                Requieren atención
              </small>

            </div>

          </div>

          <div className="inventory-summary-card">

            <div className="summary-icon red">
              !
            </div>

            <div>

              <span>
                Agotados
              </span>

              <strong>
                {agotados}
              </strong>

              <small>
                Sin existencias
              </small>

            </div>

          </div>

        </section>

        {/* INVENTARIO */}

        <section className="inventory-content">

          <div className="inventory-content-header">

            <div>

              <span className="section-label">
                CATÁLOGO
              </span>

              <h2>
                Repuestos del inventario
              </h2>

            </div>

            <button
              className="add-part-button"
              onClick={abrirAgregar}
            >
              <span>
                ＋
              </span>

              Agregar repuesto
            </button>

          </div>

          {/* BUSCADOR */}

          <div className="inventory-tools">

            <div className="search-box">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar por nombre, código, marca o categoría..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="filter-buttons">

              {[
                'Todos',
                'Disponible',
                'Stock bajo',
                'Agotado'
              ].map(
                (opcion) => (

                  <button
                    key={opcion}
                    className={
                      filtro === opcion
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setFiltro(
                        opcion
                      )
                    }
                  >
                    {opcion ===
                    'Disponible'
                      ? 'Disponibles'
                      : opcion ===
                        'Agotado'
                      ? 'Agotados'
                      : opcion}
                  </button>

                )
              )}

            </div>

          </div>

          {/* TABLA */}

          <div className="inventory-table-container">

            <table className="inventory-table">

              <thead>

                <tr>

                  <th>
                    REPUESTO
                  </th>

                  <th>
                    CATEGORÍA
                  </th>

                  <th>
                    MARCA
                  </th>

                  <th>
                    PRECIO
                  </th>

                  <th>
                    STOCK
                  </th>

                  <th>
                    ESTADO
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
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: '45px'
                      }}
                    >
                      Cargando inventario...
                    </td>

                  </tr>

                ) : repuestosFiltrados.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: '45px'
                      }}
                    >
                      No hay repuestos que coincidan con la búsqueda.
                    </td>

                  </tr>

                ) : (

                  repuestosFiltrados.map(
                    (repuesto) => (

                      <tr
                        key={
                          repuesto.id
                        }
                      >

                        <td>

                          <div className="part-name">

                            <div className="part-icon">
                              📦
                            </div>

                            <div>

                              <strong>
                                {
                                  repuesto.nombre
                                }
                              </strong>

                              <small>
                                REP-
                                {String(
                                  repuesto.id
                                ).padStart(
                                  3,
                                  '0'
                                )}
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="category-badge">
                            {
                              repuesto.categoria
                            }
                          </span>

                        </td>

                        <td>

                          <span className="brand-name">
                            {
                              repuesto.marca
                            }
                          </span>

                        </td>

                        <td>

                          <strong className="price">
                            {
                              formatearPrecio(
                                repuesto.precio
                              )
                            }
                          </strong>

                        </td>

                        <td>

                          <div className="stock-number">

                            <strong>
                              {
                                repuesto.stock
                              }
                            </strong>

                            <span>
                              {' '}unidades
                            </span>

                          </div>

                        </td>

                        <td>

                          <span
                            className={`stock-status ${
                              repuesto.estado ===
                              'Disponible'
                                ? 'available'
                                : repuesto.estado ===
                                  'Stock bajo'
                                ? 'low'
                                : 'empty'
                            }`}
                          >

                            <span></span>

                            {
                              repuesto.estado
                            }

                          </span>

                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              className="action-button edit"
                              onClick={() =>
                                abrirEditar(
                                  repuesto
                                )
                              }
                              title="Modificar repuesto"
                            >
                              ✎
                            </button>

                            <button
                              className="action-button delete"
                              onClick={() =>
                                eliminarRepuesto(
                                  repuesto
                                )
                              }
                              title="Desactivar repuesto"
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

          <div className="inventory-footer">

            <span>

              Mostrando{' '}

              <strong>
                {
                  repuestosFiltrados.length
                }
              </strong>

              {' '}de{' '}

              <strong>
                {repuestos.length}
              </strong>

              {' '}repuestos

            </span>

          </div>

        </section>

      </main>

      {/* MODAL */}

      {modalAbierto && (

        <div
          className="inventory-modal-overlay"
          onClick={cerrarModal}
        >

          <div
            className="inventory-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span>
                  {modoEdicion
                    ? 'ACTUALIZAR INVENTARIO'
                    : 'NUEVO REPUESTO'}
                </span>

                <h2>
                  {modoEdicion
                    ? 'Modificar repuesto'
                    : 'Agregar repuesto'}
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={cerrarModal}
                type="button"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                guardarRepuesto
              }
            >

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Nombre del repuesto
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    placeholder="Ej: Filtro de aceite"
                    value={
                      formulario.nombre
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Categoría
                  </label>

                  <select
                    name="categoria"
                    value={
                      formulario.categoria
                    }
                    onChange={
                      manejarCambio
                    }
                  >

                    <option value="">
                      Seleccionar categoría
                    </option>

                    <option value="Motor">
                      Motor
                    </option>

                    <option value="Frenos">
                      Frenos
                    </option>

                    <option value="Filtros">
                      Filtros
                    </option>

                    <option value="Eléctrico">
                      Eléctrico
                    </option>

                    <option value="Suspensión">
                      Suspensión
                    </option>

                    <option value="Lubricantes">
                      Lubricantes
                    </option>

                    <option value="Carrocería">
                      Carrocería
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Marca
                  </label>

                  <input
                    type="text"
                    name="marca"
                    placeholder="Ej: Bosch"
                    value={
                      formulario.marca
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Precio
                  </label>

                  <input
                    type="text"
                    name="precio"
                    placeholder="Ej: 35000"
                    value={
                      formulario.precio
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="form-group full">

                  <label>
                    Descripción
                  </label>

                  <input
                    type="text"
                    name="descripcion"
                    placeholder="Descripción del repuesto"
                    value={
                      formulario.descripcion
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="form-group full">

                  <label>
                    Cantidad en stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    placeholder="Ej: 25"
                    value={
                      formulario.stock
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                  <small>
                    La cantidad determina automáticamente el estado del inventario.
                  </small>

                </div>

              </div>

              <div className="stock-preview">

                <div className="stock-preview-icon">
                  📦
                </div>

                <div>

                  <strong>
                    Estado del inventario
                  </strong>

                  <span>
                    {
                      formulario.stock ===
                      ''
                        ? 'Ingresa una cantidad'
                        : calcularEstado(
                            formulario.stock
                          )
                    }
                  </span>

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
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
                  className="save-button"
                  disabled={
                    guardando
                  }
                >
                  {guardando
                    ? 'Guardando...'
                    : modoEdicion
                    ? 'Guardar cambios'
                    : 'Agregar repuesto'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Inventario