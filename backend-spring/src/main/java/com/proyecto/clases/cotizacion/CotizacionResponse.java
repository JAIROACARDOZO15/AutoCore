package com.proyecto.clases.cotizacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** aprobada: null = pendiente de respuesta, true = aprobada, false = rechazada. */
public record CotizacionResponse(
        Long id,
        Long reparacionId,
        BigDecimal manoObra,
        BigDecimal total,
        Boolean aprobada,
        LocalDateTime fechaCotizacion,
        LocalDateTime fechaRespuesta,
        List<DetalleCotizacionResponse> detalles) {
}
