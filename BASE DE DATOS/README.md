# Documentación Técnica de Base de Datos y Arquitectura MVC
**Proyecto:** Plataforma Digital de Telas y Control Logístico (D&D Textil)  
**Programa de Formación:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) - SENA  
**Motor de Base de Datos:** PostgreSQL 17 (UTF-8)  
**Patrón Arquitectónico:** Modelo-Vista-Controlador (MVC) / Arquitectura Limpia  
**Versión:** 2.0.0 Oficial SENA  

---

## 1. Estructura del Directorio `BASE DE DATOS/`

Este directorio contiene los artefactos de inicialización, definición DDL, datos semilla y respaldos de la base de datos relacional para el entorno productivo y de desarrollo:

* **`01_esquema_espanol.sql`**: Script DDL principal que define las 29 tablas relacionales en español, sus restricciones de integridad (`PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`), valores por defecto y tipos de datos numéricos de alta precisión para textiles y moneda.
* **`02_datos_iniciales.sql`**: Script DML con datos iniciales para categorías textiles, telas base de alta rotación, usuarios con roles tipificados (Administrador, Vendedor, Cliente), métricas y configuración global del sistema.
* **`legado/TIENDA DIGITAL TEXTIL.sql`**: Volcado antiguo con las tablas en inglés. Está en una subcarpeta para que Docker no lo ejecute al iniciar la base de datos; el backend no lo usa.
* **`README.md`**: Este documento de especificación formal del **Modelo Relacional** y el patrón **Modelo-Vista-Controlador (MVC)**.

---

## 2. Modelo Relacional Formal

El modelo de datos relacional de **D&D Textil** se encuentra normalizado hasta la **Tercera Forma Normal (3FN)**, eliminando redundancias atómicas y dependencias transitivas. Permite modelar el negocio textil con trazabilidad de compras por metro lineal, inventario fraccionado, alertas de stock mínimo y órdenes de pedido.

### 2.1. Diagrama Gráfico Vectorial del Modelo Relacional

A continuación se presenta el **diagrama entidad-relación** de las 29 tablas, agrupadas por módulo con colores, con sus 25 llaves foráneas. Se genera directamente desde `01_esquema_espanol.sql` con `documentacion/diagramas/fuentes/generar_der.py`, así que siempre coincide con el esquema:

![Diagrama entidad-relación - D&D Textil](../documentacion/diagramas/der_simple.svg)

> **Nota:** La versión con todas las columnas está en [der_completo.svg](../documentacion/diagramas/der_completo.svg). Los archivos `diagramas/modelo_relacional.svg` y `diagramas/modelo_relacional_actualizado.svg` son versiones anteriores que no incluyen las tablas agregadas en noviembre; ya nada los enlaza y se pueden borrar. El visor [`diagramas/visor_interactivo_mvc_relacional.html`](diagramas/visor_interactivo_mvc_relacional.html) muestra el DER actual y la arquitectura.

---

### 2.2. Notación Formal del Esquema Relacional

En la notación relacional, cada tabla se define con su nombre, atributos, claves primarias (**PK**) subrayadas y claves foráneas (**FK**) con indicación de la tabla referenciada:

1. **`CATEGORIAS`**  
   `CATEGORIAS(`<u>`id`</u>, `nombre` [UK], `descripcion`, `creado_en`)

2. **`USUARIOS`**  
   `USUARIOS(`<u>`id`</u>, `nombre`, `correo` [UK], `telefono`, `contrasena_hash`, `rol`, `activo`, `suspendido`, `motivo_suspension`, `tasa_comision`, `registrado_en`, `ultimo_acceso`)

3. **`PRODUCTOS`**  
   `PRODUCTOS(`<u>`id`</u>, `nombre`, `categoria_id` [FK &rarr; `CATEGORIAS.id`], `precio`, `vendedor_id` [FK &rarr; `USUARIOS.id`], `descripcion`, `material`, `ancho`, `peso`, `cuidados`, `stock`, `destacado`, `activo`, `estado_moderacion`, `motivo_rechazo`, `es_nueva_coleccion`, `es_exclusivo`, `es_oferta`, `creado_en`, `actualizado_en`)

4. **`IMAGENES_PRODUCTO`**  
   `IMAGENES_PRODUCTO(`<u>`id`</u>, `producto_id` [FK &rarr; `PRODUCTOS.id`], `url_imagen`, `orden_visualizacion`)

5. **`LOTES_INVENTARIO`**  
   `LOTES_INVENTARIO(`<u>`id`</u>, `producto_id` [FK &rarr; `PRODUCTOS.id`], `numero_lote`, `metros_recibidos`, `metros_actuales`, `costo_por_metro`, `proveedor`, `estado`, `fecha_recepcion`, `notas`, `creado_en`)

6. **`EVENTOS_MERMA`**  
   `EVENTOS_MERMA(`<u>`id`</u>, `producto_id` [FK &rarr; `PRODUCTOS.id`], `id_lote`, `metros_perdidos`, `motivo`, `descripcion`, `impacto_costo`, `responsable`, `usuario_id` [FK &rarr; `USUARIOS.id`], `creado_en`)

7. **`UMBRALES_STOCK`**  
   `UMBRALES_STOCK(`<u>`id`</u>, `tipo_tela` [UK], `metros_minimos`, `alerta_activa`)

8. **`CUPONES`**  
   `CUPONES(`<u>`id`</u>, `codigo` [UK], `tipo_descuento`, `valor_descuento`, `expira_en`, `compra_minima`, `usos_maximos`, `solo_primera_vez`, `conteo_usos`, `activo`, `creado_en`)

9. **`CATEGORIAS_CUPON`**  
   `CATEGORIAS_CUPON(`<u>`id`</u>, `cupon_id` [FK &rarr; `CUPONES.id`], `categoria_id` [FK &rarr; `CATEGORIAS.id`])

10. **`PEDIDOS`**  
    `PEDIDOS(`<u>`id`</u>, `usuario_id` [FK &rarr; `USUARIOS.id`], `vendedor_id` [FK &rarr; `USUARIOS.id`], `nombre_cliente`, `correo_cliente`, `telefono_cliente`, `documento_cliente`, `direccion_envio`, `ciudad_envio`, `departamento_envio`, `monto_total`, `subtotal`, `monto_impuesto`, `costo_envio`, `monto_descuento`, `codigo_cupon`, `estado`, `metodo_pago`, `estado_pago`, `referencia_pago` [UK], `monto_centavos`, `moneda`, `wompi_transaccion_id`, `pagado_en`, `numero_guia`, `notas`, `creado_en`, `actualizado_en`)

11. **`ITEMS_PEDIDO`**  
    `ITEMS_PEDIDO(`<u>`id`</u>, `pedido_id` [FK &rarr; `PEDIDOS.id`], `producto_id` [FK &rarr; `PRODUCTOS.id`], `cantidad`, `precio_por_metro`, `subtotal`)

12. **`ITEMS_CARRITO`**  
    `ITEMS_CARRITO(`<u>`id`</u>, `usuario_id` [FK &rarr; `USUARIOS.id`], `producto_id` [FK &rarr; `PRODUCTOS.id`], `cantidad`, `agregado_en`, `actualizado_en`)

13. **`RESENAS`**  
    `RESENAS(`<u>`id`</u>, `producto_id` [FK &rarr; `PRODUCTOS.id`], `usuario_id` [FK &rarr; `USUARIOS.id`], `calificacion`, `comentario`, `creado_en`)

14. **`TICKETS_SOPORTE`**  
    `TICKETS_SOPORTE(`<u>`id`</u>, `usuario_id` [FK &rarr; `USUARIOS.id`], `pedido_id` [FK &rarr; `PEDIDOS.id`], `nombre_usuario`, `correo_usuario`, `categoria`, `asunto`, `descripcion`, `estado`, `prioridad`, `asignado_a` [FK &rarr; `USUARIOS.id`], `creado_en`, `actualizado_en`, `resuelto_en`)

15. **`REPORTES_ERRORES`**  
    `REPORTES_ERRORES(`<u>`id`</u>, `vendedor_id` [FK &rarr; `USUARIOS.id`], `nombre_vendedor`, `correo_reportante`, `titulo`, `area`, `severidad`, `producto_id` [FK &rarr; `PRODUCTOS.id`], `nombre_producto`, `descripcion`, `pasos`, `estado`, `prioridad`, `asignado_a` [FK &rarr; `USUARIOS.id`], `reportado_en`, `resuelto_en`)

16. **`CONFIGURACION_SISTEMA`**  
    `CONFIGURACION_SISTEMA(`<u>`id`</u>, `clave` [UK], `valor`, `actualizado_en`)

17. **`SECCIONES_INICIO`**  
    `SECCIONES_INICIO(`<u>`id`</u>, `clave` [UK], `titulo`, `subtitulo`, `activo`, `orden`, `creado_en`)

18. **`DIAPOSITIVAS_CARRUSEL`**  
    `DIAPOSITIVAS_CARRUSEL(`<u>`id`</u>, `titulo`, `subtitulo`, `imagen`, `cta`, `clave_seccion`, `activo`, `orden`, `creado_en`)

19. **`BANNER_GLOBAL`**  
    `BANNER_GLOBAL(`<u>`id`</u>, `activo`, `mensaje`, `tipo_banner`, `actualizado_en`)

20. **`METRICAS_VENTAS_ERP`**  
    `METRICAS_VENTAS_ERP(`<u>`id`</u>, `fecha_registro` [UK], `ventas_reales`, `ventas_objetivo`, `margen_ganancia`, `creado_en`)

21. **`VENTAS_DIARIAS`**  
    `VENTAS_DIARIAS(`<u>`id`</u>, `fecha_venta` [UK], `ventas_totales`, `pedidos_totales`, `creado_en`)

22. **`VENTAS_REGION`**  
    `VENTAS_REGION(`<u>`id`</u>, `region` [UK], `capital`, `ventas_totales`, `pedidos_totales`, `porcentaje`, `creado_en`)

23. **`ACTIVIDAD_RECIENTE`**  
    `ACTIVIDAD_RECIENTE(`<u>`id`</u>, `tipo`, `usuario_id` [FK &rarr; `USUARIOS.id`], `nombre_usuario`, `accion`, `creado_en`)

24. **`NOTIFICACIONES_SISTEMA_ERP`**  
    `NOTIFICACIONES_SISTEMA_ERP(`<u>`id`</u>, `tipo`, `titulo`, `mensaje`, `leido`, `creado_en`)

25. **`INVENTARIO_TELAS_ERP`**  
    `INVENTARIO_TELAS_ERP(`<u>`id`</u>, `sku` [UK], `nombre_tela`, `categoria`, `proveedor`, `metros_actuales`, `metros_minimos`, `costo_por_metro`, `fecha_ultima_reposicion`)

26. **`ROLLOS_TEXTIL`**  
    `ROLLOS_TEXTIL(`<u>`id`</u>, `producto_id` [FK &rarr; `PRODUCTOS.id`], `codigo_rollo` [UK], `metraje_inicial`, `metraje_remanente`, `lote_tintoreria`, `estado`, `ubicacion_bodega`, `creado_en`, `actualizado_en`)

27. **`EVENTOS_PAGO_WOMPI`**  
    `EVENTOS_PAGO_WOMPI(`<u>`id`</u>, `referencia_pago`, `transaccion_id`, `estado`, `origen`, `resultado`, `carga_util`, `recibido_en`)

28. **`DIRECCIONES_USUARIO`**  
    `DIRECCIONES_USUARIO(`<u>`id`</u>, `usuario_id` [FK &rarr; `USUARIOS.id`], `etiqueta`, `nombre_destinatario`, `telefono`, `direccion`, `ciudad`, `departamento`, `codigo_postal`, `predeterminada`, `creado_en`)

29. **`AUDITORIA_SISTEMA`**  
    `AUDITORIA_SISTEMA(`<u>`id`</u>, `usuario_id`, `rol`, `accion`, `recurso`, `ip_origen`, `detalles`, `fecha_creacion`)

---

### 2.3. Diagrama Entidad-Relación (DER)

El DER completo (29 tablas, 25 llaves foráneas y cardinalidad) está en [documentacion/08-modelo-entidad-relacion.md](../documentacion/08-modelo-entidad-relacion.md), en imagen y en versión Mermaid. El diccionario de datos de todas las tablas está en [documentacion/04-base-de-datos-diseno-y-esquema.md](../documentacion/04-base-de-datos-diseno-y-esquema.md).

### 2.4. Vistas de Base de Datos (SQL Views)

El esquema actual **no define vistas SQL**. Las consultas de agregación (métricas, alertas de stock, facturas) están en los DAO del backend, principalmente `InventarioDAO` y `PedidoDAO`.

---

## 3. Arquitectura Modelo-Vista-Controlador (MVC)

El sistema **D&D Textil** implementa una variante robusta y desacoplada del patrón arquitectónico **Modelo-Vista-Controlador (MVC)**, adecuada para plataformas web modernas y aplicaciones distribuidas (ADSO - SENA).

### 3.1. Diagrama Gráfico Vectorial de la Arquitectura MVC

El siguiente diagrama visual ilustra la arquitectura de tres capas, los componentes de software de cada capa, los canales de comunicación HTTP REST/JSON y JDBC, y el flujo de datos transaccional:

![Arquitectura Modelo-Vista-Controlador (MVC) - D&D Textil](diagramas/arquitectura_mvc.svg)

> **Nota:** Puedes hacer clic o abrir directamente el archivo vectorial en alta definición: [arquitectura_mvc.svg](diagramas/arquitectura_mvc.svg).

---

### 3.2. Diagrama de Flujo Arquitectónico MVC (Interacción entre Capas)

```mermaid
flowchart TD
    classDef vistaStyle fill:#065f46,stroke:#10b981,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef controllerStyle fill:#1e40af,stroke:#3b82f6,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef modelStyle fill:#581c87,stroke:#8b5cf6,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef actorStyle fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#ffffff,font-family:sans-serif;

    User["Usuario / Navegador Web / App Móvil"]:::actorStyle

    subgraph VISTA ["1. CAPA VISTA (View - React 18 + TailwindCSS)"]
        direction TB
        UI_Store["Tienda Pública & Catálogo<br/>(Catalogo.jsx, Carrito.jsx, Payment.jsx)"]:::vistaStyle
        UI_Admin["Paneles de Gestión por Rol<br/>(AdminDashboard, SellerDashboard, MesaCorte)"]:::vistaStyle
        UI_Context["Estado Global Reactivo<br/>(ContextoAutenticacion, ContextoCarrito)"]:::vistaStyle
        UI_Store --> UI_Context
        UI_Admin --> UI_Context
    end

    subgraph CONTROLADOR ["2. CAPA CONTROLADOR (Controller - Java 21 HttpServer)"]
        direction TB
        BaseHandler["ManejadorBase<br/>(CORS, Rate Limit 1200 req/min, Correlation-ID)"]:::controllerStyle
        Handlers["Manejadores REST Especializados<br/>(ManejadorProductos, ManejadorPedidos, ManejadorInventario)"]:::controllerStyle
        Gson["Transformador JSON<br/>(Google Gson DTOs Bidireccionales)"]:::controllerStyle
        BaseHandler --> Handlers
        Handlers --- Gson
    end

    subgraph MODELO ["3. CAPA MODELO (Model - Java Domain + JDBC DAOs)"]
        direction TB
        Domain["Entidades de Negocio y Servicios<br/>(Producto, Pedido, RolloTextil, ServicioCorteTextil)"]:::modelStyle
        DAOs["DAOs de Persistencia JDBC<br/>(ProductoDAO, PedidoDAO, InventarioDAO, PagoWompiDAO)"]:::modelStyle
        PoolCon["Pool de Conexiones propio<br/>(Conexion.java, 24 por defecto)"]:::modelStyle
        Domain --> DAOs
        DAOs --> PoolCon
    end

    subgraph PERSISTENCIA ["4. CAPA DE BASE DE DATOS"]
        Postgres[("PostgreSQL 17<br/>29 Tablas Relacionales, Índices B-Tree, SELECT FOR UPDATE")]:::modelStyle
    end

    %% Flujo ordenado de capas
    User -->|"1. Eventos y Formularios"| VISTA
    VISTA -->|"2. Peticiones HTTP REST / JSON"| CONTROLADOR
    CONTROLADOR -->|"3. Ejecuta Casos de Uso y Validaciones"| MODELO
    MODELO -->|"4. Sentencias SQL Transaccionales"| PERSISTENCIA
    PERSISTENCIA -.->|"5. ResultSet Relacional"| MODELO
    MODELO -.->|"6. Entidades POJO Validadas"| CONTROLADOR
    CONTROLADOR -.->|"7. Respuestas JSON HTTP 200/201"| VISTA
```

---

### 3.1. Componente M: El Modelo (Model)

El **Modelo** es el núcleo de la lógica de negocio y la persistencia de datos. Contiene los datos puros, las reglas de integridad y el acceso a la base de datos:

1. **Persistencia Relacional (PostgreSQL 17):**
   * Almacenamiento seguro, índices B-Tree de alto rendimiento, transacciones ACID y bloqueos a nivel de fila (`SELECT ... FOR UPDATE`) para evitar condiciones de carrera en compras simultáneas de tela.
2. **Entidades de Dominio (`dominio.modelos.*`):**
   * 19 clases Java en `dominio.modelos` (`Producto`, `Pedido`, `Usuario`, `ItemCarrito`, `RolloTextil`, `LoteInventario`, `EventoMerma`, `Cupon`, `Resena`, `TicketSoporte`, entre otras, y el registro `TransaccionWompi`).
   * Manejo bilingüe con anotaciones `@SerializedName` de Google Gson para serialización transparente.
3. **Objetos de Acceso a Datos (`infraestructura.persistencia.jdbc.*`):**
   * DAOs especializados (`ProductoDAO`, `PedidoDAO`, `InventarioDAO`, `CarritoDAO`, `JdbcRepositorioUsuarioImpl`, `CuponDAO`).
   * Consultas SQL parametrizadas mediante `PreparedStatement` para mitigar ataques de inyección SQL (OWASP Top 10).

---

### 3.2. Componente V: La Vista (View)

La **Vista** es la interfaz visual reactiva con la que interactúan los diferentes actores del sistema (Clientes, Vendedores, Administradores):

1. **Frontend React 18 + Vite:**
   * Estructura SPA (Single Page Application) modular y desacoplada del backend.
   * Estilizado con Tailwind CSS bajo principios de ergonomía visual y accesibilidad (WCAG 2.1).
2. **Componentes Clave de Vista:**
   * `src/paginas/Catalogo.jsx`: Renderizado del catálogo textil con filtros dinámicos por tipo de tela y precio.
   * `src/paginas/Carrito.jsx`: Carrito con cálculo de totales y aplicación de cupones.
   * `src/paginas/admin/ResumenAdmin.jsx`: Panel de control con gráficos Recharts para métricas comerciales.
   * `src/paginas/admin/Inventario/ConfiguracionStock.jsx`: Vista de configuración de umbrales y alertas de stock.
3. **Consumo Desacoplado:**
   * La Vista no accede jamás de forma directa a la base de datos; delega toda obtención de información mediante peticiones asíncronas `fetch()` hacia la API REST.

---

### 3.3. Componente C: El Controlador (Controller)

El **Controlador** actúa como puente intermediario e inteligente entre la Vista y el Modelo. Recibe las peticiones HTTP, orquesta las validaciones de seguridad y coordina el flujo de respuesta:

1. **Manejador Base (`ManejadorBase.java`):**
   * Hereda de `HttpHandler` del servidor embebido de Java.
   * Aplica políticas DevSecOps globales: cabeceras CORS dinámicas, Rate Limiting per cápita (1200 req/min por IP), inyección de `X-Correlation-ID` para trazabilidad y logs estructurados en JSON.
2. **Controladores Especializados (`infraestructura.api.manejadores.*`):**
   * `ManejadorProductos`: Gestiona las rutas `/api/productos` (GET, POST, PUT, DELETE).
   * `ManejadorPedidos`: Orquesta la creación transaccional de órdenes, validando stock disponible y calculando totales con impuestos.
   * `ManejadorInventario`: Procesa métricas de lotes, mermas, umbrales y ventas regionales.
   * `ManejadorCarrito`: Gestiona las adiciones, actualizaciones y vaciado del carrito de compras.
   * `ManejadorSalud`: Expone `/health/live` y `/health/ready` para auditoría y observabilidad en Docker.

---

### 3.4. Ciclo de Vida de una Petición (Ejemplo: Compra de Tela)

A continuación se ilustra la interacción coordinada entre la Vista, el Controlador, el Modelo y la Base de Datos con el endpoint `POST /api/pedidos` (`PedidoDAO`).

> **Nota:** el checkout de la tienda no usa este endpoint sino `POST /api/pagos/intencion` (`PagoWompiDAO`), que valida el stock sin descontarlo y lo descuenta al aprobar el pago (ver `documentacion/12-diagramas-de-secuencia.md`).

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Usuario (Navegador)
    participant Vista as Vista (React: Catalogo / Carrito)
    participant Controlador as Controlador (Java: ManejadorPedidos)
    participant Modelo as Modelo (PedidoDAO / ProductoDAO)
    participant BD as PostgreSQL 17 (DB)

    Cliente->>Vista: Clic en "Confirmar Pedido"
    Vista->>Controlador: POST /api/pedidos (JSON: clienteId, articulos, total)
    Note over Controlador: ManejadorBase valida CORS, Rate Limit y genera Correlation-ID
    Controlador->>Modelo: crearPedido(clienteId, total, articulos)
    Modelo->>BD: BEGIN TRANSACTION
    Modelo->>BD: SELECT id, stock FROM productos WHERE id = ? FOR UPDATE
    BD-->>Modelo: Stock actual disponible
    alt Stock suficiente
        Modelo->>BD: INSERT INTO pedidos (...) VALUES (...)
        Modelo->>BD: INSERT INTO items_pedido (...) VALUES (...)
        Modelo->>BD: UPDATE productos SET stock = stock - ? WHERE id = ?
        Modelo->>BD: COMMIT TRANSACTION
        Modelo-->>Controlador: idPedido generado (> 0)
        Controlador-->>Vista: HTTP 201 Created {"success": true, "orderId": 12}
        Vista-->>Cliente: Notificación exitosa y factura generada
    else Stock insuficiente
        Modelo->>BD: ROLLBACK TRANSACTION
        Modelo-->>Controlador: -1 (la excepción de stock se registra en el log)
        Controlador-->>Vista: HTTP 500 {"error": "Error al crear el pedido"}
        Vista-->>Cliente: Alerta visual de metros no disponibles
    end
```

---

## 4. Guía de Ejecución y Pruebas con Docker

Para levantar y probar la base de datos junto con el backend y frontend en un entorno contenedorizado e idéntico a producción:

```bash
# 1. Posicionarse en la raíz del proyecto
cd PROYECTO-SENA-TIENDA-TEXTIL-

# 2. Iniciar los contenedores con Docker Compose
docker compose up -d

# 3. Comprobar que los contenedores estén activos y saludables
docker compose ps

# 4. Probar endpoints del Modelo y Controlador
curl -s http://localhost:8081/health/live
curl -s http://localhost:8081/api/productos
curl -s http://localhost:8081/api/inventario/umbrales
curl -s http://localhost:8081/api/metricas/regiones

# 5. Verificar logs del backend en tiempo real
docker compose logs -f backend
```

---

*Documento técnico oficial para la sustentación y entrega de evidencias de Base de Datos y Arquitectura de Software (SENA ADSO).*
