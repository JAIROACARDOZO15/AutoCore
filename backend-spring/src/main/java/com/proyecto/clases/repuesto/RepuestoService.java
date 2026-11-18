package com.proyecto.clases.repuesto;

import java.util.List;

import org.springframework.stereotype.Service;
import com.proyecto.clases.exception.ResourceNotFoundException;

@Service
public class RepuestoService {

    private final RepuestoRepository repository;

    public RepuestoService(RepuestoRepository repository) {
        this.repository = repository;
    }

    public List<Repuesto> findAll(boolean soloActivos) {
        return soloActivos ? repository.findByActivoTrue() : repository.findAll();
    }

    public Repuesto findById(Long id) {
        return getOrThrow(id);
    }

    public Repuesto create(Repuesto repuesto) {
        repuesto.setId(null);
        if (repuesto.getActivo() == null) {
            repuesto.setActivo(true);
        }
        return repository.save(repuesto);
    }

    public Repuesto update(Long id, Repuesto datos) {
        Repuesto repuesto = getOrThrow(id);
        repuesto.setNombre(datos.getNombre());
        repuesto.setDescripcion(datos.getDescripcion());
        repuesto.setPrecio(datos.getPrecio());
        repuesto.setStock(datos.getStock());
        if (datos.getActivo() != null) {
            repuesto.setActivo(datos.getActivo());
        }
        return repository.save(repuesto);
    }

    // Se conserva el repuesto relacionado; en lugar de borrarlo se desactiva.
    public Repuesto desactivar(Long id) {
        Repuesto repuesto = getOrThrow(id);
        repuesto.setActivo(false);
        return repository.save(repuesto);
    }

    private Repuesto getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repuesto no encontrado con id " + id));
    }

}
