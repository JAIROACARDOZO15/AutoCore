package com.proyecto.clases.inventario;

import com.proyecto.clases.repuesto.Repuesto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventario")
@Getter
@Setter
@NoArgsConstructor
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "repuesto_id", nullable = false, unique = true)
    private Repuesto repuesto;

    @NotNull(message = "La cantidad disponible es obligatoria")
    @PositiveOrZero(message = "La cantidad disponible no puede ser negativa")
    @Column(nullable = false)
    private Integer cantidadDisponible = 0;

    @NotNull(message = "El stock mínimo es obligatorio")
    @PositiveOrZero(message = "El stock mínimo no puede ser negativo")
    @Column(nullable = false)
    private Integer stockMinimo = 0;

    @Column(length = 100)
    private String ubicacion;

    @NotNull(message = "Las entradas son obligatorias")
    @PositiveOrZero(message = "Las entradas no pueden ser negativas")
    @Column(nullable = false)
    private Integer entradas = 0;

    @NotNull(message = "Las salidas son obligatorias")
    @PositiveOrZero(message = "Las salidas no pueden ser negativas")
    @Column(nullable = false)
    private Integer salidas = 0;

    @Column(nullable = false)
    private Boolean activo = true;
}