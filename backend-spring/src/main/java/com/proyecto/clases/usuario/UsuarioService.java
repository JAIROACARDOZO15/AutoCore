package com.proyecto.clases.usuario;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.clases.cliente.ClienteRepository;
import com.proyecto.clases.exception.BadRequestException;
import com.proyecto.clases.exception.ResourceNotFoundException;

@Service
@Transactional
public class UsuarioService implements IUsuarioService {

    private final UsuarioRepository repository;
    private final TecnicoRepository tecnicoRepository;
    private final ClienteRepository clienteRepository;

    public UsuarioService(UsuarioRepository repository, TecnicoRepository tecnicoRepository,
            ClienteRepository clienteRepository) {
        this.repository = repository;
        this.tecnicoRepository = tecnicoRepository;
        this.clienteRepository = clienteRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> findAll(Rol rol) {
        List<Usuario> usuarios = rol == null ? repository.findAll() : repository.findByRol(rol);
        return usuarios.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Override
    public UsuarioResponse create(UsuarioRequest request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new BadRequestException("La clave es obligatoria");
        }
        if (repository.existsByEmail(request.email())) {
            throw new BadRequestException("Ya existe un usuario con el email " + request.email());
        }
        Usuario usuario = new Usuario();
        aplicar(usuario, request);
        usuario.setPassword(request.password());
        usuario = repository.save(usuario);
        sincronizarTecnico(usuario, request);
        return toResponse(usuario);
    }

    @Override
    public UsuarioResponse update(Long id, UsuarioRequest request) {
        Usuario usuario = getOrThrow(id);
        if (repository.existsByEmailAndIdNot(request.email(), id)) {
            throw new BadRequestException("Ya existe un usuario con el email " + request.email());
        }
        if (usuario.getRol() == Rol.CLIENTE && request.rol() != Rol.CLIENTE
                && clienteRepository.existsByUsuarioId(id)) {
            throw new BadRequestException("No se puede cambiar el rol: el usuario tiene un cliente asociado");
        }
        aplicar(usuario, request);
        if (request.password() != null && !request.password().isBlank()) {
            usuario.setPassword(request.password());
        }
        sincronizarTecnico(usuario, request);
        return toResponse(usuario);
    }

    @Override
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public int login(LoginDto loginDto) {
        return repository.contarCredenciales(loginDto.email(), loginDto.password());
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<?> ingresar(LoginDto loginDto) {
        Map<String, Object> response = new HashMap<>();
        try {
            Usuario usuario = repository.buscarPorCredenciales(loginDto.email(), loginDto.password());

            if (usuario == null) {
                response.put("Usuario", null);
                response.put("Mensaje", "Alerta: Usuario o Password incorrectos");
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("Usuario", toResponse(usuario));
            response.put("Mensaje", "Datos correctos");
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Usuario", null);
            response.put("Mensaje", "Ha ocurrido un error");
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Usuario getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + id));
    }

    private void aplicar(Usuario usuario, UsuarioRequest request) {
        usuario.setNombre(request.nombre());
        usuario.setEmail(request.email());
        usuario.setRol(request.rol());
        if (request.activo() != null) {
            usuario.setActivo(request.activo());
        }
    }

    private void sincronizarTecnico(Usuario usuario, UsuarioRequest request) {
        Optional<Tecnico> existente = tecnicoRepository.findByUsuarioId(usuario.getId());
        if (usuario.getRol() != Rol.TECNICO) {
            existente.ifPresent(tecnicoRepository::delete);
            return;
        }
        Tecnico tecnico = existente.orElseGet(() -> {
            Tecnico nuevo = new Tecnico();
            nuevo.setUsuario(usuario);
            return nuevo;
        });
        tecnico.setEspecialidad(request.especialidad());
        tecnico.setTelefono(request.telefono());
        tecnicoRepository.save(tecnico);
    }

    private UsuarioResponse toResponse(Usuario u) {
        Tecnico t = u.getRol() == Rol.TECNICO ? tecnicoRepository.findByUsuarioId(u.getId()).orElse(null) : null;
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getRol(), u.getActivo(),
                u.getCreatedAt(),
                t == null ? null : t.getId(),
                t == null ? null : t.getEspecialidad(),
                t == null ? null : t.getTelefono());
    }

}
