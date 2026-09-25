package com.proyecto.clases.cliente;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.clases.exception.BadRequestException;
import com.proyecto.clases.exception.ResourceNotFoundException;
import com.proyecto.clases.usuario.Rol;
import com.proyecto.clases.usuario.Usuario;
import com.proyecto.clases.usuario.UsuarioRepository;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository repository;
    private final UsuarioRepository usuarioRepository;

    public ClienteService(ClienteRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public ClienteResponse findByUsuarioId(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No hay un cliente asociado al usuario con id " + usuarioId));
    }

    public ClienteResponse create(ClienteRequest request) {
        if (request.usuarioId() == null) {
            throw new BadRequestException("El usuarioId es obligatorio");
        }
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario no encontrado con id " + request.usuarioId()));
        if (usuario.getRol() != Rol.CLIENTE) {
            throw new BadRequestException("El usuario debe tener rol CLIENTE");
        }
        if (repository.existsByUsuarioId(usuario.getId())) {
            throw new BadRequestException("El usuario ya tiene un cliente registrado");
        }
        if (repository.existsByDocumento(request.documento())) {
            throw new BadRequestException("Ya existe un cliente con el documento " + request.documento());
        }
        Cliente cliente = new Cliente();
        cliente.setUsuario(usuario);
        cliente.setTelefono(request.telefono());
        cliente.setDireccion(request.direccion());
        cliente.setDocumento(request.documento());
        return toResponse(repository.save(cliente));
    }

    public ClienteResponse update(Long id, ClienteRequest request) {
        Cliente cliente = getOrThrow(id);
        if (repository.existsByDocumentoAndIdNot(request.documento(), id)) {
            throw new BadRequestException("Ya existe un cliente con el documento " + request.documento());
        }
        cliente.setTelefono(request.telefono());
        cliente.setDireccion(request.direccion());
        cliente.setDocumento(request.documento());
        return toResponse(cliente);
    }

    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Cliente getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id " + id));
    }

    private ClienteResponse toResponse(Cliente c) {
        Usuario u = c.getUsuario();
        return new ClienteResponse(c.getId(), u.getId(), u.getNombre(), u.getEmail(), c.getTelefono(),
                c.getDireccion(), c.getDocumento());
    }

}
