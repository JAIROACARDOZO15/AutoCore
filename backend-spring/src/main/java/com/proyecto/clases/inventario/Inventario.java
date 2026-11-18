package com.proyecto.clases.inventario;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import com.proyecto.clases.repuesto.Repuesto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "inventario")
@Getter
@Setter
@NoArgsConstructor
public class Inventario {

    @Id
    private Long id;

    @DBRef
    private Repuesto repuesto;

    @NotNull(message = "La cantidad disponible es obligatoria")
    @PositiveOrZero(message = "La cantidad disponible no puede ser negativa")
    private Integer cantidadDisponible = 0;

    @NotNull(message = "El stock mínimo es obligatorio")
    @PositiveOrZero(message = "El stock mínimo no puede ser negativo")
    private Integer stockMinimo = 0;

    private String ubicacion;

    @NotNull(message = "Las entradas son obligatorias")
    @PositiveOrZero(message = "Las entradas no pueden ser negativas")
    private Integer entradas = 0;

    @NotNull(message = "Las salidas son obligatorias")
    @PositiveOrZero(message = "Las salidas no pueden ser negativas")
    private Integer salidas = 0;

    private Boolean activo = true;
}