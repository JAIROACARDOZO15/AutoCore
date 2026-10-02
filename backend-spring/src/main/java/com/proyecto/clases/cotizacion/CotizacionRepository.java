package com.proyecto.clases.cotizacion;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {

    boolean existsByReparacionId(Long reparacionId);

    @Query("""
            select c from Cotizacion c
            where (:reparacionId is null or c.reparacion.id = :reparacionId)
              and (:clienteId is null or c.reparacion.equipo.cliente.id = :clienteId)
            order by c.fechaCotizacion desc
            """)
    List<Cotizacion> buscar(@Param("reparacionId") Long reparacionId, @Param("clienteId") Long clienteId);

}
