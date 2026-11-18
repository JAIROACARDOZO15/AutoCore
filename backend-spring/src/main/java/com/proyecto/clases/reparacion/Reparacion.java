package com.proyecto.clases.reparacion;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.proyecto.clases.equipo.Equipo;
import com.proyecto.clases.usuario.Tecnico;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "reparacion")
@Getter
@Setter
@NoArgsConstructor
public class Reparacion {

    @Id
    private Long id;

    @DBRef
    private Equipo equipo;

    @DBRef
    private Tecnico tecnico;

    private String fallaReportada;

    private EstadoReparacion estado = EstadoReparacion.RECIBIDO;

    private LocalDateTime fechaIngreso;

    private LocalDateTime fechaEntrega;

    private String observaciones;

    private Diagnostico diagnostico;

    private List<RepuestoReparacion> repuestosUsados = new ArrayList<>();

}
