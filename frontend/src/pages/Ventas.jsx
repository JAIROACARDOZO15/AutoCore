import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  obtenerCotizaciones,
  aprobarCotizacion,
  rechazarCotizacion,
  crearCotizacion,
  actualizarCotizacion,
  obtenerRepuestos,
  crearPedido,
  agregarDetallePedido,
  obtenerPedidoPorCotizacion,
  obtenerReparaciones,
  obtenerClientes
} from '../services/api'

import './VentasC.css'

function Ventas() {

  const navigate = useNavigate()

  const [cotizaciones, setCotizaciones] = useState([])
  const [reparaciones, setReparaciones] = useState([])
  const [repuestos, setRepuestos] = useState([])
  const [clientes, setClientes] = useState([])

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  const [cargando, setCargando] = useState(true)

  /* =========================
     NUEVA COTIZACIÓN
  ========================= */

  const [mostrarModalCotizacion, setMostrarModalCotizacion] =
    useState(false)

  const [reparacionSeleccionada, setReparacionSeleccionada] =
    useState('')

  const [manoObraNueva, setManoObraNueva] =
    useState('')

  const [ivaPorcentajeNueva, setIvaPorcentajeNueva] = useState('0')

  const [detallesNuevaCotizacion, setDetallesNuevaCotizacion] =
    useState([
      {
        repuestoId: '',
        cantidad: 1
      }
    ])

  const [creandoCotizacion, setCreandoCotizacion] =
    useState(false)

  /* =========================
     EDITAR COTIZACIÓN EXISTENTE
  ========================= */
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [cotizacionEditando, setCotizacionEditando] = useState(null)
  const [manoObraEditar, setManoObraEditar] = useState('')
  const [ivaPorcentajeEditar, setIvaPorcentajeEditar] = useState('0')
  const [detallesEditar, setDetallesEditar] = useState([])
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  /* =========================
     CARGAR DATOS
  ========================= */

  useEffect(() => {

    const usuarioGuardado =
      localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      navigate('/')
      return
    }

    cargarDatos()

  }, [navigate])

  const cargarDatos = async () => {

    try {

      setCargando(true)

      const [
        cotizacionesData,
        reparacionesData,
        repuestosData,
        clientesData
      ] = await Promise.all([
        obtenerCotizaciones(),
        obtenerReparaciones(),
        obtenerRepuestos(),
        obtenerClientes()
      ])

      setCotizaciones(
        cotizacionesData || []
      )

      setReparaciones(
        reparacionesData || []
      )

      setRepuestos(
        repuestosData || []
      )

      setClientes(
        clientesData || []
      )

    } catch (error) {

      console.error(
        'Error cargando ventas:',
        error
      )

      alert(
        error.message ||
        'No fue posible cargar las ventas.'
      )

    } finally {

      setCargando(false)

    }
  }

  /* =========================
     REPARACIONES
  ========================= */

  const obtenerReparacion = (id) => {

    return reparaciones.find(
      reparacion =>
        reparacion.id === id
    )
  }

  const reparacionesDisponibles =
    reparaciones.filter(
      reparacion =>
        reparacion.estado ===
        'COTIZACION_PENDIENTE'
    )

  const obtenerReparacionSeleccionada = () => {

    return reparacionesDisponibles.find(
      reparacion =>
        Number(reparacion.id) ===
        Number(reparacionSeleccionada)
    )
  }

  /* =========================
     ESTADO COTIZACIÓN
  ========================= */

  const obtenerEstado = (cotizacion) => {

    if (cotizacion.aprobada === true) {
      return 'APROBADA'
    }

    if (cotizacion.aprobada === false) {
      return 'RECHAZADA'
    }

    return 'PENDIENTE'
  }

  const obtenerTextoEstado = (cotizacion) => {

    const estado =
      obtenerEstado(cotizacion)

    if (estado === 'APROBADA') {
      return 'Aprobada'
    }

    if (estado === 'RECHAZADA') {
      return 'Rechazada'
    }

    return 'Pendiente'
  }

  const obtenerClaseEstado = (cotizacion) => {

    const estado =
      obtenerEstado(cotizacion)

    if (estado === 'APROBADA') {
      return 'approved'
    }

    if (estado === 'RECHAZADA') {
      return 'rejected'
    }

    return 'pending'
  }

  /* =========================
     APROBAR COTIZACIÓN
  ========================= */

  const aprobar = async (cotizacion) => {

    const confirmar =
      window.confirm(
        '¿Deseas aprobar esta cotización?'
      )

    if (!confirmar) {
      return
    }

    try {

      await aprobarCotizacion(
        cotizacion.id
      )

      await cargarDatos()

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible aprobar la cotización.'
      )
    }
  }

  /* =========================
     RECHAZAR COTIZACIÓN
  ========================= */

  const rechazar = async (cotizacion) => {

    const confirmar =
      window.confirm(
        '¿Deseas rechazar esta cotización?'
      )

    if (!confirmar) {
      return
    }

    try {

      await rechazarCotizacion(
        cotizacion.id
      )

      await cargarDatos()

    } catch (error) {

      console.error(error)

      alert(
        error.message ||
        'No fue posible rechazar la cotización.'
      )
    }
  }

  /* =========================
     ABRIR NUEVA COTIZACIÓN
  ========================= */

  const abrirNuevaCotizacion = () => {

    setReparacionSeleccionada('')

    setManoObraNueva('')
    setIvaPorcentajeNueva('0')

    setDetallesNuevaCotizacion([
      {
        repuestoId: '',
        cantidad: 1
      }
    ])

    setMostrarModalCotizacion(true)
  }

  const cerrarNuevaCotizacion = () => {

    if (creandoCotizacion) {
      return
    }

    setMostrarModalCotizacion(false)
  }

  /* =========================
     REPUESTOS
  ========================= */

  const obtenerRepuesto = (id) => {

    return repuestos.find(
      repuesto =>
        Number(repuesto.id) ===
        Number(id)
    )
  }

  /* =========================
     AGREGAR DETALLE
  ========================= */

  const agregarDetalleNuevaCotizacion = () => {

    setDetallesNuevaCotizacion(
      prev => [
        ...prev,
        {
          repuestoId: '',
          cantidad: 1
        }
      ]
    )
  }

  /* =========================
     ELIMINAR DETALLE
  ========================= */

  const eliminarDetalleNuevaCotizacion = (
    indice
  ) => {

    setDetallesNuevaCotizacion(
      prev => {

        if (prev.length === 1) {
          return prev
        }

        return prev.filter(
          (_, i) =>
            i !== indice
        )
      }
    )
  }

  /* =========================
     ACTUALIZAR DETALLE
  ========================= */

  const actualizarDetalleNuevaCotizacion = (
    indice,
    campo,
    valor
  ) => {

    setDetallesNuevaCotizacion(
      prev =>
        prev.map(
          (detalle, i) => {

            if (i !== indice) {
              return detalle
            }

            return {
              ...detalle,
              [campo]:
                campo === 'cantidad'
                  ? Number(valor)
                  : valor
            }
          }
        )
    )
  }

  /* =========================
     CREAR COTIZACIÓN
  ========================= */

  const crearNuevaCotizacion = async (
    e
  ) => {

    e.preventDefault()

    if (!reparacionSeleccionada) {

      alert(
        'Debes seleccionar una reparación.'
      )

      return
    }

    const manoObra =
      Number(manoObraNueva)

    if (
      Number.isNaN(manoObra) ||
      manoObra < 0
    ) {

      alert(
        'La mano de obra no puede ser negativa.'
      )

      return
    }

    const detallesValidos =
      detallesNuevaCotizacion.filter(
        detalle =>
          detalle.repuestoId &&
          Number(detalle.cantidad) > 0
      )

    if (
      detallesValidos.length === 0
    ) {

      alert(
        'Agrega al menos un repuesto con cantidad mayor que cero.'
      )

      return
    }

    try {

      setCreandoCotizacion(true)

      await crearCotizacion({

        reparacionId:
          Number(
            reparacionSeleccionada
          ),

        manoObra: manoObra,
        ivaPorcentaje: Number(ivaPorcentajeNueva || 0),

        detalles:

          detallesValidos.map(
            detalle => ({
              repuestoId:
                Number(
                  detalle.repuestoId
                ),

              cantidad:
                Number(
                  detalle.cantidad
                )
            })
          )
      })

      alert(
        'Cotización creada correctamente.'
      )

      setMostrarModalCotizacion(
        false
      )

      await cargarDatos()

    } catch (error) {

      console.error(
        'Error creando cotización:',
        error
      )

      alert(
        error.message ||
        'No fue posible crear la cotización.'
      )

    } finally {

      setCreandoCotizacion(
        false
      )
    }
  }

  /* =========================
     TOTAL NUEVA COTIZACIÓN
  ========================= */

  const calcularSubtotalNuevaCotizacion = () => {
    const totalRepuestos = detallesNuevaCotizacion.reduce((total, detalle) => {
      const repuesto = obtenerRepuesto(detalle.repuestoId)
      return total + Number(repuesto?.precio || 0) * Number(detalle.cantidad || 0)
    }, 0)
    return Number(manoObraNueva || 0) + totalRepuestos
  }

  const calcularIvaNuevaCotizacion = () =>
    calcularSubtotalNuevaCotizacion() * Number(ivaPorcentajeNueva || 0) / 100

  const calcularTotalNuevaCotizacion = () =>
    calcularSubtotalNuevaCotizacion() + calcularIvaNuevaCotizacion()

  /* =========================
     CREAR PEDIDO
  ========================= */

  const crearPedidoDesdeCotizacion =
    async (
      cotizacion
    ) => {

      const reparacion =
        obtenerReparacion(
          cotizacion.reparacionId
        )

      if (!reparacion) {

        alert(
          'No se encontró la reparación asociada a la cotización.'
        )

        return
      }

      if (!reparacion.clienteId) {

        alert(
          'La reparación no tiene un cliente asociado.'
        )

        return
      }

      const confirmar =
        window.confirm(
          `¿Deseas crear el pedido de la cotización #${cotizacion.id} por ${formatoDinero(cotizacion.total)}?`
        )

      if (!confirmar) {
        return
      }

      try {

        /*
         * Verificamos si ya existe
         * un pedido para esta cotización.
         */

        try {

          await obtenerPedidoPorCotizacion(
            cotizacion.id
          )

          alert(
            'Esta cotización ya tiene un pedido asociado.'
          )

          return

        } catch {
          /*
           * Si no existe,
           * continuamos creando.
           */
        }

        /* Crear pedido */

        const pedido =
          await crearPedido({

            cliente: {
              id:
                reparacion.clienteId
            },

            cotizacion: {
              id:
                cotizacion.id
            },

            estado:
              'PENDIENTE',

            total:
              0,

            observaciones:
              `Pedido generado desde la cotización #${cotizacion.id}`
          })

        /*
         * Agregar detalles
         */

        if (
          cotizacion.detalles &&
          cotizacion.detalles.length > 0
        ) {

          for (
            const detalle
            of cotizacion.detalles
          ) {

            await agregarDetallePedido(
              pedido.id,
              {
                repuesto: {
                  id:
                    detalle.repuestoId
                },

                cantidad:
                  detalle.cantidad
              }
            )
          }
        }

        alert(
          `Pedido #${pedido.id} creado correctamente.`
        )

        await cargarDatos()

      } catch (error) {

        console.error(
          'Error creando pedido:',
          error
        )

        alert(
          error.message ||
          'No fue posible crear el pedido.'
        )
      }
    }

  /* =========================
     EDITAR COTIZACIÓN
  ========================= */
  const abrirEditarCotizacion = async (cotizacion) => {
    // Una cotización ya respondida solo puede reabrirse si aún no tiene pedido.
    if (cotizacion.aprobada !== null) {
      try {
        await obtenerPedidoPorCotizacion(cotizacion.id)
        alert(
          `No se puede editar la cotización #${cotizacion.id} porque ya tiene un pedido asociado. ` +
          'Para proteger los importes del pedido y la factura, primero debe gestionarse ese pedido.'
        )
        return
      } catch (error) {
        // Un 404 indica que no existe pedido asociado. Otros errores no deben ignorarse.
        const mensaje = String(error?.message || '')
        const noExistePedido =
          /404|no existe un pedido|pedido.*no encontrado|not found/i.test(mensaje)

        if (!noExistePedido) {
          console.error('No se pudo verificar si la cotización tiene pedido:', error)
          alert(
            'No pude verificar si la cotización tiene un pedido asociado. ' +
            'Comprueba que el backend esté activo e inténtalo de nuevo.'
          )
          return
        }
      }
    }

    setCotizacionEditando(cotizacion)
    setManoObraEditar(String(cotizacion.manoObra ?? 0))
    setIvaPorcentajeEditar(String(cotizacion.ivaPorcentaje ?? 0))
    setDetallesEditar(
      Array.isArray(cotizacion.detalles)
        ? cotizacion.detalles.map(detalle => ({
            repuestoId: String(detalle.repuestoId ?? detalle.repuesto?.id ?? ''),
            cantidad: Number(detalle.cantidad ?? 1)
          }))
        : []
    )
    setMostrarModalEditar(true)
  }

  const actualizarDetalleEdicion = (indice, campo, valor) => {
    setDetallesEditar(prev => prev.map((detalle, i) => {
      if (i !== indice) return detalle
      return { ...detalle, [campo]: campo === 'cantidad' ? Number(valor) : valor }
    }))
  }

  const agregarDetalleEdicion = () => {
    setDetallesEditar(prev => [...prev, { repuestoId: '', cantidad: 1 }])
  }

  const eliminarDetalleEdicion = (indice) => {
    setDetallesEditar(prev => prev.filter((_, i) => i !== indice))
  }

  const calcularSubtotalEdicion = () => {
    const repuestosTotal = detallesEditar.reduce((total, detalle) => {
      const repuesto = obtenerRepuesto(detalle.repuestoId)
      return total + Number(repuesto?.precio || 0) * Number(detalle.cantidad || 0)
    }, 0)
    return Number(manoObraEditar || 0) + repuestosTotal
  }

  const calcularIvaEdicion = () =>
    calcularSubtotalEdicion() * Number(ivaPorcentajeEditar || 0) / 100

  const calcularTotalEdicion = () =>
    calcularSubtotalEdicion() + calcularIvaEdicion()

  const previsualizarEdicionCotizacion = () => {
    if (!cotizacionEditando) return
    const detalles = detallesEditar
      .filter(detalle => detalle.repuestoId && Number(detalle.cantidad) > 0)
      .map(detalle => {
        const repuesto = obtenerRepuesto(detalle.repuestoId) || {}
        const cantidad = Number(detalle.cantidad)
        const precioUnitario = Number(repuesto.precio || 0)
        return {
          repuestoId: Number(detalle.repuestoId),
          repuesto,
          repuestoNombre: repuesto.nombre,
          cantidad,
          precioUnitario,
          subtotal: precioUnitario * cantidad
        }
      })
    const subtotal = calcularSubtotalEdicion()
    const valorIva = calcularIvaEdicion()
    const temporal = {
      ...cotizacionEditando,
      manoObra: Number(manoObraEditar || 0),
      detalles,
      subtotal,
      ivaPorcentaje: Number(ivaPorcentajeEditar || 0),
      valorIva,
      total: subtotal + valorIva,
      aprobada: null
    }
    verFactura(temporal, { vistaPrevia: true })
  }

  const guardarEdicionCotizacion = async (e) => {
    e.preventDefault()
    if (!cotizacionEditando) return

    const manoObra = Number(manoObraEditar)
    if (!Number.isFinite(manoObra) || manoObra < 0) {
      alert('La mano de obra debe ser un valor válido mayor o igual a cero.')
      return
    }

    const ivaPorcentaje = Number(ivaPorcentajeEditar || 0)
    if (!Number.isFinite(ivaPorcentaje) || ivaPorcentaje < 0 || ivaPorcentaje > 100) {
      alert('El IVA debe ser un porcentaje entre 0 y 100.')
      return
    }

    const detallesValidos = detallesEditar.filter(
      detalle => detalle.repuestoId && Number(detalle.cantidad) > 0
    )
    if (detallesEditar.some(detalle => !detalle.repuestoId || Number(detalle.cantidad) <= 0)) {
      alert('Selecciona un repuesto y una cantidad mayor que cero en cada fila, o elimina la fila vacía.')
      return
    }

    try {
      setGuardandoEdicion(true)
      await actualizarCotizacion(cotizacionEditando.id, {
        reparacionId: Number(cotizacionEditando.reparacionId),
        manoObra,
        ivaPorcentaje,
        detalles: detallesValidos.map(detalle => ({
          repuestoId: Number(detalle.repuestoId),
          cantidad: Number(detalle.cantidad)
        }))
      })
      alert('Cotización actualizada correctamente.')
      setMostrarModalEditar(false)
      setCotizacionEditando(null)
      await cargarDatos()
    } catch (error) {
      console.error('Error actualizando cotización:', error)
      alert(error.message || 'No fue posible actualizar la cotización.')
    } finally {
      setGuardandoEdicion(false)
    }
  }

  /* =========================
     VER / IMPRIMIR DOCUMENTO
  ========================= */

  const escaparHtml = (valor) => String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  const verFactura = (cotizacion, opciones = {}) => {
    const vistaPrevia = opciones.vistaPrevia === true
    if (!vistaPrevia && (cotizacion.aprobada === null || cotizacion.aprobada === undefined)) {
      alert('La cotización aún está pendiente de aprobación o rechazo.')
      return
    }

    const reparacion = obtenerReparacion(cotizacion.reparacionId)
    if (!reparacion) {
      alert('No se encontró la reparación asociada a esta cotización.')
      return
    }

    const cliente = clientes.find(
      item => Number(item.id) === Number(reparacion.clienteId)
    ) || {}

    const tecnico = reparacion.tecnicoNombre ||
      reparacion.nombreTecnico ||
      reparacion.tecnico?.nombreCompleto ||
      reparacion.tecnico?.nombre ||
      reparacion.tecnico?.usuario?.nombre ||
      reparacion.tecnico?.usuario?.nombreCompleto ||
      'No asignado'

    const detalles = Array.isArray(cotizacion.detalles) ? cotizacion.detalles : []
    const calcularDetalle = (detalle) => {
      const repuesto = detalle.repuesto ||
        obtenerRepuesto(detalle.repuestoId || detalle.repuesto?.id) || {}
      const cantidad = Number(detalle.cantidad || 0)
      const precio = Number(detalle.precioUnitario ?? detalle.precio ?? repuesto.precio ?? 0)
      const subtotal = Number(detalle.subtotal ?? cantidad * precio)
      return { repuesto, cantidad, precio, subtotal }
    }

    const filasRepuestos = detalles.map((detalle) => {
      const d = calcularDetalle(detalle)
      return `<tr><td>${escaparHtml(d.repuesto.nombre || detalle.repuestoNombre || 'Repuesto')}</td><td class="number">${d.cantidad}</td><td class="money">${formatoDinero(d.precio)}</td><td class="money">${formatoDinero(d.subtotal)}</td></tr>`
    }).join('') || '<tr><td colspan="4" class="empty">No se registraron repuestos en esta cotización.</td></tr>'

    const subtotalRepuestos = detalles.reduce((suma, detalle) => suma + calcularDetalle(detalle).subtotal, 0)
    const manoObra = Number(cotizacion.manoObra || 0)
    const subtotalDocumento = Number(cotizacion.subtotal ?? (manoObra + subtotalRepuestos))
    const porcentajeIva = Number(cotizacion.ivaPorcentaje ?? 0)
    const ivaRegistrado = Number(cotizacion.valorIva ?? cotizacion.iva ?? cotizacion.impuesto ?? (subtotalDocumento * porcentajeIva / 100))
    const totalDocumento = Number(cotizacion.total ?? (subtotalDocumento + ivaRegistrado))
    const fecha = formatoFecha(cotizacion.fechaCotizacion || cotizacion.fechaCreacion || new Date().toISOString())
    const aprobada = cotizacion.aprobada === true
    const rechazada = cotizacion.aprobada === false
    const numeroFactura = aprobada
      ? `FAC-${String(cotizacion.id).padStart(3, '0')}`
      : `COT-${String(cotizacion.id).padStart(3, '0')}`
    const tituloDocumento = vistaPrevia ? 'PREVISUALIZACIÓN DE COTIZACIÓN' : aprobada ? 'FACTURA DE SERVICIO' : 'COTIZACIÓN RECHAZADA'
    const textoSello = vistaPrevia ? 'VISTA PREVIA' : aprobada ? 'APROBADO' : 'NEGADO'
    const claseSello = vistaPrevia ? 'preview' : aprobada ? 'approved' : 'rejected'
    const logoUrl = `${window.location.origin}/logo.png`
    const popup = window.open('', '_blank', 'width=1000,height=800')

    if (!popup) {
      alert('El navegador bloqueó la ventana de la factura. Permite las ventanas emergentes para localhost:5173 e inténtalo de nuevo.')
      return
    }

    popup.document.open()
    popup.document.write(`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${numeroFactura} - AutoCore</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:32px;color:#172b45;font-family:Arial,Helvetica,sans-serif;background:#f2f5f9}.invoice{max-width:900px;margin:0 auto;padding:42px;background:#fff;border:1px solid #dfe6ef;border-radius:12px}.top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #1769e0}.brand-wrap{display:flex;align-items:center;gap:12px}.brand-logo{width:112px;height:100px;object-fit:contain;flex:0 0 auto}.brand{color:#1769e0;font-size:31px;font-weight:800;letter-spacing:.4px}.approval-stamp{margin:0;width:max-content;max-width:100%;padding:12px 22px;border:5px double currentColor;border-radius:8px;font-size:27px;font-weight:900;letter-spacing:3px;transform:rotate(-3deg);text-align:center;white-space:nowrap}.approval-stamp.approved{color:#14804a;background:#effcf4}.approval-stamp.rejected{color:#c62836;background:#fff0f1}.approval-stamp.preview{color:#1769e0;background:#eff6ff}.muted{color:#64748b;font-size:12px;line-height:1.6}.invoice-title{text-align:right}.invoice-title h1{margin:0 0 8px;font-size:25px}.invoice-title strong{color:#1769e0;font-size:15px}.notice{margin:18px 0;padding:11px 14px;border:1px solid #f0d49b;background:#fff8e8;color:#77520c;border-radius:7px;font-size:11px;line-height:1.5}.section-title{margin:25px 0 10px;color:#1769e0;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.info{padding:14px;border:1px solid #e4eaf1;border-radius:8px}.info p{margin:5px 0;font-size:12px;line-height:1.5;overflow-wrap:anywhere}table{width:100%;margin-top:12px;border-collapse:collapse;font-size:12px}th{padding:12px 10px;color:#526780;background:#f3f6fa;text-align:left;font-size:10px;letter-spacing:.5px}td{padding:12px 10px;border-bottom:1px solid #e8edf3}.number{text-align:center}.money{text-align:right;white-space:nowrap}.empty{text-align:center;color:#64748b}.totals{width:min(100%,460px);margin:22px 0 0 auto}.total-row{display:flex;justify-content:space-between;gap:20px;padding:8px 0;font-size:12px;border-bottom:1px solid #e8edf3}.total-approval-row{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-top:18px;padding:14px 0 8px;border-bottom:3px solid #1769e0}.grand-total{display:flex;flex-direction:column;align-items:flex-end;gap:5px;min-width:220px;margin:0;padding:0;color:#1769e0;font-size:18px;font-weight:800;border:0}.grand-total strong{font-size:26px;white-space:nowrap}.footer{margin-top:35px;padding-top:16px;border-top:1px solid #e5eaf0;color:#64748b;text-align:center;font-size:10px;line-height:1.6}.actions{display:flex;justify-content:flex-end;gap:10px;margin:0 auto 18px;max-width:900px}.actions button{padding:11px 16px;color:#fff;background:#1769e0;border:0;border-radius:7px;font-weight:700;cursor:pointer}.actions .close{color:#26384d;background:#e3e9f1}@media(max-width:650px){body{padding:12px}.invoice{padding:20px}.top{flex-direction:column}.invoice-title{text-align:left}.grid{grid-template-columns:1fr}.brand-logo{width:92px;height:84px}.brand{font-size:25px}.total-approval-row{align-items:flex-start;flex-direction:column}.grand-total{align-items:flex-start;min-width:0}.approval-stamp{font-size:22px;letter-spacing:2px;padding:10px 15px}}@media print{body{padding:0;background:#fff}.invoice{max-width:none;padding:0;border:0;border-radius:0}.actions{display:none}.notice{break-inside:avoid}}
</style></head><body>
<div class="actions"><button onclick="window.print()">Imprimir / Guardar PDF</button><button class="close" onclick="window.close()">Cerrar</button></div>
<article class="invoice"><header class="top"><div><div class="brand-wrap"><img class="brand-logo" src="${escaparHtml(logoUrl)}" alt="Logo AutoCore"><div class="brand">AutoCore</div></div><p class="muted">Taller de reparación automotriz<br>Documento de gestión comercial</p></div><div class="invoice-title"><h1>${tituloDocumento}</h1><strong>${numeroFactura}</strong><p class="muted">Fecha: ${escaparHtml(fecha)}<br>Cotización: #COT-${String(cotizacion.id).padStart(3, '0')}<br>Reparación: #${escaparHtml(reparacion.id)}</p></div></header>
<div class="notice">${vistaPrevia ? 'Vista previa de los cambios sin guardar. El importe y el IVA se actualizarán en el documento al guardar la cotización.' : aprobada ? 'Documento interno imprimible. Verifica el tratamiento tributario antes de usarlo como factura fiscal.' : 'Esta cotización fue rechazada. Este documento sirve como constancia interna de la decisión y no representa una factura por cobrar.'}</div>
<h2 class="section-title">Datos del cliente</h2><div class="grid"><div class="info"><p><strong>Nombre:</strong> ${escaparHtml(cliente.nombre || cliente.nombreCompleto || cliente.usuario?.nombreCompleto || cliente.usuario?.nombre || [cliente.usuario?.nombres, cliente.usuario?.apellidos].filter(Boolean).join(' ') || reparacion.clienteNombre || 'No registrado')}</p><p><strong>Documento:</strong> ${escaparHtml(cliente.documento || 'No registrado')}</p><p><strong>Teléfono:</strong> ${escaparHtml(cliente.telefono || 'No registrado')}</p><p><strong>Correo:</strong> ${escaparHtml(cliente.email || cliente.usuario?.email || 'No registrado')}</p><p><strong>Dirección:</strong> ${escaparHtml(cliente.direccion || 'No registrada')}</p></div><div class="info"><p><strong>Vehículo:</strong> ${escaparHtml(`${reparacion.equipoMarca || ''} ${reparacion.equipoModelo || ''}`.trim() || 'No registrado')}</p><p><strong>Placa:</strong> ${escaparHtml(reparacion.placa || reparacion.equipoPlaca || 'No registrada')}</p><p><strong>Técnico:</strong> ${escaparHtml(tecnico)}</p><p><strong>Falla reportada:</strong> ${escaparHtml(reparacion.fallaReportada || 'No registrada')}</p></div></div>
<h2 class="section-title">Detalle del servicio</h2><table><thead><tr><th>Concepto</th><th class="number">Cantidad</th><th class="money">Precio unitario</th><th class="money">Subtotal</th></tr></thead><tbody><tr><td>Mano de obra</td><td class="number">1</td><td class="money">${formatoDinero(manoObra)}</td><td class="money">${formatoDinero(manoObra)}</td></tr>${filasRepuestos}</tbody></table>
<div class="totals"><div class="total-row"><span>Subtotal repuestos</span><strong>${formatoDinero(subtotalRepuestos)}</strong></div><div class="total-row"><span>Mano de obra</span><strong>${formatoDinero(manoObra)}</strong></div><div class="total-row"><span>Subtotal antes de IVA</span><strong>${formatoDinero(subtotalDocumento)}</strong></div><div class="total-row"><span>IVA (${porcentajeIva.toLocaleString('es-CO')}%)</span><strong>${formatoDinero(ivaRegistrado)}</strong></div></div><div class="total-approval-row"><div class="approval-stamp ${claseSello}">${textoSello}</div><div class="grand-total"><span>TOTAL</span><strong>${formatoDinero(totalDocumento)}</strong></div></div>
<div class="footer">Gracias por confiar en AutoCore.<br>El total respeta el valor aprobado de la cotización. Los datos que no estén registrados aparecen como no registrados.</div></article></body></html>`)
    popup.document.close()
  }

  /* =========================
     FORMATO DINERO
  ========================= */

  const formatoDinero = (
    valor
  ) => {

    return new Intl.NumberFormat(
      'es-CO',
      {
        style:
          'currency',

        currency:
          'COP',

        maximumFractionDigits:
          0
      }
    ).format(
      valor || 0
    )
  }

  /* =========================
     FORMATO FECHA
  ========================= */

  const formatoFecha = (
    fecha
  ) => {

    if (!fecha) {
      return '—'
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      'es-CO',
      {
        day:
          '2-digit',

        month:
          '2-digit',

        year:
          'numeric'
      }
    )
  }

  /* =========================
     FILTROS
  ========================= */

  const cotizacionesFiltradas =
    cotizaciones.filter(
      cotizacion => {

        const reparacion =
          obtenerReparacion(
            cotizacion.reparacionId
          )

        const texto = `
          ${cotizacion.id || ''}
          ${cotizacion.reparacionId || ''}
          ${reparacion?.clienteNombre || ''}
          ${reparacion?.equipoMarca || ''}
          ${reparacion?.equipoModelo || ''}
          ${reparacion?.fallaReportada || ''}
        `.toLowerCase()

        const coincideBusqueda =
          texto.includes(
            busqueda.toLowerCase()
          )

        const coincideEstado =
          filtroEstado === 'TODOS' ||
          obtenerEstado(
            cotizacion
          ) === filtroEstado

        return (
          coincideBusqueda &&
          coincideEstado
        )
      }
    )

  /* =========================
     ESTADÍSTICAS
  ========================= */

  const total =
    cotizaciones.length

  const pendientes =
    cotizaciones.filter(
      cotizacion =>
        cotizacion.aprobada === null
    ).length

  const aprobadas =
    cotizaciones.filter(
      cotizacion =>
        cotizacion.aprobada === true
    ).length

  const rechazadas =
    cotizaciones.filter(
      cotizacion =>
        cotizacion.aprobada === false
    ).length

  const ventasAprobadas =
    cotizaciones
      .filter(
        cotizacion =>
          cotizacion.aprobada === true
      )
      .reduce(
        (
          acumulado,
          cotizacion
        ) =>
          acumulado +
          Number(
            cotizacion.total || 0
          ),
        0
      )

  return (

    <div className="ventas-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="ventas-sidebar">

        <div className="ventas-sidebar-logo">

          <img
            src="/logo.png"
            alt="AutoCore"
          />

          <span>
            AutoCore
          </span>

        </div>

        <nav className="ventas-menu">

          <p className="ventas-menu-title">
            MENÚ PRINCIPAL
          </p>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/inventario')
            }
          >
            <span>▣</span>
            Inventario
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/reparaciones')
            }
          >
            <span>🔧</span>
            Reparaciones
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/clientes')
            }
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/repuestos')
            }
          >
            <span>⚙</span>
            Repuestos
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/ordenes')
            }
          >
            <span>▤</span>
            Órdenes
          </button>

          <button
            className="ventas-menu-item active"
          >
            <span>▥</span>
            Ventas
          </button>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/reportes')
            }
          >
            <span>▦</span>
            Reportes
          </button>

          <p className="ventas-menu-title ventas-system">
            SISTEMA
          </p>

          <button
            className="ventas-menu-item"
            onClick={() =>
              navigate('/configuracion')
            }
          >
            <span>⚙</span>
            Configuración
          </button>

        </nav>

        <button
          className="ventas-logout"
          onClick={() => {

            localStorage.removeItem(
              'usuario'
            )

            navigate('/')

          }}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

      </aside>

      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="ventas-main">

        <header className="ventas-header">

          <div>

            <p className="ventas-header-label">
              GESTIÓN COMERCIAL
            </p>

            <h1>
              Ventas
            </h1>

            <p className="ventas-header-description">
              Administra cotizaciones y ventas generadas por el taller.
            </p>

          </div>

          <div className="ventas-user">

            <div className="ventas-notification">
              🔔
              <span></span>
            </div>

            <div className="ventas-avatar">
              U
            </div>

            <div>

              <strong>
                Usuario
              </strong>

              <small>
                ADMIN
              </small>

            </div>

          </div>

        </header>

        {/* =========================
            ESTADÍSTICAS
        ========================= */}

        <section className="ventas-stats">

          <div className="venta-stat-card">

            <div className="venta-stat-icon blue">
              $
            </div>

            <div>

              <span>
                Ventas aprobadas
              </span>

              <strong>
                {formatoDinero(
                  ventasAprobadas
                )}
              </strong>

              <small>
                Valor generado
              </small>

            </div>

          </div>

          <div className="venta-stat-card">

            <div className="venta-stat-icon orange">
              ◷
            </div>

            <div>

              <span>
                Pendientes
              </span>

              <strong>
                {pendientes}
              </strong>

              <small>
                Por responder
              </small>

            </div>

          </div>

          <div className="venta-stat-card">

            <div className="venta-stat-icon green">
              ✓
            </div>

            <div>

              <span>
                Aprobadas
              </span>

              <strong>
                {aprobadas}
              </strong>

              <small>
                Confirmadas
              </small>

            </div>

          </div>

          <div className="venta-stat-card">

            <div className="venta-stat-icon red">
              !
            </div>

            <div>

              <span>
                Rechazadas
              </span>

              <strong>
                {rechazadas}
              </strong>

              <small>
                No aprobadas
              </small>

            </div>

          </div>

        </section>

        {/* =========================
            TABLA
        ========================= */}

        <section className="ventas-panel">

          <div className="ventas-panel-header">

            <div>

              <span>
                COMERCIAL
              </span>

              <h2>
                Cotizaciones y ventas
              </h2>

            </div>

            <button
              className="nueva-venta-button"
              onClick={
                abrirNuevaCotizacion
              }
            >
              + Nueva cotización
            </button>

          </div>

          <div className="ventas-filtros">

            <div className="ventas-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar cliente, reparación o equipo..."
                value={busqueda}
                onChange={e =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>

            <select
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

              <option value="PENDIENTE">
                Pendientes
              </option>

              <option value="APROBADA">
                Aprobadas
              </option>

              <option value="RECHAZADA">
                Rechazadas
              </option>

            </select>

          </div>

          <div className="ventas-table-wrapper">

            <table className="ventas-table">

              <thead>

                <tr>

                  <th>
                    COTIZACIÓN
                  </th>

                  <th>
                    CLIENTE
                  </th>

                  <th>
                    REPARACIÓN
                  </th>

                  <th>
                    MANO DE OBRA
                  </th>

                  <th>
                    TOTAL
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
                      className="ventas-loading"
                    >
                      Cargando ventas...
                    </td>

                  </tr>

                ) : cotizacionesFiltradas.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="ventas-empty"
                    >

                      <div>

                        <span>
                          💰
                        </span>

                        <strong>
                          No hay ventas registradas
                        </strong>

                        <small>
                          Las cotizaciones aparecerán aquí cuando se creen desde una reparación.
                        </small>

                      </div>

                    </td>

                  </tr>

                ) : (

                  cotizacionesFiltradas.map(
                    cotizacion => {

                      const reparacion =
                        obtenerReparacion(
                          cotizacion.reparacionId
                        )

                      return (

                        <tr
                          key={
                            cotizacion.id
                          }
                        >

                          <td>

                            <strong className="venta-number">

                              #COT-
                              {String(
                                cotizacion.id
                              ).padStart(
                                3,
                                '0'
                              )}

                            </strong>

                            <small className="venta-date">

                              {formatoFecha(
                                cotizacion.fechaCotizacion
                              )}

                            </small>

                          </td>

                          <td>

                            <div className="venta-cliente">

                              <div className="venta-cliente-avatar">

                                {(
                                  reparacion?.clienteNombre ||
                                  'C'
                                ).charAt(0)}

                              </div>

                              <div>

                                <strong>

                                  {reparacion?.clienteNombre ||
                                    'Sin cliente'}

                                </strong>

                                <small>

                                  Cliente #
                                  {reparacion?.clienteId ||
                                    '—'}

                                </small>

                              </div>

                            </div>

                          </td>

                          <td>

                            <div className="venta-reparacion">

                              <strong>
                                #
                                {cotizacion.reparacionId}
                              </strong>

                              <small>

                                {reparacion
                                  ? `${reparacion.equipoMarca || ''} ${reparacion.equipoModelo || ''}`
                                  : 'Reparación'}

                              </small>

                            </div>

                          </td>

                          <td>

                            <strong className="venta-money">

                              {formatoDinero(
                                cotizacion.manoObra
                              )}

                            </strong>

                          </td>

                          <td>

                            <strong className="venta-total">

                              {formatoDinero(
                                cotizacion.total
                              )}

                            </strong>

                          </td>

                          <td>

                            <span
                              className={`venta-status ${obtenerClaseEstado(
                                cotizacion
                              )}`}
                            >

                              <i></i>

                              {obtenerTextoEstado(
                                cotizacion
                              )}

                            </span>

                          </td>

                          <td>

                            {cotizacion.aprobada === null ? (

                              <div className="venta-actions">

                                <button
                                  type="button"
                                  className="edit-button"
                                  onClick={() => abrirEditarCotizacion(cotizacion)}
                                  title="Editar cotización pendiente"
                                  aria-label="Editar cotización pendiente"
                                >
                                  ✏️
                                </button>

                                <button
                                  type="button"
                                  className="invoice-button"
                                  onClick={() => verFactura(cotizacion, { vistaPrevia: true })}
                                  title="Previsualizar cotización e IVA"
                                  aria-label="Previsualizar cotización e IVA"
                                >
                                  👁
                                </button>

                                <button
                                  className="approve-button"
                                  onClick={() =>
                                    aprobar(
                                      cotizacion
                                    )
                                  }
                                >
                                  ✓
                                </button>

                                <button
                                  className="reject-button"
                                  onClick={() =>
                                    rechazar(
                                      cotizacion
                                    )
                                  }
                                >
                                  ×
                                </button>

                              </div>

                            ) : cotizacion.aprobada === true ? (

                              <div className="venta-actions">
                                <button
                                  type="button"
                                  className="edit-button"
                                  onClick={() => abrirEditarCotizacion(cotizacion)}
                                  title="Editar cotización si no tiene pedido asociado"
                                  aria-label="Editar cotización aprobada si no tiene pedido"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  className="invoice-button"
                                  onClick={() => verFactura(cotizacion)}
                                  title="Ver e imprimir factura"
                                  aria-label="Ver e imprimir factura"
                                >
                                  🧾
                                </button>
                                <button
                                  type="button"
                                  className="approve-button"
                                  onClick={() => crearPedidoDesdeCotizacion(cotizacion)}
                                  title="Crear pedido"
                                  aria-label="Crear pedido"
                                >
                                  📦
                                </button>
                              </div>

                            ) : (

                              <div className="venta-actions">
                                <button
                                  type="button"
                                  className="edit-button"
                                  onClick={() => abrirEditarCotizacion(cotizacion)}
                                  title="Editar cotización si no tiene pedido asociado"
                                  aria-label="Editar cotización rechazada si no tiene pedido"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  className="invoice-button rejected-document-button"
                                  onClick={() => verFactura(cotizacion)}
                                  title="Ver constancia de cotización rechazada"
                                  aria-label="Ver constancia de cotización rechazada"
                                >
                                  📄
                                </button>
                              </div>

                            )}

                          </td>

                        </tr>

                      )
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =========================
            MODAL NUEVA COTIZACIÓN
        ========================= */}

        {mostrarModalCotizacion && (

          <div
            className="cotizacion-modal-overlay"
            onMouseDown={e => {

              if (
                e.target ===
                e.currentTarget
              ) {
                cerrarNuevaCotizacion()
              }

            }}
          >

            <div className="cotizacion-modal">

              <div className="cotizacion-modal-header">

                <div>

                  <span className="cotizacion-modal-label">
                    GESTIÓN COMERCIAL
                  </span>

                  <h2>
                    Nueva cotización
                  </h2>

                  <p>
                    Crea una cotización para una reparación pendiente.
                  </p>

                </div>

                <button
                  type="button"
                  className="cotizacion-modal-close"
                  onClick={
                    cerrarNuevaCotizacion
                  }
                  disabled={
                    creandoCotizacion
                  }
                >
                  ×
                </button>

              </div>

              {reparacionesDisponibles.length === 0 ? (

                <div className="cotizacion-sin-reparaciones">

                  <div className="cotizacion-sin-icon">
                    🔧
                  </div>

                  <h3>
                    No hay reparaciones pendientes de cotización
                  </h3>

                  <p>

                    Para crear una cotización,
                    primero debes tener una reparación
                    en estado
                    <strong>
                      {' '}COTIZACION_PENDIENTE
                    </strong>.

                  </p>

                  <button
                    type="button"
                    className="cotizacion-secondary-button"
                    onClick={
                      cerrarNuevaCotizacion
                    }
                  >
                    Cerrar
                  </button>

                </div>

              ) : (

                <form
                  className="cotizacion-form"
                  onSubmit={
                    crearNuevaCotizacion
                  }
                >

                  <div className="cotizacion-form-grid">

                    <div className="cotizacion-form-group full">

                      <label>
                        Reparación *
                      </label>

                      <select
                        value={
                          reparacionSeleccionada
                        }
                        onChange={e =>
                          setReparacionSeleccionada(
                            e.target.value
                          )
                        }
                        required
                      >

                        <option value="">
                          Selecciona una reparación
                        </option>

                        {reparacionesDisponibles.map(
                          reparacion => (

                            <option
                              key={
                                reparacion.id
                              }
                              value={
                                reparacion.id
                              }
                            >

                              #
                              {reparacion.id}
                              {' — '}
                              {reparacion.clienteNombre ||
                                'Sin cliente'}
                              {' — '}
                              {reparacion.equipoMarca ||
                                ''}
                              {' '}
                              {reparacion.equipoModelo ||
                                ''}

                            </option>

                          )
                        )}

                      </select>

                    </div>

                    {reparacionSeleccionada && (

                      <div className="cotizacion-reparacion-info full">

                        {(() => {

                          const reparacion =
                            obtenerReparacionSeleccionada()

                          return (

                            <>

                              <div>

                                <span>
                                  CLIENTE
                                </span>

                                <strong>
                                  {reparacion?.clienteNombre ||
                                    'Sin cliente'}
                                </strong>

                              </div>

                              <div>

                                <span>
                                  VEHÍCULO
                                </span>

                                <strong>

                                  {reparacion?.equipoMarca ||
                                    ''}

                                  {' '}

                                  {reparacion?.equipoModelo ||
                                    ''}

                                </strong>

                              </div>

                              <div>

                                <span>
                                  FALLA
                                </span>

                                <strong>
                                  {reparacion?.fallaReportada ||
                                    'Sin falla registrada'}
                                </strong>

                              </div>

                            </>

                          )

                        })()}

                      </div>

                    )}

                    <div className="cotizacion-form-group full">

                      <label>
                        Mano de obra *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={
                          manoObraNueva
                        }
                        onChange={e =>
                          setManoObraNueva(
                            e.target.value
                          )
                        }
                        placeholder="Ej. 150000"
                        required
                      />

                    </div>

                    <div className="cotizacion-form-group full">
                      <label>IVA (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={ivaPorcentajeNueva}
                        onChange={e => setIvaPorcentajeNueva(e.target.value)}
                        disabled={creandoCotizacion}
                      />
                      <small>Ingresa 0 si no aplica IVA. El valor se guarda en la cotización.</small>
                    </div>

                  </div>

                  <div className="cotizacion-detalles-header">

                    <div>

                      <h3>
                        Repuestos
                      </h3>

                      <p>
                        Agrega los repuestos incluidos en la cotización.
                      </p>

                    </div>

                    <button
                      type="button"
                      className="cotizacion-add-detail"
                      onClick={
                        agregarDetalleNuevaCotizacion
                      }
                    >
                      + Agregar repuesto
                    </button>

                  </div>

                  <div className="cotizacion-detalles">

                    {detallesNuevaCotizacion.map(
                      (
                        detalle,
                        indice
                      ) => (

                        <div
                          className="cotizacion-detalle-row"
                          key={indice}
                        >

                          <div className="cotizacion-form-group">

                            <label>
                              Repuesto
                            </label>

                            <select
                              value={
                                detalle.repuestoId
                              }
                              onChange={e =>
                                actualizarDetalleNuevaCotizacion(
                                  indice,
                                  'repuestoId',
                                  e.target.value
                                )
                              }
                              required
                            >

                              <option value="">
                                Selecciona un repuesto
                              </option>

                              {repuestos.map(
                                repuesto => (

                                  <option
                                    key={
                                      repuesto.id
                                    }
                                    value={
                                      repuesto.id
                                    }
                                  >

                                    {repuesto.nombre}
                                    {' — '}
                                    {formatoDinero(
                                      repuesto.precio
                                    )}

                                  </option>

                                )
                              )}

                            </select>

                          </div>

                          <div className="cotizacion-form-group cantidad-group">

                            <label>
                              Cantidad
                            </label>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={
                                detalle.cantidad
                              }
                              onChange={e =>
                                actualizarDetalleNuevaCotizacion(
                                  indice,
                                  'cantidad',
                                  e.target.value
                                )
                              }
                              required
                            />

                          </div>

                          <div className="cotizacion-detalle-subtotal">

                            <span>
                              Subtotal
                            </span>

                            <strong>

                              {formatoDinero(

                                Number(
                                  obtenerRepuesto(
                                    detalle.repuestoId
                                  )?.precio ||
                                  0
                                ) *

                                Number(
                                  detalle.cantidad ||
                                  0
                                )

                              )}

                            </strong>

                          </div>

                          <button
                            type="button"
                            className="cotizacion-remove-detail"
                            onClick={() =>
                              eliminarDetalleNuevaCotizacion(
                                indice
                              )
                            }
                            disabled={
                              detallesNuevaCotizacion.length ===
                              1
                            }
                            title="Eliminar repuesto"
                          >
                            ×
                          </button>

                        </div>

                      )
                    )}

                  </div>

                  <div className="cotizacion-total-box cotizacion-total-breakdown">
                    <div><span>Subtotal</span><strong>{formatoDinero(calcularSubtotalNuevaCotizacion())}</strong></div>
                    <div><span>IVA ({Number(ivaPorcentajeNueva || 0)}%)</span><strong>{formatoDinero(calcularIvaNuevaCotizacion())}</strong></div>
                    <div className="cotizacion-grand-total"><span>Total estimado</span><strong>{formatoDinero(calcularTotalNuevaCotizacion())}</strong></div>
                  </div>

                  <div className="cotizacion-form-actions">

                    <button
                      type="button"
                      className="cotizacion-secondary-button"
                      onClick={
                        cerrarNuevaCotizacion
                      }
                      disabled={
                        creandoCotizacion
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="cotizacion-primary-button"
                      disabled={
                        creandoCotizacion
                      }
                    >

                      {creandoCotizacion
                        ? 'Creando...'
                        : 'Crear cotización'}

                    </button>

                  </div>

                </form>

              )}

            </div>

          </div>

        )}

        {/* =========================
            MODAL EDITAR COTIZACIÓN
        ========================= */}
        {mostrarModalEditar && cotizacionEditando && (
          <div
            className="cotizacion-modal-overlay"
            onMouseDown={e => {
              if (e.target === e.currentTarget && !guardandoEdicion) {
                setMostrarModalEditar(false)
                setCotizacionEditando(null)
              }
            }}
          >
            <div className="cotizacion-modal">
              <div className="cotizacion-modal-header">
                <div>
                  <span className="cotizacion-modal-label">GESTIÓN COMERCIAL</span>
                  <h2>Editar cotización #COT-{String(cotizacionEditando.id).padStart(3, '0')}</h2>
                  <p>Las cotizaciones aprobadas o rechazadas se reabren al guardar, únicamente si no tienen un pedido asociado.</p>
                </div>
                <button
                  type="button"
                  className="cotizacion-modal-close"
                  onClick={() => {
                    if (!guardandoEdicion) {
                      setMostrarModalEditar(false)
                      setCotizacionEditando(null)
                    }
                  }}
                  disabled={guardandoEdicion}
                  aria-label="Cerrar edición"
                >×</button>
              </div>

              <form onSubmit={guardarEdicionCotizacion}>
                <div className="cotizacion-edit-context">
                  <strong>Reparación #{cotizacionEditando.reparacionId}</strong>
                  <span>{obtenerReparacion(cotizacionEditando.reparacionId)?.clienteNombre || 'Cliente no registrado'}</span>
                  <span>{`${obtenerReparacion(cotizacionEditando.reparacionId)?.equipoMarca || ''} ${obtenerReparacion(cotizacionEditando.reparacionId)?.equipoModelo || ''}`.trim()}</span>
                </div>

                <div className="cotizacion-form-group full">
                  <label>Mano de obra *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={manoObraEditar}
                    onChange={e => setManoObraEditar(e.target.value)}
                    required
                    disabled={guardandoEdicion}
                  />
                </div>

                <div className="cotizacion-form-group full cotizacion-iva-field">
                  <label>IVA (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={ivaPorcentajeEditar}
                    onChange={e => setIvaPorcentajeEditar(e.target.value)}
                    required
                    disabled={guardandoEdicion}
                  />
                  <small>El IVA se calcula sobre la mano de obra más los repuestos. Usa 0 si no aplica.</small>
                </div>

                <div className="cotizacion-detalles-header">
                  <div>
                    <h3>Repuestos</h3>
                    <p>Actualiza las cantidades o selecciona otros repuestos.</p>
                  </div>
                  <button type="button" className="cotizacion-add-detail" onClick={agregarDetalleEdicion} disabled={guardandoEdicion}>
                    + Agregar repuesto
                  </button>
                </div>

                <div className="cotizacion-detalles">
                  {detallesEditar.map((detalle, indice) => (
                    <div className="cotizacion-detalle-row" key={`edit-${indice}`}>
                      <div className="cotizacion-form-group">
                        <label>Repuesto</label>
                        <select
                          value={detalle.repuestoId}
                          onChange={e => actualizarDetalleEdicion(indice, 'repuestoId', e.target.value)}
                          required
                          disabled={guardandoEdicion}
                        >
                          <option value="">Selecciona un repuesto</option>
                          {repuestos.map(repuesto => (
                            <option key={repuesto.id} value={repuesto.id}>
                              {repuesto.nombre} — {formatoDinero(repuesto.precio)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="cotizacion-form-group cantidad-group">
                        <label>Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={detalle.cantidad}
                          onChange={e => actualizarDetalleEdicion(indice, 'cantidad', e.target.value)}
                          required
                          disabled={guardandoEdicion}
                        />
                      </div>
                      <div className="cotizacion-detalle-subtotal">
                        <span>Subtotal</span>
                        <strong>{formatoDinero(Number(obtenerRepuesto(detalle.repuestoId)?.precio || 0) * Number(detalle.cantidad || 0))}</strong>
                      </div>
                      <button
                        type="button"
                        className="cotizacion-remove-detail"
                        onClick={() => eliminarDetalleEdicion(indice)}
                        disabled={guardandoEdicion}
                        title="Eliminar repuesto"
                      >×</button>
                    </div>
                  ))}
                </div>

                <div className="cotizacion-total-box cotizacion-total-breakdown">
                  <div><span>Subtotal</span><strong>{formatoDinero(calcularSubtotalEdicion())}</strong></div>
                  <div><span>IVA ({Number(ivaPorcentajeEditar || 0)}%)</span><strong>{formatoDinero(calcularIvaEdicion())}</strong></div>
                  <div className="cotizacion-grand-total"><span>Total estimado actualizado</span><strong>{formatoDinero(calcularTotalEdicion())}</strong></div>
                </div>

                <div className="cotizacion-form-actions cotizacion-edit-actions">
                  <button type="button" className="cotizacion-secondary-button" onClick={previsualizarEdicionCotizacion} disabled={guardandoEdicion}>
                    Vista previa de factura
                  </button>
                  <button
                    type="button"
                    className="cotizacion-secondary-button"
                    onClick={() => {
                      if (!guardandoEdicion) {
                        setMostrarModalEditar(false)
                        setCotizacionEditando(null)
                      }
                    }}
                    disabled={guardandoEdicion}
                  >Cancelar</button>
                  <button type="submit" className="cotizacion-primary-button" disabled={guardandoEdicion}>
                    {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  )
}

export default Ventas
