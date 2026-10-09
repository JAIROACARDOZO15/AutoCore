package com.proyecto.clases.pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.clases.exception.BadRequestException;
import com.proyecto.clases.exception.ResourceNotFoundException;
import com.proyecto.clases.repuesto.Repuesto;
import com.proyecto.clases.repuesto.RepuestoRepository;

@Service
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final RepuestoRepository repuestoRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            DetallePedidoRepository detallePedidoRepository,
            RepuestoRepository repuestoRepository) {

        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.repuestoRepository = repuestoRepository;
    }

    @Transactional(readOnly = true)
    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Pedido findById(Long id) {
        return getOrThrow(id);
    }

    @Transactional(readOnly = true)
    public Pedido findByCotizacionId(Long cotizacionId) {
        return pedidoRepository.findByCotizacionId(cotizacionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No existe un pedido para la cotización con id " + cotizacionId));
    }

    public Pedido create(Pedido pedido) {

        if (pedido.getCotizacion() == null ||
                pedido.getCotizacion().getId() == null) {

            throw new BadRequestException(
                    "Debe indicar la cotización asociada al pedido");
        }

        if (pedido.getCliente() == null ||
                pedido.getCliente().getId() == null) {

            throw new BadRequestException(
                    "Debe indicar el cliente asociado al pedido");
        }

        if (pedidoRepository.findByCotizacionId(
                pedido.getCotizacion().getId()).isPresent()) {

            throw new BadRequestException(
                    "La cotización ya tiene un pedido asociado");
        }

        pedido.setId(null);

        if (pedido.getEstado() == null) {
            pedido.setEstado(Pedido.EstadoPedido.PENDIENTE);
        }

        if (pedido.getTotal() == null) {
            pedido.setTotal(BigDecimal.ZERO);
        }

        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setFechaActualizacion(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    public Pedido update(Long id, Pedido datos) {

        Pedido pedido = getOrThrow(id);

        if (datos.getCliente() != null) {
            pedido.setCliente(datos.getCliente());
        }

        if (datos.getCotizacion() != null) {
            pedido.setCotizacion(datos.getCotizacion());
        }

        if (datos.getEstado() != null) {
            pedido.setEstado(datos.getEstado());
        }

        if (datos.getTotal() != null) {
            pedido.setTotal(datos.getTotal());
        }

        if (datos.getObservaciones() != null) {
            pedido.setObservaciones(datos.getObservaciones());
        }

        pedido.setFechaActualizacion(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    public void delete(Long id) {

        Pedido pedido = getOrThrow(id);

        pedidoRepository.delete(pedido);
    }

    public List<DetallePedido> findDetalles(Long pedidoId) {

        getOrThrow(pedidoId);

        return detallePedidoRepository.findByPedidoId(pedidoId);
    }

    public DetallePedido addDetalle(
            Long pedidoId,
            DetallePedido detalle) {

        Pedido pedido = getOrThrow(pedidoId);

        if (detalle.getRepuesto() == null ||
                detalle.getRepuesto().getId() == null) {

            throw new BadRequestException(
                    "Debe indicar el repuesto");
        }

        Repuesto repuesto = repuestoRepository
                .findById(detalle.getRepuesto().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Repuesto no encontrado con id "
                                        + detalle.getRepuesto().getId()));

        if (detalle.getCantidad() == null ||
                detalle.getCantidad() <= 0) {

            throw new BadRequestException(
                    "La cantidad debe ser mayor que cero");
        }

        detalle.setId(null);
        detalle.setPedido(pedido);
        detalle.setRepuesto(repuesto);

        detalle.setPrecioUnitario(repuesto.getPrecio());

        BigDecimal subtotal = repuesto.getPrecio()
                .multiply(BigDecimal.valueOf(detalle.getCantidad()));

        detalle.setSubtotal(subtotal);

        DetallePedido guardado =
                detallePedidoRepository.save(detalle);

        actualizarTotalPedido(pedidoId);

        return guardado;
    }

    public void deleteDetalle(Long detalleId) {

        DetallePedido detalle =
                detallePedidoRepository.findById(detalleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Detalle de pedido no encontrado con id "
                                                + detalleId));

        Long pedidoId = detalle.getPedido().getId();

        detallePedidoRepository.delete(detalle);

        actualizarTotalPedido(pedidoId);
    }

    private void actualizarTotalPedido(Long pedidoId) {

        List<DetallePedido> detalles =
                detallePedidoRepository.findByPedidoId(pedidoId);

        BigDecimal total = detalles.stream()
                .map(DetallePedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Pedido pedido = getOrThrow(pedidoId);

        pedido.setTotal(total);
        pedido.setFechaActualizacion(LocalDateTime.now());

        pedidoRepository.save(pedido);
    }

    private Pedido getOrThrow(Long id) {

        return pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pedido no encontrado con id " + id));
    }
}