package com.proyecto.clases.usuario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TecnicoRepository extends JpaRepository<Tecnico, Long> {

    Optional<Tecnico> findByUsuarioId(Long usuarioId);

}
