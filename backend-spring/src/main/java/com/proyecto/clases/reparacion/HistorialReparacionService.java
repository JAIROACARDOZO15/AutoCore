package com.proyecto.clases.reparacion;

import java.time.Instant;
import java.util.ArrayList;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.proyecto.clases.usuario.Usuario;
import com.proyecto.clases.usuario.UsuarioRepository;

@Service
public class HistorialReparacionService {

    private final UsuarioRepository usuarioRepository;

    public HistorialReparacionService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void registrar(Reparacion reparacion, String tipo, String descripcion) {
        if (reparacion.getHistorial() == null) {
            reparacion.setHistorial(new ArrayList<>());
        }

        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        String correo = autenticacion != null && autenticacion.isAuthenticated()
                ? autenticacion.getName()
                : null;
        String rol = autenticacion != null && autenticacion.getAuthorities() != null
                ? autenticacion.getAuthorities().stream()
                        .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                        .findFirst().orElse("SISTEMA")
                : "SISTEMA";

        String nombre = "Sistema";
        if (correo != null && !"anonymousUser".equals(correo)) {
            nombre = usuarioRepository.findFirstByEmail(correo)
                    .map(Usuario::getNombre)
                    .filter(valor -> valor != null && !valor.isBlank())
                    .orElse(correo);
        } else {
            correo = null;
        }

        EventoReparacion evento = new EventoReparacion();
        evento.setFecha(Instant.now());
        evento.setTipo(tipo);
        evento.setDescripcion(descripcion);
        evento.setActorNombre(nombre);
        evento.setActorCorreo(correo);
        evento.setActorRol(rol);
        reparacion.getHistorial().add(evento);
    }
}
