# Diagramas de secuencia — D&D Textil

> Cada diagrama sigue el código real, llamada por llamada: componentes de React, manejadores, servicios, DAO y las consultas SQL. Donde el comportamiento difiere de lo que dicen los requisitos, el diagrama lo marca con una nota.

| # | Flujo | Caso de uso | Archivos principales |
| :-: | :--- | :--- | :--- |
| 1 | Iniciar sesión | CU-04 | `IniciarSesion.jsx`, `ContextoAutenticacion.jsx`, `ManejadorAutenticacion`, `ServicioAutenticacion`, `JdbcRepositorioUsuarioImpl` |
| 2 | Registrarse | CU-03 | `Registro.jsx`, `ManejadorAutenticacion`, `ServicioAutenticacion` |
| 3 | Realizar compra | CU-06 | `Carrito.jsx`, `Pago.jsx`, `payment/Payment.jsx`, `ManejadorPedidos`, `PedidoDAO` |
| 4 | Descargar factura PDF | CU-26 | `FacturasAdmin.jsx`, `ManejadorFactura`, `PedidoDAO`, `ServicioFactura` |
| 5 | Motor de corte textil | — | `PruebasReglasNegocioTextil`, `ServicioCorteTextil`, `RolloTextil` |

## 1. Iniciar sesión

Todas las peticiones pasan primero por `ManejadorBase.handle()`, que agrega CORS, aplica el límite de 120 peticiones por minuto por IP, registra un log en JSON y convierte `ExcepcionDominio` en una respuesta 400.

![1. Iniciar sesión](diagramas/sec_login.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Frontend - React
    participant UI as IniciarSesion.jsx
    participant CTX as ContextoAutenticacion
    end
    box Backend - Java
    participant BASE as ManejadorBase<br/>(handle)
    participant MA as ManejadorAutenticacion
    participant SA as ServicioAutenticacion
    participant REPO as JdbcRepositorioUsuarioImpl
    end
    participant DB as PostgreSQL
    U->>UI: escribe correo y contraseña
    UI->>CTX: login(email, password)
    CTX->>BASE: POST /api/iniciar-sesion<br/>{email, password}
    activate BASE
    BASE->>BASE: límite de 120 peticiones/min por IP
    alt límite superado
    BASE-->>CTX: 429 Demasiadas peticiones
    end
    BASE->>MA: procesarPeticion()
    activate MA
    MA->>SA: iniciarSesion(correo, contrasena)
    activate SA
    SA->>SA: generarHashContrasena()<br/>SHA-256
    SA->>REPO: buscarPorCorreoYValidarContrasena(correo, hash)
    REPO->>DB: SELECT … FROM usuarios<br/>WHERE correo = ? AND contrasena_hash = ?<br/>AND activo = true
    DB-->>REPO: fila o vacío
    REPO-->>SA: Optional<Usuario>
    alt credenciales incorrectas, cuenta inactiva o suspendida
    SA-->>MA: ExcepcionDominio
    MA-->>BASE: (excepción)
    BASE-->>CTX: 400 {error}
    CTX-->>UI: success = false
    UI-->>U: "Credenciales incorrectas"
    else credenciales válidas
    SA->>REPO: actualizarUltimoAcceso(id)
    REPO->>DB: UPDATE usuarios SET ultimo_acceso = NOW()
    SA-->>MA: Usuario
    deactivate SA
    MA-->>BASE: 200 {success, user}
    deactivate MA
    BASE->>BASE: registrarLogJson(INFO)
    BASE-->>CTX: 200 {success, user}
    deactivate BASE
    CTX->>CTX: normaliza el rol y guarda<br/>authUser en localStorage
    CTX-->>UI: success = true
    UI->>UI: navega según rol<br/>cliente → /cliente · vendedor → /vendedor · admin → /admin
    UI-->>U: panel de su rol
    end
    Note over CTX,BASE: El backend no emite token ni sesión: el frontend guarda el usuario<br/>en localStorage y las demás rutas de la API no verifican el rol.
```

</details>

## 2. Registrarse

La validación ocurre dos veces: en el navegador con zod y en `ServicioAutenticacion`. El correo único lo garantiza la restricción `UNIQUE` de `usuarios.correo`.

![2. Registrarse](diagramas/sec_registro.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as Visitante
    box Frontend - React
    participant UI as Registro.jsx
    participant CTX as ContextoAutenticacion
    end
    box Backend - Java
    participant MA as ManejadorAutenticacion
    participant SA as ServicioAutenticacion
    participant REPO as JdbcRepositorioUsuarioImpl
    end
    participant DB as PostgreSQL
    U->>UI: nombre, correo, contraseña<br/>y confirmación
    UI->>UI: valida con zod<br/>(nombre ≥ 2, correo válido, clave ≥ 6)
    alt datos inválidos
    UI-->>U: mensajes en el formulario
    else datos válidos
    UI->>CTX: register(datos)
    CTX->>MA: POST /api/registro<br/>{name, email, password}
    activate MA
    MA->>MA: aceptaHabeasData = true<br/>(no viene en la petición)
    MA->>SA: registrarCliente(nombre, correo, contrasena, true)
    activate SA
    alt faltan campos
    SA-->>MA: ExcepcionDominio
    MA-->>CTX: 400 {error}
    CTX-->>UI: muestra el error
    else
    SA->>SA: rol = "cliente"<br/>hash SHA-256
    SA->>REPO: guardar(usuario, hash)
    REPO->>DB: INSERT INTO usuarios
    alt correo repetido (UNIQUE)
    DB-->>REPO: error
    REPO-->>SA: false
    SA-->>MA: ExcepcionDominio("…el correo ya exista")
    MA-->>CTX: 400 {error}
    else
    DB-->>REPO: ok
    REPO-->>SA: true
    SA-->>MA: ok
    deactivate SA
    MA-->>CTX: 201 {success}
    deactivate MA
    CTX-->>UI: cuenta creada
    UI-->>U: redirige a Inicio (/)
    end
    end
    end
    Note over UI,MA: El formulario no tiene casilla de autorización de datos (Ley 1581 de 2012)<br/>y el frontend no envía el campo, el backend lo da por aceptado.
```

</details>

## 3. Realizar compra

Es el flujo más importante y el que más diferencias tiene con los requisitos: no hay pasarela de pago, los datos de envío no se guardan y si falla por stock la pantalla no avisa. Lo bueno: la creación del pedido es atómica y usa bloqueo pesimista (`SELECT … FOR UPDATE`) para evitar sobreventa.

![3. Realizar compra](diagramas/sec_compra.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as Cliente
    box Frontend - React
    participant CAR as Carrito.jsx
    participant CHK as Pago.jsx<br/>(/checkout)
    participant PAY as Payment.jsx<br/>(/pago)
    participant LS as localStorage
    end
    box Backend - Java
    participant MP as ManejadorPedidos
    participant DAO as PedidoDAO
    end
    participant DB as PostgreSQL
    U->>CAR: "Proceder al pago"
    CAR->>CHK: navega a /checkout<br/>(si no hay sesión, ProtectedRoute envía a /login)
    U->>CHK: datos de envío y cupón
    CHK->>CHK: subtotal − descuento<br/>+ envío ($15.000 si < $100.000) + IVA 19 %
    CHK->>LS: guarda lastOrder
    CHK->>PAY: "Confirmar pedido" → /pago
    U->>PAY: datos de tarjeta o banco PSE
    Note right of PAY: No hay pasarela de pago: el formulario<br/>solo se valida en el navegador y pasa<br/>directo a crear el pedido.
    PAY->>MP: POST /api/pedidos<br/>{clientId, total, items[productId, quantity, unitPrice]}
    activate MP
    MP->>DAO: crearPedido(idCliente, total, articulos)
    activate DAO
    DAO->>DB: BEGIN
    DAO->>DB: INSERT INTO pedidos (…, 'Cliente', 'cliente@tienda.com', 'N/A', 'pending')
    DB-->>DAO: id del pedido
    loop por cada artículo
    DAO->>DB: SELECT stock FROM productos<br/>WHERE id = ? FOR UPDATE
    alt producto inexistente o stock < cantidad
    DAO->>DB: ROLLBACK
    DAO-->>MP: -1
    MP-->>PAY: 500 {error: "Error al crear el pedido"}
    PAY-->>U: (no se muestra ningún mensaje)
    else hay stock
    DAO->>DB: UPDATE productos SET stock = stock − cantidad
    DAO->>DAO: agrega INSERT items_pedido al lote
    end
    end
    DAO->>DB: INSERT INTO items_pedido (lote)
    DAO->>DB: COMMIT
    DAO-->>MP: idPedido
    deactivate DAO
    MP-->>PAY: 201 {success, orderId}
    deactivate MP
    PAY->>LS: vacía el carrito
    PAY-->>U: /confirmacion?orderId=…
    Note over DAO,DB: El total lo calcula el navegador y el backend lo guarda tal cual.<br/>Los datos de envío del formulario no llegan a la base de datos.
```

</details>

## 4. Descargar factura PDF

Muestra por qué la facturación falla con pedidos reales: el manejador mezcla la tabla `pedidos` (español) con `users`, `order_items` y `products` (inglés).

![4. Descargar factura PDF](diagramas/sec_factura.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as Administrador<br/>o Cliente
    box Frontend - React
    participant UI as FacturasAdmin.jsx /<br/>HistorialPedidos.jsx
    end
    box Backend - Java
    participant MF as ManejadorFactura
    participant DAO as PedidoDAO
    participant SF as ServicioFactura<br/>(PDFBox)
    end
    participant DB as PostgreSQL
    U->>UI: "Descargar factura" del pedido N
    UI->>MF: GET /api/facturas/N
    activate MF
    MF->>DAO: obtenerPedidoPorId(N)
    DAO->>DB: SELECT … FROM pedidos WHERE id = N
    DB-->>DAO: pedido
    DAO-->>MF: Pedido
    alt pedido no existe
    MF-->>UI: 404 {error}
    else
    MF->>DB: SELECT name, email FROM users WHERE id = ?
    DB-->>MF: cliente (tabla en inglés)
    MF->>DB: SELECT … FROM order_items JOIN products<br/>WHERE order_id = N
    DB-->>MF: artículos (tablas en inglés)
    MF->>MF: subtotal = Σ cantidad × precio<br/>IVA = subtotal × 19 %<br/>total = pedido.total
    MF->>SF: generarFactura(N, cliente, artículos, subtotal, IVA, total)
    activate SF
    SF->>SF: encabezado, datos del cliente,<br/>tabla de artículos, totales,<br/>valor en letras, marca de agua
    SF-->>MF: byte[] PDF
    deactivate SF
    MF-->>UI: 200 application/pdf<br/>FAC-00000N.pdf
    deactivate MF
    UI-->>U: descarga el archivo
    end
    Note over MF,DB: El pedido se lee de pedidos (español), pero el cliente y los artículos<br/>se leen de users y order_items (inglés). Para un pedido creado desde<br/>la tienda la factura sale sin artículos y con datos de cliente equivocados.
```

</details>

## 5. Motor de corte textil

Documenta las reglas de negocio de corte (retazo por debajo de 1 m con 40 % de descuento; tarifa mayorista desde 15 m con 15 %; rollo cerrado desde 50 m con 25 %). Hoy este servicio solo se ejecuta en las pruebas automatizadas.

![5. Motor de corte textil](diagramas/sec_corte.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    participant T as PruebasReglasNegocioTextil
    participant S as ServicioCorteTextil
    participant R as RolloTextil
    participant M as EventoMerma
    Note over T,M: 1. Validar metraje continuo
    T->>S: validarMetrajeContinuo(rollos, metros, loteTintoreria)
    activate S
    loop rollos con estado "disponible" del mismo lote
    S->>R: getMetrajeRemanente()
    S->>S: suma el metraje del lote y busca<br/>el primer rollo con remanente ≥ metros
    end
    alt hay un rollo que alcanza solo
    S-->>T: CORTE_CONTINUO_OK + rollo asignado
    else el lote alcanza, pero repartido
    S-->>T: FRAGMENTED_STOCK (requiere empates)
    else no alcanza
    S-->>T: INSUFFICIENT_STOCK
    end
    deactivate S
    Note over T,M: 2. Procesar el corte
    T->>S: procesarCorteYRemanente(rollo, metros, precioBase)
    activate S
    alt metros > remanente
    S-->>T: IllegalStateException (sobrecorte)
    else
    S->>R: setMetrajeRemanente(remanente − metros)
    alt remanente = 0
    S->>R: setEstado("agotado")
    else 0 < remanente < 1,0 m
    S->>R: setEstado("retazo_liquidado")
    S->>M: new EventoMerma(remanente, "remanente_sub_metro")
    S->>S: precio retazo = precioBase × 0,60
    else remanente ≥ 1,0 m
    S->>R: setEstado("disponible")
    end
    S-->>T: ResultadoProcesamientoCorte
    end
    deactivate S
    Note over T,M: 3. Liquidar precio por volumen
    T->>S: calcularPrecioEscalonado(precioBase, metros)
    activate S
    alt metros ≥ 50
    S->>S: ROLLO_CERRADO, 25 % de descuento
    else metros ≥ 15
    S->>S: MAYORISTA, 15 % de descuento
    else
    S->>S: DETAL, sin descuento
    end
    S-->>T: TarifaCalculada
    deactivate S
    Note over T,M: Ningún endpoint de la API usa este servicio ni existe tabla de rollos:<br/>hoy el motor solo se ejecuta dentro de la suite de pruebas automatizadas.
```

</details>

Fuentes editables en PlantUML: `diagramas/fuentes/sec_*.puml`.
