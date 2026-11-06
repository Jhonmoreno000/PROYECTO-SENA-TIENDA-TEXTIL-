# Manual de Usuario — D&D Textil (Tienda Digital de Telas)

> **Documento Oficial de Usuario Final y Operación por Roles**  
> **Versión:** 1.0 (Octubre 2026)  
> **Proyecto:** D&D Textil — Tienda digital de telas  
> **Programa de formación:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) — SENA  
> **Dirigido a:** Clientes, vendedores y administradores  
> **Archivo PDF Oficial:** [Manual_de_usuario_DD_Textil.pdf](./Manual_de_usuario_DD_Textil.pdf)

---

## Tabla de Contenido

1. [Antes de empezar](#1-antes-de-empezar)
2. [Tienda en línea](#2-tienda-en-línea)
   - [2.1. Inicio](#21-inicio)
   - [2.2. Catálogo](#22-catálogo)
   - [2.3. Ficha de la tela](#23-ficha-de-la-tela)
   - [2.4. Carrito](#24-carrito)
   - [2.5. Crear una cuenta](#25-crear-una-cuenta)
   - [2.6. Iniciar sesión](#26-iniciar-sesión)
3. [Comprar telas](#3-comprar-telas)
   - [3.1. Datos de envío](#31-datos-de-envío)
   - [3.2. Pago](#32-pago)
4. [Panel del cliente](#4-panel-del-cliente)
   - [4.1. Historial de pedidos](#41-historial-de-pedidos)
   - [4.2. Rastrear un envío](#42-rastrear-un-envío)
   - [4.3. Reportar un problema](#43-reportar-un-problema)
   - [4.4. Calculadora de metraje](#44-calculadora-de-metraje)
   - [4.5. Lista de deseos](#45-lista-de-deseos)
   - [4.6. Mi perfil y direcciones](#46-mi-perfil-y-direcciones)
5. [Panel del vendedor](#5-panel-del-vendedor)
   - [5.1. Panel principal y productos](#51-panel-principal-y-productos)
   - [5.2. Pedidos](#52-pedidos)
   - [5.3. Alertas de stock](#53-alertas-de-stock)
6. [Panel del administrador](#6-panel-del-administrador)
   - [6.1. Resumen](#61-resumen)
   - [6.2. Usuarios](#62-usuarios)
   - [6.3. Catálogo](#63-catálogo)
   - [6.4. Carrusel y página de inicio](#64-carrusel-y-página-de-inicio)
   - [6.5. Inventario](#65-inventario)
   - [6.6. Moderación](#66-moderación)
   - [6.7. Soporte, cupones y reportes](#67-soporte-cupones-y-reportes)
   - [6.8. Analítica y facturación](#68-analítica-y-facturación)
   - [6.9. Configuración](#69-configuración)
7. [Uso desde el celular](#7-uso-desde-el-celular)
8. [Preguntas frecuentes](#8-preguntas-frecuentes)

---

## 1. Antes de empezar

**D&D Textil** es una tienda en línea para comprar y vender telas por metros. Todo se usa desde el navegador, sin instalar programas adicionales.

### Qué necesitas

- Un computador, tablet o celular con conexión a internet.
- Un navegador actualizado (Chrome, Edge, Firefox o Safari).
- La dirección de la tienda. En pruebas locales es `http://localhost:3001`.

### Tipos de usuario

| Rol | Qué puede hacer | Ruta principal |
| :--- | :--- | :--- |
| **Visitante** | Ver el catálogo, usar los filtros y armar el carrito. | `/` y `/catalogo` |
| **Cliente** | Todo lo anterior + pagar pedidos, descargar facturas, rastrear envíos, usar la calculadora de metraje y abrir tickets de soporte. | `/cliente` |
| **Vendedor** | Publicar y editar sus telas, atender sus pedidos y revisar alertas de stock bajo. | `/vendedor` |
| **Administrador** | Controlar toda la tienda: usuarios, catálogo, carrusel, inventario de rollos, moderación, cupones, soporte, analítica y configuración de marca. | `/admin` |

### Cuentas de prueba

Si estás probando el sistema en un entorno de demostración, puedes entrar con cualquiera de estas cuentas desde la pantalla de inicio de sesión:

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@ddtextil.com` | `admin123` |
| **Vendedor** | `vendedor@ddtextil.com` | `vendedor123` |
| **Cliente** | `cliente@ddtextil.com` (o `cliente@gmail.com`) | `cliente123` |

---

## 2. Tienda en línea

### 2.1. Inicio

Al abrir la dirección de la tienda verás la portada principal con los siguientes controles clave:

1. **Barra superior:** permite ir a **Inicio**, **Catálogo**, **Contacto** y **Sobre Nosotros**.
2. **Icono de luna / sol:** cambia entre modo claro y modo oscuro.
3. **Ingresar:** lleva a la pantalla de inicio de sesión. Si ya entraste, muestra tu nombre y el acceso directo a tu panel (**Mi Cuenta**).
4. **Carrito (icono de bolsa):** muestra cuántos productos llevas agregados y abre el resumen de compra.
5. **Explorar Colección:** baja directamente al catálogo de telas destacadas o abre la vista completa de catálogo.

### 2.2. Catálogo

En **Catálogo** (`/catalogo`) encuentras todas las telas disponibles para compra por metraje:

- **Apartados rápidos:** en la parte superior puedes alternar entre **Todos**, **Nuevas Colecciones**, **Telas Exclusivas** y **Ofertas Especiales**.
- **Filtro por proyecto (*¿Qué estás imaginando crear?*):** elige el uso final (**Moda y Confección**, **Cortinas y Hogar**, **Tapicería**, **Verano** o **Invierno**) para que el sistema filtre automáticamente los tejidos recomendados.
- **Ordenar y precio:** a la izquierda puedes ordenar los resultados y ajustar el control deslizante de **Rango de Precio** máximo por metro lineal.
- Haz clic sobre la foto o el nombre de cualquier tela para abrir su ficha técnica detallada.

### 2.3. Ficha de la tela

Dentro de la página de un producto (`/producto/:id`) puedes revisar su información técnica (composición, gramaje $\text{g/m}^2$, ancho útil y cuidados de lavado) y configurar tu corte:

1. **Metros por corte:** usa los botones `-` y `+` o escribe cuántos metros lineales necesitas en ese corte.
2. **Cantidad de cortes:** indica cuántos tramos iguales de ese metraje deseas llevar.
3. **Agregar al carrito:** guarda la selección en tu bolsa de compras para seguir navegando por la tienda.
4. **Comprar ahora:** agrega el producto y te dirige de inmediato al carrito para finalizar la orden.
5. **Favoritos (corazón):** guarda la tela en tu **Lista de deseos / Muestrario Virtual** (requiere sesión iniciada).
6. **Reseñas:** al final de la página puedes leer opiniones verificadas de otros compradores y, si ya iniciaste sesión, calificar la tela de **1 a 5 estrellas** dejando tu comentario.

### 2.4. Carrito

Haz clic en el icono de la bolsa en la esquina superior derecha para abrir tu carrito (`/carrito`):

- **Cambiar metros:** ajusta los metros con `-` y `+` o elimina un corte haciendo clic en el icono de papelera.
- **Código de cupón:** si cuentas con un código promocional (por ejemplo `BIENVENIDA10`), escríbelo en el campo correspondiente y pulsa **Aplicar**.
- **Resumen del pedido:** a la derecha se detalla en tiempo real:
  - **Subtotal** de las telas seleccionadas.
  - **Descuento** aplicado por cupón o volumen.
  - **Envío:** tarifa estándar de **$15.000 COP**, o **gratis** en compras iguales o superiores a **$100.000 COP**.
  - **IVA (19 %)** discriminado legalmente.
  - **Total a pagar**.
- Haz clic en **Proceder al Pago** para avanzar al checkout.

### 2.5. Crear una cuenta

Para registrarte como cliente nuevo (`/registro`):

1. Haz clic en **Ingresar** en la barra superior y luego selecciona **Regístrate aquí**.
2. Completa tu **Nombre Completo**, **Correo Electrónico** y una **Contraseña** (mínimo 6 caracteres), o utiliza los botones de registro rápido con **Google** o **Microsoft**.
3. Marca las casillas de aceptación de **Términos y Condiciones** y la **Política de Tratamiento de Datos Personales (Habeas Data — Ley 1581 de 2012)**.
4. Haz clic en **Crear Cuenta**.

### 2.6. Iniciar sesión

En la pantalla **Bienvenido de nuevo** (`/login`):

1. Escribe tu **Correo Electrónico** y tu **Contraseña**, y pulsa **Iniciar Sesión**.
2. Si lo prefieres, entra con tu cuenta corporativa o personal de **Google** o **Microsoft**.
3. **Solo en entorno de demostración:** debajo del formulario encontrarás tres botones de acceso rápido (**Cliente**, **Vendedor** y **Admin**) que autocompletan las credenciales de prueba con un solo clic para agilizar la sustentación.

---

## 3. Comprar telas

Al pulsar **Proceder al Pago** desde el carrito se inicia el proceso de compra en tres pasos guiados (**Envío** → **Pago** → **Confirmación**). Si aún no habías iniciado sesión, el sistema te solicitará hacerlo antes de continuar.

### 3.1. Datos de envío

En el **Paso 1 (Información de Envío)**:

1. Completa los **Datos de Contacto**: nombre completo, correo electrónico y teléfono de contacto (10 dígitos).
2. Completa la **Dirección de Entrega**: dirección física exacta, barrio, departamento, ciudad y notas adicionales para el transportador (ej. *"Dejar en portería"*).
3. Revisa a la derecha el resumen de productos y el total calculado.
4. Haz clic en **Confirmar Pedido y Pagar**. El sistema registrará el pedido en la base de datos y te llevará a la selección de pasarela de pago.

### 3.2. Pago

En el **Paso 2 (Pasarela de Pagos Multi-Método)** elige cómo deseas pagar utilizando las pestañas superiores:

- **Tarjeta Crédito / Débito:** ingresa los 16 dígitos de la tarjeta, nombre del titular, fecha de vencimiento (`MM/AA`), código de seguridad (`CVV`, que voltea dinámicamente la tarjeta 3D en pantalla), tipo y número de documento, y número de cuotas (1 a 36).
- **PSE (ACH Colombia):** selecciona tipo de persona (Natural o Jurídica), entidad bancaria de la lista oficial ACH, tipo y número de documento y teléfono celular.
- **Wompi (Bancolombia):** pago directo mediante cuenta o Botón Bancolombia / corresponsal bancario.
- **Mercado Pago:** pago con saldo en cuenta de Mercado Pago o tarjetas vinculadas.
- **Nequi / Bre-B:** ingresa tu número celular de 10 dígitos vinculado a Nequi o tu llave Bre-B (celular, correo, documento o llave alfanumérica) para aprobar la notificación push.
- **ePayco:** alternativa para pagos en efectivo (Efecty, Baloto, Gana, SuRed) o tarjetas internacionales.

Pulsa el botón de pago al final del formulario. En pocos segundos verás la pantalla de **¡Pago Exitoso!** (**Paso 3**) con el número de pedido, el código de seguimiento y el botón para ir directamente a **Mis Pedidos**.

---

## 4. Panel del cliente

Cuando inicias sesión con una cuenta de cliente accedes a tu espacio personal (`/cliente`). Desde el menú lateral izquierdo puedes navegar por todas tus herramientas de compra y postventa.

### 4.1. Historial de pedidos

En **Resumen** o **Mis Pedidos** (`/cliente/pedidos`) encuentras todas tus compras realizadas:

- Cada fila muestra el número de pedido, la fecha de compra, la cantidad de telas, el total pagado y el estado actual (**Pagado**, **En Corte**, **Empacado**, **Enviado** o **Entregado**).
- Haz clic en **Ver Detalles** para desplegar los artículos del pedido, la dirección de despacho y el botón para descargar tu **Factura Electrónica en PDF** (con código QR y CUFE).

### 4.2. Rastrear un envío

En **Rastrear Envío** (`/cliente/seguimiento`):

1. Escribe el número de pedido (por ejemplo `1001`) o el número de guía logística (por ejemplo `COL987654321`) y pulsa **Buscar**.
2. También puedes hacer clic directamente sobre cualquiera de tus pedidos recientes listados debajo del buscador.
3. Verás la barra de progreso con las cinco etapas operativas del despacho:
   - **Pedido Confirmado** → **En Proceso de Corte** → **Empacado** → **En Tránsito** → **Entregado**, junto con el historial cronológico de actualizaciones de bodega.

### 4.3. Reportar un problema

Si recibiste un pedido con alguna novedad de calidad o metraje, ve a **Soporte y Devoluciones** (`/cliente/soporte`):

1. Selecciona el **Pedido Relacionado** (el sistema habilita únicamente pedidos en estado **Entregado**).
2. Elige el **Tipo de Problema**:
   - *Tela con manchas o daños físicos*.
   - *Hilos sueltos o imperfectos de tejido*.
   - *Color diferente al mostrado en catálogo*.
   - *Metraje incompleto o menor al facturado*.
3. Escribe una **Descripción Detallada** del inconveniente y, si lo deseas, adjunta fotografías de evidencia del rollo o corte recibido.
4. Haz clic en **Enviar Reporte**. En la columna derecha podrás consultar en todo momento el estado de tus tickets (**Abierto**, **En Revisión** o **Resuelto**).

### 4.4. Calculadora de metraje

Si no estás seguro de cuántos metros lineales comprar para tu prenda o proyecto de hogar, abre la **Calculadora de Metraje** (`/cliente/calculadora`):

1. Elige el **Tipo de Proyecto** entre los 6 moldes paramétricos incluidos:
   - *Falda Circular*, *Falda Recta*, *Cortinas Estándar*, *Mantel de Mesa*, *Cojines Decorativos* o *Vestido Sencillo*.
2.Selecciona el **Ancho de la Tela** del rollo (**1,40 m**, **1,50 m**, **1,60 m** o **2,80 m** para lencería de hogar/cortinería).
3. Ingresa las medidas solicitadas en centímetros (largo, cintura, ancho de ventana, dimensiones de mesa, etc.).
4. En el recuadro derecho verás de inmediato los **Metros Recomendados**, que ya incluyen un **10 % adicional de margen técnico** por encogimiento de lavado y costuras.

### 4.5. Lista de deseos

En **Lista de Deseos** (`/cliente/favoritos`) se guardan las telas que marcaste con el icono de corazón en el catálogo:

- Funciona como un **Muestrario Virtual**: puedes filtrar tus telas guardadas por categoría o quitarlas cuando ya no las necesites, facilitando la planeación de colecciones de confección.

### 4.6. Mi perfil y direcciones

En **Configuración** (`/cliente/perfil`) puedes administrar tu cuenta en tres pestañas:

- **Datos Personales:** actualiza tu nombre, correo electrónico o teléfono y pulsa **Guardar Cambios**.
- **Direcciones:** agrega, edita o elimina direcciones de entrega frecuentes y marca una como **Principal** para agilizar futuros checkouts.
- **Seguridad:** cambia tu contraseña actual y configura tus preferencias de notificaciones por correo.

---

## 5. Panel del vendedor

Al ingresar con una cuenta de vendedor accedes al panel **ERP Vendedor** (`/vendedor`), diseñado para gestionar tu catálogo propio y el alistamiento de tus órdenes.

### 5.1. Panel principal y productos

En **Panel Principal** y **Productos** (`/vendedor/productos`):

- En la parte superior se presentan tus indicadores clave en tiempo real: **Ventas del Mes**, **Pedidos Activos**, **Productos Activos** y **Stock Bajo**.
- En la tabla de **Gestión de Inventario Textil** puedes:
  - **Editar (icono de lápiz):** modificar nombre, categoría, precio por metro, metros disponibles en stock, descripción e imagen del producto.
  - **Desactivar / Activar (icono de ojo):** ocultar temporalmente una tela de la tienda pública sin borrar su historial.
  - **Eliminar (icono de papelera):** retirar definitivamente un producto del catálogo.
- Para publicar una tela nueva, haz clic en el botón **+ Nuevo Producto** (`/vendedor/productos/nuevo`), completa los datos técnicos y sube las fotografías. Todo producto nuevo o editado pasa por la cola de **Moderación** del administrador antes de hacerse visible al público.

### 5.2. Pedidos

En **Pedidos** (`/vendedor/pedidos`) consultas exclusivamente las órdenes de compra que incluyen telas de tu catálogo:

- Filtra rápidamente usando las pestañas **Todos**, **Preparando**, **Enviados** y **Entregados**, o busca por número de pedido o nombre del cliente.
- Cada tarjeta detalla los cortes solicitados (producto, metros lineales y subtotal) junto con el estado actual del despacho para coordinar el corte en bodega.

### 5.3. Alertas de stock

En **Alertas Stock** (`/vendedor/alertas`) el sistema agrupa automáticamente las referencias que están próximas a agotarse:

- **Stock Crítico (menos de 10 metros):** requiere reposición inmediata de rollos para evitar quiebres de inventario.
- **Stock Bajo:** advertencia preventiva de reabastecimiento.
- Desde cada tarjeta puedes escribir la nueva cantidad de metros disponibles cuando recibas mercancía y actualizar el inventario con un clic.

---

## 6. Panel del administrador

El panel **ERP Intelligence** (`/admin`) reúne todas las herramientas operativas, financieras y de gobierno de la tienda en un menú lateral organizado por áreas.

### 6.1. Resumen

Al entrar al panel (`/admin`) verás el tablero ejecutivo de control:

- **Filtros globales:** filtra las métricas por rango de fechas, vendedor o categoría textil.
- **Indicadores clave (KPIs):** ingresos totales, pedidos completados, ticket promedio, tasa de conversión y estado general del inventario.
- **Centro de alertas:** notificaciones rápidas sobre rollos con stock bajo, reportes técnicos abiertos y solicitudes pendientes en cola de moderación.

### 6.2. Usuarios

En **Usuarios** (`/admin/usuarios`) administras todas las cuentas registradas en la plataforma:

- Busca usuarios por nombre o correo y filtra por rol (**Administrador**, **Vendedor**, **Cliente**).
- **Cambiar rol:** usa el selector desplegable de la columna **Rol** para promover o reasignar permisos de un usuario (revalidado en base de datos en cada petición).
- **Suspender / Activar:** bloquea temporalmente el acceso de una cuenta sin borrar su historial transaccional, o elimínala con el icono de papelera.

### 6.3. Catálogo

En **Catálogo** (`/admin/productos`) tienes vista y control sobre absolutamente todas las telas de la plataforma, sin importar qué vendedor las haya creado. Puedes crear nuevas referencias, editar precios, ajustar stock, destacar productos en portada o eliminarlos.

### 6.4. Carrusel y página de inicio

En **Carrusel / Home** (`/admin/carrusel`) personalizas la portada pública de la tienda sin tocar código:

- **Diapositivas del carrusel:** pulsa **+ Agregar Slide** para subir una nueva imagen promocional con su título, subtítulo y enlace, reordena las diapositivas con las flechas o actívalas/desactívalas individualmente.
- **Visibilidad de secciones:** en la parte inferior puedes mostrar u ocultar con un interruptor las secciones de la página principal (**Portada**, **Carrusel**, **Productos Destacados**, **Novedades**, **Beneficios**, etc.).

### 6.5. Inventario

El módulo de **Inventario** está diseñado específicamente para la operación física de una bodega textil y se divide en cuatro pantallas:

1. **Control de Lotes** (`/admin/inventario/lotes`): registra cada rollo físico que entra a bodega indicando tipo de tela, metraje inicial, proveedor y **código de lote de tintorería**. Permite descontar metros manualmente cuando se realiza un corte en mostrador.
2. **Calculadora de Merma** (`/admin/inventario/mermas`): registra pérdidas de tela por daños de fábrica, manchas, cortes defectuosos o muestras comerciales. El sistema descuenta automáticamente esos metros del rollo afectado y calcula el costo financiero de la pérdida.
3. **Alertas de Stock** (`/admin/inventario/alertas`): define el umbral mínimo de metros por producto y permite registrar entradas rápidas de mercancía.
4. **Historial de Movimientos** (`/admin/inventario/movimientos`): bitácora completa de auditoría con todas las entradas, ventas, ajustes y mermas. Incluye filtros por fecha/tipo y botón **Exportar CSV** para contabilidad.

### 6.6. Moderación

En el bloque de **Moderación** supervisas la calidad del catálogo multi-vendedor:

- **Cola de Aprobación** (`/admin/moderacion/cola`): revisa las telas nuevas o editadas por los vendedores. Puedes **Aprobar** su publicación inmediata o **Rechazar** el cambio escribiendo el motivo de corrección (por ejemplo, *"Falta especificar el gramaje o mejorar la iluminación de la foto"*).
- **Rendimiento** (`/admin/moderacion/rendimiento`): consulta las ventas, cumplimiento de despacho, calificación promedio y tasa de devoluciones de cada vendedor.

### 6.7. Soporte, cupones y reportes

En el bloque de **Operaciones** gestionas la atención al cliente, el marketing promocional y la salud técnica:

- **Gestión de Tickets** (`/admin/soporte/tickets`): bandeja centralizada con los reclamos enviados por los clientes. Permite filtrar por prioridad (**Alta**, **Media**, **Baja**), asignar responsable y cambiar el estado hasta su cierre (**Resuelto**).
- **Cupones** (`/admin/marketing/cupones`): pulsa **+ Crear Cupón** para definir códigos promocionales por **porcentaje** (ej. `15%`) o **valor fijo** (ej. `$20.000 COP`), fecha de vencimiento, límite máximo de usos y reglas acumulables.
- **Gestión de Reportes** (`/admin/operaciones/bugs`): registro interno para reportar y hacer seguimiento a fallos técnicos o mejoras operativas del sistema.
