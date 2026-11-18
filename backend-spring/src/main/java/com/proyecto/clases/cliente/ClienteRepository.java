package com.proyecto.clases.cliente;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClienteRepository extends MongoRepository<Cliente, Long> {

    default Optional<Cliente> findByUsuarioId(Long usuarioId) {
        return findAll().stream().filter(c -> c.getUsuario() != null
                && usuarioId.equals(c.getUsuario().getId())).findFirst();
    }

    default boolean existsByUsuarioId(Long usuarioId) {
        return findByUsuarioId(usuarioId).isPresent();
    }

    boolean existsByDocumento(String documento);

    boolean existsByDocumentoAndIdNot(String documento, Long id);

}
