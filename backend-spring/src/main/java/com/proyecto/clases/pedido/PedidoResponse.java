
package com.proyecto.clases.pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PedidoResponse(
        Long id,
        Long clienteId,
        Long cotizacionId,
        Pedido.EstadoPedido estado,
        BigDecimal total,
        LocalDateTime fechaPedido,
        LocalDateTime fechaActualizacion,
        String observaciones
) {
    public static PedidoResponse from(Pedido pedido) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getCliente() != null
                        ? pedido.getCliente().getId() : null,
                pedido.getCotizacion() != null
                        ? pedido.getCotizacion().getId() : null,
                pedido.getEstado(),
                pedido.getTotal(),
                pedido.getFechaPedido(),
                pedido.getFechaActualizacion(),
                pedido.getObservaciones()
        );
    }
}
