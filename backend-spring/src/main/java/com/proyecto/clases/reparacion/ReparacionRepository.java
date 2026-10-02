package com.proyecto.clases.reparacion;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReparacionRepository extends JpaRepository<Reparacion, Long> {

    @Query("""
            select r from Reparacion r
            where (:estado is null or r.estado = :estado)
              and (:tecnicoId is null or r.tecnico.id = :tecnicoId)
              and (:clienteId is null or r.equipo.cliente.id = :clienteId)
            order by r.fechaIngreso desc
            """)
    List<Reparacion> buscar(@Param("estado") EstadoReparacion estado,
            @Param("tecnicoId") Long tecnicoId,
            @Param("clienteId") Long clienteId);

}
