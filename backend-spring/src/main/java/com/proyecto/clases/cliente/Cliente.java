package com.proyecto.clases.cliente;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;

import com.proyecto.clases.usuario.Usuario;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "cliente")
@Getter
@Setter
@NoArgsConstructor
public class Cliente {

    @Id
    private Long id;

    @DBRef
    private Usuario usuario;

    private String telefono;

    private String direccion;

    @Indexed(unique = true)
    private String documento;

}
