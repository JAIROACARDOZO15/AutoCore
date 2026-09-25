package com.proyecto.clases.reparacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** tecnicoId es opcional (id de la tabla tecnico): si viene, se asigna/reasigna el tecnico. */
public record ReparacionRequest(
        @NotNull(message = "El equipoId es obligatorio") Long equipoId,
        Long tecnicoId,
        @NotBlank(message = "La falla reportada es obligatoria") String fallaReportada,
        String observaciones) {
}
