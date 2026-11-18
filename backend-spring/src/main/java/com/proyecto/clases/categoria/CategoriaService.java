package com.proyecto.clases.categoria;

import java.util.List;

import org.springframework.stereotype.Service;
import com.proyecto.clases.exception.BadRequestException;
import com.proyecto.clases.exception.ResourceNotFoundException;

@Service
public class CategoriaService {

    private final CategoriaRepository repository;

    public CategoriaService(CategoriaRepository repository) {
        this.repository = repository;
    }

    public List<Categoria> findAll() {
        return repository.findAll();
    }

    public Categoria findById(Long id) {
        return getOrThrow(id);
    }

    public Categoria create(Categoria categoria) {

        categoria.setId(null);

        if (repository.existsByNombreIgnoreCase(categoria.getNombre())) {
            throw new BadRequestException(
                "Ya existe una categoría con el nombre: " + categoria.getNombre()
            );
        }

        return repository.save(categoria);
    }

    public Categoria update(Long id, Categoria datos) {

        Categoria categoria = getOrThrow(id);

        if (!categoria.getNombre().equalsIgnoreCase(datos.getNombre())
                && repository.existsByNombreIgnoreCase(datos.getNombre())) {

            throw new BadRequestException(
                "Ya existe una categoría con el nombre: " + datos.getNombre()
            );
        }

        categoria.setNombre(datos.getNombre());
        categoria.setDescripcion(datos.getDescripcion());

        return repository.save(categoria);
    }

    public void delete(Long id) {
        Categoria categoria = getOrThrow(id);
        repository.delete(categoria);
    }

    private Categoria getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Categoría no encontrada con id " + id
                    )
                );
    }
}
