package com.proyecto.clases.usuario;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "usuario")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    private Long id;

    private String nombre;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Rol rol;

    private Boolean activo = true;

    private LocalDateTime createdAt;

}
