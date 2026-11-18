package com.proyecto.clases.usuario;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface TecnicoRepository extends MongoRepository<Tecnico, Long> {

    default Optional<Tecnico> findByUsuarioId(Long usuarioId) {
        return findAll().stream().filter(t -> t.getUsuario() != null
                && usuarioId.equals(t.getUsuario().getId())).findFirst();
    }

}
