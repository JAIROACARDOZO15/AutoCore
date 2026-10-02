package com.proyecto.clases.usuario;

import java.time.LocalDateTime;

/** tecnicoId, especialidad y telefono solo vienen cuando rol = TECNICO. */
public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        Rol rol,
        Boolean activo,
        LocalDateTime createdAt,
        Long tecnicoId,
        String especialidad,
        String telefono) {
}
