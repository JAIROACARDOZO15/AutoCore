# Frontend AutoCore

Interfaz de AutoCore construida con React 19, React Router y Vite 8. Contiene los portales de administrador, técnico y cliente.

## Requisitos

- Node.js compatible con Vite 8.
- npm.
- API Spring Boot activa en `http://localhost:8080`.

## Instalación y ejecución

Desde la carpeta `frontend`:

```powershell
npm ci
npm run dev
```

Abre la dirección que imprime Vite (normalmente `http://localhost:5173`). La URL de API está definida en `src/services/api.js` como `http://localhost:8080/api`.

## Rutas de la interfaz

| Ruta | Vista |
|---|---|
| `/` | Inicio de sesión |
| `/dashboard` | Panel seleccionado por rol |
| `/clientes` | Gestión de clientes y sus vehículos |
| `/inventario`, `/repuestos` | Catálogo e inventario de repuestos |
| `/reparaciones` | Órdenes de reparación, asignación y estados |
| `/ordenes` | Seguimiento de órdenes |
| `/ventas` | Cotizaciones, pedidos y documento imprimible |
| `/reportes` | Indicadores y reportes |
| `/mis-vehiculos` | Vehículos del cliente |
| `/estado-vehiculo` | Seguimiento por vehículo: etapas, diagnóstico, técnico, repuestos y cotización |
| `/mis-reparaciones` | Reparaciones del cliente |
| `/mis-cotizaciones` | Revisión y respuesta a cotizaciones |
| `/mis-ordenes` | Pedidos y órdenes del cliente |

Las opciones visibles de la barra lateral se seleccionan con el rol guardado en la sesión. El acceso y los datos también dependen del JWT y de los recursos que responda el backend.

## Sesión y llamadas a API

`src/services/api.js` centraliza las llamadas HTTP. Para las rutas protegidas agrega el token guardado en `localStorage` como encabezado `Authorization: Bearer <token>`. El inicio de sesión guarda token y usuario; cerrar sesión borra ambos.

## Scripts disponibles

```powershell
npm run dev       # servidor de desarrollo
npm run build     # bundle de producción en dist/
npm run preview   # vista previa del bundle
npm run lint      # ESLint
```

Para instrucciones de base de datos, backend y cuentas de demostración, consulta el [README principal](../README.md).
