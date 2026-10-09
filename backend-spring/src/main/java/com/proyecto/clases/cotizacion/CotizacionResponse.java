package com.proyecto.clases.cotizacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** aprobada: null = pendiente, true = aprobada, false = rechazada. */
public record CotizacionResponse(
        Long id,
        Long reparacionId,
        BigDecimal manoObra,
        BigDecimal subtotal,
        BigDecimal ivaPorcentaje,
        BigDecimal valorIva,
        BigDecimal total,
        Boolean aprobada,
        LocalDateTime fechaCotizacion,
        LocalDateTime fechaRespuesta,
        List<DetalleCotizacionResponse> detalles) {
}
