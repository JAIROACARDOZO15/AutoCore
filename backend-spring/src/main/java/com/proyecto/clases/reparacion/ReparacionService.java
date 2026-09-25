package com.proyecto.clases.reparacion;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.clases.cliente.Cliente;
import com.proyecto.clases.equipo.Equipo;
import com.proyecto.clases.equipo.EquipoRepository;
import com.proyecto.clases.exception.BadRequestException;
import com.proyecto.clases.exception.ResourceNotFoundException;
import com.proyecto.clases.repuesto.Repuesto;
import com.proyecto.clases.repuesto.RepuestoRepository;
import com.proyecto.clases.usuario.Tecnico;
import com.proyecto.clases.usuario.TecnicoRepository;

@Service
@Transactional
public class ReparacionService {

    // Cambios de estado que se hacen a mano. Los demas ocurren solos: el diagnostico lleva a
    // COTIZACION_PENDIENTE, crear la cotizacion a ESPERANDO_APROBACION y aprobarla/rechazarla a
    // EN_REPARACION o RECHAZADO.
    private static final Map<EstadoReparacion, EstadoReparacion> AVANCE_MANUAL = Map.of(
            EstadoReparacion.RECIBIDO, EstadoReparacion.EN_DIAGNOSTICO,
            EstadoReparacion.EN_REPARACION, EstadoReparacion.FINALIZADA,
            EstadoReparacion.FINALIZADA, EstadoReparacion.ENTREGADO);

    private final ReparacionRepository repository;
    private final EquipoRepository equipoRepository;
    private final TecnicoRepository tecnicoRepository;
    private final RepuestoRepository repuestoRepository;

    public ReparacionService(ReparacionRepository repository, EquipoRepository equipoRepository,
            TecnicoRepository tecnicoRepository, RepuestoRepository repuestoRepository) {
        this.repository = repository;
        this.equipoRepository = equipoRepository;
        this.tecnicoRepository = tecnicoRepository;
        this.repuestoRepository = repuestoRepository;
    }

    @Transactional(readOnly = true)
    public List<ReparacionResponse> findAll(EstadoReparacion estado, Long tecnicoId, Long clienteId) {
        return repository.buscar(estado, tecnicoId, clienteId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ReparacionResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public ReparacionResponse create(ReparacionRequest request) {
        Reparacion reparacion = new Reparacion();
        reparacion.setEquipo(buscarEquipo(request.equipoId()));
        reparacion.setTecnico(buscarTecnico(request.tecnicoId()));
        reparacion.setFallaReportada(request.fallaReportada());
        reparacion.setObservaciones(request.observaciones());
        reparacion.setEstado(EstadoReparacion.RECIBIDO);
        return toResponse(repository.save(reparacion));
    }

    public ReparacionResponse update(Long id, ReparacionRequest request) {
        Reparacion reparacion = getOrThrow(id);
        verificarEditable(reparacion);
        reparacion.setEquipo(buscarEquipo(request.equipoId()));
        if (request.tecnicoId() != null) {
            reparacion.setTecnico(buscarTecnico(request.tecnicoId()));
        }
        reparacion.setFallaReportada(request.fallaReportada());
        reparacion.setObservaciones(request.observaciones());
        return toResponse(reparacion);
    }

    public ReparacionResponse asignarTecnico(Long id, Long tecnicoId) {
        Reparacion reparacion = getOrThrow(id);
        verificarEditable(reparacion);
        reparacion.setTecnico(buscarTecnico(tecnicoId));
        return toResponse(reparacion);
    }

    public ReparacionResponse cambiarEstado(Long id, CambiarEstadoRequest request) {
        Reparacion reparacion = getOrThrow(id);
        EstadoReparacion actual = reparacion.getEstado();
        EstadoReparacion nuevo = request.estado();

        if (AVANCE_MANUAL.get(actual) != nuevo) {
            throw new BadRequestException(
                    "Transicion no permitida: " + actual + " -> " + nuevo + ". " + ayuda(actual));
        }
        if (nuevo == EstadoReparacion.EN_DIAGNOSTICO && reparacion.getTecnico() == null) {
            throw new BadRequestException("Asigne un tecnico antes de iniciar el diagnostico");
        }
        if (nuevo == EstadoReparacion.ENTREGADO) {
            reparacion.setFechaEntrega(LocalDateTime.now());
        }
        reparacion.setEstado(nuevo);
        return toResponse(reparacion);
    }

    public ReparacionResponse registrarDiagnostico(Long id, DiagnosticoRequest request) {
        Reparacion reparacion = getOrThrow(id);
        EstadoReparacion estado = reparacion.getEstado();
        if (estado != EstadoReparacion.EN_DIAGNOSTICO && estado != EstadoReparacion.COTIZACION_PENDIENTE) {
            throw new BadRequestException(
                    "El diagnostico solo se registra o edita en estado EN_DIAGNOSTICO o COTIZACION_PENDIENTE (estado actual: "
                            + estado + ")");
        }
        Diagnostico diagnostico = reparacion.getDiagnostico();
        if (diagnostico == null) {
            diagnostico = new Diagnostico();
            diagnostico.setReparacion(reparacion);
            reparacion.setDiagnostico(diagnostico);
        }
        diagnostico.setHallazgos(request.hallazgos());
        diagnostico.setSolucionPropuesta(request.solucionPropuesta());
        if (estado == EstadoReparacion.EN_DIAGNOSTICO) {
            reparacion.setEstado(EstadoReparacion.COTIZACION_PENDIENTE);
        }
        repository.flush();
        return toResponse(reparacion);
    }

    public ReparacionResponse agregarRepuestoUsado(Long id, RepuestoUsadoRequest request) {
        Reparacion reparacion = getOrThrow(id);
        verificarEnReparacion(reparacion);
        Repuesto repuesto = repuestoRepository.findById(request.repuestoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Repuesto no encontrado con id " + request.repuestoId()));
        if (!Boolean.TRUE.equals(repuesto.getActivo())) {
            throw new BadRequestException("El repuesto " + repuesto.getNombre() + " esta desactivado");
        }
        if (repuesto.getStock() < request.cantidadUsada()) {
            throw new BadRequestException("Stock insuficiente de " + repuesto.getNombre() + ": disponible "
                    + repuesto.getStock() + ", solicitado " + request.cantidadUsada());
        }
        repuesto.setStock(repuesto.getStock() - request.cantidadUsada());

        RepuestoReparacion linea = new RepuestoReparacion();
        linea.setReparacion(reparacion);
        linea.setRepuesto(repuesto);
        linea.setCantidadUsada(request.cantidadUsada());
        reparacion.getRepuestosUsados().add(linea);
        repository.flush();
        return toResponse(reparacion);
    }

    public ReparacionResponse quitarRepuestoUsado(Long id, Long repuestoUsadoId) {
        Reparacion reparacion = getOrThrow(id);
        verificarEnReparacion(reparacion);
        RepuestoReparacion linea = reparacion.getRepuestosUsados().stream()
                .filter(l -> l.getId().equals(repuestoUsadoId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Repuesto usado no encontrado con id " + repuestoUsadoId + " en la reparacion " + id));
        Repuesto repuesto = linea.getRepuesto();
        repuesto.setStock(repuesto.getStock() + linea.getCantidadUsada());
        reparacion.getRepuestosUsados().remove(linea);
        return toResponse(reparacion);
    }

    public void delete(Long id) {
        Reparacion reparacion = getOrThrow(id);
        for (RepuestoReparacion linea : reparacion.getRepuestosUsados()) {
            Repuesto repuesto = linea.getRepuesto();
            repuesto.setStock(repuesto.getStock() + linea.getCantidadUsada());
        }
        repository.delete(reparacion);
    }

    private Reparacion getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reparacion no encontrada con id " + id));
    }

    private Equipo buscarEquipo(Long equipoId) {
        return equipoRepository.findById(equipoId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id " + equipoId));
    }

    private Tecnico buscarTecnico(Long tecnicoId) {
        if (tecnicoId == null) {
            return null;
        }
        return tecnicoRepository.findById(tecnicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Tecnico no encontrado con id " + tecnicoId));
    }

    private void verificarEditable(Reparacion reparacion) {
        EstadoReparacion estado = reparacion.getEstado();
        if (estado == EstadoReparacion.ENTREGADO || estado == EstadoReparacion.RECHAZADO) {
            throw new BadRequestException("No se puede modificar una reparacion en estado " + estado);
        }
    }

    private void verificarEnReparacion(Reparacion reparacion) {
        if (reparacion.getEstado() != EstadoReparacion.EN_REPARACION) {
            throw new BadRequestException(
                    "Los repuestos usados solo se gestionan en estado EN_REPARACION (estado actual: "
                            + reparacion.getEstado() + ")");
        }
    }

    private String ayuda(EstadoReparacion actual) {
        return switch (actual) {
            case RECIBIDO, EN_REPARACION, FINALIZADA ->
                "Desde " + actual + " solo se puede pasar a " + AVANCE_MANUAL.get(actual);
            case EN_DIAGNOSTICO -> "Para avanzar registre el diagnostico (PUT /api/reparaciones/{id}/diagnostico)";
            case COTIZACION_PENDIENTE -> "Para avanzar cree la cotizacion (POST /api/cotizaciones)";
            case ESPERANDO_APROBACION ->
                "Para avanzar apruebe o rechace la cotizacion (PATCH /api/cotizaciones/{id}/aprobar o /rechazar)";
            case ENTREGADO, RECHAZADO -> actual + " es un estado final";
        };
    }

    private ReparacionResponse toResponse(Reparacion r) {
        Equipo equipo = r.getEquipo();
        Cliente cliente = equipo.getCliente();
        Tecnico tecnico = r.getTecnico();
        Diagnostico d = r.getDiagnostico();
        return new ReparacionResponse(
                r.getId(),
                equipo.getId(), equipo.getTipo(), equipo.getMarca(), equipo.getModelo(),
                cliente.getId(), cliente.getUsuario().getNombre(),
                tecnico == null ? null : tecnico.getId(),
                tecnico == null ? null : tecnico.getUsuario().getNombre(),
                r.getFallaReportada(), r.getEstado(), r.getFechaIngreso(), r.getFechaEntrega(),
                r.getObservaciones(),
                d == null ? null
                        : new DiagnosticoResponse(d.getId(), d.getHallazgos(), d.getSolucionPropuesta(),
                                d.getFechaDiagnostico()),
                r.getRepuestosUsados().stream()
                        .map(l -> new RepuestoUsadoResponse(l.getId(), l.getRepuesto().getId(),
                                l.getRepuesto().getNombre(), l.getCantidadUsada()))
                        .toList());
    }

}
