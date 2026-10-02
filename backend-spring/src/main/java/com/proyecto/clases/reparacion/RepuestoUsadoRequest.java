package com.proyecto.clases.reparacion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RepuestoUsadoRequest(
        @NotNull(message = "El repuestoId es obligatorio") Long repuestoId,
        @NotNull(message = "La cantidad es obligatoria") @Positive(message = "La cantidad debe ser mayor a 0") Integer cantidadUsada) {
}
