# Descripción General y Roles de Usuario

Esta sección detalla el propósito de la plataforma **D&D Textil**, los roles que interactúan en ella y el mapa de navegación de sus interfaces.

---

## 1. Descripción General del Sistema

**D&D Textil** es una tienda digital B2B/B2C especializada en la venta de telas por metraje. Fue diseñada para que clientes individuales, modistas, sastres y empresas del sector textil puedan explorar un catálogo completo de telas, calcular los metros necesarios para proyectos específicos de confección o decoración, y gestionar sus compras en línea.

La plataforma cuenta con un panel administrativo completo para vendedores y administradores, permitiendo la gestión eficiente del inventario, control de mermas y auditoría del negocio.

---

## 2. Gestión de Roles y Permisos

La plataforma cuenta con tres niveles de acceso, cada uno adaptado a necesidades específicas:

### 2.1 Cliente (Comprador)
Es el usuario final que adquiere las telas. Sus capacidades incluyen:
*   Explorar el catálogo de telas filtrando por categoría, color y precio.
*   Utilizar la **Calculadora de Metraje** inteligente para estimar el material necesario.
*   Guardar productos en su **Lista de Deseos** (Favoritos) con persistencia en la base de datos.
*   Gestionar el carrito de compras e iniciar el proceso de checkout.
*   Realizar el seguimiento en tiempo real de sus pedidos a través de una línea de tiempo interactiva.
*   Registrar y consultar **Tickets de Soporte** para garantías o devoluciones.
*   Modificar su información de perfil.

### 2.2 Vendedor
Entidad comercial encargada de la provisión y catalogación de productos:
*   Publicar nuevos productos (telas) con descripción, fotografías (Base64), metraje disponible, categoría y colores.
*   Actualizar stock e información comercial en tiempo real.
*   Recibir notificaciones automáticas cuando un producto está por debajo del umbral de stock crítico (menor a 5 metros).
*   Visualizar gráficos interactivos y métricas de sus ventas e ingresos mensuales.
*   Gestionar y dar respuesta a las solicitudes de soporte/reclamos de sus clientes.

### 2.3 Administrador
Usuario con control total sobre el ecosistema de la plataforma:
*   Monitorear estadísticas globales de ventas, usuarios activos y volumen comercial mediante endpoints métricos.
*   Aprobar, suspender o editar cuentas de clientes y vendedores.
*   Registrar lotes de inventario de proveedores (`inventory_batches`) y desperdicios (`waste_events`) por daños o mala manipulación.
*   Configurar umbrales críticos de stock mínimos por categoría.
*   Crear y parametrizar cupones de descuento (porcentaje o valor fijo) aplicables a categorías específicas.
*   Configurar el banner publicitario global del inicio.
*   Resolver tickets de soporte complejos y auditar reportes de fallos técnicos (`bug_reports`).
*   Auditar actividades del sistema a través de logs de actividad (`recent_activity`).

---

## 3. Mapa de Navegación y Vistas

### 3.1 Interfaces Públicas (Sin Inicio de Sesión)
*   **Inicio (`/`)**: Presenta banners promocionales configurables, categorías populares y productos destacados.
*   **Catálogo de Telas (`/catalogo`)**: Muestra todas las telas en tarjetas dinámicas con filtros por categoría y búsqueda de texto.
*   **Detalle de Producto (`/producto/:id`)**: Ficha técnica de la tela, composición, colores, galería y selector de metraje.
*   **Carrito de Compras (`/carrito`)**: Resumen de productos agregados, metros seleccionados y cálculo del subtotal.
*   **Proceso de Pago (`/checkout` & `/checkout/success`)**: Formulario de datos de envío, pasarela simulada y pantalla de confirmación con número de guía.
*   **Sobre Nosotros (`/nosotros`)** y **Contacto (`/contactos`)**: Información institucional y formulario de contacto con mapa integrado.
*   **Acceso (`/registro` y `/login`)**: Formularios reactivos para creación de cuentas y autenticación.

### 3.2 Panel del Cliente (`/cliente/*`)
*   **Resumen (`/cliente`)**: Métricas personales de compras, pedidos recientes y accesos rápidos.
*   **Pedidos (`/cliente/pedidos`)**: Historial transaccional detallado de compras realizadas.
*   **Seguimiento (`/cliente/rastreo`)**: Línea de tiempo interactiva sobre el estado de entrega del paquete.
*   **Favoritos (`/cliente/favoritos`)**: Colección persistente de telas de interés.
*   **Calculadora (`/cliente/calculadora`)**: Herramienta interactiva para calcular metraje según el proyecto.
*   **Soporte (`/cliente/soporte`)**: Gestión e inicio de reclamos/tickets de ayuda.

### 3.3 Panel del Vendedor (`/vendedor/*`)
*   **Escritorio**: Reporte de ingresos del mes, ventas y alertas de stock bajo.
*   **Productos**: Listado, edición de visibilidad, variación de colores y borrado lógico de telas.
*   **Adición de Productos**: Carga de nuevas telas con imágenes procesadas localmente en Base64.
*   **Estadísticas**: Gráficas de rendimiento comercial por periodo y productos estrella.

### 3.4 Panel del Administrador (`/admin/*`)
*   **Dashboard General**: Métricas de salud del negocio, ventas diarias y distribución regional.
*   **Usuarios**: Activación, suspensión y reasignación de roles de usuario.
*   **Control de Inventario**: Gestión de lotes, mermas de metraje y umbrales mínimos.
*   **Marketing**: Banners promocionales y cupones de descuento.
*   **Auditoría y Soporte**: Logs de actividad, resolución de reportes de bugs y soporte técnico general.
