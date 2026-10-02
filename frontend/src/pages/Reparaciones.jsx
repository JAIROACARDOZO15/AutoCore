import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  obtenerReparaciones,
  obtenerEquipos,
  obtenerTecnicos,
  crearReparacion,
  actualizarReparacion,
  eliminarReparacion,
  cambiarEstadoReparacion
} from '../services/api'

import './ReparacionesC.css'

function Reparaciones() {

  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(null)

  const [reparaciones, setReparaciones] = useState([])
  const [equipos, setEquipos] = useState([])
  const [tecnicos, setTecnicos] = useState([])

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)

  const [reparacionSeleccionada, setReparacionSeleccionada] =
    useState(null)

  const [formulario, setFormulario] = useState({
    equipoId: '',
    tecnicoId: '',
    fallaReportada: '',
    observaciones: ''
  })

  useEffect(() => {

    const usuarioGuardado =
      localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      navigate('/')
      return
    }

    setUsuario(
      JSON.parse(usuarioGuardado)
    )

  }, [navigate])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {

    try {

      setCargando(true)

      const [
        reparacionesData,
        equiposData,
        tecnicosData
      ] = await Promise.all([
        obtenerReparaciones(),
        obtenerEquipos(),
        obtenerTecnicos()
      ])

      setReparaciones(
        reparacionesData || []
      )

      setEquipos(
        equiposData || []
      )

      setTecnicos(
        tecnicosData || []
      )

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible cargar las reparaciones.'
      )

    } finally {

      setCargando(false)

    }
  }

  const manejarCambio = (e) => {

    const {
      name,
      value
    } = e.target

    setFormulario(
      anterior => ({
        ...anterior,
        [name]: value
      })
    )
  }

  const abrirAgregar = () => {

    setModoEdicion(false)

    setReparacionSeleccionada(null)

    setFormulario({
      equipoId: '',
      tecnicoId: '',
      fallaReportada: '',
      observaciones: ''
    })

    setModalAbierto(true)
  }

  const abrirEditar = (reparacion) => {

    setModoEdicion(true)

    setReparacionSeleccionada(
      reparacion
    )

    setFormulario({
      equipoId:
        reparacion.equipoId || '',

      tecnicoId:
        reparacion.tecnicoId || '',

      fallaReportada:
        reparacion.fallaReportada || '',

      observaciones:
        reparacion.observaciones || ''
    })

    setModalAbierto(true)
  }

  const cerrarModal = () => {

    if (guardando) {
      return
    }

    setModalAbierto(false)
    setModoEdicion(false)

    setReparacionSeleccionada(
      null
    )
  }

  const guardarReparacion = async (e) => {

    e.preventDefault()

    if (!formulario.equipoId) {
      alert(
        'Debes seleccionar un vehículo/equipo.'
      )
      return
    }

    if (
      !formulario.fallaReportada.trim()
    ) {
      alert(
        'La falla reportada es obligatoria.'
      )
      return
    }

    try {

      setGuardando(true)

      const datos = {
        equipoId:
          Number(formulario.equipoId),

        tecnicoId:
          formulario.tecnicoId
            ? Number(formulario.tecnicoId)
            : null,

        fallaReportada:
          formulario.fallaReportada.trim(),

        observaciones:
          formulario.observaciones.trim()
      }

      if (modoEdicion) {

        await actualizarReparacion(
          reparacionSeleccionada.id,
          datos
        )

        alert(
          'Reparación actualizada correctamente.'
        )

      } else {

        await crearReparacion(
          datos
        )

        alert(
          'Reparación creada correctamente.'
        )
      }

      cerrarModal()

      await cargarDatos()

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible guardar la reparación.'
      )

    } finally {

      setGuardando(false)

    }
  }

  const borrarReparacion = async (
    reparacion
  ) => {

    const confirmar =
      window.confirm(
        `¿Deseas eliminar la reparación #${reparacion.id}?`
      )

    if (!confirmar) {
      return
    }

    try {

      await eliminarReparacion(
        reparacion.id
      )

      alert(
        'Reparación eliminada correctamente.'
      )

      await cargarDatos()

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible eliminar la reparación.'
      )
    }
  }

  const avanzarEstado = async (
    reparacion
  ) => {

    let nuevoEstado = null

    if (
      reparacion.estado === 'RECIBIDO'
    ) {
      nuevoEstado = 'EN_DIAGNOSTICO'
    }

    else if (
      reparacion.estado === 'EN_REPARACION'
    ) {
      nuevoEstado = 'FINALIZADA'
    }

    else if (
      reparacion.estado === 'FINALIZADA'
    ) {
      nuevoEstado = 'ENTREGADO'
    }

    if (!nuevoEstado) {

      alert(
        'Este estado se gestiona mediante el flujo de diagnóstico/cotización.'
      )

      return
    }

    try {

      await cambiarEstadoReparacion(
        reparacion.id,
        nuevoEstado
      )

      await cargarDatos()

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible cambiar el estado.'
      )
    }
  }

  const reparacionesFiltradas =
    reparaciones.filter(
      reparacion => {

        const texto =
          busqueda
            .toLowerCase()
            .trim()

        const coincideTexto =
          !texto ||
          reparacion.clienteNombre
            ?.toLowerCase()
            .includes(texto) ||
          reparacion.equipoMarca
            ?.toLowerCase()
            .includes(texto) ||
          reparacion.equipoModelo
            ?.toLowerCase()
            .includes(texto) ||
          reparacion.fallaReportada
            ?.toLowerCase()
            .includes(texto)

        const coincideEstado =
          filtroEstado === 'TODOS' ||
          reparacion.estado ===
            filtroEstado

        return (
          coincideTexto &&
          coincideEstado
        )
      }
    )

  const total =
    reparaciones.length

  const recibidas =
    reparaciones.filter(
      r => r.estado === 'RECIBIDO'
    ).length

  const proceso =
    reparaciones.filter(
      r =>
        r.estado ===
          'EN_DIAGNOSTICO' ||
        r.estado ===
          'EN_REPARACION'
    ).length

  const finalizadas =
    reparaciones.filter(
      r =>
        r.estado ===
          'FINALIZADA' ||
        r.estado ===
          'ENTREGADO'
    ).length

  const nombre =
    usuario?.nombre ||
    usuario?.email ||
    'Usuario'

  const rol =
    usuario?.rol ||
    'ADMIN'

  const textoEstado = (
    estado
  ) => {

    const estados = {
      RECIBIDO: 'Recibido',
      EN_DIAGNOSTICO: 'En diagnóstico',
      COTIZACION_PENDIENTE:
        'Cotización pendiente',
      ESPERANDO_APROBACION:
        'Esperando aprobación',
      EN_REPARACION:
        'En reparación',
      FINALIZADA:
        'Finalizada',
      ENTREGADO:
        'Entregado',
      RECHAZADO:
        'Rechazado'
    }

    return (
      estados[estado] ||
      estado
    )
  }

  const claseEstado = (
    estado
  ) => {

    const clases = {
      RECIBIDO: 'recibido',
      EN_DIAGNOSTICO: 'diagnostico',
      COTIZACION_PENDIENTE:
        'cotizacion',
      ESPERANDO_APROBACION:
        'aprobacion',
      EN_REPARACION:
        'reparacion',
      FINALIZADA:
        'finalizada',
      ENTREGADO:
        'entregado',
      RECHAZADO:
        'rechazado'
    }

    return (
      clases[estado] ||
      ''
    )
  }

  const cerrarSesion = () => {

    localStorage.removeItem(
      'usuario'
    )

    navigate('/')
  }

  return (

    <div className="reparaciones-page">

      <aside className="reparaciones-sidebar">

        <div className="reparaciones-logo">

          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>

        </div>

        <nav className="reparaciones-menu">

          <p className="reparaciones-menu-title">
            MENÚ PRINCIPAL
          </p>

          <button
            className="reparaciones-menu-item"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="reparaciones-menu-item"
            onClick={() =>
              navigate('/inventario')
            }
          >
            <span>▣</span>
            Inventario
          </button>

          <button
            className="reparaciones-menu-item active"
          >
            <span>🔧</span>
            Reparaciones
          </button>

          <button
            className="reparaciones-menu-item"
            onClick={() =>
              navigate('/clientes')
            }
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className="reparaciones-menu-item"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Repuestos
          </button>

          <button
            className="reparaciones-menu-item"
            onClick={() =>
              navigate('/ordenes')
            }
          >
            <span>▤</span>
            Órdenes
          </button>

          <button
            className="reparaciones-menu-item"
            onClick={() =>
              navigate('/ventas')
            }
          >
            <span>▥</span>
            Ventas
          </button>

          <button
            className="reparaciones-menu-item"
            onClick={() =>
              navigate('/reportes')
            }
          >
            <span>▦</span>
            Reportes
          </button>

          <p className="reparaciones-menu-title reparaciones-system">
            SISTEMA
          </p>

          <button
            className="reparaciones-menu-item"
            onClick={() =>
              navigate('/configuracion')
            }
          >
            <span>⚙</span>
            Configuración
          </button>

        </nav>

        <button
          className="reparaciones-logout"
          onClick={cerrarSesion}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

      <main className="reparaciones-main">

        <header className="reparaciones-header">

          <div>

            <p className="reparaciones-label">
              GESTIÓN DEL TALLER
            </p>

            <h1>
              Reparaciones
            </h1>

            <p className="reparaciones-description">
              Controla y da seguimiento a las reparaciones del taller.
            </p>

          </div>

          <div className="reparaciones-header-right">

            <button className="reparaciones-notification">
              🔔
              <span></span>
            </button>

            <div className="reparaciones-user">

              <div className="reparaciones-avatar">
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

        <section className="reparaciones-summary">

          <div className="reparacion-summary-card">

            <div className="reparacion-summary-icon blue">
              🔧
            </div>

            <div>

              <span>
                Total
              </span>

              <strong>
                {total}
              </strong>

              <small>
                Reparaciones
              </small>

            </div>

          </div>

          <div className="reparacion-summary-card">

            <div className="reparacion-summary-icon orange">
              📥
            </div>

            <div>

              <span>
                Recibidas
              </span>

              <strong>
                {recibidas}
              </strong>

              <small>
                Pendientes
              </small>

            </div>

          </div>

          <div className="reparacion-summary-card">

            <div className="reparacion-summary-icon purple">
              ⚙
            </div>

            <div>

              <span>
                En proceso
              </span>

              <strong>
                {proceso}
              </strong>

              <small>
                En atención
              </small>

            </div>

          </div>

          <div className="reparacion-summary-card">

            <div className="reparacion-summary-icon green">
              ✓
            </div>

            <div>

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

          </div>

        </section>

        <section className="reparaciones-content">

          <div className="reparaciones-content-header">

            <div>

              <span className="reparacion-section-label">
                SERVICIO
              </span>

              <h2>
                Reparaciones registradas
              </h2>

            </div>

            <button
              className="add-repair-button"
              onClick={abrirAgregar}
            >
              ＋ Nueva reparación
            </button>

          </div>

          <div className="reparaciones-tools">

            <div className="repair-search-box">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar cliente, vehículo o falla..."
                value={busqueda}
                onChange={e =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              className="repair-filter"
              value={filtroEstado}
              onChange={e =>
                setFiltroEstado(
                  e.target.value
                )
              }
            >

              <option value="TODOS">
                Todos los estados
              </option>

              <option value="RECIBIDO">
                Recibido
              </option>

              <option value="EN_DIAGNOSTICO">
                En diagnóstico
              </option>

              <option value="COTIZACION_PENDIENTE">
                Cotización pendiente
              </option>

              <option value="ESPERANDO_APROBACION">
                Esperando aprobación
              </option>

              <option value="EN_REPARACION">
                En reparación
              </option>

              <option value="FINALIZADA">
                Finalizada
              </option>

              <option value="ENTREGADO">
                Entregado
              </option>

              <option value="RECHAZADO">
                Rechazado
              </option>

            </select>

          </div>

          <div className="reparaciones-table-container">

            <table className="reparaciones-table">

              <thead>

                <tr>

                  <th>
                    CLIENTE
                  </th>

                  <th>
                    VEHÍCULO
                  </th>

                  <th>
                    FALLA
                  </th>

                  <th>
                    TÉCNICO
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
                      colSpan="6"
                      className="reparaciones-loading"
                    >
                      Cargando reparaciones...
                    </td>

                  </tr>

                ) : reparacionesFiltradas.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="reparaciones-empty"
                    >

                      <div>
                        🔧
                      </div>

                      <strong>
                        No hay reparaciones
                      </strong>

                      <p>
                        Registra la primera reparación de AutoCore.
                      </p>

                    </td>

                  </tr>

                ) : (

                  reparacionesFiltradas.map(
                    reparacion => (

                      <tr
                        key={
                          reparacion.id
                        }
                      >

                        <td>

                          <div className="repair-client">

                            <div className="repair-avatar">
                              {reparacion.clienteNombre
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {
                                  reparacion.clienteNombre
                                }
                              </strong>

                              <small>
                                REP-
                                {String(
                                  reparacion.id
                                ).padStart(
                                  3,
                                  '0'
                                )}
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>

                          <strong className="repair-car">
                            {reparacion.equipoMarca ||
                              'Vehículo'}{' '}
                            {reparacion.equipoModelo ||
                              ''}
                          </strong>

                          <small className="repair-type">
                            {reparacion.equipoTipo ||
                              'Equipo'}
                          </small>

                        </td>

                        <td>

                          <span className="repair-failure">
                            {
                              reparacion.fallaReportada
                            }
                          </span>

                        </td>

                        <td>

                          {
                            reparacion.tecnicoNombre ||
                            'Sin asignar'
                          }

                        </td>

                        <td>

                          <span
                            className={`repair-status ${claseEstado(
                              reparacion.estado
                            )}`}
                          >

                            <i></i>

                            {
                              textoEstado(
                                reparacion.estado
                              )
                            }

                          </span>

                        </td>

                        <td>

                          <div className="repair-actions">

                            <button
                              className="repair-action edit"
                              title="Editar"
                              onClick={() =>
                                abrirEditar(
                                  reparacion
                                )
                              }
                            >
                              ✎
                            </button>

                            <button
                              className="repair-action next"
                              title="Avanzar estado"
                              onClick={() =>
                                avanzarEstado(
                                  reparacion
                                )
                              }
                            >
                              →
                            </button>

                            <button
                              className="repair-action delete"
                              title="Eliminar"
                              onClick={() =>
                                borrarReparacion(
                                  reparacion
                                )
                              }
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

          <div className="reparaciones-footer">

            Mostrando{' '}

            <strong>
              {
                reparacionesFiltradas.length
              }
            </strong>

            {' '}de{' '}

            <strong>
              {reparaciones.length}
            </strong>

            {' '}reparaciones

          </div>

        </section>

      </main>

      {modalAbierto && (

        <div
          className="reparaciones-modal-overlay"
          onClick={cerrarModal}
        >

          <div
            className="reparaciones-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <div className="reparaciones-modal-header">

              <div>

                <span>
                  {modoEdicion
                    ? 'ACTUALIZAR REPARACIÓN'
                    : 'NUEVA REPARACIÓN'}
                </span>

                <h2>
                  {modoEdicion
                    ? 'Modificar reparación'
                    : 'Registrar reparación'}
                </h2>

              </div>

              <button
                className="reparaciones-modal-close"
                onClick={cerrarModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                guardarReparacion
              }
            >

              <div className="reparaciones-form-grid">

                <div className="repair-form-group full">

                  <label>
                    Vehículo / Equipo *
                  </label>

                  <select
                    name="equipoId"
                    value={
                      formulario.equipoId
                    }
                    onChange={
                      manejarCambio
                    }
                  >

                    <option value="">
                      Seleccionar vehículo
                    </option>

                    {equipos.map(
                      equipo => (

                        <option
                          key={
                            equipo.id
                          }
                          value={
                            equipo.id
                          }
                        >
                          {equipo.clienteNombre}
                          {' — '}
                          {equipo.marca || ''}
                          {' '}
                          {equipo.modelo || ''}
                          {' '}
                          ({equipo.tipo})
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div className="repair-form-group">

                  <label>
                    Técnico asignado
                  </label>

                  <select
                    name="tecnicoId"
                    value={
                      formulario.tecnicoId
                    }
                    onChange={
                      manejarCambio
                    }
                  >

                    <option value="">
                      Sin asignar
                    </option>

                    {tecnicos.map(
                      tecnico => (

                        <option
                          key={
                            tecnico.tecnicoId
                          }
                          value={
                            tecnico.tecnicoId
                          }
                        >
                          {tecnico.nombre}
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div className="repair-form-group">

                  <label>
                    Estado inicial
                  </label>

                  <input
                    value="Recibido"
                    disabled
                  />

                </div>

                <div className="repair-form-group full">

                  <label>
                    Falla reportada *
                  </label>

                  <textarea
                    name="fallaReportada"
                    rows="3"
                    placeholder="Describe la falla reportada por el cliente..."
                    value={
                      formulario.fallaReportada
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="repair-form-group full">

                  <label>
                    Observaciones
                  </label>

                  <textarea
                    name="observaciones"
                    rows="3"
                    placeholder="Observaciones adicionales..."
                    value={
                      formulario.observaciones
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

              </div>

              <div className="reparaciones-modal-info">

                <span>
                  🔧
                </span>

                <div>

                  <strong>
                    Flujo de reparación
                  </strong>

                  <p>
                    La reparación inicia en estado RECIBIDO. Después puede avanzar a diagnóstico y continuar con el flujo del taller.
                  </p>

                </div>

              </div>

              <div className="reparaciones-modal-actions">

                <button
                  type="button"
                  className="repair-cancel-button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="repair-save-button"
                  disabled={guardando}
                >
                  {guardando
                    ? 'Guardando...'
                    : modoEdicion
                    ? 'Guardar cambios'
                    : 'Crear reparación'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Reparaciones