package com.proyecto.clases.reparacion;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "diagnostico")
@Getter
@Setter
@NoArgsConstructor
public class Diagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reparacion_id", nullable = false, unique = true)
    private Reparacion reparacion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String hallazgos;

    @Column(name = "solucion_propuesta", columnDefinition = "TEXT")
    private String solucionPropuesta;

    @CreationTimestamp
    @Column(name = "fecha_diagnostico", nullable = false, updatable = false)
    private LocalDateTime fechaDiagnostico;

}
