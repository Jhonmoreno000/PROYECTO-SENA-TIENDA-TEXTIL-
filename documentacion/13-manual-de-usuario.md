# Manual de usuario — D&D Textil

Guía para usar la tienda en línea y los paneles de cliente, vendedor y administrador. Todas las imágenes son capturas reales de la aplicación.

> **Avisos de esta versión.** Algunas funciones todavía no trabajan como se describe en los requisitos. Están señaladas en cada sección con ⚠️.

## Contenido

1. [Antes de empezar](#1-antes-de-empezar)
2. [Tienda en línea](#2-tienda-en-línea)
3. [Comprar telas](#3-comprar-telas)
4. [Panel del cliente](#4-panel-del-cliente)
5. [Panel del vendedor](#5-panel-del-vendedor)
6. [Panel del administrador](#6-panel-del-administrador)
7. [Uso desde el celular](#7-uso-desde-el-celular)
8. [Preguntas frecuentes](#8-preguntas-frecuentes)

## 1. Antes de empezar

**Qué se necesita:** un navegador actualizado (Chrome, Edge o Firefox) y la dirección del sitio. Con la instalación en Docker es `http://localhost:3001`.

**Tipos de usuario**

| Usuario | Qué puede hacer | Dónde llega al iniciar sesión |
| :--- | :--- | :--- |
| Visitante | Ver el catálogo, armar el carrito, registrarse | — |
| Cliente | Comprar, seguir sus pedidos, pedir soporte, usar la calculadora de metraje | Mi Resumen (`/cliente`) |
| Vendedor | Mantener precio, stock e imagen de sus telas y atender sus pedidos | Panel Principal (`/vendedor`) |
| Administrador | Todo lo anterior más usuarios, inventario, contenido, cupones, analítica y configuración | Resumen (`/admin`) |

**Cuentas de prueba**

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| Administrador | `admin@ddtextil.com` | `admin123` |
| Vendedor | `vendedor@ddtextil.com` | `vendedor123` |
| Cliente | `cliente@gmail.com` | `cliente123` |

⚠️ Con los datos iniciales actuales solo funciona la cuenta del administrador; las de vendedor y cliente necesitan que se corrijan sus contraseñas en la base (ver la sección «Credenciales de prueba» del README). El botón de acceso rápido «Cliente» de la pantalla de ingreso usa `cliente@ddtextil.com`, que no existe.

## 2. Tienda en línea

### 2.1. Inicio

![Página de inicio](manual/01_inicio.png)

La barra superior está en todas las páginas de la tienda:

- **Inicio, Catálogo, Nosotros, Contacto:** secciones del sitio.
- **Luna:** cambia entre modo claro y oscuro.
- **Ingresar:** abre el inicio de sesión. Con la sesión iniciada aquí aparece la inicial del usuario, que lleva a su panel.
- **Carrito:** el número indica cuántas telas hay en él.

El botón **Explorar colección** lleva al catálogo.

### 2.2. Catálogo

![Catálogo de productos](manual/02_catalogo.png)

1. Arriba elija el apartado: **Todos**, **Nuevas Colecciones**, **Telas Exclusivas** u **Ofertas Especiales**.
2. En **¿Qué estás imaginando crear?** filtre por tipo de proyecto (vestidos de gala, muebles de exterior, moda de verano).
3. Use **Ordenar por** y la barra de **Rango de precio** para acotar los resultados.
4. Pulse una tarjeta para ver la ficha de la tela.

### 2.3. Ficha de la tela

![Ficha de una tela](manual/03_ficha_tela.png)

La ficha muestra el precio por metro, la composición, el ancho, el peso, el stock disponible y las instrucciones de cuidado.

1. En **Metros por corte** indique cuántos metros quiere de cada pieza.
2. En **Cantidad de cortes** indique cuántas piezas iguales necesita. El sistema no deja pasar del stock disponible.
3. Revise el total de metros y el precio en la franja de resumen.
4. Pulse **Agregar al Carrito**. **Comprar Ahora** agrega la tela y lo lleva directo al carrito.
5. **Favoritos** guarda la tela en su lista de deseos.

Más abajo están las **Reseñas de Clientes**. Con la sesión iniciada puede calificar la tela de 1 a 5 estrellas y dejar un comentario (una reseña por tela).

### 2.4. Carrito

![Carrito con cupón aplicado](manual/04_carrito.png)

- Cambie los metros con **−** y **+**, o quite una tela con el ícono de la papelera. **Vaciar carrito** quita todo.
- Escriba un código en el campo **CÓDIGO** y pulse **Aplicar** para usar un cupón. Si no aplica, el sistema dice por qué (vencido, compra mínima, solo primera compra…).
- El **Resumen del pedido** muestra subtotal, descuento, envío ($15.000; gratis desde $100.000), IVA del 19 % y el total.
- Pulse **Proceder al Pago** para comprar. Si no ha iniciado sesión, el sistema le pedirá ingresar.

El carrito se guarda en el navegador: si cambia de equipo o de navegador no lo encontrará.

### 2.5. Crear una cuenta

![Registro](manual/05_registro.png)

1. Desde **Ingresar**, pulse **Regístrate**.
2. Escriba su nombre completo, correo y una contraseña de al menos 6 caracteres, y confírmela.
3. Pulse **Crear Cuenta**. Al terminar verá el aviso de bienvenida y quedará en el inicio.

### 2.6. Iniciar sesión

![Iniciar sesión](manual/06_iniciar_sesion.png)

1. Escriba su correo y su contraseña.
2. Pulse **Iniciar Sesión**. El sistema lo lleva al panel de su rol.

Si escribe mal los datos verá «Credenciales incorrectas». Si su cuenta fue suspendida, el mensaje indica el motivo.

## 3. Comprar telas

### 3.1. Datos de envío

![Datos de envío](manual/07_datos_envio.png)

1. Desde el carrito pulse **Proceder al Pago**.
2. Complete nombre, correo, teléfono, dirección, ciudad, departamento y código postal. Las notas de entrega son opcionales.
3. Revise el **Resumen del Pedido** a la derecha y pulse **Confirmar Pedido**.

### 3.2. Pago

![Pago con tarjeta](manual/08_pago_tarjeta.png)

1. Elija **Tarjeta Crédito/Débito**.
2. Escriba el nombre del titular, los 16 dígitos de la tarjeta, el vencimiento (MM/AA), el CVV, el tipo y el número de documento.
3. Pulse **Pagar de forma segura**. Verá el aviso «¡Pago procesado exitosamente!» y su pedido quedará en **Compras › Historial de Pedidos**.

⚠️ Avisos de esta versión:

- El pago es simulado: no se conecta a ningún banco.
- El **Total a pagar** de esta pantalla muestra el subtotal sin envío ni IVA; el valor que se registra es el del resumen del paso anterior.
- La opción **PSE** deja la página en blanco. Si le pasa, recargue la página y pague con tarjeta.
- Después de pagar, el sistema lo lleva al inicio en lugar de mostrar la página de confirmación. Consulte el pedido en su historial.
- Si una tela se agotó mientras pagaba, la pantalla no muestra ningún mensaje y el pedido no se crea.

## 4. Panel del cliente

![Mi Resumen](manual/10_panel_cliente.png)

El menú de la izquierda organiza el panel:

| Menú | Opciones |
| :--- | :--- |
| Mi Resumen | Total de pedidos, pedidos activos, favoritos e inversión total, con accesos rápidos |
| Compras | Historial de Pedidos · Rastrear Envío |
| Mi Colección | Lista de Deseos · Calculadora de Metraje |
| Ayuda | Mis Tickets · Reportar Problema |
| Ajustes | Mi Perfil · Libreta de Direcciones |

### 4.1. Historial de pedidos

![Historial de pedidos](manual/11_historial_pedidos.png)

Cada tarjeta muestra el número de pedido, el estado, la fecha y el total. **Ver Detalles** abre el contenido del pedido y **Factura** descarga el PDF.

⚠️ La descarga de la factura falla en esta versión.

### 4.2. Rastrear un envío

![Rastreo](manual/12_rastreo.png)

Escriba el número de pedido o de guía y pulse **Buscar** para ver en qué etapa va.

### 4.3. Reportar un problema

![Reportar un problema](manual/13_nuevo_ticket.png)

1. En **Pedido afectado** elija el pedido. Solo aparecen los pedidos entregados.
2. Elija el tipo de problema (manchas, hilos sueltos, color incorrecto, metraje incorrecto…).
3. Describa lo que pasó y, si quiere, adjunte fotos.
4. Envíe el reporte. Podrá seguirlo en **Ayuda › Mis Tickets**.

### 4.4. Calculadora de metraje

![Calculadora de metraje](manual/14_calculadora.png)

1. Elija el proyecto (falda circular, falda recta, cortinas, mantel, cojines o vestido sencillo).
2. Seleccione el ancho de la tela y, si quiere, el precio por metro.
3. Escriba las medidas que pide el proyecto y pulse **Calcular Metraje**. El resultado aparece debajo; si indicó el precio, también el costo estimado.

### 4.5. Lista de deseos

![Lista de deseos](manual/15_lista_deseos.png)

Agrupa las telas guardadas con **Favoritos**. Desde aquí puede agregarlas al carrito o crear categorías.

⚠️ La lista se guarda solo mientras la página está abierta; al recargar se pierde.

### 4.6. Mi perfil y direcciones

![Mi perfil](manual/16_perfil.png)

Muestra nombre, correo y teléfono, y permite cambiar la contraseña. La **Libreta de Direcciones** guarda varias direcciones de envío.

⚠️ En esta versión ni los cambios del perfil ni las direcciones se guardan: al recargar vuelven los datos anteriores.

## 5. Panel del vendedor

### 5.1. Panel principal y productos

![Panel del vendedor](manual/17_panel_vendedor.png)

El panel resume ventas, pedidos procesados, ticket promedio y estado del inventario de sus telas.

![Control de inventario del vendedor](manual/18_productos_vendedor.png)

En **Control de Inventario**:

1. Pulse el lápiz de una tela para editar el precio, el stock o la imagen, y guarde.
2. Pulse la papelera para retirarla del catálogo (queda desactivada, no se borra).

⚠️ El botón **Nuevo Producto** todavía no hace nada.

### 5.2. Pedidos

![Gestión de pedidos](manual/19_pedidos_vendedor.png)

Use los filtros **Todos, Preparando, Enviados, Entregados** y cambie el estado de cada pedido a medida que avanza.

⚠️ En esta versión los pedidos de la tienda no se asignan al vendedor de la tela, así que la lista aparece vacía.

### 5.3. Alertas de stock

![Alertas de stock](manual/20_alertas_stock.png)

Muestra las telas con stock crítico o bajo para reponerlas a tiempo.

## 6. Panel del administrador

### 6.1. Resumen

![Resumen del administrador](manual/21_resumen_admin.png)

Indicadores de ingresos, clientes, valor del inventario y pedidos, con el centro de alertas y la actividad reciente. Use **Filtros Globales** para cambiar el periodo y la categoría.

### 6.2. Usuarios

![Gestión de usuarios](manual/22_usuarios.png)

1. Filtre por **Todos, Admins, Vendedores o Clientes**, o busque por nombre o correo.
2. Cambie el rol con la lista **Rol**.
3. Pulse **Suspender** para bloquear una cuenta (o **Activar** para devolverle el acceso).

### 6.3. Catálogo

![Catálogo del administrador](manual/23_catalogo_admin.png)

Lista todas las telas de todos los vendedores con filtros por categoría. Con el lápiz se corrige el precio o el stock de cualquier tela.

⚠️ **Nuevo Textil** muestra «Módulo de creación en desarrollo».

### 6.4. Carrusel y página de inicio

![Carrusel](manual/24_carrusel.png)

En **Catálogo › Carrusel** pulse **Agregar Slide** para crear una diapositiva (título, subtítulo, imagen y texto del botón). Con los íconos de cada slide puede editarla u ocultarla.

![Página de inicio](manual/25_pagina_inicio.png)

En **Catálogo › Página Inicio** decida qué secciones se ven en la tienda (portada, carrusel, productos destacados, beneficios) con **Ocultar** o **Mostrar**. Los cambios se aplican de inmediato.

### 6.5. Inventario

![Control de lotes](manual/26_lotes.png)

**Control de Lotes** muestra los rollos, su capital y las alertas, con filtros por estado.

⚠️ **Ingresar Lote** solo muestra un aviso en esta versión.

![Registrar merma](manual/27_merma.png)

En **Calculadora de Merma** pulse **Registrar Merma**, elija el lote, los metros perdidos, la clasificación, la causa y el responsable, y pulse **Registrar Incidente**.

![Umbrales de stock](manual/28_umbrales.png)

En **Alertas de Stock** fije el mínimo de metros por tipo de tela y active o desactive la alerta de cada uno. **Historial de Movimientos** muestra las entradas, mermas y ventas, y permite **Exportar CSV**.

### 6.6. Moderación

![Cola de aprobación](manual/34_moderacion.png)

La **Cola de Aprobación** muestra las telas nuevas de los vendedores para **Aprobar** o **Rechazar** (con motivo). **Rendimiento** compara los vendedores.

⚠️ En esta versión la cola aparece siempre vacía aunque haya telas pendientes.

### 6.7. Soporte, cupones y reportes

![Tickets de soporte](manual/30_tickets.png)

**Gestión de Tickets** lista los reportes de los clientes; filtre por **Abiertos, En Acción o Resueltos** y cambie el estado de cada uno.

![Crear cupón](manual/29_cupones.png)

Para crear un cupón pulse **Crear Cupón** y complete:

1. **Código del cupón** (por ejemplo TEXTIL25).
2. **Tipo**: porcentaje o valor fijo en pesos, y el **Valor**.
3. **Fecha de expiración**.
4. Reglas opcionales: compra mínima, usos máximos y «solo para nuevos clientes».
5. Pulse **Activar Campaña**. Para detener un cupón use **Desactivar** en su tarjeta.

![Reportes](manual/31_reportes.png)

**Reportes** reúne los reportes de fallos de la plataforma con su prioridad; cambie el estado con la lista de cada uno.

### 6.8. Analítica y facturación

![Mapa de ventas](manual/32_mapa_ventas.png)

El menú **Analítica** tiene el **Mapa de Ventas** por región, la **Rotación de Inventario** (telas que más y menos se venden), el **Análisis de Devoluciones** y la **Proyección de Ingresos**.

⚠️ **Facturación** queda en blanco en esta versión.

### 6.9. Configuración

![Configuración](manual/33_configuracion.png)

En **Central de Control de Marca** se cambian el nombre de la tienda, los colores de la marca (con vista previa), el modo oscuro por defecto y, en **Parámetros Financieros & Stock**, el IVA, el costo de envío, el mínimo para envío gratis y el umbral de stock bajo.

## 7. Uso desde el celular

![Catálogo en el celular](manual/35_movil_catalogo.png)

La tienda se adapta a pantallas pequeñas: el menú se abre con el botón de la esquina superior y las tarjetas se muestran en una sola columna.

## 8. Preguntas frecuentes

**No puedo entrar con la cuenta de prueba de cliente o vendedor.** Con los datos iniciales actuales esas contraseñas no coinciden. Pida al administrador del sistema que aplique la corrección de la sección «Credenciales de prueba» del README.

**Elegí PSE y la página quedó en blanco.** Es un error conocido de esta versión. Recargue la página y pague con tarjeta.

**Pagué y me llevó al inicio.** El pedido sí quedó registrado; consúltelo en **Compras › Historial de Pedidos**.

**Aparece «Demasiadas peticiones. Intente más tarde».** El servidor limita a 120 peticiones por minuto. Espere un minuto y vuelva a intentarlo sin recargar la página varias veces seguidas.

**Inicié sesión desde el carrito y no volví a la compra.** Abra de nuevo el carrito con el ícono de la barra superior; sus telas siguen ahí.
