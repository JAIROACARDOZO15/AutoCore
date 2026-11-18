package com.proyecto.clases.cotizacion;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.proyecto.clases.reparacion.Reparacion;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "cotizacion")
@Getter
@Setter
@NoArgsConstructor
public class Cotizacion {

    @Id
    private Long id;

    @DBRef
    private Reparacion reparacion;

    private BigDecimal manoObra = BigDecimal.ZERO;

    private BigDecimal ivaPorcentaje = BigDecimal.ZERO;

    private BigDecimal valorIva = BigDecimal.ZERO;

    private BigDecimal total = BigDecimal.ZERO;

    // null = pendiente de respuesta del cliente
    private Boolean aprobada;

    private LocalDateTime fechaCotizacion;

    private LocalDateTime fechaRespuesta;

    private List<DetalleCotizacion> detalles = new ArrayList<>();

}
