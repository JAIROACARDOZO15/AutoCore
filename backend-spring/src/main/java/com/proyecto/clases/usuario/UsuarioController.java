package com.proyecto.clases.usuario;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/usuarios")
@Tag(name = "1. Usuarios", description = "CRUD de usuarios (ADMIN, TECNICO, CLIENTE) y login de acceso")
public class UsuarioController {

    private final IUsuarioService service;

    public UsuarioController(IUsuarioService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Filtro opcional por rol (ej. ?rol=TECNICO)")
    public List<UsuarioResponse> getAll(@RequestParam(required = false) Rol rol) {
        return service.findAll(rol);
    }

    @GetMapping("/{id}")
    public UsuarioResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear usuario", description = "Si rol = TECNICO tambien se crea su registro en la tabla tecnico (especialidad, telefono)")
    public UsuarioResponse create(@Valid @RequestBody UsuarioRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario", description = "Si password viene vacia se conserva la actual")
    public UsuarioResponse update(@PathVariable Long id, @Valid @RequestBody UsuarioRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar usuario", description = "Elimina tambien su tecnico/cliente asociado (ON DELETE CASCADE). Para solo inhabilitarlo use PUT con activo=false")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/loginclient")
    @Operation(summary = "Login (conteo)", description = "Devuelve 1 si email y password coinciden con un usuario activo, 0 si no")
    public int loginClient(@RequestBody LoginDto loginDto) {
        return service.login(loginDto);
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "200 con el usuario (incluye rol) si las credenciales son correctas, 404 si no")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        return service.ingresar(loginDto);
    }

}
