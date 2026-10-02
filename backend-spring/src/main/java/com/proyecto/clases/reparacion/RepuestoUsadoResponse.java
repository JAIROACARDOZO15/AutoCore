package com.proyecto.clases.reparacion;

public record RepuestoUsadoResponse(
        Long id,
        Long repuestoId,
        String repuestoNombre,
        Integer cantidadUsada) {
}
