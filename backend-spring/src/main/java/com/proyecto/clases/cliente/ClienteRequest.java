package com.proyecto.clases.cliente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** usuarioId es obligatorio al crear (debe ser un usuario con rol CLIENTE); al actualizar se ignora. */
public record ClienteRequest(
        Long usuarioId,
        @Size(max = 20) String telefono,
        @Size(max = 255) String direccion,
        @NotBlank(message = "El documento es obligatorio") @Size(max = 20) String documento) {
}
