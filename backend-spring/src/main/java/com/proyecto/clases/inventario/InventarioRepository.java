package com.proyecto.clases.inventario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    Optional<Inventario> findByRepuestoId(Long repuestoId);

    boolean existsByRepuestoId(Long repuestoId);
}