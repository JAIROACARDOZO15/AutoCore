package com.proyecto.clases.categoria;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoriaRepository extends MongoRepository<Categoria, Long> {

    boolean existsByNombreIgnoreCase(String nombre);
}