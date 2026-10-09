
package com.proyecto.clases.pedido;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    // Obtener todos los pedidos
    @GetMapping
    public ResponseEntity<List<Pedido>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Obtener un pedido por ID
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
            service.findById(id)
        );
    }

    // Obtener pedido por cotización
    @GetMapping("/cotizacion/{cotizacionId}")
    public ResponseEntity<Pedido> findByCotizacion(
            @PathVariable Long cotizacionId) {

        return ResponseEntity.ok(
            service.findByCotizacionId(cotizacionId)
        );
    }

    // Crear pedido
    @PostMapping
    public ResponseEntity<Pedido> create(
            @Valid @RequestBody Pedido pedido) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(service.create(pedido));
    }

    // Actualizar pedido
    @PutMapping("/{id}")
    public ResponseEntity<Pedido> update(
            @PathVariable Long id,
            @Valid @RequestBody Pedido pedido) {

        return ResponseEntity.ok(
            service.update(id, pedido)
        );
    }

    // Eliminar pedido
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }

    // Obtener detalles de un pedido
    @GetMapping("/{pedidoId}/detalles")
    public ResponseEntity<List<DetallePedido>> findDetalles(
            @PathVariable Long pedidoId) {

        return ResponseEntity.ok(
            service.findDetalles(pedidoId)
        );
    }

    // Agregar detalle a un pedido
    @PostMapping("/{pedidoId}/detalles")
    public ResponseEntity<DetallePedido> addDetalle(
            @PathVariable Long pedidoId,
            @Valid @RequestBody DetallePedido detalle) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(service.addDetalle(pedidoId, detalle));
    }

    // Eliminar detalle de un pedido
    @DeleteMapping("/detalles/{detalleId}")
    public ResponseEntity<Void> deleteDetalle(
            @PathVariable Long detalleId) {

        service.deleteDetalle(detalleId);

        return ResponseEntity.noContent().build();
    }
}
