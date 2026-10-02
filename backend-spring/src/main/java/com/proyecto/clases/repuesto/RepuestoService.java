package com.proyecto.clases.repuesto;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.clases.exception.ResourceNotFoundException;

@Service
@Transactional
public class RepuestoService {

    private final RepuestoRepository repository;

    public RepuestoService(RepuestoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Repuesto> findAll(boolean soloActivos) {
        return soloActivos ? repository.findByActivoTrue() : repository.findAll();
    }

    @Transactional(readOnly = true)
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
        return repuesto;
    }

    // El repuesto puede estar en cotizaciones o reparaciones (FK RESTRICT): no se borra, se desactiva
    public Repuesto desactivar(Long id) {
        Repuesto repuesto = getOrThrow(id);
        repuesto.setActivo(false);
        return repuesto;
    }

    private Repuesto getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repuesto no encontrado con id " + id));
    }

}
