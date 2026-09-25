package com.proyecto.clases.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * password: obligatoria al crear; al actualizar, si va vacia se conserva la actual.
 * especialidad y telefono solo aplican cuando rol = TECNICO (se guardan en la tabla tecnico).
 */
public record UsuarioRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 100) String nombre,
        @NotBlank(message = "El email es obligatorio") @Email(message = "El email no tiene un formato valido") @Size(max = 150) String email,
        String password,
        @NotNull(message = "El rol es obligatorio") Rol rol,
        Boolean activo,
        @Size(max = 100) String especialidad,
        @Size(max = 20) String telefono) {
}
