package com.proyecto.clases.cotizacion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** El precio unitario y el subtotal los calcula el servidor con el precio actual del repuesto. */
public record DetalleCotizacionRequest(
        @NotNull(message = "El repuestoId es obligatorio") Long repuestoId,
        @NotNull(message = "La cantidad es obligatoria") @Positive(message = "La cantidad debe ser mayor a 0") Integer cantidad) {
}
