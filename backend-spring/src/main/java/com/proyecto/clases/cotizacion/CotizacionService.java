package com.proyecto.clases.cotizacion;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.clases.exception.BadRequestException;
import com.proyecto.clases.exception.ResourceNotFoundException;
import com.proyecto.clases.pedido.PedidoRepository;
import com.proyecto.clases.reparacion.EstadoReparacion;
import com.proyecto.clases.reparacion.Reparacion;
import com.proyecto.clases.reparacion.ReparacionRepository;
import com.proyecto.clases.repuesto.Repuesto;
import com.proyecto.clases.repuesto.RepuestoRepository;

@Service
@Transactional
public class CotizacionService {

    private final CotizacionRepository repository;
    private final ReparacionRepository reparacionRepository;
    private final RepuestoRepository repuestoRepository;
    private final PedidoRepository pedidoRepository;

    public CotizacionService(
            CotizacionRepository repository,
            ReparacionRepository reparacionRepository,
            RepuestoRepository repuestoRepository,
            PedidoRepository pedidoRepository) {
        this.repository = repository;
        this.reparacionRepository = reparacionRepository;
        this.repuestoRepository = repuestoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional(readOnly = true)
    public List<CotizacionResponse> findAll(Long reparacionId, Long clienteId) {
        return repository.buscar(reparacionId, clienteId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CotizacionResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public CotizacionResponse create(CotizacionRequest request) {
        Reparacion reparacion = reparacionRepository.findById(request.reparacionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reparacion no encontrada con id " + request.reparacionId()));
        if (repository.existsByReparacionId(reparacion.getId())) {
            throw new BadRequestException("La reparacion ya tiene una cotizacion");
        }
        if (reparacion.getEstado() != EstadoReparacion.COTIZACION_PENDIENTE) {
            throw new BadRequestException(
                    "La cotizacion se crea cuando la reparacion esta en COTIZACION_PENDIENTE (registre antes el diagnostico). Estado actual: "
                            + reparacion.getEstado());
        }
        Cotizacion cotizacion = new Cotizacion();
        cotizacion.setReparacion(reparacion);
        aplicar(cotizacion, request);
        reparacion.setEstado(EstadoReparacion.ESPERANDO_APROBACION);
        return toResponse(repository.saveAndFlush(cotizacion));
    }

    public CotizacionResponse update(Long id, CotizacionRequest request) {
        Cotizacion cotizacion = getOrThrow(id);

        // Nunca cambiar importes de una cotización que ya originó un pedido:
        // el pedido y su factura deben conservar el importe aprobado.
        if (pedidoRepository.findByCotizacionId(id).isPresent()) {
            throw new BadRequestException(
                    "No se puede editar la cotización porque ya tiene un pedido asociado. "
                    + "El pedido y su factura deben gestionarse por separado.");
        }

        if (!cotizacion.getReparacion().getId().equals(request.reparacionId())) {
            throw new BadRequestException("No se puede cambiar la reparacion de una cotizacion");
        }

        // Si la cotización estaba aprobada o rechazada, al modificarla vuelve
        // a quedar pendiente para que se tome una nueva decisión.
        boolean debeVolverARevision = cotizacion.getAprobada() != null;

        aplicar(cotizacion, request);

        if (debeVolverARevision) {
            cotizacion.setAprobada(null);
            cotizacion.setFechaRespuesta(null);
            cotizacion.getReparacion().setEstado(EstadoReparacion.ESPERANDO_APROBACION);
        }

        repository.flush();
        return toResponse(cotizacion);
    }

    public CotizacionResponse aprobar(Long id) {
        return responder(id, true);
    }

    public CotizacionResponse rechazar(Long id) {
        return responder(id, false);
    }

    public void delete(Long id) {
        Cotizacion cotizacion = getOrThrow(id);
        verificarPendiente(cotizacion, "eliminar");
        cotizacion.getReparacion().setEstado(EstadoReparacion.COTIZACION_PENDIENTE);
        repository.delete(cotizacion);
    }

    private CotizacionResponse responder(Long id, boolean aprobada) {
        Cotizacion cotizacion = getOrThrow(id);
        verificarPendiente(cotizacion, "responder");
        cotizacion.setAprobada(aprobada);
        cotizacion.setFechaRespuesta(LocalDateTime.now());
        cotizacion.getReparacion()
                .setEstado(aprobada ? EstadoReparacion.EN_REPARACION : EstadoReparacion.RECHAZADO);
        return toResponse(cotizacion);
    }

    private void verificarPendiente(Cotizacion cotizacion, String accion) {
        if (cotizacion.getAprobada() != null) {
            throw new BadRequestException("No se puede " + accion + " una cotizacion ya "
                    + (cotizacion.getAprobada() ? "aprobada" : "rechazada"));
        }
    }

    // Reemplaza los detalles y recalcula subtotales y total con los precios actuales de los repuestos
    private void aplicar(Cotizacion cotizacion, CotizacionRequest request) {
        cotizacion.getDetalles().clear();
        BigDecimal subtotal = request.manoObra().setScale(2, RoundingMode.HALF_UP);
        BigDecimal porcentajeIva = request.ivaPorcentaje() != null
                ? request.ivaPorcentaje()
                : (cotizacion.getIvaPorcentaje() != null ? cotizacion.getIvaPorcentaje() : BigDecimal.ZERO);
        if (porcentajeIva.compareTo(BigDecimal.ZERO) < 0 || porcentajeIva.compareTo(new BigDecimal("100")) > 0) {
            throw new BadRequestException("El IVA debe estar entre 0 y 100 por ciento");
        }
        if (request.detalles() != null) {
            for (DetalleCotizacionRequest item : request.detalles()) {
                Repuesto repuesto = repuestoRepository.findById(item.repuestoId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Repuesto no encontrado con id " + item.repuestoId()));
                if (!Boolean.TRUE.equals(repuesto.getActivo())) {
                    throw new BadRequestException("El repuesto " + repuesto.getNombre() + " esta desactivado");
                }
                DetalleCotizacion detalle = new DetalleCotizacion();
                detalle.setCotizacion(cotizacion);
                detalle.setRepuesto(repuesto);
                detalle.setCantidad(item.cantidad());
                detalle.setPrecioUnitario(repuesto.getPrecio());
                detalle.setSubtotal(repuesto.getPrecio().multiply(BigDecimal.valueOf(item.cantidad()))
                        .setScale(2, RoundingMode.HALF_UP));
                cotizacion.getDetalles().add(detalle);
                subtotal = subtotal.add(detalle.getSubtotal());
            }
        }
        BigDecimal valorIva = subtotal.multiply(porcentajeIva)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(valorIva).setScale(2, RoundingMode.HALF_UP);

        cotizacion.setManoObra(request.manoObra().setScale(2, RoundingMode.HALF_UP));
        cotizacion.setIvaPorcentaje(porcentajeIva.setScale(2, RoundingMode.HALF_UP));
        cotizacion.setValorIva(valorIva);
        cotizacion.setTotal(total);
    }

    private Cotizacion getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cotizacion no encontrada con id " + id));
    }

    private CotizacionResponse toResponse(Cotizacion c) {
        BigDecimal valorIva = c.getValorIva() != null ? c.getValorIva() : BigDecimal.ZERO;
        BigDecimal subtotal = c.getTotal().subtract(valorIva);
        BigDecimal porcentajeIva = c.getIvaPorcentaje() != null ? c.getIvaPorcentaje() : BigDecimal.ZERO;
        return new CotizacionResponse(c.getId(), c.getReparacion().getId(), c.getManoObra(), subtotal,
                porcentajeIva, valorIva, c.getTotal(), c.getAprobada(), c.getFechaCotizacion(), c.getFechaRespuesta(),
                c.getDetalles().stream()
                        .map(d -> new DetalleCotizacionResponse(d.getId(), d.getRepuesto().getId(),
                                d.getRepuesto().getNombre(), d.getCantidad(), d.getPrecioUnitario(),
                                d.getSubtotal()))
                        .toList());
    }

}
