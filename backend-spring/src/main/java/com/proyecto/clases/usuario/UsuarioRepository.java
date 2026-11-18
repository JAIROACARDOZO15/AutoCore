package com.proyecto.clases.usuario;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UsuarioRepository extends MongoRepository<Usuario, Long> {

    List<Usuario> findByRol(Rol rol);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByEmailAndPasswordAndActivoTrue(String email, String password);

    Optional<Usuario> findFirstByEmailAndPasswordAndActivoTrue(String email, String password);

    default Integer contarCredenciales(String email, String password) {
        return existsByEmailAndPasswordAndActivoTrue(email, password) ? 1 : 0;
    }

    default Usuario buscarPorCredenciales(String email, String password) {
        return findFirstByEmailAndPasswordAndActivoTrue(email, password).orElse(null);
    }

}
