# 🚗 AutoCore

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black)

**Proyecto académico:** Entornos de Programación (24542)
**Institución:** Universidad Industrial de Santander (UIS)
**Grupo:** F1 · **Año:** 2026

AutoCore es una aplicación web para gestionar un taller de reparación automotriz. Centraliza clientes, vehículos, repuestos, inventario, reparaciones, cotizaciones, pedidos y ventas, con vistas para los roles de administrador, técnico y cliente.

## Contenido

- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Módulos y roles](#módulos-y-roles)
- [Flujo de reparación y cotización](#flujo-de-reparación-y-cotización)
- [Cotizaciones, IVA y factura imprimible](#cotizaciones-iva-y-factura-imprimible)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Configuración y ejecución local](#configuración-y-ejecución-local)
- [API y documentación](#api-y-documentación)
- [Configuración sensible](#configuración-sensible)
- [Equipo](#equipo)

## Funcionalidades

- Inicio de sesión y vistas diferenciadas por rol (`ADMIN`, `TECNICO` y `CLIENTE`).
- Gestión de clientes y vehículos asociados.
- Catálogo de repuestos con precios y estado.
- Control de inventario: cantidades disponibles, entradas, salidas y stock mínimo.
- Gestión de reparaciones, asignación de técnicos y registro de diagnósticos.
- Registro de repuestos utilizados durante una reparación.
- Creación y gestión de cotizaciones vinculadas a reparaciones.
- Aprobación y rechazo de cotizaciones.
- Pedidos asociados a cotizaciones y consulta de órdenes del taller.
- Vista previa e impresión de documentos de cotización/factura de servicio.
- Cálculo de subtotal, IVA y total cuando el desglose de IVA está habilitado y guardado en la cotización.
- Reportes e indicadores generales del taller.

> **Nota:** la factura imprimible del frontend es un documento de gestión. No constituye por sí sola una factura electrónica validada por la DIAN. El porcentaje de IVA debe configurarse de acuerdo con el tratamiento tributario que corresponda.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Frontend | React 19, Vite 8, React Router |
| Backend | Java 17, Spring Boot 3.3.4 |
| API | REST |
| Persistencia | Spring Data MongoDB |
| Base de datos | MongoDB Atlas |
| Documentación de API | Swagger / OpenAPI |
| Control de versiones | Git y GitHub |

## Arquitectura

```mermaid
flowchart LR
    U[Usuario en navegador] --> FE[Frontend React + Vite]
    FE -->|HTTP / JSON| API[API REST Spring Boot]
    API --> MDB[Spring Data MongoDB]
    MDB --> DB[(MongoDB Atlas: autocore)]
    API --> SW[Swagger / OpenAPI]
```

El frontend consume la API REST del backend. Spring Boot valida y procesa las operaciones y utiliza Spring Data MongoDB para acceder a MongoDB Atlas.

## Módulos y roles

| Módulo | Descripción |
|---|---|
| Login | Inicio de sesión y lectura del rol del usuario |
| Dashboard | Panel de acuerdo con el rol |
| Clientes | Datos de los clientes |
| Vehículos | Vehículos asociados a los clientes |
| Repuestos | Catálogo, precios y disponibilidad |
| Inventario | Existencias, movimientos y stock mínimo |
| Reparaciones | Diagnóstico, técnico asignado, estados y repuestos usados |
| Órdenes | Consulta y seguimiento de órdenes de servicio |
| Ventas | Cotizaciones, aprobación/rechazo, pedidos y documentos imprimibles |
| Reportes | Indicadores operativos y comerciales |
| Configuración | Opciones de configuración disponibles en la interfaz |

### Administrador

Gestiona los módulos generales del taller: clientes, repuestos, inventario, reparaciones, órdenes, ventas, reportes y configuración.

### Técnico

Consulta las reparaciones asignadas y la información necesaria para diagnosticar y realizar los trabajos.

### Cliente

Consulta la información de sus vehículos, reparaciones, cotizaciones y órdenes, según las pantallas habilitadas para su rol.

## Flujo de reparación y cotización

```text
RECIBIDO
   |
   v
EN_DIAGNOSTICO
   |
   | Registrar diagnóstico
   v
COTIZACION_PENDIENTE
   |
   | Crear cotización
   v
ESPERANDO_APROBACION
   |                    |
   v                    v
Aprobada              Rechazada
   |                    |
   v                    v
EN_REPARACION         RECHAZADO
   |
   v
FINALIZADA
   |
   v
ENTREGADO
```

El backend controla las transiciones de estado. Registrar el diagnóstico habilita la creación de la cotización; la aprobación permite continuar con la reparación.

### Edición y nueva aprobación

Cuando una cotización se modifica, el subtotal, el IVA y el total deben recalcularse y la cotización debe volver a quedar pendiente de aprobación. La edición no debe alterar silenciosamente un pedido ya creado: si existe un pedido asociado, la operación debe bloquearse o gestionarse mediante un flujo explícito de revisión del pedido.

## Cotizaciones, IVA y factura imprimible

La cotización se relaciona con una reparación e incluye mano de obra y repuestos. Cuando el desglose tributario está habilitado, se almacenan:

- `mano_obra`: valor de la mano de obra.
- `iva_porcentaje`: porcentaje de IVA aplicado.
- `valor_iva`: valor calculado del impuesto.
- `total`: importe total de la cotización.

El cálculo previsto es:

```text
Subtotal = mano de obra + suma de repuestos
IVA      = subtotal × iva_porcentaje / 100
Total    = subtotal + valor_iva
```

La vista de factura puede mostrar el cliente, vehículo, técnico, reparación, detalle del servicio, subtotal, IVA y total, y permite imprimir o guardar el documento como PDF desde el navegador.

## Estructura del proyecto

```text
AutoCore/
├── backend-spring/
│   ├── src/main/java/com/proyecto/clases/
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-local.properties.example
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── README.md
├── frontend/
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── imagenes/
├── .gitignore
└── README.md
```

## Requisitos

- Java 17.
- Node.js y npm compatibles con la versión de Vite del proyecto.
- Una cuenta de MongoDB Atlas y un clúster gratuito (no hace falta descargar MongoDB).
- Git (opcional para ejecutar; necesario para contribuir al repositorio).

## Configuración y ejecución local

### 1. Base de datos MongoDB Atlas

En Atlas, crea un usuario de base de datos y autoriza la IP desde la que usarás la aplicación. Copia `backend-spring/src/main/resources/application-local.properties.example` como `application-local.properties` en esa misma carpeta y reemplaza la URI de ejemplo por la URI Java de Atlas. No subas ese archivo ni compartas contraseñas.

### 2. Backend

Abre una terminal en la carpeta raíz y ejecuta:

```powershell
cd backend-spring
.\mvnw.cmd spring-boot:run
```

Backend: `http://localhost:8080`

Swagger/OpenAPI: `http://localhost:8080/swagger-ui/index.html`

Si Swagger no abre con esa dirección, revisa el mensaje de inicio de Spring Boot y la configuración de springdoc.

### 3. Frontend

Abre una segunda terminal en la raíz del proyecto:

```powershell
cd frontend
npm install
npm run dev
```

Vite normalmente publica la aplicación en `http://localhost:5173`.

## API y documentación

| Módulo | Endpoint base |
|---|---|
| Usuarios y login | `/api/usuarios` |
| Clientes | `/api/clientes` |
| Vehículos | `/api/equipos` |
| Repuestos | `/api/repuestos` |
| Inventario | `/api/inventarios` |
| Reparaciones y diagnósticos | `/api/reparaciones` |
| Cotizaciones | `/api/cotizaciones` |
| Pedidos | `/api/pedidos` |

Los endpoints disponibles y sus métodos HTTP se pueden consultar en Swagger. Las rutas concretas pueden incluir operaciones específicas para asignar técnicos, registrar diagnósticos, cambiar estados, gestionar repuestos, aprobar/rechazar cotizaciones y consultar pedidos.

Para más información sobre los controladores y el flujo del backend, consulta [backend-spring/README.md](backend-spring/README.md).

## Configuración sensible

- No subas contraseñas, tokens ni archivos de configuración local.
- Usa `application-local.properties` para la URI de MongoDB Atlas y la clave JWT local; el archivo está fuera de Git.
- Antes de publicar el repositorio, revisa que no haya claves reales en archivos de configuración ni datos personales que no deban compartirse.
- Los datos iniciales son para desarrollo/pruebas; cámbialos y aplica medidas de seguridad antes de cualquier despliegue real.

## Estado del proyecto

AutoCore integra frontend React, backend Spring Boot y persistencia MongoDB Atlas. El alcance incluye gestión de clientes, vehículos, repuestos, inventario, reparaciones, cotizaciones, pedidos, ventas y reportes. La cobertura de pruebas automatizadas y el endurecimiento de seguridad continúan siendo áreas de mejora.

## Equipo

| Integrante | Responsabilidades |
|---|---|
| **Jairo Armando Cardozo Mendoza** | Frontend, inventario, interfaz de usuario y Jira |
| **Jose Fernando Estevez Cardenas** | Backend con Spring Boot |
| **Alejandro Sarin** | Base de datos, órdenes, ventas y Node.js |

Proyecto académico de **Entornos de Programación (24542)** · Universidad Industrial de Santander (UIS) · Grupo F1 · 2026.
