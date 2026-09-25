package com.proyecto.clases.cliente;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clientes")
@Tag(name = "2. Clientes", description = "CRUD de clientes (telefono, direccion, documento), vinculados a un usuario con rol CLIENTE")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @GetMapping
    public List<ClienteResponse> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ClienteResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Buscar cliente por usuario", description = "Sirve para obtener el clienteId de un usuario con rol CLIENTE que inicio sesion")
    public ClienteResponse getByUsuario(@PathVariable Long usuarioId) {
        return service.findByUsuarioId(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar cliente", description = "usuarioId debe ser un usuario existente con rol CLIENTE que aun no tenga cliente")
    public ClienteResponse create(@Valid @RequestBody ClienteRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar cliente", description = "Actualiza telefono, direccion y documento (usuarioId no se puede cambiar)")
    public ClienteResponse update(@PathVariable Long id, @Valid @RequestBody ClienteRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar cliente", description = "Elimina tambien sus equipos y reparaciones (ON DELETE CASCADE); el usuario se conserva")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

}
