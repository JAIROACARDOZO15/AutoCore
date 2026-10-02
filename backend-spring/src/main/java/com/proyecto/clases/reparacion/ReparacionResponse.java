package com.proyecto.clases.reparacion;

import java.time.LocalDateTime;
import java.util.List;

public record ReparacionResponse(
        Long id,
        Long equipoId,
        String equipoTipo,
        String equipoMarca,
        String equipoModelo,
        Long clienteId,
        String clienteNombre,
        Long tecnicoId,
        String tecnicoNombre,
        String fallaReportada,
        EstadoReparacion estado,
        LocalDateTime fechaIngreso,
        LocalDateTime fechaEntrega,
        String observaciones,
        DiagnosticoResponse diagnostico,
        List<RepuestoUsadoResponse> repuestosUsados) {
}
