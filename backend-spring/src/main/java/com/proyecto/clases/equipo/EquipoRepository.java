package com.proyecto.clases.equipo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface EquipoRepository extends MongoRepository<Equipo, Long> {

    default List<Equipo> findByClienteId(Long clienteId) {
        return findAll().stream().filter(e -> e.getCliente() != null
                && clienteId.equals(e.getCliente().getId())).toList();
    }

    boolean existsBySerial(String serial);

    boolean existsBySerialAndIdNot(String serial, Long id);

}
