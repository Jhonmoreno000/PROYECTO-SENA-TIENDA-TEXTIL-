# Manual de Usuario — D&D Textil (Tienda Digital de Telas)

> **Documento Oficial de Usuario Final y Operación por Roles**  
> **Versión:** 3.0 (Marketplace Multi-Vendedor)  
> **Proyecto:** D&D Textil — Marketplace Digital de Telas  
> **Programa de formación:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) — SENA  
> **Dirigido a:** Clientes, vendedores externos y administradores  
> **Archivo PDF Oficial:** [Manual_de_usuario_DD_Textil.pdf](./Manual_de_usuario_DD_Textil.pdf)

---

## Tabla de Contenido

1. [Antes de empezar](#1-antes-de-empezar)
2. [Tienda en línea y Marketplace](#2-tienda-en-línea-y-marketplace)
   - [2.1. Inicio](#21-inicio)
   - [2.2. Tiendas Proveedoras](#22-tiendas-proveedoras)
   - [2.3. Catálogo](#23-catálogo)
   - [2.4. Ficha de la tela y comparador](#24-ficha-de-la-tela-y-comparador)
   - [2.5. Carrito](#25-carrito)
   - [2.6. Crear una cuenta](#26-crear-una-cuenta)
   - [2.7. Iniciar sesión](#27-iniciar-sesión)
3. [Comprar telas](#3-comprar-telas)
   - [3.1. Datos de envío](#31-datos-de-envío)
   - [3.2. Pago](#32-pago)
4. [Panel del cliente](#4-panel-del-cliente-único-rol-habilitado-para-compras-y-reseñas)
   - [4.1. Historial de pedidos y desglose por tienda](#41-historial-de-pedidos-y-desglose-por-tienda)
   - [4.2. Rastrear un envío](#42-rastrear-un-envío)
   - [4.3. Reportar un problema](#43-reportar-un-problema)
   - [4.4. Calculadora de metraje](#44-calculadora-de-metraje)
   - [4.5. Lista de deseos](#45-lista-de-deseos)
   - [4.6. Mi perfil, direcciones y nivel VIP](#46-mi-perfil-direcciones-y-nivel-vip)
5. [Panel del vendedor](#5-panel-del-vendedor-proveedores-externos-marketplace)
   - [5.1. Mi Tienda — Perfil público tipo red social](#51-mi-tienda--perfil-público-tipo-red-social)
   - [5.2. Alertas y Oportunidades VIP / Auditorías](#52-alertas-y-oportunidades-vip--auditorías)
   - [5.3. Productos, precios propios y comparativa competitiva](#53-productos-precios-propios-y-comparativa-competitiva)
   - [5.4. Pedidos y Alertas de Stock](#54-pedidos-y-alertas-de-stock)
6. [Panel del administrador](#6-panel-del-administrador-gobierno-comisiones-y-auditoría-antifraude)
   - [6.1. Resumen](#61-resumen)
   - [6.2. Usuarios, Vendedores y Clientes](#62-usuarios-vendedores-y-clientes)
   - [6.3. Catálogo y Moderación (Control Antifraude)](#63-catálogo-y-moderación-control-antifraude)
   - [6.4. Carrusel y página de inicio](#64-carrusel-y-página-de-inicio)
   - [6.5. Auditoría de Inventario Antifraude](#65-auditoría-de-inventario-antifraude-solo-lectura-y-alertas-reales)
   - [6.6. Soporte, cupones y reportes](#66-soporte-cupones-y-reportes)
   - [6.7. Analítica y facturación](#67-analítica-y-facturación)
   - [6.8. Configuración](#68-configuración)
7. [Uso desde el celular](#7-uso-desde-el-celular)
8. [Preguntas frecuentes](#8-preguntas-frecuentes)

---

## 1. Antes de empezar

**D&D Textil** es un **Marketplace Multi-Vendedor** en línea que conecta múltiples proveedores textiles externos con compradores y confeccionistas para comprar y vender telas por metros bajo un modelo de **Comisión + Venta**. Todo se usa desde el navegador, sin instalar programas adicionales.

### Qué necesitas

- Un computador, tablet o celular con conexión a internet.
- Un navegador actualizado (Chrome, Edge, Firefox o Safari).
- La dirección de la tienda. En pruebas locales es `http://localhost:3001`.

### Tipos de usuario

| Rol | Qué puede hacer | Ruta principal |
| :--- | :--- | :--- |
| **Visitante** | Explorar el catálogo, ver tiendas proveedoras (`/tiendas`, `/tienda/:id`), usar filtros y armar el carrito (sin pagar ni reseñar hasta registrarse como cliente). | `/`, `/catalogo`, `/tiendas` |
| **Cliente** | Único rol autorizado para finalizar compras (`/checkout`, `/pago`) y publicar reseñas verificadas; además descarga facturas PDF, rastrea envíos, desbloquea catálogo VIP y usa la calculadora de metraje. | `/cliente` |
| **Vendedor** | Gestionar su perfil público de tienda (`/vendedor/mi-tienda`), publicar telas, definir precios/descuentos propios, administrar stock/rollos/lotes, atender sub-pedidos y gestionar alertas reales (`/vendedor/alertas`). | `/vendedor` |
| **Administrador** | Auditar ventas, comisiones (10 %), usuarios, cupones, carrusel y moderación (`changes_requested`). Por control antifraude opera precios, lotes y mermas en **modo solo lectura** y envía alertas reales a los vendedores. | `/admin` |

### Cuentas de prueba reales sembradas en PostgreSQL

Si estás probando el sistema en entorno local o sustentación, estas cuentas reales existen en la base de datos (`SembradorDatosPrueba`):

| Rol | Comercio / Perfil | Correo | Contraseña |
| :--- | :--- | :--- | :--- |
| **Administrador** | D&D Textil (Plataforma) | `admin@ddtextil.com` | `admin123` |
| **Vendedor 1** | Textiles Pérez & Cía (Medellín) | `vendedor@ddtextil.com` | `vendedor123` |
| **Vendedor 2** | Casa Textil González (Bogotá) | `maria.gonzalez@ddtextil.com` | `vendedor123` |
| **Vendedor 3** | Hilos del Valle Textil (Cali) | `andres.restrepo@hilosdelvalle.com` | `vendedor123` |
| **Vendedor 4** | Telas & Seda del Caribe (Barranquilla) | `valentina.castro@telasdelcaribe.com` | `vendedor123` |
| **Cliente** | Comprador Principal / VIP | `cliente@gmail.com` | `cliente123` |

---

## 2. Tienda en línea y Marketplace

### 2.1. Inicio

Al abrir la dirección de la tienda verás la portada principal con los siguientes controles clave:

1. **Barra superior:** permite ir a **Inicio** (`/`), **Catálogo** (`/catalogo`), **Tiendas** (`/tiendas`), **Contacto** (`/contacto`) y **Nosotros** (`/nosotros`).
2. **Icono de luna / sol:** cambia entre modo claro y modo oscuro manteniendo el contraste cromático 60-30-10.
3. **Ingresar:** lleva a la pantalla de inicio de sesión. Si ya entraste, muestra tu nombre y el acceso directo a tu panel (**Mi Cuenta**).
4. **Carrito (icono de bolsa):** muestra cuántos productos llevas agregados y abre el resumen multi-vendedor.
5. **Explorar Colección:** baja directamente al catálogo de telas destacadas o abre la vista completa de catálogo.

### 2.2. Tiendas Proveedoras

En **Tiendas** (`/tiendas`) accedes al directorio oficial de los proveedores externos registrados en PostgreSQL:

- Cada tarjeta muestra la portada, logo/avatar, ciudad de origen, calificación promedio en estrellas y botón para ingresar a la vitrina.
- Al entrar en **Perfil Público de Tienda** (`/tienda/:id`) ves su diseño tipo red social con tres pestañas: **Telas en Venta**, **Reseñas del Vendedor** y **Información y Envíos** (solo usuarios autenticados con rol `cliente` pueden publicar calificaciones a la tienda).

### 2.3. Catálogo

En **Catálogo** (`/catalogo`) encuentras todas las telas activas con carga optimizada incremental sin lag al desplazarse:

- **Apartados rápidos:** alterna entre **Todos**, **Nuevas Colecciones**, **Telas Exclusivas VIP** (desbloqueadas automáticamente por el algoritmo de recurrencia para clientes frecuentes) y **Ofertas Especiales**.
- **Filtro por proyecto (*¿Qué estás imaginando crear?*):** elige el uso final (**Moda y Confección**, **Cortinas y Hogar**, **Tapicería**, **Verano** o **Invierno**) para que el sistema filtre los tejidos recomendados.
- **Ordenar y precio:** ajusta el orden y el rango de **Precio** por metro lineal, viendo distintivos claros de *Más Vendido* y *Descuento*.
- Haz clic sobre la foto o el nombre de cualquier tela para abrir su ficha técnica detallada.

### 2.4. Ficha de la tela y comparador

Dentro de la página de un producto (`/producto/:id`) revisas su ficha técnica (composición, gramaje $\text{g/m}^2$, ancho útil y cuidados de lavado), la tarjeta del proveedor vendedor y el **Comparador de Competencia** entre vendedores para la misma categoría/tejido:

1. **Metros por corte:** usa los botones `-` y `+` o escribe cuántos metros lineales necesitas en ese corte.
2. **Cantidad de cortes:** indica cuántos tramos iguales de ese metraje deseas llevar.
3. **Agregar al carrito:** guarda la selección en tu bolsa de compras para seguir navegando por la tienda.
4. **Comprar ahora:** agrega el producto y te dirige de inmediato al carrito para finalizar la orden.
5. **Favoritos (corazón):** guarda la tela en tu **Lista de deseos / Muestrario Virtual** (requiere sesión iniciada).
6. **Reseñas:** consulta calificaciones reales verificadas y, si tienes sesión de **cliente**, califica de **1 a 5 estrellas**.

### 2.5. Carrito

Haz clic en el icono de la bolsa en la esquina superior derecha para abrir tu carrito (`/carrito`), donde se agrupan telas de uno o múltiples proveedores:

- **Cambiar metros:** ajusta los metros con `-` y `+` o elimina un corte haciendo clic en el icono de papelera.
- **Código de cupón:** si cuentas con un código promocional (por ejemplo `BIENVENIDA10`), escríbelo en el campo correspondiente y pulsa **Aplicar**.
- **Resumen del pedido:** a la derecha se detalla en tiempo real:
  - **Subtotal** de las telas seleccionadas (y división automática por tienda al confirmar).
  - **Descuento** aplicado por cupón o volumen.
  - **Envío:** tarifa estándar configurada, o **gratis** al superar el umbral de compra.
  - **IVA (19 %)** discriminado legalmente.
  - **Total a pagar**.
- Haz clic en **Proceder al Pago** para avanzar al checkout (exclusivo para usuarios autenticados con rol `cliente`).

### 2.6. Crear una cuenta

Para registrarte como cliente nuevo (`/registro`):

1. Haz clic en **Ingresar** en la barra superior y luego selecciona **Regístrate aquí**.
2. Completa tu **Nombre Completo**, **Correo Electrónico** y una **Contraseña** (mínimo 6 caracteres), o utiliza los botones de registro rápido con **Google** o **Microsoft**.
3. Marca las casillas de aceptación de **Términos y Condiciones** y la **Política de Tratamiento de Datos Personales (Habeas Data — Ley 1581 de 2012)**.
4. Haz clic en **Crear Cuenta**.

### 2.7. Iniciar sesión

En la pantalla **Bienvenido de nuevo** (`/login`):

1. Escribe tu **Correo Electrónico** y tu **Contraseña**, y pulsa **Iniciar Sesión**.
2. Si lo prefieres, entra con tu cuenta corporativa o personal de **Google** o **Microsoft**.
3. **Solo en entorno de demostración:** debajo del formulario encontrarás los botones de acceso rápido (**Cliente**, **Vendedor**, **Admin**) para pruebas en vivo cuando `VITE_ENABLE_DEMO_ACCOUNTS=true`.

---

## 3. Comprar telas

Al pulsar **Proceder al Pago** desde el carrito se inicia el proceso de compra en tres pasos guiados (**Envío** → **Pago** → **Confirmación**). Esta ruta requiere autenticación estricta con rol **`cliente`** (`strict={true}`): si eres visitante serás redirigido a `/login` o `/registro`, y si iniciaste sesión como `vendedor` o `admin` deberás usar una cuenta de `cliente` para comprar. Al confirmar, si tu carrito tiene telas de varias tiendas, realizas **un único pago unificado** y el backend crea automáticamente sub-pedidos independientes (`grupo_checkout`) liquidando comisión y ganancia neta por tienda.

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

## 4. Panel del cliente (Único rol habilitado para compras y reseñas)

> **Regla de Seguridad Marketplace:** Por integridad transaccional, únicamente los usuarios autenticados con rol **`cliente`** pueden confirmar pedidos en `/checkout`, realizar pagos en `/pago` y publicar reseñas verificadas sobre productos o tiendas proveedoras. Visitantes no registrados, vendedores y administradores ven el catálogo y las tiendas pero tienen bloqueadas las compras.

Cuando inicias sesión con una cuenta de cliente accedes a tu espacio personal (`/cliente`). Desde el menú lateral izquierdo puedes navegar por todas tus herramientas de compra, cálculo textil y postventa, además de explorar **Tiendas Proveedoras** (`/tiendas`) y sus perfiles tipo red social (`/tienda/:id`).

### 4.1. Historial de pedidos y desglose por tienda

En **Resumen** o **Mis Pedidos** (`/cliente/pedidos`) encuentras todas tus compras realizadas:

- Cada fila muestra el número de sub-pedido por vendedor (si compraste telas de múltiples tiendas en un mismo carrito, se agrupan bajo el mismo comprobante de pago `grupo_checkout`), la fecha, los metros comprados, el total pagado y el estado actual (**Pagado**, **En Corte**, **Empacado**, **Enviado** o **Entregado**).
- Haz clic en **Ver Detalles** para desplegar los artículos del pedido, la dirección de despacho y el botón para descargar tu **Factura Electrónica en PDF** (con código QR y CUFE).

### 4.2. Rastrear un envío

En **Rastrear Envío** (`/cliente/pedidos/rastreo`):

1. Escribe el número de pedido (por ejemplo `1001`) o el número de guía logística (por ejemplo `COL987654321`) y pulsa **Buscar**.
2. También puedes hacer clic directamente sobre cualquiera de tus pedidos recientes listados debajo del buscador.
3. Verás la barra de progreso con las cinco etapas operativas del despacho:
   - **Pedido Confirmado** → **En Proceso de Corte** → **Empacado** → **En Tránsito** → **Entregado**, junto con el historial cronológico de actualizaciones de bodega.

### 4.3. Reportar un problema

Si recibiste un pedido con alguna novedad de calidad o metraje, ve a **Reportar Problema** (`/cliente/soporte/nuevo`) o consulta **Mis Tickets** (`/cliente/soporte/tickets`):

1. Selecciona el **Pedido Relacionado** (el sistema habilita únicamente pedidos en estado **Entregado**).
2. Elige el **Tipo de Problema**:
   - *Tela con manchas o daños físicos*.
   - *Hilos sueltos o imperfectos de tejido*.
   - *Color diferente al mostrado en catálogo*.
   - *Metraje incompleto o menor al facturado*.
3. Escribe una **Descripción Detallada** del inconveniente y, si lo deseas, adjunta fotografías de evidencia del rollo o corte recibido.
4. Haz clic en **Enviar Reporte**. En **Mis Tickets** (`/cliente/soporte/tickets`) podrás consultar en todo momento el estado (**Abierto**, **En Revisión** o **Resuelto**).

### 4.4. Calculadora de metraje

Si no estás seguro de cuántos metros lineales comprar para tu prenda o proyecto de hogar, abre la **Calculadora de Metraje** (`/cliente/coleccion/calculadora`):

1. Elige el **Tipo de Proyecto** entre los 6 moldes paramétricos incluidos:
   - *Falda Circular*, *Falda Recta*, *Cortinas Estándar*, *Mantel de Mesa*, *Cojines Decorativos* o *Vestido Sencillo*.
2. Selecciona el **Ancho de la Tela** del rollo (**1,40 m**, **1,50 m**, **1,60 m** o **2,80 m** para lencería de hogar/cortinería).
3. Ingresa las medidas solicitadas en centímetros (largo, cintura, ancho de ventana, dimensiones de mesa, etc.).
4. En el recuadro derecho verás de inmediato los **Metros Recomendados**, que ya incluyen un **10 % adicional de margen técnico** por encogimiento de lavado y costuras.

### 4.5. Lista de deseos

En **Lista de Deseos** (`/cliente/coleccion`, también accesible vía `/favoritos`) se guardan las telas que marcaste con el icono de corazón en el catálogo:

- Funciona como un **Muestrario Virtual**: puedes filtrar tus telas guardadas por categoría o quitarlas cuando ya no las necesites, facilitando la planeación de colecciones de confección.

### 4.6. Mi perfil, direcciones y nivel VIP

En **Mi Perfil** (`/cliente/configuracion`) y **Libreta de Direcciones** (`/cliente/configuracion/direcciones`) puedes administrar tu cuenta:

- **Datos Personales:** actualiza tu nombre, correo electrónico o teléfono y pulsa **Guardar Cambios**.
- **Direcciones:** agrega, edita o elimina direcciones de entrega frecuentes (`/cliente/configuracion/direcciones`) y marca una como **Principal** para agilizar futuros checkouts.
- **Seguridad y Elegibilidad VIP:** cambia tu contraseña actual y consulta si tu recurrencia de compra ya desbloqueó el catálogo **Exclusivo VIP**.

---

## 5. Panel del vendedor (Proveedores Externos Marketplace)

Al ingresar con una cuenta de vendedor (por ejemplo `vendedor@ddtextil.com`, `maria.gonzalez@ddtextil.com`, `andres.restrepo@hilosdelvalle.com` o `valentina.castro@telasdelcaribe.com`) accedes al panel **ERP Vendedor** (`/vendedor`), donde administras tu propia tienda, tus telas y tus liquidaciones netas tras la comisión del 10 % de la plataforma.

### 5.1. Mi Tienda — Perfil público tipo red social

En **Mi Tienda (Perfil)** (`/vendedor/mi-tienda`):

- Edita en vivo la **foto de portada**, **avatar/logo**, **nombre comercial**, **biografía**, **ciudad**, **especialidad** y **políticas de envío**.
- Haz clic en **Ver mi perfil público** para previsualizar exactamente cómo ven los clientes tu vitrina en `/tienda/:id`, junto con tus telas activas y reseñas verificadas.

### 5.2. Alertas y Oportunidades VIP / Auditorías

En **Alertas y Auditorías** (`/vendedor/alertas`) recibes alertas reales generadas en base de datos (`alertas_vendedor`):

- **Oportunidades VIP (`vip_recomendado`):** notificaciones automáticas cuando el algoritmo detecta clientes recurrentes para activar telas exclusivas o promociones con descuento sugerido.
- **Auditorías de Catálogo:** observaciones de calidad enviadas por el administrador cuando marca un producto con estado *Requiere cambios* (`changes_requested`).
- **Alertas de Stock Bajo y Reportes de Mermas:** avisos oficiales enviados por el administrador desde el tablero de auditoría de inventario para que repongas stock o ajustes mermas.

### 5.3. Productos, precios propios y comparativa competitiva

En **Mis Productos** (`/vendedor/productos`):

- En la parte superior visualizas indicadores reales en tiempo real (ingresos netos descontando comisión, pedidos activos, productos publicados y stock bajo).
- Solo tú (el vendedor propietario) puedes fijar o editar precios, porcentajes de descuento, stock disponible y habilitar **Telas Exclusivas VIP**. El administrador tiene bloqueada por sistema la edición de precios e inventario para prevenir fraude.
- **Desactivar / Activar / Eliminar:** gestiona tus fichas técnicas; los cambios quedan sujetos al flujo de moderación administrativa.

### 5.4. Pedidos y Alertas de Stock

- **Gestión de Pedidos** (`/vendedor/pedidos`): consulta exclusivamente los sub-pedidos pertenecientes a tu tienda (con desglose de venta bruta, comisión de plataforma y ganancia neta del vendedor) filtrando por estado (**Preparando**, **Enviados**, **Entregados**).
- **Alertas de Stock** (`/vendedor/stock`): identifica referencias con stock crítico o bajo en tu bodega y actualiza los metros disponibles tras recibir nuevos rollos.

---

## 6. Panel del administrador (Gobierno, Comisiones y Auditoría Antifraude)

El panel **ERP Intelligence** (`/admin`) reúne las herramientas ejecutivas, moderación, comisiones marketplace y auditoría en tiempo real alimentadas íntegramente desde PostgreSQL (sin datos hardcodeados).

### 6.1. Resumen

Al entrar al panel (`/admin`) verás el tablero ejecutivo de control:

- **Indicadores reales (KPIs):** volumen total de ventas marketplace, **ingresos por comisiones de administración (10 %)**, pedidos completados, ganancias netas de vendedores y métricas por tienda.
- **Centro de alertas:** notificaciones operativas sobre stock bajo en proveedores, reportes técnicos abiertos y telas pendientes en cola de moderación.

### 6.2. Usuarios, Vendedores y Clientes

En el bloque **Usuarios** (`/admin/usuarios`, `/admin/vendedores`, `/admin/clientes`) administras todas las cuentas reales registradas en la plataforma:

- Busca usuarios por nombre o correo y filtra por rol (**Administrador**, **Vendedor**, **Cliente**).
- Consulta las métricas reales de facturación por tienda (`/admin/vendedores`) y segmentación VIP de compradores recurrentes (`/admin/clientes`).
- **Suspender / Activar:** bloquea temporalmente el acceso de una cuenta sin borrar su historial transaccional.

### 6.3. Catálogo y Moderación (Control Antifraude)

En **Productos** (`/admin/productos`) y **Cola de Aprobación** (`/admin/moderacion/aprobacion`):

- Supervisas todas las telas del marketplace en modo **auditoría**: por política antifraude, el administrador **no puede modificar el precio, stock ni descuentos** definidos por los vendedores.
- Puedes **Aprobar** una tela nueva/actualizada o marcar **Solicitar Cambios** (`changes_requested`) indicando el motivo; esta acción crea automáticamente una alerta real en la bandeja `/vendedor/alertas` del proveedor.
- En **Rendimiento** (`/admin/moderacion/vendedores`) evalúas cumplimiento de despacho, calificación promedio y reclamos de cada tienda.

### 6.4. Carrusel y página de inicio

En **Carrusel** (`/admin/carrusel`) y **Página Inicio** (`/admin/home`) personalizas la portada pública de la tienda sin tocar código:

- **Diapositivas del carrusel:** pulsa **+ Agregar Slide** para subir una imagen promocional con título, subtítulo y enlace, reordenarlas o activarlas/desactivarlas individualmente.
- **Visibilidad de secciones:** muestra u oculta con un interruptor las secciones de la página principal (**Portada**, **Carrusel**, **Productos Destacados**, **Novedades**, **Beneficios**, etc.).

### 6.5. Auditoría de Inventario Antifraude (Solo Lectura y Alertas Reales)

Por separación estricta de responsabilidades y prevención de fraudes, el módulo de **Inventario** del administrador opera en **modo auditoría (solo lectura)** sobre lotes y mermas — el administrador no puede alterar manualmente metros, crear rollos ni modificar mermas:

1. **Auditoría de Lotes** (`/admin/inventario/lotes`): visualiza las entradas de lotes de cada vendedor y sus códigos de lote de tintorería.
2. **Auditoría de Mermas** (`/admin/inventario/merma`): revisa pérdidas por corte o remanentes sub-metro de cada tienda y pulsa **Enviar Reporte de Mermas al Vendedor** para despachar el resumen real a la bandeja `/vendedor/alertas`.
3. **Notificar Stock Bajo** (`/admin/inventario/alertas`): supervisa telas próximas a agotarse y pulsa **Notificar al Vendedor** para enviar una alerta real (`stock_bajo`) al proveedor responsable.
4. **Historial de Movimientos** (`/admin/inventario/historial`): bitácora completa de auditoría con filtros y exportación **CSV** para contabilidad.

### 6.6. Soporte, cupones y reportes

En el bloque de **Soporte** y **Reportes** (`/admin/soporte/tickets`, `/admin/soporte/cupones`, `/admin/reportes`):

- **Gestión de Tickets** (`/admin/soporte/tickets`): bandeja centralizada con reclamos de clientes, filtros por prioridad (**Alta**, **Media**, **Baja**) y seguimiento hasta cierre.
- **Crear Cupones** (`/admin/soporte/cupones`): define códigos promocionales por porcentaje o valor fijo, vigencia, compra mínima y límite de usos.
- **Reportes** (`/admin/reportes`): registro técnico de fallos reportados.

### 6.7. Analítica y facturación

En el bloque de **Analítica** (`/admin/analytics/*`) y **Facturación** (`/admin/facturas`):

- **Mapa de Ventas** (`/admin/analytics/mapa-ventas`): distribución geográfica real por departamento de Colombia.
- **Rotación de Inventario** (`/admin/analytics/rotacion`): telas de alta rotación vs baja rotación por tienda.
- **Análisis de Devoluciones** (`/admin/analytics/devoluciones`): causas de novedad y métricas por vendedor.
- **Proyección de Ingresos** (`/admin/analytics/proyeccion`): estimación financiera de ingresos y comisiones basada en histórico real.
- **Facturación** (`/admin/facturas`): listado consolidado de sub-pedidos y facturas emitidas con descarga directa en PDF.

### 6.8. Configuración

En **Configuración** (`/admin/configuracion`) ajustas el nombre comercial, parámetros visuales globales, porcentaje de **IVA**, costos de envío estándar, envío gratuito y tasas de comisión de la plataforma.

---

## 7. Uso desde el celular

La tienda se adapta automáticamente a pantallas de celular y tablet (**Diseño Responsivo Mobile-First** y soporte **PWA / App Android**):

- El menú superior se convierte en un botón de tres líneas (**menú hamburguesa**) en la esquina superior derecha para navegar cómodamente con el pulgar.
- Dentro de los paneles de **Cliente**, **Vendedor** y **Administrador**, el menú lateral se abre y se cierra tocando el icono de menú en la esquina superior izquierda.
- Las tablas extensas de inventario, pedidos y movimientos se pueden desplazar horizontalmente deslizando con el dedo sin perder legibilidad.

---

## 8. Preguntas frecuentes

### ¿Por qué no aparecen los botones de acceso rápido (Cliente / Vendedor / Admin) en el login?
Esos botones solo se muestran cuando la aplicación corre en modo de prueba o demostración local (`VITE_ENABLE_DEMO_ACCOUNTS=true`). En el entorno de producción real se ocultan automáticamente por seguridad.

### ¿Los pagos realizados en el entorno de prueba cobran dinero real?
No. En el entorno de demostración la pasarela de pagos funciona en modo simulador (*Sandbox*) para que puedas probar tarjetas de crédito/débito, PSE, Wompi, Mercado Pago, Nequi/Bre-B y ePayco sin realizar cargos bancarios reales.

### ¿Por qué no puedo reportar un problema sobre un pedido que acabo de hacer?
El formulario de **Soporte y Devoluciones** solo habilita pedidos que ya figuran como **Entregado**, ya que está diseñado para reportar novedades sobre la tela física recibida en tu dirección.

### ¿Qué hago si al navegar muy rápido aparece un aviso de "Demasiadas peticiones"?
El servidor cuenta con un límite de seguridad contra abusos automatizados (*Rate Limiting* de **1.200 peticiones por minuto por IP**). Espera unos segundos y vuelve a recargar la página.

### ¿Se borra mi carrito si recargo la página?
No. El carrito de compras, el tema visual (claro/oscuro) y tu sesión firmada se conservan en el navegador hasta que cierres sesión explícitamente o el token cumpla su ciclo de expiración de 12 horas.
