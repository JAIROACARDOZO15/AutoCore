package com.proyecto.clases.equipo;

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
@RequestMapping("/api/equipos")
@Tag(name = "3. Equipos", description = "CRUD de equipos (PC, celular, tablet) que traen los clientes al taller")
public class EquipoController {

    private final EquipoService service;

    public EquipoController(EquipoService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar equipos", description = "Filtro opcional por cliente (ej. ?clienteId=1)")
    public List<EquipoResponse> getAll(@RequestParam(required = false) Long clienteId) {
        return service.findAll(clienteId);
    }

    @GetMapping("/{id}")
    public EquipoResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquipoResponse create(@Valid @RequestBody EquipoRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public EquipoResponse update(@PathVariable Long id, @Valid @RequestBody EquipoRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar equipo", description = "Elimina tambien sus reparaciones (ON DELETE CASCADE)")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

}
