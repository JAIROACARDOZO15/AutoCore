# Backend AutoCore

Backend REST con Spring Boot 3, Java 17, Spring Data MongoDB y Swagger. Se conecta a MongoDB Atlas mediante una URI local; no requiere instalar MongoDB en el computador.

## Módulos

| Módulo | Endpoint | Colecciones principales |
|---|---|---|
| Usuarios y login | `/api/usuarios` | `usuario`, `tecnico` |
| Clientes | `/api/clientes` | `cliente` |
| Equipos | `/api/equipos` | `equipo` |
| Repuestos e inventario | `/api/repuestos`, `/api/inventarios` | `repuesto`, `inventario` |
| Reparaciones | `/api/reparaciones` | `reparacion` (diagnóstico y repuestos usados embebidos) |
| Cotizaciones | `/api/cotizaciones` | `cotizacion` (detalles embebidos) |
| Pedidos | `/api/pedidos` | `pedido`, `detalle_pedido` |

Las relaciones entre documentos usan referencias MongoDB; los detalles que pertenecen a una cotización o reparación se guardan dentro de su documento.

## Preparar MongoDB Atlas

1. Crea o reanuda un clúster gratuito en Atlas.
2. En **Network Access**, autoriza la IP desde la que ejecutarás el backend.
3. En **Database Access**, crea un usuario y contraseña de base de datos.
4. En el proyecto, copia `src/main/resources/application-local.properties.example` como `application-local.properties`.
5. Reemplaza la URI de ejemplo por la URI Java de Atlas y cambia el marcador por el nombre de la base, por ejemplo `autocore`.
6. Usa una clave JWT local de al menos 32 caracteres. No guardes credenciales reales en Git ni las compartas en chats.

El archivo `application-local.properties` está excluido de Git. También se puede definir `MONGODB_URI` y `JWT_SECRET` como variables de entorno.

## Ejecutar

Desde `backend-spring`:

```powershell
.\mvnw.cmd spring-boot:run
```

API: `http://localhost:8080`
Swagger: `http://localhost:8080/swagger-ui.html`

La aplicación agrega datos de demostración cuando la colección de usuarios está vacía. Usuarios de demostración: `admin@taller.com / admin123`, `carlos@taller.com / tec123`, `juan@mail.com / cli123`.

Los IDs numéricos se conservan para las rutas existentes y se generan usando la colección `mongo_sequences`.

## Flujo de reparación

```text
RECIBIDO → EN_DIAGNOSTICO → COTIZACION_PENDIENTE → ESPERANDO_APROBACION
                                      ├→ EN_REPARACION → FINALIZADA → ENTREGADO
                                      └→ RECHAZADO
```

El backend valida transiciones y calcula subtotales, IVA y totales de las cotizaciones.

## Notas

- Las contraseñas de los usuarios de demostración se guardan en texto plano, por el comportamiento heredado del proyecto académico. No uses contraseñas reales.
- Los endpoints no tienen autorización por rol; el login emite JWT, pero el control de roles todavía debe añadirse.
- `src/main/resources/schema.sql` es un archivo legado de MySQL y ya no participa en el arranque.
