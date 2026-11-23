# Manual de Usuario — D&D Textil (Tienda Digital de Telas)

> **Documento Oficial de Usuario Final y Operación por Roles**  
> **Versión:** 1.1 (Noviembre 2026)  
> **Proyecto:** D&D Textil — Tienda digital de telas  
> **Programa de formación:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) — SENA  
> **Dirigido a:** Clientes, vendedores y administradores  
> **Archivo PDF Oficial:** [Manual_de_usuario_DD_Textil.pdf](./Manual_de_usuario_DD_Textil.pdf)

Este manual describe la aplicación tal como funciona en la versión actual del repositorio. Las pantallas se tomaron el 17 de noviembre de 2026 con la base de datos de demostración. Los recuadros **Aviso** señalan funciones que todavía no están completas o que se comportan distinto a lo que muestra la pantalla.

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
   - [3.2. Forma de pago](#32-forma-de-pago)
   - [3.3. Confirmación](#33-confirmación)
4. [Panel del cliente](#4-panel-del-cliente)
   - [4.1. Mi resumen](#41-mi-resumen)
   - [4.2. Historial de pedidos y facturas](#42-historial-de-pedidos-y-facturas)
   - [4.3. Rastrear un envío](#43-rastrear-un-envío)
   - [4.4. Reportar un problema y mis tickets](#44-reportar-un-problema-y-mis-tickets)
   - [4.5. Calculadora de metraje](#45-calculadora-de-metraje)
   - [4.6. Lista de deseos](#46-lista-de-deseos)
   - [4.7. Mi perfil y libreta de direcciones](#47-mi-perfil-y-libreta-de-direcciones)
5. [Panel del vendedor](#5-panel-del-vendedor)
   - [5.1. Resumen y mis productos](#51-resumen-y-mis-productos)
   - [5.2. Gestión de pedidos](#52-gestión-de-pedidos)
   - [5.3. Alertas de stock](#53-alertas-de-stock)
6. [Panel del administrador](#6-panel-del-administrador)
   - [6.1. Resumen](#61-resumen)
   - [6.2. Usuarios](#62-usuarios)
   - [6.3. Catálogo de textiles](#63-catálogo-de-textiles)
   - [6.4. Carrusel y página de inicio](#64-carrusel-y-página-de-inicio)
   - [6.5. Inventario](#65-inventario)
   - [6.6. Moderación](#66-moderación)
   - [6.7. Soporte y cupones](#67-soporte-y-cupones)
   - [6.8. Analítica](#68-analítica)
   - [6.9. Facturación y reportes](#69-facturación-y-reportes)
   - [6.10. Configuración](#610-configuración)
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
| **Visitante** | Ver el catálogo, guardar favoritos, armar el carrito y hacer el checkout. | `/` y `/catalogo` |
| **Cliente** | Todo lo anterior + historial de pedidos, facturas en PDF, rastreo, calculadora de metraje, tickets de soporte, perfil y direcciones. | `/cliente` |
| **Vendedor** | Publicar, editar y eliminar sus telas, revisar sus pedidos y las alertas de stock. | `/vendedor` |
| **Administrador** | Controlar toda la tienda: usuarios, catálogo, carrusel, inventario de rollos, moderación, cupones, soporte, analítica, facturación y configuración de marca. | `/admin` |

### Cuentas de prueba

En la base de datos de demostración existen estas cuentas. También puedes cargarlas con los botones de **Acceso rápido (Demo)** de la pantalla de inicio de sesión.

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@ddtextil.com` | `admin123` |
| **Vendedor** | `vendedor@ddtextil.com` | `vendedor123` |
| **Cliente** | `cliente@ddtextil.com` | `cliente123` |

---

## 2. Tienda en línea

### 2.1. Inicio

Al abrir la dirección de la tienda verás la portada principal:

1. **Franja superior:** muestra la promoción vigente (*¡Envío gratis en compras superiores a $200.000 COP a todo el país!*). Se puede cerrar con la **X**.
2. **Menú:** **Inicio**, **Catálogo**, **Nosotros** y **Contacto**.
3. **Iconos de la derecha:** luna/sol (modo claro u oscuro), corazón (lista de deseos) y carrito, con un número que indica cuántos productos llevas.
4. **Ingresar:** abre la pantalla de inicio de sesión. Si ya entraste, muestra tu nombre y te lleva a tu panel.
5. **Explorar colección** y **Conocer más:** llevan al catálogo y a la página *Nosotros*.
6. **Asesor en línea:** el botón verde de la esquina inferior derecha abre el chat de WhatsApp con la tienda.

### 2.2. Catálogo

En **Catálogo** (`/catalogo`) encuentras todas las telas aprobadas:

- **Apartados:** **Todos**, **Nuevas Colecciones**, **Telas Exclusivas** y **Ofertas Especiales**.
- **¿Qué estás imaginando crear?:** filtra por proyecto (**Todo el Catálogo**, **Vestidos de Gala**, **Muebles de Exterior**, **Moda de Verano**).
- **Ordenar por:** *Destacados*, *Precio: Menor a Mayor*, *Precio: Mayor a Menor* o *Nombre A-Z*.
- **Rango de precio:** control deslizante con el precio máximo por metro.
- El corazón de cada tarjeta guarda la tela en tu lista de deseos. Haz clic en la foto o el nombre para abrir su ficha.

### 2.3. Ficha de la tela

En la página de un producto (`/producto/:id`) ves la galería de fotos (pasa el cursor para ampliar), el precio por metro y la **Información de la Tela**: material, ancho, peso (g/m²), stock disponible y cuidados de lavado. Debajo puedes:

1. **Metros por corte:** cuántos metros necesitas en cada corte.
2. **Cantidad de cortes:** cuántos cortes iguales llevas. El sistema no deja superar el stock.
3. **Agregar al Carrito** o **Comprar Ahora** (agrega y te lleva al carrito).
4. **Favoritos** y **Compartir** (copia el enlace de la tela).
5. **Reseñas:** lee las opiniones de otros compradores. Con la sesión iniciada puedes calificar de 1 a 5 estrellas y dejar un comentario.

### 2.4. Carrito

Haz clic en el icono del carrito para abrir **Carrito de Compras** (`/carrito`):

- Cambia los metros con `-` y `+`, elimina un producto con la papelera o usa **Vaciar carrito**.
- **Cupón:** escribe el código en el campo **CÓDIGO** y pulsa **Aplicar**. En la base de demostración funcionan, por ejemplo, `DESCUENTO10` y `BIENVENIDA20`.
- **Resumen del pedido:** subtotal, descuento, envío (**$15.000 COP**, gratis desde **$200.000 COP**; el aviso azul indica cuánto falta), **IVA (19 %)** y **Total**.
- Pulsa **Continuar a Envío y Pago**.

El carrito y el cupón se guardan en el navegador, así que no se pierden al recargar la página.

### 2.5. Crear una cuenta

En **Crear Cuenta** (`/registro`):

1. Escribe tu **Nombre Completo**, **Correo Electrónico**, **Contraseña** (mínimo 8 caracteres) y **Confirmar Contraseña**.
2. Marca la casilla de autorización de tratamiento de datos personales (**Ley 1581 de 2012, Habeas Data**). Es obligatoria.
3. Pulsa **Crear Cuenta**.

Debajo aparecen los botones **Google** y **Microsoft** (*O regístrate con*).

> **Aviso:** los botones de Google y Microsoft solo funcionan si el servidor tiene configurados `VITE_GOOGLE_CLIENT_ID` y `VITE_AZURE_CLIENT_ID`. En la instalación de prueba muestran un mensaje de que no están configurados.

### 2.6. Iniciar sesión

En **Bienvenido de nuevo** (`/login`):

1. Escribe tu **Correo Electrónico** y tu **Contraseña** y pulsa **Iniciar Sesión**.
2. También puedes usar **Continuar con Google** o **Continuar con Microsoft** (ver el aviso anterior).
3. **Acceso rápido (Demo):** los botones **Admin**, **Vendedor** y **Cliente** llenan el formulario con las cuentas de prueba.

Si escribes mal la contraseña varias veces seguidas, el sistema bloquea ese correo durante 15 minutos.

---

## 3. Comprar telas

La compra tiene dos pasos (**Datos de Envío y Facturación** → **Pasarela de Pago**) y una pantalla de confirmación. No es obligatorio iniciar sesión, pero conviene hacerlo: así el pedido queda en tu **Historial de Pedidos**.

### 3.1. Datos de envío

En **Datos de Envío y Facturación** (`/checkout`):

1. **Información de Contacto:** nombre completo, correo electrónico y teléfono móvil.
2. **Dirección de Envío:** dirección de entrega, ciudad o municipio, departamento, código postal y notas (opcional, por ejemplo *"Dejar en portería"*).
3. A la derecha revisa el **Resumen del Pedido** (productos, subtotal, envío, IVA y total).
4. Pulsa **Continuar a Pasarela de Pago** (o **Ir a Pasarela de Pago** en el resumen).

### 3.2. Forma de pago

En **Elige tu Forma de Pago** (`/pago`) aparece el total y seis opciones:

| Opción | Detalle en pantalla |
| :--- | :--- |
| **Wompi Bancolombia** (recomendado) | Nequi, PSE, Botón Bancolombia o tarjetas. |
| **Mercado Pago** | Checkout Pro, cuotas, Efecty. |
| **Nequi / Daviplata / Bre-B** | Transferencia con código QR. |
| **ePayco / Efecty / Gana** | Baloto, Gana Antioquia, SuRed. |
| **Tarjeta Crédito / Débito** | Visa, Mastercard, Amex. |
| **PSE / Contraentrega** | Todos los bancos o pago al recibir. |

Para pagar con tarjeta llena el nombre del titular, el número, la fecha `MM/AA`, el `CVV` y el tipo y número de documento. La tarjeta de la izquierda se actualiza mientras escribes. Pulsa **Pagar de forma segura**.

> En esta versión todos los medios de pago son simulados: no se hace ningún cobro real.

### 3.3. Confirmación

Al terminar se muestra **¡Pago Aprobado y Pedido Confirmado!** con la **Referencia de Pago** (`DD-…`), el ID de transacción, la fecha y el detalle del pedido.

> **Aviso:** la pantalla de confirmación siempre indica pago aprobado, pero en la versión actual el servidor rechaza la confirmación (`POST /api/pagos/confirmar` responde *"Rechazado por seguridad PCI-DSS"* porque confunde la referencia de pago con un número de tarjeta). El pedido queda en estado **Pendiente** y así aparece en el historial, el rastreo y la facturación. Ver `BUG-PAY-01` en [14-plan-y-reporte-de-pruebas-iso25010.md](14-plan-y-reporte-de-pruebas-iso25010.md).

---

## 4. Panel del cliente

Al iniciar sesión como cliente entras a tu panel (`/cliente`). El menú lateral tiene: **Mi Resumen**, **Compras** (Historial de Pedidos, Rastrear Envío), **Mi Colección** (Lista de Deseos, Calculadora de Metraje), **Ayuda** (Mis Tickets, Reportar Problema) y **Ajustes** (Mi Perfil, Libreta de Direcciones). Abajo están tu nombre, el botón de inicio y **Cerrar sesión**.

### 4.1. Mi resumen

Muestra un resumen de tus compras, pedidos recientes y accesos directos a las demás opciones.

### 4.2. Historial de pedidos y facturas

En **Historial de Pedidos** (`/cliente/pedidos`):

- Arriba ves **Total Pedidos**, **En Proceso** y **Entregados**.
- Busca por número de pedido o de guía, o filtra con **Todos los estados**.
- Cada pedido muestra número, fecha, estado (**Pendiente**, **Pagado**, **En Corte**, **Empacado**, **Enviado**, **Entregado** o **Cancelado**), total y telas.
- **Ver Detalles** despliega los productos y la dirección. **Factura** descarga el PDF de la factura (`FAC-000001.pdf`, con CUFE).
- Si el pedido está **Entregado** aparece además **Reportar Problema**.

### 4.3. Rastrear un envío

En **Rastrear Envío** (`/cliente/pedidos/rastreo`):

1. Escribe el número de pedido (por ejemplo `1`) o la guía (por ejemplo `DDT-COL-1`), o elige uno de tus pedidos.
2. Verás la línea de etapas **Pago → Corte → Empaque → Envío → Entrega**, la guía y la transportadora, el historial de estados, el **Resumen Financiero** y el **Destino y Destinatario**.
3. El indicador **En Vivo** y el botón de recarga actualizan la información.

> **Aviso:** mientras el pedido esté pendiente, el historial puede mostrar el texto *"Pago aprobado y registrado"*. El estado real es el que aparece en la etiqueta junto al número de pedido.

### 4.4. Reportar un problema y mis tickets

En **Reportar Problema** (`/cliente/soporte/nuevo`):

1. Elige el pedido afectado o **Consulta general / Sin pedido específico**. La lista muestra todos tus pedidos, sin importar su estado.
2. Elige el tipo de problema: manchas, hilos sueltos, color incorrecto, metraje incorrecto, tela dañada en transporte, tela equivocada, calidad diferente, retraso en la entrega, pago o facturación, u otro.
3. Escribe la descripción (máximo 500 caracteres) y adjunta hasta 5 fotos.
4. Pulsa **Enviar Reporte a Soporte**.

En **Mis Tickets** (`/cliente/soporte/tickets`) consultas el estado de tus casos.

### 4.5. Calculadora de metraje

En **Calculadora de Metraje** (`/cliente/coleccion/calculadora`):

1. En **¿Qué vas a hacer?** elige: *Falda Circular*, *Falda Recta*, *Cortinas*, *Mantel*, *Cojines* o *Vestido Sencillo*.
2. Elige el **Ancho de la tela** (1,10 m, 1,40 m, 1,50 m estándar, 2,80 m o 3,00 m) y, si quieres un costo estimado, escribe el **Precio por metro (opcional)**.
3. Escribe las medidas en centímetros y pulsa **Calcular Metraje**.

El resultado incluye un margen de seguridad (10 % en la mayoría de proyectos) por encogimiento y costuras.

### 4.6. Lista de deseos

En **Lista de Deseos** (`/cliente/coleccion`, también `/favoritos`) están las telas que marcaste con el corazón. Funciona como **Muestrario Virtual**: puedes filtrarlas por categoría y quitarlas.

> **Aviso:** la lista de deseos se guarda en el navegador, no en la base de datos. Si cambias de equipo o borras los datos del navegador, no la verás.

### 4.7. Mi perfil y libreta de direcciones

- **Mi Perfil** (`/cliente/configuracion`): cambia tu foto, nombre, correo y teléfono, y pulsa **Guardar Cambios**. En **Seguridad** está **Cambiar contraseña**.
- **Libreta de Direcciones** (`/cliente/configuracion/direcciones`): **Agregar Nueva Dirección**, editarla, eliminarla y marcar una como **Principal**.

---

## 5. Panel del vendedor

Al ingresar como vendedor entras a **ERP Vendedor** (`/vendedor`). El menú tiene **Resumen**, **Inventario** (Mis Productos, Alertas de Stock), **Ventas** (Gestión de Pedidos), **Ayuda y Soporte** y **Configuración**.

> **Aviso:** los números rojos del menú (por ejemplo, 2 y 5) son fijos. No cuentan alertas ni pedidos reales.

### 5.1. Resumen y mis productos

- **Filtros Operativos:** periodo (*Últimos 7 días*) y categoría.
- **Indicadores:** **Mis Ventas Totales**, **Pedidos Procesados**, **Ticket Promedio** y **Estado de Inventario**.
- **Desempeño de Ventas Diarias** y **Productos Estrella**.
- **Control de Inventario y Catálogo:** tabla con producto, precio, stock (en rojo si es bajo) y categoría. El lápiz edita y la papelera elimina.
- **+ Nuevo Producto** abre el formulario para publicar una tela (nombre, precio, stock, categoría, descripción e imagen). El producto queda publicado de inmediato.

### 5.2. Gestión de pedidos

En **Gestión de Pedidos** (`/vendedor/pedidos`) aparecen los indicadores **Total Pedidos**, **En Preparación**, **Enviados** y **Entregados**, y la tabla **Mis Pedidos** con las pestañas **Todos**, **En Preparación**, **Enviados** y **Entregados**.

> **Aviso:** los pedidos que hacen los clientes no guardan el vendedor de cada tela, por eso esta pantalla muestra *"No tienes pedidos aún"* aunque existan compras.

### 5.3. Alertas de stock

En **Alertas de Stock** (`/vendedor/stock`):

- Indicadores **Stock Crítico** (menos de 10 m), **Stock Bajo** (menos de 20 m), **Agotados** y **Reportes Abiertos**.
- La lista **Stock Crítico – Acción Urgente** muestra cada tela con sus metros. **Reponer Urgente** abre una ventana para registrar los metros que llegan.

---

## 6. Panel del administrador

El panel **ERP Intelligence** (`/admin`) agrupa las herramientas en el menú lateral: **Resumen**, **Usuarios**, **Catálogo**, **Inventario**, **Moderación**, **Analítica**, **Soporte**, **Facturación**, **Reportes** y **Configuración**.

> **Aviso:** como en el panel del vendedor, los números rojos del menú (3 en Moderación y 12 en Soporte) son fijos.

### 6.1. Resumen

- **Filtros Globales:** periodo y categoría. La etiqueta **PostgreSQL en vivo** indica que los datos vienen de la base de datos.
- **Indicadores:** **Ingresos Totales**, **Clientes Registrados**, **Valor Inventario** y **Pedidos Totales**.
- **Ventas Reales (Base de Datos)**, **Centro de Alertas**, **Actividad Reciente** y **Top Vendedores**.

### 6.2. Usuarios

En **Gestión de Usuarios** (`/admin/usuarios`):

- Indicadores **Total Usuarios**, **Administradores**, **Vendedores** y **Clientes Activos**.
- Filtra con **Todos**, **Admins**, **Vendedores** y **Clientes**, o busca por nombre o correo.
- Cambia el rol con el selector **Rol** y bloquea o reactiva una cuenta con **Suspender**.
- En el submenú están también **Vendedores** y **Clientes**, con métricas de cada grupo.

### 6.3. Catálogo de textiles

En **Catálogo de Textiles** (`/admin/productos`) ves todas las telas de todos los vendedores, con los indicadores **Total Productos**, **Destacados**, **Stock Bajo** y **Agotados**, filtros por categoría y buscador. Cada fila tiene editar y eliminar.

> **Aviso:** el botón **+ Nuevo Textil** solo muestra el mensaje *"Módulo de creación en desarrollo"*. Para crear telas usa **+ Nuevo Producto** en el panel del vendedor.

### 6.4. Carrusel y página de inicio

- **Carrusel** (`/admin/carrusel`): **Agregar Slide**, editar o borrar cada diapositiva (*Nueva Colección 2026*, *Telas Exclusivas*, *Ofertas Especiales*) y cambiar los textos de **Apartados del Inicio**. Los cambios se guardan en la base de datos.
- **Página Inicio** (`/admin/home`): muestra u oculta las secciones **Portada**, **Carrusel de Promociones**, **Productos Destacados** y **Sección de Beneficios**.

### 6.5. Inventario

1. **Control de Lotes** (`/admin/inventario/lotes`): indicadores **Rollos Totales**, **En Movimiento**, **Alertas de Stock** y **Capital Riesgo**; filtros **Todo el Inventario**, **Lotes Sanos**, **Stock Bajo** y **Críticos**; deslizador de **Umbral Crítico**. Cada tarjeta de lote muestra disponibilidad y merma acumulada, y **Ajustar** permite corregir los metros actuales.
2. **Calculadora de Merma** (`/admin/inventario/merma`): **Registrar Merma** abre *Registrar Incidente de Merma* (lote, volumen en metros, clasificación, causa y responsable). Al guardar se descuentan los metros del lote.
3. **Alertas de Stock** (`/admin/inventario/alertas`): tabla **Umbrales por Tipo de Tela**. Haz clic en el valor para editarlo y presiona Enter. Incluye el interruptor de **Notificaciones Email**.
4. **Historial de Movimientos** (`/admin/inventario/historial`): ventas, mermas y ajustes con buscador, filtros **Todos**, **Merma** y **Ventas**, y botón **Exportar CSV**.

> **Aviso:** el botón **Ingresar Lote** solo muestra un mensaje; todavía no hay formulario para registrar rollos nuevos desde la pantalla.

### 6.6. Moderación

- **Cola de Aprobación** (`/admin/moderacion/aprobacion`): productos en estado pendiente, con **Aprobar** o **Rechazar** indicando el motivo. Si no hay ninguno se muestra *"¡Todo al día!"*.
- **Rendimiento** (`/admin/moderacion/vendedores`): ventas y resultados de cada vendedor.

> **Aviso:** los productos creados desde el panel del vendedor se publican como aprobados, así que normalmente la cola está vacía.

### 6.7. Soporte y cupones

- **Gestión de Tickets** (`/admin/soporte/tickets`): indicadores **Total Tickets**, **Backlog Activo**, **Resueltos Hoy** y **Prioridad Alta**; filtros **Todos**, **Abiertos**, **En Acción** y **Resueltos**. Abre un ticket para cambiar su estado.
- **Crear Cupones** (`/admin/soporte/cupones`): **Crear Cupón** abre *Nueva Campaña* con código, tipo (**%** o **COP Fijo**), valor, fecha de expiración y reglas opcionales (compra mínima, usos máximos y *solo para nuevos clientes*). Pulsa **Activar Campaña**. Cada cupón se puede **Desactivar**.

### 6.8. Analítica

- **Mapa de Ventas** (`/admin/analytics/mapa-ventas`): ventas por departamento (mapa de calor), mejor región y promedio por región.
- **Rotación de Inventario** (`/admin/analytics/rotacion`): telas con más y menos movimiento.
- **Análisis de Devoluciones** (`/admin/analytics/devoluciones`): motivos de reclamo más frecuentes.
- **Proyección de Ingresos** (`/admin/analytics/proyeccion`): escenarios proyectado, conservador y optimista.

### 6.9. Facturación y reportes

- **Facturación** (`/admin/facturas`): lista de facturas electrónicas con buscador por número de pedido o cliente, estado y total. **PDF** descarga la factura y **Actualizar** recarga la lista.
- **Reportes** (`/admin/reportes`): reportes de fallos técnicos enviados desde **Reportar fallo** (`/reportar-fallo`), con filtros **Todos**, **Abiertos**, **En Progreso** y **Resueltos**.

### 6.10. Configuración

En **Central de Control de Marca** (`/admin/configuracion`):

- **Identidad de Marca:** nombre del e-commerce, colores **Primario**, **Secundario** y **Acento (CTA)**, **Restaurar Valores de Fábrica** y **Modo Oscuro por Defecto**, con **Live Preview**.
- **Parámetros Financieros & Stock:** tasa de impuesto, costo de envío, umbral de envío gratis y umbral de stock bajo.
- **Banner global:** activa la franja superior y define su mensaje y color.
- Pulsa **Guardar Configuración** para aplicar los cambios.

> **Aviso:** la base de datos inicial trae los colores violeta `#8B5CF6`, rosa `#EC4899` y ámbar `#F59E0B`, por eso las capturas de este manual se ven en violeta. Los colores oficiales de la marca son naranja `#F97316`, pizarra `#0F172A` y `#EA580C` ([Manual de identidad visual](./17-manual-de-identidad-visual.md), sección 06). Para aplicarlos, pulsa **Restaurar Valores de Fábrica** y luego **Guardar Configuración**.

---

## 7. Uso desde el celular

La tienda se adapta a celulares y tablets:

- Arriba quedan el logo, los iconos (tema, favoritos, carrito, cuenta) y el botón de **menú** (tres líneas) con las páginas.
- Los apartados y filtros del catálogo se acomodan en varias filas.
- En los paneles, el menú lateral se abre y se cierra con el icono de menú.
- Las tablas largas se desplazan horizontalmente con el dedo.

El repositorio incluye además el proyecto **Android** (Capacitor) para empaquetar la tienda como aplicación.

---

## 8. Preguntas frecuentes

### ¿Los pagos cobran dinero real?
No. Todas las pasarelas funcionan en modo simulado. Además, en la versión actual la confirmación del pago falla en el servidor y el pedido queda **Pendiente** aunque la pantalla diga *Pago Aprobado* (ver la sección 3.3).

### ¿Por qué no funcionan los botones de Google y Microsoft?
Necesitan los identificadores `VITE_GOOGLE_CLIENT_ID` y `VITE_AZURE_CLIENT_ID` en el archivo `.env` del frontend. Sin ellos el sistema muestra un aviso y se debe entrar con correo y contraseña.

### ¿Puedo reportar un problema de un pedido que acabo de hacer?
Sí. **Reportar Problema** lista todos tus pedidos e incluye la opción de consulta general. El acceso directo desde el historial solo aparece en pedidos **Entregados**.

### ¿Qué hago si aparece un aviso de "Demasiadas peticiones"?
El servidor limita a **1.200 peticiones por minuto por IP**. Espera unos segundos y recarga la página. Si el aviso aparece al iniciar sesión, puede ser el bloqueo de 15 minutos por intentos fallidos.

### ¿Se borra mi carrito si recargo la página?
No. El carrito, el cupón aplicado, la lista de deseos y el tema (claro u oscuro) se guardan en el navegador. La sesión dura 12 horas.
