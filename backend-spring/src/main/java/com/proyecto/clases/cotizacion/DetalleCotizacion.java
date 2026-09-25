package com.proyecto.clases.cotizacion;

import java.math.BigDecimal;

import com.proyecto.clases.repuesto.Repuesto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "detalle_cotizacion")
@Getter
@Setter
@NoArgsConstructor
public class DetalleCotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cotizacion_id", nullable = false)
    private Cotizacion cotizacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "repuesto_id", nullable = false)
    private Repuesto repuesto;

    @Column(nullable = false)
    private Integer cantidad = 1;

    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

}
