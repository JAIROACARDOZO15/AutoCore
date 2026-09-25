package com.proyecto.clases.config;

import java.math.BigDecimal;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        crearUsuario("Administrador", "admin@taller.com", "admin123", Rol.ADMIN);

        Usuario carlos = crearUsuario("Carlos Pérez", "carlos@taller.com", "tec123", Rol.TECNICO);
        Usuario maria = crearUsuario("María López", "maria@taller.com", "tec123", Rol.TECNICO);
        crearTecnico(carlos, "Hardware PC", "3001234567");
        Tecnico tecnicoMaria = crearTecnico(maria, "Celulares", "3009876543");

        Usuario juan = crearUsuario("Juan García", "juan@mail.com", "cli123", Rol.CLIENTE);
        Usuario ana = crearUsuario("Ana Rodríguez", "ana@mail.com", "cli123", Rol.CLIENTE);
        Cliente clienteJuan = crearCliente(juan, "3112223344", "Cra 27 #36-50, Bucaramanga", "1098765432");
        Cliente clienteAna = crearCliente(ana, "3225556677", "Cll 45 #23-10, Bucaramanga", "1097654321");

        crearEquipo(clienteJuan, "PC", "Dell", "Inspiron 15", "DLL-2024-001", "Laptop Dell pantalla 15 pulgadas");
        Equipo galaxy = crearEquipo(clienteJuan, "Celular", "Samsung", "Galaxy S23", "SAM-2024-002",
                "Celular Samsung con pantalla rota");
        crearEquipo(clienteAna, "Tablet", "Apple", "iPad Air", "APL-2024-003", "iPad que no enciende");

        crearRepuesto("Pantalla LCD 15\"", "Pantalla de reemplazo para laptop 15 pulgadas", "185000.00", 5);
        crearRepuesto("Batería Samsung S23", "Batería original Samsung Galaxy S23", "95000.00", 10);
        crearRepuesto("Conector de carga iPad", "Puerto de carga Lightning", "45000.00", 8);
        crearRepuesto("Pasta térmica", "Pasta térmica para procesador", "15000.00", 20);
        crearRepuesto("Disco SSD 256GB", "Disco sólido SATA 2.5\"", "120000.00", 7);

        Reparacion reparacion = new Reparacion();
        reparacion.setEquipo(galaxy);
        reparacion.setTecnico(tecnicoMaria);
        reparacion.setFallaReportada("Pantalla rota, no responde al tacto después de caída");
        reparacion.setEstado(EstadoReparacion.EN_DIAGNOSTICO);
        reparacionRepository.save(reparacion);
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
