package com.proyecto.clases.usuario;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "tecnico")
@Getter
@Setter
@NoArgsConstructor
public class Tecnico {

    @Id
    private Long id;

    @DBRef
    private Usuario usuario;

    private String especialidad;

    private String telefono;

}
