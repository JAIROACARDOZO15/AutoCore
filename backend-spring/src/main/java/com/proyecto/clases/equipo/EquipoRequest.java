package com.proyecto.clases.equipo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** tipo: PC, Celular, Tablet, Otro. */
public record EquipoRequest(
        @NotNull(message = "El clienteId es obligatorio") Long clienteId,
        @NotBlank(message = "El tipo es obligatorio") @Size(max = 50) String tipo,
        @Size(max = 100) String marca,
        @Size(max = 100) String modelo,
        @Size(max = 100) String serial,
        String descripcion) {
}
