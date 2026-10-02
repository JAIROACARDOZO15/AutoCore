package com.proyecto.clases.cliente;

public record ClienteResponse(
        Long id,
        Long usuarioId,
        String nombre,
        String email,
        String telefono,
        String direccion,
        String documento) {
}
