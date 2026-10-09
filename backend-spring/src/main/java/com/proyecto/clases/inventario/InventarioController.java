package com.proyecto.clases.inventario;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
@RequestMapping("/api/inventarios")
@Tag(
    name = "6. Inventarios",
    description = "Gestión del inventario de repuestos"
)
public class InventarioController {

    private final InventarioService service;

    public InventarioController(InventarioService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar inventarios")
    public List<Inventario> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar inventario por ID")
    public Inventario getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/repuesto/{repuestoId}")
    @Operation(summary = "Buscar inventario por repuesto")
    public Inventario getByRepuesto(
            @PathVariable Long repuestoId) {

        return service.findByRepuestoId(repuestoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear inventario para un repuesto")
    public Inventario create(
            @Valid @RequestBody Inventario inventario) {

        return service.create(inventario);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar inventario")
    public Inventario update(
            @PathVariable Long id,
            @Valid @RequestBody Inventario inventario) {

        return service.update(id, inventario);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar inventario")
    public void delete(@PathVariable Long id) {

        service.delete(id);
    }
}