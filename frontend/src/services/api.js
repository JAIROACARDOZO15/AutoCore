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
    let mensaje = 'Error en la solicitud'

    try {
      const error = await respuesta.json()

      mensaje =
        error.message ||
        error.Mensaje ||
        error.error ||
        mensaje
    } catch {
      mensaje = `Error ${respuesta.status}`
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
    body: JSON.stringify({
      email,
      password
    })
  })
}

/* =========================
   USUARIOS
========================= */

export async function obtenerUsuarios() {
  return request('/usuarios')
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
   REPUESTOS
========================= */

export async function obtenerRepuestos() {
  return request('/repuestos?soloActivos=true')
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

export async function actualizarReparacion(
  id,
  reparacion
) {
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

export async function asignarTecnico(
  reparacionId,
  tecnicoId
) {
  return request(
    `/reparaciones/${reparacionId}/tecnico/${tecnicoId}`,
    {
      method: 'PATCH'
    }
  )
}

export async function cambiarEstadoReparacion(
  id,
  estado
) {
  return request(
    `/reparaciones/${id}/estado`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        estado
      })
    }
  )
}

export async function obtenerOrdenes() {
  return request('/reparaciones')
}


/* =========================
   EQUIPOS / VEHÍCULOS
========================= */

export async function obtenerEquipos() {
  return request('/equipos')
}

/* =========================
   TÉCNICOS
========================= */

export async function obtenerTecnicos() {
  return request('/usuarios?rol=TECNICO')
}

/* =========================
   COTIZACIONES / VENTAS
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