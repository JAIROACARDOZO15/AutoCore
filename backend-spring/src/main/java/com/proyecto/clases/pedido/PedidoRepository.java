package com.proyecto.clases.pedido;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends MongoRepository<Pedido, Long> {

    default Optional<Pedido> findByCotizacionId(Long cotizacionId) {
        return findAll().stream().filter(p -> p.getCotizacion() != null
                && cotizacionId.equals(p.getCotizacion().getId())).findFirst();
    }
    default Optional<Pedido> findByCotizacion_Reparacion_Id(Long reparacionId) {
        return findAll().stream().filter(p -> p.getCotizacion() != null
                && p.getCotizacion().getReparacion() != null
                && reparacionId.equals(p.getCotizacion().getReparacion().getId())).findFirst();
    }
}
