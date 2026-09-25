package com.proyecto.clases.cotizacion;

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
@RequestMapping("/api/cotizaciones")
@Tag(name = "6. Cotizaciones", description = "Presupuesto de una reparacion (repuestos + mano de obra) que el cliente aprueba o rechaza")
public class CotizacionController {

    private final CotizacionService service;

    public CotizacionController(CotizacionService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar cotizaciones", description = "Filtros opcionales: ?reparacionId=1&clienteId=2")
    public List<CotizacionResponse> getAll(@RequestParam(required = false) Long reparacionId,
            @RequestParam(required = false) Long clienteId) {
        return service.findAll(reparacionId, clienteId);
    }

    @GetMapping("/{id}")
    public CotizacionResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear cotizacion", description = "La reparacion debe estar en COTIZACION_PENDIENTE (tras registrar el diagnostico); pasa a ESPERANDO_APROBACION. "
            + "El servidor calcula precios, subtotales y total a partir de los repuestos y la mano de obra")
    public CotizacionResponse create(@Valid @RequestBody CotizacionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar cotizacion", description = "Reemplaza mano de obra y detalles mientras el cliente no haya respondido")
    public CotizacionResponse update(@PathVariable Long id, @Valid @RequestBody CotizacionRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/aprobar")
    @Operation(summary = "Aprobar cotizacion", description = "La reparacion pasa a EN_REPARACION")
    public CotizacionResponse aprobar(@PathVariable Long id) {
        return service.aprobar(id);
    }

    @PatchMapping("/{id}/rechazar")
    @Operation(summary = "Rechazar cotizacion", description = "La reparacion pasa a RECHAZADO")
    public CotizacionResponse rechazar(@PathVariable Long id) {
        return service.rechazar(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar cotizacion", description = "Solo si aun no fue respondida; la reparacion vuelve a COTIZACION_PENDIENTE")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

}
