package com.proyecto.clases.equipo;

import java.time.LocalDateTime;

public record EquipoResponse(
        Long id,
        Long clienteId,
        String clienteNombre,
        String tipo,
        String marca,
        String modelo,
        String serial,
        String descripcion,
        LocalDateTime fechaRegistro) {
}
