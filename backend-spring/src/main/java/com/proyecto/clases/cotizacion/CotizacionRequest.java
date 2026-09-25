package com.proyecto.clases.cotizacion;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/** detalles puede ir vacio o null (cotizacion solo de mano de obra). El total lo calcula el servidor. */
public record CotizacionRequest(
        @NotNull(message = "El reparacionId es obligatorio") Long reparacionId,
        @NotNull(message = "La mano de obra es obligatoria") @PositiveOrZero(message = "La mano de obra no puede ser negativa") BigDecimal manoObra,
        @Valid List<DetalleCotizacionRequest> detalles) {
}
