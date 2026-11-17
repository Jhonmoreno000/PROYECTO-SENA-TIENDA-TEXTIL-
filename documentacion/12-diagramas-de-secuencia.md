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

El inicio de sesión comprueba primero el bloqueo por intentos fallidos (`ProtectorFuerzaBruta`), verifica la contraseña con PBKDF2 y, si es correcta, emite un token firmado (`TokenSesion`, 12 horas) que el frontend envía en las peticiones siguientes.

![1. Iniciar sesión](diagramas/sec_login.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant UI as IniciarSesion.jsx
    participant CTX as ContextoAutenticacion
    participant MA as ManejadorAutenticacion
    participant PFB as ProtectorFuerzaBruta
    participant SA as ServicioAutenticacion
    participant REPO as JdbcRepositorioUsuarioImpl
    participant TK as TokenSesion
    participant DB as PostgreSQL

    U->>UI: escribe correo y contraseña
    UI->>CTX: login(email, password)
    CTX->>MA: POST /api/iniciar-sesion
    MA->>PFB: estaBloqueado(correo, IP)
    alt 5 intentos fallidos previos
        MA-->>CTX: 429 con segundos restantes
        UI-->>U: "Cuenta bloqueada temporalmente"
    end
    MA->>SA: iniciarSesion(correo, contrasena)
    SA->>REPO: buscar usuario por correo
    REPO->>DB: SELECT ... FROM usuarios WHERE correo = ?
    DB-->>REPO: fila o vacío
    SA->>SA: verifica la contraseña con PBKDF2
    alt credenciales incorrectas o cuenta suspendida
        SA-->>MA: ExcepcionDominio
        MA->>PFB: registrarFallo(correo, IP)
        MA-->>CTX: 400 {error}
        UI-->>U: "Credenciales incorrectas"
    else credenciales válidas
        SA-->>MA: Usuario
        MA->>TK: emitir(idUsuario, rol)
        TK-->>MA: token firmado HMAC-SHA256 (12 h)
        MA-->>CTX: 200 {success, user, token}
        CTX->>CTX: guarda authUser y token en localStorage
        UI-->>U: panel de su rol
    end
    Note over CTX,TK: Las peticiones siguientes llevan Authorization: Bearer token
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
    participant UI as Registro.jsx
    participant CTX as ContextoAutenticacion
    participant MA as ManejadorAutenticacion
    participant SA as ServicioAutenticacion
    participant REPO as JdbcRepositorioUsuarioImpl
    participant DB as PostgreSQL
    U->>UI: nombre, correo, contraseña, confirmación<br/>y casilla de autorización de datos
    UI->>UI: valida con zod (nombre ≥ 2, correo válido,<br/>clave ≥ 8, confirmación igual, casilla marcada)
    alt datos inválidos
        UI-->>U: mensajes en el formulario
    else datos válidos
        UI->>CTX: register(datos)
        CTX->>MA: POST /api/registro {name, email, password, aceptaHabeasData}
        MA->>SA: registrarCliente(nombre, correo, contrasena, aceptaHabeasData)
        alt no acepta la política, faltan campos, correo inválido o clave < 8
            SA-->>MA: ExcepcionDominio
            MA-->>CTX: 400 {error}
            CTX-->>UI: muestra el error
        else
            SA->>SA: rol = "cliente"<br/>hash PBKDF2 (10 000 iteraciones + sal)
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
                MA-->>CTX: 201 {success}
                CTX->>MA: POST /api/iniciar-sesion (login automático)
                MA-->>CTX: 200 {usuario, token}
                UI-->>U: «¡Cuenta creada!» y redirige a Inicio (/)
            end
        end
    end
    Note over UI,SA: La autorización de datos (Ley 1581 de 2012) se pide en el formulario y el backend la exige;<br/>la fecha de aceptación no se guarda en la base de datos.
```

</details>

## 3. Realizar compra

La compra usa `ManejadorPagosWompi` y `PagoWompiDAO`: el backend recalcula el total, valida el stock con `SELECT … FOR SHARE` (sin descontarlo) y crea el pedido `pending` con los datos de envío. El stock solo se descuenta cuando el pago se aprueba (`procesarTransaccionWompi`), y como hoy la confirmación falla, las compras no bajan el stock. El pago es simulado: ningún medio se conecta a una pasarela real. El proceso no exige sesión, y si no la hay `Payment.jsx` asigna el pedido al usuario con id 4.

![3. Realizar compra](diagramas/sec_compra.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as Cliente
    participant CAR as Carrito.jsx
    participant CHK as CheckoutForm (/checkout)
    participant PAY as Payment.jsx (/pago)
    participant MP as ManejadorPagosWompi
    participant DAO as PagoWompiDAO
    participant DB as PostgreSQL

    U->>CAR: "Continuar a Envío y Pago"
    CAR->>CHK: navega a /checkout
    U->>CHK: datos de quien recibe y dirección
    CHK->>PAY: continúa a /pago
    U->>PAY: elige tarjeta, PSE, Nequi / Bre-B o contraentrega
    PAY->>MP: POST /api/pagos/intencion
    MP->>DAO: crearIntencionPago(...)
    DAO->>DB: BEGIN
    loop por cada artículo
        DAO->>DB: SELECT precio, stock ... FOR SHARE
        alt stock insuficiente
            DAO->>DB: ROLLBACK
            MP-->>PAY: 400 {error}
        end
    end
    DAO->>DAO: valida cupón y calcula descuento, envío, IVA y total
    DAO->>DB: INSERT pedidos ('pending') e items_pedido
    DAO->>DB: COMMIT
    MP-->>PAY: 200 {reference, amount}
    PAY->>PAY: aprueba el pago tras 0,8 s (simulado)
    PAY->>MP: POST /api/pagos/confirmar {reference: DD-<13 dígitos>-XXXX, ...}
    MP->>MP: contieneDatosTarjetaSensibles(cuerpo)
    alt la referencia coincide con el patrón de tarjeta (hoy, siempre)
        MP-->>PAY: 400 "Rechazado por seguridad PCI-DSS"
        Note over MP,DB: el pedido queda en 'pending'
    else diseño previsto
        MP->>DAO: confirmarPagoPorReferencia(...)
        DAO->>DB: SELECT ... FROM pedidos ... FOR UPDATE (idempotencia)
        DAO->>DB: UPDATE pedidos SET estado = 'paid'
        DAO->>DB: UPDATE productos SET stock = GREATEST(0, stock - metros)
    end
    PAY-->>U: /confirmacion?referencia=... (muestra "Pago Aprobado" en ambos casos)
    Note over PAY,DAO: Pago simulado: no hay conexión con una pasarela real. Sin sesión, el pedido se asigna al usuario 4
```

</details>

## 4. Descargar factura PDF

El manejador lee el pedido, la cabecera de facturación y los artículos mediante `PedidoDAO`, todo desde las tablas en español (`pedidos`, `items_pedido`, `productos`), y arma el PDF con PDFBox.

![4. Descargar factura PDF](diagramas/sec_factura.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as Administrador o Cliente
    participant UI as FacturasAdmin.jsx / HistorialPedidos.jsx
    participant MF as ManejadorFactura
    participant DAO as PedidoDAO
    participant SF as ServicioFactura (PDFBox)
    participant DB as PostgreSQL
    U->>UI: «Descargar factura» del pedido N
    UI->>MF: GET /api/facturas/N
    MF->>DAO: obtenerPedidoPorId(N)
    DAO->>DB: SELECT … FROM pedidos WHERE id = N
    DB-->>DAO: pedido
    DAO-->>MF: Pedido
    alt pedido no existe
        MF-->>UI: 404 {error}
    else
        MF->>DAO: obtenerCabeceraFactura(N)
        DAO->>DB: SELECT nombre_cliente, correo_cliente, direccion_envio, metodo_pago,<br/>subtotal, monto_descuento, costo_envio, monto_impuesto FROM pedidos
        DAO-->>MF: datos del cliente y montos guardados
        MF->>DAO: obtenerArticulosFactura(N)
        DAO->>DB: SELECT … FROM items_pedido LEFT JOIN productos
        DAO-->>MF: artículos
        MF->>MF: usa los montos guardados;<br/>si faltan: subtotal = Σ cantidad × precio,<br/>IVA = (subtotal − descuento) × 19 %
        MF->>SF: generarFactura(N, cliente, artículos, subtotal, descuento, envío, IVA, total, método)
        SF->>SF: encabezado con CUFE, cliente, artículos,<br/>totales, valor en letras, marca de agua
        SF-->>MF: byte[] PDF
        MF-->>UI: 200 application/pdf (FAC-00000N.pdf)
        UI-->>U: descarga el archivo
    end
    Note over MF,DB: Todo se lee de las tablas en español (pedidos, items_pedido, productos).<br/>El manejador no comprueba el rol ni que el pedido sea del usuario que lo pide.
```

</details>

## 5. Motor de corte textil

Documenta las reglas de negocio de corte (retazo por debajo de 1 m con 40 % de descuento; tarifa mayorista desde 15 m con 15 %; rollo cerrado desde 50 m con 25 %). El servicio se usa desde `POST /api/inventario/corte`, que actualiza el rollo, registra la merma y sincroniza el stock del producto; ninguna pantalla llama todavía a ese endpoint.

![5. Motor de corte textil](diagramas/sec_corte.png)

<details><summary>Versión Mermaid (se dibuja en GitHub)</summary>

```mermaid
sequenceDiagram
    autonumber
    actor C as Cliente HTTP (sin pantalla aún)
    participant MI as ManejadorInventario
    participant DAO as InventarioDAO
    participant S as ServicioCorteTextil
    participant R as RolloTextil
    participant DB as PostgreSQL
    C->>MI: POST /api/inventario/corte {rollCode, meters, basePrice}
    MI->>DAO: obtenerRolloPorCodigoOId(rollCode)
    DAO->>DB: SELECT … FROM rollos_textil
    DAO-->>MI: RolloTextil
    alt rollo no existe
        MI-->>C: 404 {error}
    else
        opt basePrice ≤ 0
            MI->>DB: SELECT precio FROM productos (si no hay, 25 000)
        end
        MI->>S: validarMetrajeContinuo([rollo], metros, lote)
        alt el rollo no alcanza
            S-->>MI: FRAGMENTED_STOCK / INSUFFICIENT_STOCK
            MI-->>C: 400 {error, code}
        else alcanza
            S-->>MI: CORTE_CONTINUO_OK
            MI->>S: procesarCorteYRemanente(rollo, metros, precio)
            S->>R: setMetrajeRemanente(remanente − metros)
            alt remanente = 0
                S->>R: setEstado("agotado")
            else 0 < remanente < 1,0 m
                S->>R: setEstado("retazo_liquidado")
                S->>S: new EventoMerma(remanente, "remanente_sub_metro")
            else remanente ≥ 1,0 m
                S->>R: setEstado("disponible")
            end
            S-->>MI: ResultadoProcesamientoCorte
            MI->>S: calcularPrecioEscalonado(precio, metros)
            S-->>MI: TarifaCalculada (≥ 50 m −25 %, ≥ 15 m −15 %, resto detal)
            MI->>DAO: actualizarRolloDespuesDeCorte(rollo, merma)
            DAO->>DB: transacción: UPDATE rollos_textil,<br/>INSERT eventos_merma (si hay retazo), UPDATE productos.stock
            MI-->>C: 200 {rollId, remainingMeters, status, totalPrice}
        end
    end
    Note over C,S: El endpoint existe y usa el motor, pero ninguna pantalla del frontend lo llama todavía.<br/>El mismo servicio se prueba en PruebasReglasNegocioTextil.
```

</details>

Fuentes editables en PlantUML: `diagramas/fuentes/sec_*.puml`.


---

## 6. Diagrama de Secuencia: Emisión y Validación de Sesión Firmada (`TokenSesion`)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario (Cliente / Vendedor / Admin)
    participant SPA as Frontend React (ContextoAutenticacion + interceptorSesion.js)
    participant MB as ManejadorBase / ManejadorAutenticacion
    participant TS as TokenSesion (HMAC-SHA256)
    participant DB as PostgreSQL (JdbcRepositorioUsuarioImpl / PedidoDAO)

    U->>SPA: Ingresa credenciales en /login
    SPA->>MB: POST /api/iniciar-sesion {email, password}
    MB->>DB: buscarPorCorreo(email) + verificar PBKDF2 (SHA-256 solo en cuentas antiguas)
    DB-->>MB: Usuario activo (id, rol)
    MB->>TS: emitir(id, rol)
    TS-->>MB: token = base64url({sub,rol,exp}).base64url(HmacSHA256)
    MB-->>SPA: 200 OK {id, nombre, rol, token}
    SPA->>SPA: Guarda sesión y programa temporizador de expiración

    Note over U,DB: Petición subsecuente protegida (ej. GET /api/pedidos)
    U->>SPA: Abre panel de pedidos
    SPA->>MB: GET /api/pedidos (Authorization: Bearer token)
    MB->>TS: verificar(token)
    TS-->>MB: Identidad reclamada (idUsuario, rol)
    MB->>DB: buscarPorId(idUsuario)
    DB-->>MB: Usuario actual (activo=true, suspendido=false, rolActual)
    MB->>DB: Consulta filtrada según rolActual (Cliente / Vendedor / Admin)
    DB-->>MB: Lista de pedidos autorizados
    MB-->>SPA: 200 OK [pedidos]
```
