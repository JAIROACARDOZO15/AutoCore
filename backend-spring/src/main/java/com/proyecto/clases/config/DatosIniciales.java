package com.proyecto.clases.config;

import java.math.BigDecimal;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import com.proyecto.clases.cliente.Cliente;
import com.proyecto.clases.cliente.ClienteRepository;
import com.proyecto.clases.equipo.Equipo;
import com.proyecto.clases.equipo.EquipoRepository;
import com.proyecto.clases.reparacion.EstadoReparacion;
import com.proyecto.clases.reparacion.Reparacion;
import com.proyecto.clases.reparacion.ReparacionRepository;
import com.proyecto.clases.repuesto.Repuesto;
import com.proyecto.clases.repuesto.RepuestoRepository;
import com.proyecto.clases.usuario.Rol;
import com.proyecto.clases.usuario.Tecnico;
import com.proyecto.clases.usuario.TecnicoRepository;
import com.proyecto.clases.usuario.Usuario;
import com.proyecto.clases.usuario.UsuarioRepository;

/** Carga los datos de prueba solo cuando la base esta vacia (primer arranque). */
@Component
public class DatosIniciales implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final TecnicoRepository tecnicoRepository;
    private final ClienteRepository clienteRepository;
    private final EquipoRepository equipoRepository;
    private final RepuestoRepository repuestoRepository;
    private final ReparacionRepository reparacionRepository;

    public DatosIniciales(UsuarioRepository usuarioRepository, TecnicoRepository tecnicoRepository,
            ClienteRepository clienteRepository, EquipoRepository equipoRepository,
            RepuestoRepository repuestoRepository, ReparacionRepository reparacionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.tecnicoRepository = tecnicoRepository;
        this.clienteRepository = clienteRepository;
        this.equipoRepository = equipoRepository;
        this.repuestoRepository = repuestoRepository;
        this.reparacionRepository = reparacionRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() > 0) {
            migrarMuestrasDeTaller();
            return;
        }

        crearUsuario("Administrador", "admin@taller.com", "admin123", Rol.ADMIN);

        Usuario carlos = crearUsuario("Carlos Pérez", "carlos@taller.com", "tec123", Rol.TECNICO);
        Usuario maria = crearUsuario("María López", "maria@taller.com", "tec123", Rol.TECNICO);
        crearTecnico(carlos, "Mecánica general", "3001234567");
        Tecnico tecnicoMaria = crearTecnico(maria, "Frenos y mantenimiento", "3009876543");

        Usuario juan = crearUsuario("Juan García", "juan@mail.com", "cli123", Rol.CLIENTE);
        Usuario ana = crearUsuario("Ana Rodríguez", "ana@mail.com", "cli123", Rol.CLIENTE);
        Cliente clienteJuan = crearCliente(juan, "3112223344", "Cra 27 #36-50, Bucaramanga", "1098765432");
        Cliente clienteAna = crearCliente(ana, "3225556677", "Cll 45 #23-10, Bucaramanga", "1097654321");

        crearEquipo(clienteJuan, "Vehículo", "Toyota", "Corolla", "TOY-2024-001", "Sedán para mantenimiento general");
        Equipo galaxy = crearEquipo(clienteJuan, "Vehículo", "Renault", "Logan", "REN-2024-002",
                "Sedán con revisión de frenos pendiente");
        crearEquipo(clienteAna, "Vehículo", "Kia", "Picanto", "KIA-2024-003", "Vehículo compacto para mantenimiento");

        crearRepuesto("Filtro de aceite Toyota Corolla", "Filtro de aceite para motor Toyota Corolla", "28000.00", 12);
        crearRepuesto("Pastillas de freno delanteras", "Juego de pastillas de freno para eje delantero", "95000.00", 10);
        crearRepuesto("Bujía de encendido", "Bujía para motor a gasolina", "25000.00", 8);
        crearRepuesto("Aceite de motor 5W-30", "Lubricante sintético para motor de automóvil", "45000.00", 20);
        crearRepuesto("Filtro de aire del motor", "Filtro de aire para sistema de admisión", "32000.00", 7);

        Reparacion reparacion = new Reparacion();
        reparacion.setEquipo(galaxy);
        reparacion.setTecnico(tecnicoMaria);
        reparacion.setFallaReportada("Revisión de frenos y mantenimiento preventivo");
        reparacion.setEstado(EstadoReparacion.EN_DIAGNOSTICO);
        reparacionRepository.save(reparacion);
    }

    /** Actualiza únicamente los registros de demostración originales de la app, conservando sus IDs. */
    private void migrarMuestrasDeTaller() {
        boolean baseDeDemostracion = usuarioRepository.findAll().stream()
                .anyMatch(usuario -> "admin@taller.com".equalsIgnoreCase(usuario.getEmail()));
        if (!baseDeDemostracion) {
            return;
        }

        for (Equipo equipo : equipoRepository.findAll()) {
            switch (String.valueOf(equipo.getSerial())) {
                case "DLL-2024-001" -> actualizarEquipoDemo(equipo, "Vehículo", "Toyota", "Corolla",
                        "TOY-2024-001", "Sedán para mantenimiento general");
                case "SAM-2024-002" -> actualizarEquipoDemo(equipo, "Vehículo", "Renault", "Logan",
                        "REN-2024-002", "Sedán con revisión de frenos pendiente");
                case "APL-2024-003" -> actualizarEquipoDemo(equipo, "Vehículo", "Kia", "Picanto",
                        "KIA-2024-003", "Vehículo compacto para mantenimiento");
                default -> { }
            }
        }

        actualizarRepuestoDemo("Pantalla LCD 15\"", "Filtro de aceite Toyota Corolla",
                "Filtro de aceite para motor Toyota Corolla", "28000.00", 12);
        actualizarRepuestoDemo("Batería Samsung S23", "Pastillas de freno delanteras",
                "Juego de pastillas de freno para eje delantero", "95000.00", 10);
        actualizarRepuestoDemo("Conector de carga iPad", "Bujía de encendido",
                "Bujía para motor a gasolina", "25000.00", 8);
        actualizarRepuestoDemo("Pasta térmica", "Aceite de motor 5W-30",
                "Lubricante sintético para motor de automóvil", "45000.00", 20);
        actualizarRepuestoDemo("Disco SSD 256GB", "Filtro de aire del motor",
                "Filtro de aire para sistema de admisión", "32000.00", 7);

        for (Tecnico tecnico : tecnicoRepository.findAll()) {
            if ("Hardware PC".equalsIgnoreCase(tecnico.getEspecialidad())) {
                tecnico.setEspecialidad("Mecánica general");
                tecnicoRepository.save(tecnico);
            } else if ("Celulares".equalsIgnoreCase(tecnico.getEspecialidad())) {
                tecnico.setEspecialidad("Frenos y mantenimiento");
                tecnicoRepository.save(tecnico);
            }
        }

        for (Reparacion reparacion : reparacionRepository.findAll()) {
            if ("Pantalla rota, no responde al tacto después de caída".equals(reparacion.getFallaReportada())) {
                reparacion.setFallaReportada("Revisión de frenos y mantenimiento preventivo");
                reparacionRepository.save(reparacion);
            }
        }
    }

    private void actualizarEquipoDemo(Equipo equipo, String tipo, String marca, String modelo,
            String serial, String descripcion) {
        equipo.setTipo(tipo);
        equipo.setMarca(marca);
        equipo.setModelo(modelo);
        equipo.setSerial(serial);
        equipo.setDescripcion(descripcion);
        equipoRepository.save(equipo);
    }

    private void actualizarRepuestoDemo(String nombreAnterior, String nombreNuevo, String descripcion,
            String precio, int stock) {
        repuestoRepository.findAll().stream()
                .filter(repuesto -> nombreAnterior.equals(repuesto.getNombre()))
                .findFirst()
                .ifPresent(repuesto -> {
                    repuesto.setNombre(nombreNuevo);
                    repuesto.setDescripcion(descripcion);
                    repuesto.setPrecio(new BigDecimal(precio));
                    repuesto.setStock(stock);
                    repuestoRepository.save(repuesto);
                });
    }

    private Usuario crearUsuario(String nombre, String email, String password, Rol rol) {
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setPassword(password);
        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
    }

    private Tecnico crearTecnico(Usuario usuario, String especialidad, String telefono) {
        Tecnico tecnico = new Tecnico();
        tecnico.setUsuario(usuario);
        tecnico.setEspecialidad(especialidad);
        tecnico.setTelefono(telefono);
        return tecnicoRepository.save(tecnico);
    }

    private Cliente crearCliente(Usuario usuario, String telefono, String direccion, String documento) {
        Cliente cliente = new Cliente();
        cliente.setUsuario(usuario);
        cliente.setTelefono(telefono);
        cliente.setDireccion(direccion);
        cliente.setDocumento(documento);
        return clienteRepository.save(cliente);
    }

    private Equipo crearEquipo(Cliente cliente, String tipo, String marca, String modelo, String serial,
            String descripcion) {
        Equipo equipo = new Equipo();
        equipo.setCliente(cliente);
        equipo.setTipo(tipo);
        equipo.setMarca(marca);
        equipo.setModelo(modelo);
        equipo.setSerial(serial);
        equipo.setDescripcion(descripcion);
        return equipoRepository.save(equipo);
    }

    private void crearRepuesto(String nombre, String descripcion, String precio, int stock) {
        Repuesto repuesto = new Repuesto();
        repuesto.setNombre(nombre);
        repuesto.setDescripcion(descripcion);
        repuesto.setPrecio(new BigDecimal(precio));
        repuesto.setStock(stock);
        repuestoRepository.save(repuesto);
    }

}
