package com.proyecto.clases.reparacion;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
public interface ReparacionRepository extends MongoRepository<Reparacion, Long> {

    default List<Reparacion> buscar(EstadoReparacion estado, Long tecnicoId, Long clienteId) {
        return findAll().stream()
                .filter(r -> estado == null || estado == r.getEstado())
                .filter(r -> tecnicoId == null || (r.getTecnico() != null
                        && tecnicoId.equals(r.getTecnico().getId())))
                .filter(r -> clienteId == null || (r.getEquipo() != null
                        && r.getEquipo().getCliente() != null
                        && clienteId.equals(r.getEquipo().getCliente().getId())))
                .sorted((a, b) -> java.util.Comparator.nullsLast(java.util.Comparator
                        .<java.time.LocalDateTime>naturalOrder()).reversed()
                        .compare(a.getFechaIngreso(), b.getFechaIngreso()))
                .toList();
    }

}
