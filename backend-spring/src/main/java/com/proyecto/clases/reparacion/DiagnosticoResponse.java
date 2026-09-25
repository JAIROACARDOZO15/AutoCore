package com.proyecto.clases.reparacion;

import java.time.LocalDateTime;

public record DiagnosticoResponse(
        Long id,
        String hallazgos,
        String solucionPropuesta,
        LocalDateTime fechaDiagnostico) {
}
