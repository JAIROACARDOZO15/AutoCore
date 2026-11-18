package com.proyecto.clases.pedido;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.proyecto.clases.cliente.Cliente;
import com.proyecto.clases.cotizacion.Cotizacion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "pedido")
@Getter
@Setter
@NoArgsConstructor
public class Pedido {

    @Id
    private Long id;

    @NotNull(message = "El cliente es obligatorio")
    @DBRef
    private Cliente cliente;

    @NotNull(message = "La cotización es obligatoria")
    @DBRef
    private Cotizacion cotizacion;

    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @NotNull(message = "El total es obligatorio")
    @PositiveOrZero(message = "El total no puede ser negativo")
    private BigDecimal total = BigDecimal.ZERO;

    private LocalDateTime fechaPedido;

    private LocalDateTime fechaActualizacion;

    private String observaciones;

    public enum EstadoPedido {
        PENDIENTE,
        CONFIRMADO,
        PROCESANDO,
        COMPLETADO,
        CANCELADO
    }
}