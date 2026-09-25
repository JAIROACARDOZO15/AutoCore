# Backend - Taller de Reparacion

Spring Boot 3 + Java 17 + Maven, JPA/Hibernate sobre MySQL (base `taller_reparacion`) y Swagger (springdoc-openapi).

## Modulos (un CRUD por cada uno)

| # | Modulo | Endpoint base | Tablas que maneja |
|---|---|---|---|
| 1 | Usuario | `/api/usuarios` | `usuario`, `tecnico` (se crea/actualiza cuando rol = TECNICO) |
| 2 | Cliente | `/api/clientes` | `cliente` |
| 3 | Equipo | `/api/equipos` | `equipo` |
| 4 | Repuesto | `/api/repuestos` | `repuesto` |
| 5 | Reparacion | `/api/reparaciones` | `reparacion`, `diagnostico`, `repuesto_reparacion` |
| 6 | Cotizacion | `/api/cotizaciones` | `cotizacion`, `detalle_cotizacion` |

Codigo en `src/main/java/com/proyecto/clases/<modulo>` (entity, repository, service, controller, request/response).

## Flujo de una reparacion

```
RECIBIDO --(PATCH /estado, requiere tecnico)--> EN_DIAGNOSTICO
EN_DIAGNOSTICO --(PUT /{id}/diagnostico)--> COTIZACION_PENDIENTE
COTIZACION_PENDIENTE --(POST /api/cotizaciones)--> ESPERANDO_APROBACION
ESPERANDO_APROBACION --(PATCH /api/cotizaciones/{id}/aprobar)--> EN_REPARACION
                     --(PATCH /api/cotizaciones/{id}/rechazar)--> RECHAZADO
EN_REPARACION --(PATCH /estado)--> FINALIZADA --(PATCH /estado)--> ENTREGADO
```

- Repuestos usados: `POST /api/reparaciones/{id}/repuestos` (solo en EN_REPARACION) descuenta stock; `DELETE .../repuestos/{repuestoUsadoId}` lo devuelve.
- Cotizacion: el servidor calcula precios, subtotales y total a partir de los repuestos y la mano de obra.

## Login

`POST /api/usuarios/login` con `{"email": "...", "password": "..."}` devuelve el usuario (con su `rol`) o 404.
`POST /api/usuarios/loginclient` devuelve `1` o `0`.
Usuarios de prueba: `admin@taller.com / admin123`, `carlos@taller.com / tec123`, `juan@mail.com / cli123`.

## Como correrlo

1. Tener MySQL corriendo. Copiar `src/main/resources/application-local.properties.example` como `application-local.properties` y poner tu usuario/clave de MySQL (ese archivo no se sube a git; tambien sirven las variables de entorno `DB_USERNAME` y `DB_PASSWORD`).
2. Ejecutar (no hace falta tener Maven instalado):
   ```
   ./mvnw.cmd spring-boot:run
   ```
3. Swagger: http://localhost:8080/swagger-ui.html

No hay que crear nada a mano. En el **primer arranque** la app crea la base `taller_reparacion`, las tablas (`src/main/resources/schema.sql`) y carga los datos de prueba (`config/DatosIniciales.java`). En los siguientes arranques no borra ni recarga nada: `schema.sql` usa `CREATE TABLE IF NOT EXISTS` y los datos de prueba solo se cargan si no hay ningun usuario.

Para empezar de cero: `DROP DATABASE taller_reparacion;` en MySQL y volver a arrancar.

Al arrancar, `ddl-auto=validate` comprueba que las entidades coincidan con las tablas; si cambia `schema.sql`, hay que actualizar las entidades.

## Notas

- Las claves se guardan y comparan en texto plano (como en la guia del curso y los datos de prueba).
- Los roles se devuelven en el login, pero los endpoints aun no restringen el acceso por rol (no hay Spring Security).
- Los borrados respetan las FK del script: eliminar un usuario/cliente/equipo borra en cascada lo que depende de el; los repuestos no se borran, se desactivan.
