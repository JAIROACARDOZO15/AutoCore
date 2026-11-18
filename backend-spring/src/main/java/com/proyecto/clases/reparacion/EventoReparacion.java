package com.proyecto.clases.reparacion;

import java.time.Instant;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EventoReparacion {

    private Instant fecha;
    private String tipo;
    private String descripcion;
    private String actorNombre;
    private String actorCorreo;
    private String actorRol;
}
