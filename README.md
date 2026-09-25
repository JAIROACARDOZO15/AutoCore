# Sistema de Gestion - Taller de Reparacion

Entornos de Programacion - Grupo F1 - UIS 2026.

Sistema para gestionar un taller de reparacion: usuarios y roles, clientes, equipos, repuestos, reparaciones y cotizaciones.

## Estructura del repositorio

```
.
├── backend-spring/   API REST en Spring Boot + MySQL + Swagger
├── frontend/         Interfaz de usuario (pendiente)
├── .gitignore
├── .gitattributes
└── README.md
```

## Como correr el backend

Requisitos: Java 17 y MySQL corriendo en local (no hace falta instalar Maven).

1. Copiar `backend-spring/src/main/resources/application-local.properties.example` como `application-local.properties` (misma carpeta) y poner tu usuario y clave de MySQL. Ese archivo no se sube a git.
2. Desde la carpeta `backend-spring/`:
   ```
   ./mvnw.cmd spring-boot:run
   ```
3. Abrir Swagger: http://localhost:8080/swagger-ui.html

En el primer arranque la app crea sola la base `taller_reparacion`, sus tablas y los datos de prueba; en los siguientes no borra nada.

Mas detalle (modulos, flujo de estados, login) en [backend-spring/README.md](backend-spring/README.md).
