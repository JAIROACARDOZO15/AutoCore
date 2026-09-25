package com.proyecto.clases.reparacion;

import jakarta.validation.constraints.NotBlank;

public record DiagnosticoRequest(
        @NotBlank(message = "Los hallazgos son obligatorios") String hallazgos,
        String solucionPropuesta) {
}
