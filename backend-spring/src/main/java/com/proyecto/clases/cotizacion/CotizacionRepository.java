package com.proyecto.clases.cotizacion;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
public interface CotizacionRepository extends MongoRepository<Cotizacion, Long> {

    default boolean existsByReparacionId(Long reparacionId) {
        return findAll().stream().anyMatch(c -> c.getReparacion() != null
                && reparacionId.equals(c.getReparacion().getId()));
    }

    default List<Cotizacion> buscar(Long reparacionId, Long clienteId) {
        return findAll().stream()
                .filter(c -> reparacionId == null || (c.getReparacion() != null
                        && reparacionId.equals(c.getReparacion().getId())))
                .filter(c -> clienteId == null || (c.getReparacion() != null
                        && c.getReparacion().getEquipo() != null
                        && c.getReparacion().getEquipo().getCliente() != null
                        && clienteId.equals(c.getReparacion().getEquipo().getCliente().getId())))
                .sorted((a, b) -> java.util.Comparator.nullsLast(java.util.Comparator
                        .<java.time.LocalDateTime>naturalOrder()).reversed()
                        .compare(a.getFechaCotizacion(), b.getFechaCotizacion()))
                .toList();
    }

}
