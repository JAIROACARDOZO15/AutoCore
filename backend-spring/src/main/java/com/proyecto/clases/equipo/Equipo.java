package com.proyecto.clases.equipo;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;

import com.proyecto.clases.cliente.Cliente;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "equipo")
@Getter
@Setter
@NoArgsConstructor
public class Equipo {

    @Id
    private Long id;

    @DBRef
    private Cliente cliente;

    private String tipo;

    private String marca;

    private String modelo;

    private String serial;

    private String descripcion;

    private LocalDateTime fechaRegistro;

}
