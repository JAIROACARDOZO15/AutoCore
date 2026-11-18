package com.proyecto.clases.cotizacion;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;

import com.proyecto.clases.repuesto.Repuesto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "detalle_cotizacion")
@Getter
@Setter
@NoArgsConstructor
public class DetalleCotizacion {

    @Id
    private Long id;

    @DBRef
    private Cotizacion cotizacion;

    @DBRef
    private Repuesto repuesto;

    private Integer cantidad = 1;

    private BigDecimal precioUnitario;

    private BigDecimal subtotal;

}
