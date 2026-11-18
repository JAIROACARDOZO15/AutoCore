package com.proyecto.clases.reparacion;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import com.proyecto.clases.repuesto.Repuesto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "repuesto_reparacion")
@Getter
@Setter
@NoArgsConstructor
public class RepuestoReparacion {

    @Id
    private Long id;

    @DBRef
    private Reparacion reparacion;

    @DBRef
    private Repuesto repuesto;

    private Integer cantidadUsada = 1;

}
