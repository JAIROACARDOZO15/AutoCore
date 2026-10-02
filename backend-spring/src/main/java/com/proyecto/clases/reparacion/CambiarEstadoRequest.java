package com.proyecto.clases.reparacion;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoRequest(@NotNull(message = "El estado es obligatorio") EstadoReparacion estado) {
}
