package com.proyecto.clases.reparacion;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reparaciones")
@Tag(name = "5. Reparaciones", description = "Flujo central del taller: orden de reparacion, tecnico, estados, diagnostico y repuestos usados")
public class ReparacionController {

    private final ReparacionService service;

    public ReparacionController(ReparacionService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar reparaciones", description = "Filtros opcionales: ?estado=EN_REPARACION&tecnicoId=1&clienteId=2 (tecnicoId es el id de la tabla tecnico)")
    public List<ReparacionResponse> getAll(@RequestParam(required = false) EstadoReparacion estado,
            @RequestParam(required = false) Long tecnicoId,
            @RequestParam(required = false) Long clienteId) {
        return service.findAll(estado, tecnicoId, clienteId);
    }

    @GetMapping("/{id}")
    public ReparacionResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear orden de reparacion", description = "Nace en estado RECIBIDO. tecnicoId es opcional (se puede asignar despues)")
    public ReparacionResponse create(@Valid @RequestBody ReparacionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de la reparacion", description = "Cambia equipo, falla y observaciones; si viene tecnicoId lo reasigna. No permitido en ENTREGADO/RECHAZADO")
    public ReparacionResponse update(@PathVariable Long id, @Valid @RequestBody ReparacionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar reparacion", description = "Elimina tambien su diagnostico y cotizacion, y devuelve al inventario los repuestos usados")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PatchMapping("/{id}/tecnico/{tecnicoId}")
    @Operation(summary = "Asignar tecnico", description = "tecnicoId es el id de la tabla tecnico (campo tecnicoId de GET /api/usuarios?rol=TECNICO)")
    public ReparacionResponse asignarTecnico(@PathVariable Long id, @PathVariable Long tecnicoId) {
        return service.asignarTecnico(id, tecnicoId);
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado", description = "Avances manuales: RECIBIDO -> EN_DIAGNOSTICO (requiere tecnico), EN_REPARACION -> FINALIZADA, FINALIZADA -> ENTREGADO. "
            + "COTIZACION_PENDIENTE, ESPERANDO_APROBACION, EN_REPARACION y RECHAZADO se alcanzan registrando el diagnostico y creando/respondiendo la cotizacion")
    public ReparacionResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest request) {
        return service.cambiarEstado(id, request);
    }

    @PutMapping("/{id}/diagnostico")
    @Operation(summary = "Registrar o editar diagnostico", description = "Un diagnostico por reparacion. Si esta EN_DIAGNOSTICO pasa a COTIZACION_PENDIENTE")
    public ReparacionResponse registrarDiagnostico(@PathVariable Long id,
            @Valid @RequestBody DiagnosticoRequest request) {
        return service.registrarDiagnostico(id, request);
    }

    @PostMapping("/{id}/repuestos")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar repuesto usado", description = "Solo en estado EN_REPARACION. Descuenta la cantidad del stock del repuesto")
    public ReparacionResponse agregarRepuestoUsado(@PathVariable Long id,
            @Valid @RequestBody RepuestoUsadoRequest request) {
        return service.agregarRepuestoUsado(id, request);
    }

    @DeleteMapping("/{id}/repuestos/{repuestoUsadoId}")
    @Operation(summary = "Quitar repuesto usado", description = "Solo en estado EN_REPARACION. Devuelve la cantidad al stock. repuestoUsadoId es el id de la linea (campo id de repuestosUsados)")
    public ReparacionResponse quitarRepuestoUsado(@PathVariable Long id, @PathVariable Long repuestoUsadoId) {
        return service.quitarRepuestoUsado(id, repuestoUsadoId);
    }

}
