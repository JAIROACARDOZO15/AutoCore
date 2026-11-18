# Backend AutoCore

API REST con Java 17, Spring Boot 3.3, Spring Data MongoDB, Spring Security, JWT y Swagger/OpenAPI.

## Configuración local

1. En `src/main/resources`, copia `application-local.properties.example` como `application-local.properties`.
2. Reemplaza el marcador `TU_NUEVA_CONTRASENA` por la contraseña de un usuario de MongoDB Atlas y pon la URI de conexión completa. Codifica caracteres especiales de la contraseña para URL.
3. Define una variable `JWT_SECRET` privada, aleatoria y de al menos 32 bytes.
4. En Atlas, permite la IP del equipo en **Network Access** y confirma que el clúster está activo.

El archivo `application-local.properties` está excluido por `.gitignore`. Alternativamente, proporciona `MONGODB_URI` y `JWT_SECRET` como variables de entorno. Nunca guardes credenciales reales en `application.properties` ni en Git.

## Ejecutar

Desde `backend-spring`:

```powershell
.\mvnw.cmd spring-boot:run
```

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Recursos principales

| Dominio | Endpoint | Almacenamiento |
|---|---|---|
| Usuarios/login | `/api/usuarios` | `usuario`, `tecnico` |
| Clientes | `/api/clientes` | `cliente` |
| Vehículos | `/api/equipos` | `equipo` |
| Repuestos | `/api/repuestos` | `repuesto` |
| Inventario | `/api/inventarios` | `inventario` |
| Reparaciones y diagnósticos | `/api/reparaciones` | `reparacion`, diagnóstico y repuestos usados |
| Cotizaciones | `/api/cotizaciones` | `cotizacion`, con detalles embebidos |
| Pedidos | `/api/pedidos` | `pedido`, `detalle_pedido` |

Los controladores exponen CRUD y acciones de negocio. Consulta Swagger para ver métodos, cuerpos, validaciones y filtros. Las relaciones usan referencias MongoDB; los detalles que pertenecen a una reparación o cotización se conservan como parte del documento correspondiente.

## Autenticación y cuentas de demostración

`POST /api/usuarios/login` recibe `email` y `password`; si son correctos, responde con usuario y JWT. Los endpoints de negocio requieren `Authorization: Bearer <token>`. Swagger y login son públicos. Las cuentas de demostración se insertan solo si `usuario` está vacía; correos y contraseñas están listados en [Usuarios de demostración](../README.md#usuarios-de-demostración).

## Flujo de reparación

```text
RECIBIDO → EN_DIAGNOSTICO → COTIZACION_PENDIENTE → ESPERANDO_APROBACION
                                                       ├─ aprobada → EN_REPARACION → FINALIZADA → ENTREGADO
                                                       └─ rechazada → RECHAZADO
```

El backend valida el estado de una reparación, gestiona el técnico y registra diagnóstico y repuestos usados. Las cotizaciones contienen mano de obra, detalles de repuestos, subtotal, IVA y total. Los servicios de inventario ajustan las existencias cuando se usa o devuelve un repuesto.

Cada reparación conserva además una bitácora embebida de eventos. Las solicitudes, asignaciones, diagnósticos, cotizaciones, decisiones del cliente, cambios de estado y uso de repuestos registran instante UTC, descripción, autor y rol. Las reparaciones previas pueden no tener esta bitácora; no se inventa el autor ni la hora de eventos pasados que nunca se guardaron.

## Comprobaciones

```powershell
.\mvnw.cmd test
```

Este comando compila y ejecuta las pruebas automatizadas disponibles. Verifica también el inicio real con la URI de MongoDB configurada y revisa Swagger para confirmar conectividad y operaciones.

## Notas de seguridad y alcance

- Actualmente Spring Security valida que las rutas protegidas tengan JWT, pero no restringe cada endpoint según el rol.
- El código actual guarda y compara contraseñas en texto plano. El `PasswordEncoder` configurado aún no está integrado en el flujo de usuarios; usa solo cuentas de demostración.
- No despliegues el backend directamente a Internet con esta configuración académica.
- `schema.sql` es legado de una versión relacional y no se usa al ejecutar MongoDB.
