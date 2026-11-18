package com.proyecto.clases.reparacion;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "diagnostico")
@Getter
@Setter
@NoArgsConstructor
public class Diagnostico {

    @Id
    private Long id;

    @DBRef
    private Reparacion reparacion;

    private String hallazgos;

    private String solucionPropuesta;

    private LocalDateTime fechaDiagnostico;

}
