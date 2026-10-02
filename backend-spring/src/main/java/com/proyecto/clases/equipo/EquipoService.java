package com.proyecto.clases.equipo;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.clases.cliente.Cliente;
import com.proyecto.clases.cliente.ClienteRepository;
import com.proyecto.clases.exception.BadRequestException;
import com.proyecto.clases.exception.ResourceNotFoundException;

@Service
@Transactional
public class EquipoService {

    private final EquipoRepository repository;
    private final ClienteRepository clienteRepository;

    public EquipoService(EquipoRepository repository, ClienteRepository clienteRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<EquipoResponse> findAll(Long clienteId) {
        List<Equipo> equipos = clienteId == null ? repository.findAll() : repository.findByClienteId(clienteId);
        return equipos.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EquipoResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public EquipoResponse create(EquipoRequest request) {
        String serial = normalizar(request.serial());
        if (serial != null && repository.existsBySerial(serial)) {
            throw new BadRequestException("Ya existe un equipo con el serial " + serial);
        }
        Equipo equipo = new Equipo();
        aplicar(equipo, request, serial);
        return toResponse(repository.save(equipo));
    }

    public EquipoResponse update(Long id, EquipoRequest request) {
        Equipo equipo = getOrThrow(id);
        String serial = normalizar(request.serial());
        if (serial != null && repository.existsBySerialAndIdNot(serial, id)) {
            throw new BadRequestException("Ya existe un equipo con el serial " + serial);
        }
        aplicar(equipo, request, serial);
        return toResponse(equipo);
    }

    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Equipo getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id " + id));
    }

    private void aplicar(Equipo equipo, EquipoRequest request, String serial) {
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cliente no encontrado con id " + request.clienteId()));
        equipo.setCliente(cliente);
        equipo.setTipo(request.tipo());
        equipo.setMarca(request.marca());
        equipo.setModelo(request.modelo());
        equipo.setSerial(serial);
        equipo.setDescripcion(request.descripcion());
    }

    // El serial es UNIQUE: un texto vacio se guarda como NULL para no chocar con otros equipos sin serial
    private String normalizar(String serial) {
        return serial == null || serial.isBlank() ? null : serial.trim();
    }

    private EquipoResponse toResponse(Equipo e) {
        Cliente c = e.getCliente();
        return new EquipoResponse(e.getId(), c.getId(), c.getUsuario().getNombre(), e.getTipo(), e.getMarca(),
                e.getModelo(), e.getSerial(), e.getDescripcion(), e.getFechaRegistro());
    }

}
