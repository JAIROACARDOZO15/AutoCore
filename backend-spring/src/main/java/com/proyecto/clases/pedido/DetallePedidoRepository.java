package com.proyecto.clases.pedido;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetallePedidoRepository extends MongoRepository<DetallePedido, Long> {

    default List<DetallePedido> findByPedidoId(Long pedidoId) {
        return findAll().stream().filter(d -> d.getPedido() != null
                && pedidoId.equals(d.getPedido().getId())).toList();
    }
}
