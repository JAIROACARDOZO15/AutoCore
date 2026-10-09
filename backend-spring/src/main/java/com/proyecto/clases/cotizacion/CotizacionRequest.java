package com.proyecto.clases.cotizacion;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/** El servidor calcula subtotal, IVA y total. ivaPorcentaje es opcional para clientes antiguos. */
public record CotizacionRequest(
        @NotNull(message = "El reparacionId es obligatorio") Long reparacionId,
        @NotNull(message = "La mano de obra es obligatoria") @PositiveOrZero(message = "La mano de obra no puede ser negativa") BigDecimal manoObra,
        @DecimalMin(value = "0.0", message = "El IVA no puede ser negativo")
        @DecimalMax(value = "100.0", message = "El IVA no puede superar el 100%") BigDecimal ivaPorcentaje,
        @Valid List<DetalleCotizacionRequest> detalles) {
}
