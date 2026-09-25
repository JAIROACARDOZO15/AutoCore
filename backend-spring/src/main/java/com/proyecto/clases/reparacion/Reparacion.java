package com.proyecto.clases.reparacion;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.proyecto.clases.equipo.Equipo;
import com.proyecto.clases.usuario.Tecnico;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reparacion")
@Getter
@Setter
@NoArgsConstructor
public class Reparacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipo equipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Tecnico tecnico;

    @Column(name = "falla_reportada", nullable = false, columnDefinition = "TEXT")
    private String fallaReportada;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReparacion estado = EstadoReparacion.RECIBIDO;

    @CreationTimestamp
    @Column(name = "fecha_ingreso", nullable = false, updatable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @OneToOne(mappedBy = "reparacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private Diagnostico diagnostico;

    @OneToMany(mappedBy = "reparacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RepuestoReparacion> repuestosUsados = new ArrayList<>();

}
