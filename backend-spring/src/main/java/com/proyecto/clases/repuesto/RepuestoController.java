package com.proyecto.clases.repuesto;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
@RequestMapping("/api/repuestos")
@Tag(name = "4. Repuestos", description = "Inventario del taller: agregar repuestos, actualizar stock y precios, desactivar los que ya no se usan")
public class RepuestoController {

    private final RepuestoService service;

    public RepuestoController(RepuestoService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar repuestos", description = "Con ?soloActivos=true omite los desactivados")
    public List<Repuesto> getAll(@RequestParam(defaultValue = "false") boolean soloActivos) {
        return service.findAll(soloActivos);
    }

    @GetMapping("/{id}")
    public Repuesto getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Repuesto create(@Valid @RequestBody Repuesto repuesto) {
        return service.create(repuesto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar repuesto", description = "Sirve para cambiar stock, precio o reactivarlo (activo=true)")
    public Repuesto update(@PathVariable Long id, @Valid @RequestBody Repuesto repuesto) {
        return service.update(id, repuesto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar repuesto", description = "No lo borra de la base de datos: lo marca activo=false para conservar el historial de cotizaciones y reparaciones")
    public Repuesto desactivar(@PathVariable Long id) {
        return service.desactivar(id);
    }

}
