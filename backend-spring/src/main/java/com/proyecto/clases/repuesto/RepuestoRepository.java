package com.proyecto.clases.repuesto;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface RepuestoRepository extends MongoRepository<Repuesto, Long> {

    List<Repuesto> findByActivoTrue();

}
