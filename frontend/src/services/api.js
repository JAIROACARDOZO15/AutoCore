
const API_URL = 'http://localhost:8080/api'

async function request(endpoint, options = {}) {
  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  if (!respuesta.ok) {
    let mensaje = `Error ${respuesta.status}`

    try {
      const error = await respuesta.json()
      mensaje =
        error.message ||
        error.Mensaje ||
        error.error ||
        mensaje
    } catch {
      // La respuesta del servidor no contiene JSON.
    }

    throw new Error(mensaje)
  }

  if (respuesta.status === 204) {
    return null
  }

  return respuesta.json()
}

/* =========================
   LOGIN
========================= */

export async function login(email, password) {
  return request('/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

/* =========================
   USUARIOS Y TÉCNICOS
========================= */

export async function obtenerUsuarios() {
  return request('/usuarios')
}

export async function obtenerUsuario(id) {
  return request(`/usuarios/${id}`)
}

export async function obtenerTecnicos() {
  return request('/usuarios?rol=TECNICO')
}

export async function crearUsuario(usuario) {
  return request('/usuarios', {
    method: 'POST',
    body: JSON.stringify(usuario)
  })
}

export async function actualizarUsuario(id, usuario) {
  return request(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(usuario)
  })
}

export async function eliminarUsuario(id) {
  return request(`/usuarios/${id}`, {
    method: 'DELETE'
  })
}

/* =========================
   CLIENTES
========================= */

export async function obtenerClientes() {
  return request('/clientes')
}

export async function obtenerCliente(id) {
  return request(`/clientes/${id}`)
}

export async function obtenerClientePorUsuario(usuarioId) {
  return request(`/clientes/usuario/${usuarioId}`)
}

export async function crearCliente(cliente) {
  return request('/clientes', {
    method: 'POST',
    body: JSON.stringify(cliente)
  })
}

export async function actualizarCliente(id, cliente) {
  return request(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cliente)
  })
}

export async function eliminarCliente(id) {
  return request(`/clientes/${id}`, {
    method: 'DELETE'
  })
}

/* =========================
   EQUIPOS / VEHÍCULOS
========================= */

export async function obtenerEquipos() {
  return request('/equipos')
}

export async function obtenerEquipo(id) {
  return request(`/equipos/${id}`)
}

export async function crearEquipo(equipo) {
  return request('/equipos', {
    method: 'POST',
    body: JSON.stringify(equipo)
  })
}

export async function actualizarEquipo(id, equipo) {
  return request(`/equipos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(equipo)
  })
}

export async function eliminarEquipo(id) {
  return request(`/equipos/${id}`, {
    method: 'DELETE'
  })
}

/* =========================
   REPUESTOS
========================= */

export async function obtenerRepuestos() {
  return request('/repuestos')
}

export async function obtenerRepuesto(id) {
  return request(`/repuestos/${id}`)
}

export async function crearRepuesto(repuesto) {
  return request('/repuestos', {
    method: 'POST',
    body: JSON.stringify(repuesto)
  })
}

export async function actualizarRepuesto(id, repuesto) {
  return request(`/repuestos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(repuesto)
  })
}

export async function eliminarRepuesto(id) {
  return request(`/repuestos/${id}`, {
    method: 'DELETE'
  })
}

/* =========================
   INVENTARIO
========================= */

export async function obtenerInventarios() {
  return request('/inventarios')
}

export async function obtenerInventario(id) {
  return request(`/inventarios/${id}`)
}

export async function obtenerInventarioPorRepuesto(repuestoId) {
  return request(`/inventarios/repuesto/${repuestoId}`)
}

export async function crearInventario(inventario) {
  return request('/inventarios', {
    method: 'POST',
    body: JSON.stringify(inventario)
  })
}

export async function actualizarInventario(id, inventario) {
  return request(`/inventarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inventario)
  })
}

export async function eliminarInventario(id) {
  return request(`/inventarios/${id}`, {
    method: 'DELETE'
  })
}

/* =========================
   REPARACIONES
========================= */

export async function obtenerReparaciones() {
  return request('/reparaciones')
}

export async function obtenerReparacion(id) {
  return request(`/reparaciones/${id}`)
}

export async function crearReparacion(reparacion) {
  return request('/reparaciones', {
    method: 'POST',
    body: JSON.stringify(reparacion)
  })
}

export async function actualizarReparacion(id, reparacion) {
  return request(`/reparaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reparacion)
  })
}

export async function eliminarReparacion(id) {
  return request(`/reparaciones/${id}`, {
    method: 'DELETE'
  })
}

export async function asignarTecnico(reparacionId, tecnicoId) {
  return request(
    `/reparaciones/${reparacionId}/tecnico/${tecnicoId}`,
    { method: 'PATCH' }
  )
}

export async function cambiarEstadoReparacion(id, estado) {
  return request(`/reparaciones/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado })
  })
}

export async function registrarDiagnostico(id, diagnostico) {
  return request(`/reparaciones/${id}/diagnostico`, {
    method: 'PUT',
    body: JSON.stringify(diagnostico)
  })
}

export async function agregarRepuestoUsado(
  reparacionId,
  repuestoUsado
) {
  return request(`/reparaciones/${reparacionId}/repuestos`, {
    method: 'POST',
    body: JSON.stringify(repuestoUsado)
  })
}

export async function quitarRepuestoUsado(
  reparacionId,
  repuestoUsadoId
) {
  return request(
    `/reparaciones/${reparacionId}/repuestos/${repuestoUsadoId}`,
    { method: 'DELETE' }
  )
}

/* =========================
   COTIZACIONES
========================= */

export async function obtenerCotizaciones() {
  return request('/cotizaciones')
}

export async function obtenerCotizacion(id) {
  return request(`/cotizaciones/${id}`)
}

export async function crearCotizacion(cotizacion) {
  return request('/cotizaciones', {
    method: 'POST',
    body: JSON.stringify(cotizacion)
  })
}

export async function actualizarCotizacion(id, cotizacion) {
  return request(`/cotizaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cotizacion)
  })
}

export async function aprobarCotizacion(id) {
  return request(`/cotizaciones/${id}/aprobar`, {
    method: 'PATCH'
  })
}

export async function rechazarCotizacion(id) {
  return request(`/cotizaciones/${id}/rechazar`, {
    method: 'PATCH'
  })
}

export async function eliminarCotizacion(id) {
  return request(`/cotizaciones/${id}`, {
    method: 'DELETE'
  })
}

/* =========================
   PEDIDOS
========================= */

export async function obtenerPedidos() {
  return request('/pedidos')
}

export async function obtenerPedido(id) {
  return request(`/pedidos/${id}`)
}

export async function obtenerPedidoPorCotizacion(cotizacionId) {
  return request(`/pedidos/cotizacion/${cotizacionId}`)
}

export async function crearPedido(pedido) {
  return request('/pedidos', {
    method: 'POST',
    body: JSON.stringify(pedido)
  })
}

export async function actualizarPedido(id, pedido) {
  return request(`/pedidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pedido)
  })
}

export async function eliminarPedido(id) {
  return request(`/pedidos/${id}`, {
    method: 'DELETE'
  })
}

export async function obtenerDetallesPedido(pedidoId) {
  return request(`/pedidos/${pedidoId}/detalles`)
}

export async function agregarDetallePedido(pedidoId, detalle) {
  return request(`/pedidos/${pedidoId}/detalles`, {
    method: 'POST',
    body: JSON.stringify(detalle)
  })
}

export async function eliminarDetallePedido(detalleId) {
  return request(`/pedidos/detalles/${detalleId}`, {
    method: 'DELETE'
  })
}

/* =========================
   ÓRDENES
========================= */

export async function obtenerOrdenes() {
  return request('/reparaciones')
}
