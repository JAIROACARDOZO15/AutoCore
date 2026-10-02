package com.proyecto.clases.equipo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {

    List<Equipo> findByClienteId(Long clienteId);

    boolean existsBySerial(String serial);

    boolean existsBySerialAndIdNot(String serial, Long id);

}
