package com.proyecto.clases.cotizacion;

import java.math.BigDecimal;

public record DetalleCotizacionResponse(
        Long id,
        Long repuestoId,
        String repuestoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal) {
}
