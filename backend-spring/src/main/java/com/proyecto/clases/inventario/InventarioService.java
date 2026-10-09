package com.proyecto.clases.inventario;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.clases.exception.BadRequestException;
import com.proyecto.clases.exception.ResourceNotFoundException;
import com.proyecto.clases.repuesto.Repuesto;
import com.proyecto.clases.repuesto.RepuestoRepository;

@Service
@Transactional
public class InventarioService {

    private final InventarioRepository repository;
    private final RepuestoRepository repuestoRepository;

    public InventarioService(
            InventarioRepository repository,
            RepuestoRepository repuestoRepository) {

        this.repository = repository;
        this.repuestoRepository = repuestoRepository;
    }

    @Transactional(readOnly = true)
    public List<Inventario> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Inventario findById(Long id) {
        return getOrThrow(id);
    }

    @Transactional(readOnly = true)
    public Inventario findByRepuestoId(Long repuestoId) {

        return repository.findByRepuestoId(repuestoId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "No existe inventario para el repuesto con id "
                        + repuestoId
                    )
                );
    }

    public Inventario create(Inventario inventario) {

        if (inventario.getRepuesto() == null ||
                inventario.getRepuesto().getId() == null) {

            throw new BadRequestException(
                "Debe indicar el repuesto asociado al inventario"
            );
        }

        Long repuestoId = inventario.getRepuesto().getId();

        if (repository.existsByRepuestoId(repuestoId)) {
            throw new BadRequestException(
                "El repuesto ya tiene un registro de inventario"
            );
        }

        Repuesto repuesto = repuestoRepository.findById(repuestoId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Repuesto no encontrado con id " + repuestoId
                    )
                );

        inventario.setId(null);
        inventario.setRepuesto(repuesto);

        return repository.save(inventario);
    }

    public Inventario update(Long id, Inventario datos) {

        Inventario inventario = getOrThrow(id);

        inventario.setCantidadDisponible(
            datos.getCantidadDisponible()
        );

        inventario.setStockMinimo(
            datos.getStockMinimo()
        );

        inventario.setUbicacion(
            datos.getUbicacion()
        );

        inventario.setEntradas(
            datos.getEntradas()
        );

        inventario.setSalidas(
            datos.getSalidas()
        );

        inventario.setActivo(
            datos.getActivo()
        );

        // Sincronizar el stock del repuesto
        Repuesto repuesto = inventario.getRepuesto();

        repuesto.setStock(
            datos.getCantidadDisponible()
        );

        repuestoRepository.save(repuesto);

        return inventario;
    }

    public void delete(Long id) {

        Inventario inventario = getOrThrow(id);

        repository.delete(inventario);
    }

    private Inventario getOrThrow(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Inventario no encontrado con id " + id
                    )
                );
    }
}