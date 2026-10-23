# Mapa de navegación — D&D Textil

> Generado a partir del código: las 50 rutas de `tienda digital de telas/src/App.jsx`, los menús laterales de `src/datos/enlacesCliente.js`, `enlacesVendedor.js` y `enlacesAdmin.js`, y los enlaces del encabezado, carrito y pago. Reemplaza la sección 4 de `03-arquitectura-frontend-y-roles.md` (que solo cubría las vistas públicas) y la imagen `public/images/diagrams/mapa-navegacion.png`.

## 1. Diagrama general

![Mapa de navegación](diagramas/mapa_navegacion.png)

Versión vectorial: `diagramas/mapa_navegacion.svg`.

**Reglas de acceso** (componente `ProtectedRoute`):

- Si una ruta protegida se abre sin sesión, redirige a `/login` guardando la ruta pedida (ver observación 4).
- Si el usuario tiene sesión pero no el rol requerido, redirige a `/`.
- Al iniciar sesión, `IniciarSesion.jsx` envía a cada rol a su panel: cliente → `/cliente`, vendedor → `/vendedor`, admin → `/admin`.
- El administrador también puede entrar al panel del vendedor (rutas con `roles={['vendedor','admin']}`).

## 2. Diagramas por sección (se dibujan en GitHub)

### 2.1. Sitio público y proceso de compra

```mermaid
flowchart LR
    subgraph PUB["Sitio público"]
        r_inicio["Inicio<br/>/"]
        r_catalogo["Catálogo<br/>/catalogo"]
        r_producto_id["Detalle de tela<br/>/producto/:id"]
        r_carrito["Carrito<br/>/carrito"]
        r_nosotros["Nosotros<br/>/nosotros"]
        r_contacto["Contacto<br/>/contacto"]
        r_login["Iniciar sesión<br/>/login"]
        r_registro["Registro<br/>/registro"]
        r_reportar_fallo["Reportar fallo<br/>/reportar-fallo · sin enlace"]
    end
    subgraph BUY["Proceso de compra (requiere sesión)"]
        r_checkout["Datos de envío<br/>/checkout"]
        r_pago["Pago (tarjeta o PSE)<br/>/pago"]
        r_confirmacion["Confirmación del pedido<br/>/confirmacion"]
    end
    r_cliente["Mi Resumen<br/>/cliente"]
    r_vendedor["Panel Principal<br/>/vendedor"]
    r_admin["Resumen<br/>/admin"]
    r_inicio -->|menú| r_catalogo
    r_inicio -->|menú| r_nosotros
    r_inicio -->|menú| r_contacto
    r_inicio -->|ícono carrito| r_carrito
    r_inicio -->|Ingresar| r_login
    r_catalogo -->|ver tela| r_producto_id
    r_producto_id -->|agregar| r_carrito
    r_login -->|crear cuenta| r_registro
    r_registro -.->|cuenta creada| r_inicio
    r_carrito -->|Proceder al pago| r_checkout
    r_checkout -->|Confirmar pedido| r_pago
    r_pago -->|pago aprobado| r_confirmacion
    r_login -->|rol cliente| r_cliente
    r_login -->|rol vendedor| r_vendedor
    r_login -->|rol admin| r_admin
    classDef orphan stroke-dasharray: 5 5,fill:#fff,color:#555
    class r_reportar_fallo orphan
```

### 2.2. Panel del cliente

```mermaid
flowchart LR
    r_cliente["Mi Resumen<br/>/cliente"]
    subgraph CLIENTE_1["Compras"]
        r_cliente_pedidos["Historial de Pedidos<br/>/cliente/pedidos"]
        r_cliente_pedidos_rastreo["Rastrear Envío<br/>/cliente/pedidos/rastreo"]
    end
    r_cliente --> CLIENTE_1
    subgraph CLIENTE_2["Mi Colección"]
        r_cliente_coleccion["Lista de Deseos<br/>/cliente/coleccion"]
        r_cliente_coleccion_calculadora["Calculadora de Metraje<br/>/cliente/coleccion/calculadora"]
    end
    r_cliente --> CLIENTE_2
    subgraph CLIENTE_3["Ayuda"]
        r_cliente_soporte_tickets["Mis Tickets<br/>/cliente/soporte/tickets"]
        r_cliente_soporte_nuevo["Reportar Problema<br/>/cliente/soporte/nuevo"]
    end
    r_cliente --> CLIENTE_3
    subgraph CLIENTE_4["Ajustes"]
        r_cliente_configuracion["Mi Perfil<br/>/cliente/configuracion"]
        r_cliente_configuracion_direcciones["Libreta de Direcciones<br/>/cliente/configuracion/direcciones"]
    end
    r_cliente --> CLIENTE_4
    r_cliente_perfil["Perfil (duplicado)<br/>/cliente/perfil · sin enlace"]
    r_cliente -.-> r_cliente_perfil
    classDef orphan stroke-dasharray: 5 5,fill:#fff,color:#555
    class r_cliente_perfil orphan
    style r_cliente fill:#E8F3EA,stroke:#2F7D45,stroke-width:2px
```

### 2.3. Panel del vendedor

```mermaid
flowchart LR
    r_vendedor["Panel Principal<br/>/vendedor"]
    subgraph VENDEDOR_1["Inventario"]
        r_vendedor_productos["Mis Productos<br/>/vendedor/productos"]
        r_vendedor_stock["Alertas de Stock<br/>/vendedor/stock"]
    end
    r_vendedor --> VENDEDOR_1
    subgraph VENDEDOR_2["Ventas"]
        r_vendedor_pedidos["Gestión de Pedidos<br/>/vendedor/pedidos"]
    end
    r_vendedor --> VENDEDOR_2
    r_vendedor_configuracion["Configuración<br/>/vendedor/configuracion"]
    r_vendedor --> r_vendedor_configuracion
    style r_vendedor fill:#FBF1E3,stroke:#A8641A,stroke-width:2px
```

### 2.4. Panel del administrador

```mermaid
flowchart LR
    r_admin["Resumen<br/>/admin"]
    subgraph ADMIN_1["Usuarios"]
        r_admin_usuarios["Gestión de Usuarios<br/>/admin/usuarios"]
        r_admin_vendedores["Vendedores<br/>/admin/vendedores"]
        r_admin_clientes["Clientes<br/>/admin/clientes"]
    end
    r_admin --> ADMIN_1
    subgraph ADMIN_2["Catálogo"]
        r_admin_productos["Productos<br/>/admin/productos"]
        r_admin_carrusel["Carrusel<br/>/admin/carrusel"]
        r_admin_home["Página Inicio<br/>/admin/home"]
    end
    r_admin --> ADMIN_2
    subgraph ADMIN_3["Inventario"]
        r_admin_inventario_lotes["Control de Lotes<br/>/admin/inventario/lotes"]
        r_admin_inventario_merma["Calculadora de Merma<br/>/admin/inventario/merma"]
        r_admin_inventario_alertas["Alertas de Stock<br/>/admin/inventario/alertas"]
        r_admin_inventario_historial["Historial de Movimientos<br/>/admin/inventario/historial"]
    end
    r_admin --> ADMIN_3
    subgraph ADMIN_4["Moderación"]
        r_admin_moderacion_aprobacion["Cola de Aprobación<br/>/admin/moderacion/aprobacion"]
        r_admin_moderacion_vendedores["Rendimiento<br/>/admin/moderacion/vendedores"]
    end
    r_admin --> ADMIN_4
    subgraph ADMIN_5["Analítica"]
        r_admin_analytics_mapa_ventas["Mapa de Ventas<br/>/admin/analytics/mapa-ventas"]
        r_admin_analytics_rotacion["Rotación de Inventario<br/>/admin/analytics/rotacion"]
        r_admin_analytics_devoluciones["Análisis de Devoluciones<br/>/admin/analytics/devoluciones"]
        r_admin_analytics_proyeccion["Proyección de Ingresos<br/>/admin/analytics/proyeccion"]
    end
    r_admin --> ADMIN_5
    subgraph ADMIN_6["Soporte"]
        r_admin_soporte_tickets["Gestión de Tickets<br/>/admin/soporte/tickets"]
        r_admin_soporte_cupones["Crear Cupones<br/>/admin/soporte/cupones"]
    end
    r_admin --> ADMIN_6
    r_admin_facturas["Facturación<br/>/admin/facturas"]
    r_admin --> r_admin_facturas
    r_admin_reportes["Reportes<br/>/admin/reportes"]
    r_admin --> r_admin_reportes
    r_admin_configuracion["Configuración<br/>/admin/configuracion"]
    r_admin --> r_admin_configuracion
    r_admin_actividad["Actividad reciente<br/>/admin/actividad · sin enlace"]
    r_admin -.-> r_admin_actividad
    classDef orphan stroke-dasharray: 5 5,fill:#fff,color:#555
    class r_admin_actividad orphan
    style r_admin fill:#E8EEF9,stroke:#3B5BA9,stroke-width:2px
```

## 3. Inventario de rutas

| # | Ruta | Pantalla | Componente | Acceso | Cómo se llega |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `/` | Inicio | `Inicio` | Pública | Logo y menú superior |
| 2 | `/catalogo` | Catálogo | `Catalogo` | Pública | Menú superior y pie de página |
| 3 | `/producto/:id` | Detalle de tela | `DetalleProducto` | Pública | Tarjeta de producto en Catálogo o Inicio |
| 4 | `/carrito` | Carrito | `Carrito` | Pública | Ícono del carrito en el encabezado |
| 5 | `/nosotros` | Nosotros | `About` | Pública | Menú superior y pie de página |
| 6 | `/contacto` | Contacto | `Contact` | Pública | Menú superior y pie de página |
| 7 | `/login` | Iniciar sesión | `IniciarSesion` | Pública | Botón Ingresar del encabezado; redirección de rutas protegidas |
| 8 | `/registro` | Registro | `Registro` | Pública | Enlace desde Iniciar sesión |
| 9 | `/reportar-fallo` | Reportar fallo | `BugReport` | Pública | Ningún enlace (solo escribiendo la URL) |
| 10 | `/pago` | Pago (tarjeta o PSE) | `Payment` | Cualquier usuario con sesión | Botón «Confirmar pedido» en Datos de envío |
| 11 | `/checkout` | Datos de envío | `Pago` | Cualquier usuario con sesión | Botón «Proceder al pago» del carrito |
| 12 | `/confirmacion` | Confirmación del pedido | `ConfirmacionPedido` | Cualquier usuario con sesión | Automático tras un pago aprobado (tarjeta o PSE) |
| 13 | `/cliente` | Mi Resumen | `PanelCliente` | Cliente | Inicio de sesión con rol cliente; menú de usuario del encabezado |
| 14 | `/cliente/perfil` | Perfil (duplicado) | `Perfil` | Cliente | Ningún enlace (solo escribiendo la URL) |
| 15 | `/cliente/pedidos` | Historial de Pedidos | `ClientOrderHistory` | Cliente | Menú lateral › Compras › Historial de Pedidos |
| 16 | `/cliente/pedidos/rastreo` | Rastrear Envío | `SeguimientoPedido` | Cliente | Menú lateral › Compras › Rastrear Envío |
| 17 | `/cliente/coleccion` | Lista de Deseos | `Wishlist` | Cliente | Menú lateral › Mi Colección › Lista de Deseos |
| 18 | `/cliente/coleccion/calculadora` | Calculadora de Metraje | `ProjectCalculator` | Cliente | Menú lateral › Mi Colección › Calculadora de Metraje |
| 19 | `/cliente/soporte/nuevo` | Reportar Problema | `NewReport` | Cliente | Menú lateral › Ayuda › Reportar Problema |
| 20 | `/cliente/soporte/tickets` | Mis Tickets | `MyTickets` | Cliente | Menú lateral › Ayuda › Mis Tickets |
| 21 | `/cliente/configuracion` | Mi Perfil | `Perfil` | Cliente | Menú lateral › Ajustes › Mi Perfil |
| 22 | `/cliente/configuracion/direcciones` | Libreta de Direcciones | `AddressBook` | Cliente | Menú lateral › Ajustes › Libreta de Direcciones |
| 23 | `/vendedor` | Panel Principal | `ProductosVendedor` | Vendedor y admin | Inicio de sesión con rol vendedor |
| 24 | `/vendedor/productos` | Mis Productos | `ProductosVendedor` | Vendedor y admin | Menú lateral › Inventario › Mis Productos |
| 25 | `/vendedor/pedidos` | Gestión de Pedidos | `PedidosVendedor` | Vendedor y admin | Menú lateral › Ventas › Gestión de Pedidos |
| 26 | `/vendedor/stock` | Alertas de Stock | `StockAlerts` | Vendedor y admin | Menú lateral › Inventario › Alertas de Stock |
| 27 | `/vendedor/configuracion` | Configuración | `Perfil` | Vendedor y admin | Menú lateral › Configuración |
| 28 | `/admin` | Resumen | `ResumenAdmin` | Admin | Inicio de sesión con rol admin; menú de usuario del encabezado |
| 29 | `/admin/usuarios` | Gestión de Usuarios | `GestionUsuarios` | Admin | Menú lateral › Usuarios › Gestión de Usuarios |
| 30 | `/admin/vendedores` | Vendedores | `MetricasVendedor` | Admin | Menú lateral › Usuarios › Vendedores |
| 31 | `/admin/clientes` | Clientes | `MetricasCliente` | Admin | Menú lateral › Usuarios › Clientes |
| 32 | `/admin/productos` | Productos | `ProductosAdmin` | Admin | Menú lateral › Catálogo › Productos |
| 33 | `/admin/carrusel` | Carrusel | `GestionarCarrusel` | Admin | Menú lateral › Catálogo › Carrusel |
| 34 | `/admin/home` | Página Inicio | `GestionarInicio` | Admin | Menú lateral › Catálogo › Página Inicio |
| 35 | `/admin/facturas` | Facturación | `FacturasAdmin` | Admin | Menú lateral › Facturación |
| 36 | `/admin/reportes` | Reportes | `ReportesAdmin` | Admin | Menú lateral › Reportes |
| 37 | `/admin/actividad` | Actividad reciente | `ActividadAdmin` | Admin | Ningún enlace (solo escribiendo la URL) |
| 38 | `/admin/inventario/lotes` | Control de Lotes | `ControlLotes` | Admin | Menú lateral › Inventario › Control de Lotes |
| 39 | `/admin/inventario/merma` | Calculadora de Merma | `CalculadoraMerma` | Admin | Menú lateral › Inventario › Calculadora de Merma |
| 40 | `/admin/inventario/alertas` | Alertas de Stock | `ConfiguracionStock` | Admin | Menú lateral › Inventario › Alertas de Stock |
| 41 | `/admin/inventario/historial` | Historial de Movimientos | `HistorialMovimientos` | Admin | Menú lateral › Inventario › Historial de Movimientos |
| 42 | `/admin/moderacion/aprobacion` | Cola de Aprobación | `ColaAprobacion` | Admin | Menú lateral › Moderación › Cola de Aprobación |
| 43 | `/admin/moderacion/vendedores` | Rendimiento | `RendimientoVendedores` | Admin | Menú lateral › Moderación › Rendimiento |
| 44 | `/admin/analytics/mapa-ventas` | Mapa de Ventas | `MapaVentas` | Admin | Menú lateral › Analítica › Mapa de Ventas |
| 45 | `/admin/analytics/rotacion` | Rotación de Inventario | `RankingRotacion` | Admin | Menú lateral › Analítica › Rotación de Inventario |
| 46 | `/admin/analytics/devoluciones` | Análisis de Devoluciones | `AnalisisDevoluciones` | Admin | Menú lateral › Analítica › Análisis de Devoluciones |
| 47 | `/admin/analytics/proyeccion` | Proyección de Ingresos | `ProyeccionIngresos` | Admin | Menú lateral › Analítica › Proyección de Ingresos |
| 48 | `/admin/soporte/tickets` | Gestión de Tickets | `GestionTickets` | Admin | Menú lateral › Soporte › Gestión de Tickets |
| 49 | `/admin/soporte/cupones` | Crear Cupones | `CreacionCupones` | Admin | Menú lateral › Soporte › Crear Cupones |
| 50 | `/admin/configuracion` | Configuración | `ConfiguracionSistema` | Admin | Menú lateral › Configuración |

## 4. Observaciones de navegación

1. **Rutas sin enlace.** `/reportar-fallo`, `/cliente/perfil` y `/admin/actividad` existen en `App.jsx` pero ningún menú, botón ni enlace lleva a ellas. Hay que enlazarlas o eliminarlas.
2. **Pantallas duplicadas.** `/cliente/perfil` y `/cliente/configuracion` cargan el mismo componente `Perfil`; `/vendedor` y `/vendedor/productos` cargan el mismo `ProductosVendedor`, así que el «Panel Principal» del vendedor no es un resumen sino la lista de productos.
3. **Nombres cruzados en el pago.** `/checkout` usa el archivo `Pago.jsx` (datos de envío) y `/pago` usa `payment/Payment.jsx` (tarjeta o PSE). Conviene renombrar los archivos para que coincidan con la ruta.
4. **El login no regresa a la compra.** `IniciarSesion.jsx` guarda la ruta pedida en `from`, pero solo la usa si el rol no es cliente, vendedor ni admin. En la práctica, un cliente que pulsa «Proceder al pago» sin sesión termina en `/cliente` en vez de volver a `/checkout`.
5. **Destino distinto para el vendedor.** Tras el login va a `/vendedor`, pero el menú de usuario del encabezado lo lleva a `/vendedor/productos`.
6. **Documentación anterior.** La sección 4 de `03-arquitectura-frontend-y-roles.md` menciona `/contactos` y `/checkout/success`, que no existen; las rutas reales son `/contacto` y `/confirmacion`.
