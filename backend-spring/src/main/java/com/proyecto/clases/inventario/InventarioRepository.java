package com.proyecto.clases.inventario;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface InventarioRepository extends MongoRepository<Inventario, Long> {

    default Optional<Inventario> findByRepuestoId(Long repuestoId) {
        return findAll().stream().filter(i -> i.getRepuesto() != null
                && repuestoId.equals(i.getRepuesto().getId())).findFirst();
    }

    default boolean existsByRepuestoId(Long repuestoId) {
        return findByRepuestoId(repuestoId).isPresent();
    }
}
