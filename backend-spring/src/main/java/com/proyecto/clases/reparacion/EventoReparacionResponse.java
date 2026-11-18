package com.proyecto.clases.reparacion;

import java.time.Instant;

public record EventoReparacionResponse(
        Instant fecha,
        String tipo,
        String descripcion,
        String actorNombre,
        String actorCorreo,
        String actorRol) {
}
