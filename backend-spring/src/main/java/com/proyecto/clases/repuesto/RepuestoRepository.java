package com.proyecto.clases.repuesto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RepuestoRepository extends JpaRepository<Repuesto, Long> {

    List<Repuesto> findByActivoTrue();

}
