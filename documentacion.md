Documentación Integral de la Plataforma D&D Textil - Versión 2.0 (Enero 2026)
1. Introducción y Propósito del Sistema
D&D Textil es una solución tecnológica avanzada diseñada para la comercialización de textiles por metraje. La plataforma ha sido construida para que cualquier persona, empresa o costurera pueda adquirir sus materiales de forma intuitiva, visualizar el catálogo completo y calcular con precisión técnica la cantidad de insumos necesarios para sus proyectos, eliminando las barreras entre el comercio tradicional y el entorno digital.
Esta guía constituye el repositorio maestro de conocimiento de la plataforma, detallando su funcionamiento, organización, arquitectura técnica y manuales de usuario. Está redactada para ser accesible tanto para usuarios finales como para personal técnico y administrativo.
2. Definición del Modelo: ¿Qué es D&D Textil?
D&D Textil es un ecosistema de venta de telas en línea. Los clientes pueden explorar un inventario dinámico, aplicar filtros avanzados por tipología, colorimetría o rango de precios, y ejecutar transacciones comerciales seguras. La plataforma integra paneles especializados para que los vendedores gestionen su oferta y los administradores supervisen la salud financiera y operativa del negocio.
Bajo una analogía comercial, D&D Textil es una tienda física trasladada al entorno digital, con la ventaja competitiva de ofrecer inventario en tiempo real, asistencia matemática para el cálculo de metraje y la comodidad de la gestión remota desde cualquier dispositivo.
3. Arquitectura de Usuarios y Control de Acceso (RBAC)
La plataforma segmenta sus funcionalidades en tres niveles jerárquicos de acceso, garantizando la seguridad y la especialización de las herramientas.
3.1 Rol: Cliente (Customer Tier)
Es el consumidor final del producto. Sus facultades incluyen:
* Navegación de Catálogo: Exploración de la base de datos completa de textiles.
* Filtrado Inteligente: Búsqueda por tipo de fibra (algodón, seda, lino, etc.), color o precio.
* Gestión de Compra: Adición de productos al carrito de compras con selección de metraje decimal.
* Calculadora de Metraje: Herramienta técnica para determinar la cantidad exacta de tela según el proyecto.
* Lista de Deseos (Wishlist): Persistencia de productos de interés para adquisiciones futuras.
* Trazabilidad: Monitoreo del estado de pedidos en tiempo real y apertura de tickets de soporte técnico.
3.2 Rol: Vendedor (Merchant Tier)
Persona o entidad que suministra el inventario. Sus facultades incluyen:
* Gestión de Inventario (CMS): Alta de nuevos productos con carga multimedia, descripciones técnicas y precios.
* Control de Stock: Actualización de la disponibilidad métrica de cada textil.
* Sistema de Alertas: Notificaciones automáticas cuando el inventario cae por debajo del umbral de seguridad (5 metros).
* Business Intelligence: Visualización de analíticas de ventas, márgenes de ganancia y pedidos procesados.
* Atención de Reclamaciones: Respuesta directa a incidencias reportadas por sus clientes.
3.3 Rol: Administrador (Governing Tier)
Director de operaciones con control total sobre el ecosistema. Sus facultades incluyen:
* Auditoría Global: Supervisión de todas las transacciones, perfiles de vendedores y bases de datos de clientes.
* Gobernanza de Cuentas: Aprobación, suspensión o modificación de roles de usuarios.
* Gestión de Mermas: Registro técnico de textiles desperdiciados (cortes erróneos, daños de bodega o defectos de fábrica) para balancear el inventario real.
* Motor de Promociones: Creación de cupones de descuento (porcentaje o valor fijo) con reglas lógicas de aplicación.
* Supervisión de Soporte: Revisión jerárquica de tickets y asignación de prioridades de resolución.
4. Estructura de Navegación y Mapa del Sitio
4.1 Capa Pública (Acceso Universal)
* Página de Inicio (/): Fachada principal con banners atractivos, exhibición de categorías populares y productos destacados.
* Catálogo de Telas (/catalogo): Interfaz central con visualización de tarjetas de producto, filtros dinámicos y opciones de compra rápida.
* Detalle de Producto (/producto/:id): Ficha técnica profunda con galería fotográfica, descripción de composición, selector de color y metros.
* Carrito de Compras (/carrito): Módulo de consolidación donde se pueden ajustar cantidades o remover productos antes del pago.
* Pasarela de Pago (Checkout): Formulario de recolección de datos logísticos y confirmación de orden.
* Confirmación de Éxito (/checkout/success): Resumen post-transacción con número de guía y detalles de seguimiento.
* Institucional (/nosotros y /contactos): Historia de la marca, valores corporativos, formulario de contacto y geolocalización.
* Autenticación (/registro y /login): Puertas de acceso para la creación o ingreso a cuentas de usuario.
4.2 Panel del Cliente
* Mi Panel: Resumen de actividad reciente y KPIs personales de compra.
* Historial de Compras: Registro histórico de pedidos con estados actualizados (pendiente, enviado, entregado).
* Rastreo Visual: Línea de tiempo interactiva sobre la etapa logística del envío.
* Favoritos: Galería personalizada de productos guardados con sincronización de base de datos.
* Calculadora Inteligente: Interfaz asistida para la determinación de metrajes.
* Centro de Soporte: Gestión de tickets y reclamaciones.
4.3 Panel del Vendedor
* Mi Tienda: Dashboard ejecutivo con ingresos mensuales y alertas de stock bajo.
* Gestión de Catálogo: Listado maestro de productos con edición en tiempo real.
* Formulario de Publicación: Herramienta para el alta de nuevos textiles con especificaciones técnicas.
* Analítica Avanzada: Gráficos de tendencia de ventas y estacionalidad.
4.4 Panel Administrativo
* Dashboard Global: Monitoreo de KPIs de negocio: ingresos, volumen de usuarios y salud del inventario.
* Control de Mermas: Registro de pérdidas para optimización financiera.
* Gestión de Cupones: Administración de campañas de marketing y fidelización.
5. Especificaciones del Frontend: Lógica de Presentación
El Frontend comprende todos los elementos visuales e interactivos con los que el usuario tiene contacto directo.
5.1 Tecnologías y Herramientas
* React 18: Motor principal basado en arquitectura de componentes. Permite actualizaciones selectivas de la interfaz sin recargas totales de página.
* Vite: Herramienta de construcción que optimiza el flujo de desarrollo y el empaquetado final.
* Tailwind CSS: Framework de diseño utilizado para implementar la estética Glassmorphism (cristal esmerilado), paneles translúcidos y sombras suaves.
* Framer Motion: Biblioteca encargada de la orquestación de animaciones, transiciones de ruta y feedback táctil.
* React Router: Gestor de navegación que determina la visualización de pantallas sin peticiones de página nueva al servidor.
5.2 Organización de Código (Estructura src/)
* pages/: Contenedores de vistas completas de la aplicación.
* components/: Unidades reutilizables (ProductCard, Header, Footer, Toast, DashboardLayout).
* context/: Cerebros lógicos de la aplicación:
o AuthContext: Seguridad de sesión y roles.
o MetricsContext: Almacén central de datos de negocio.
o CartContext: Lógica del carrito y persistencia de metros.
* hooks/: Funciones especializadas (useDarkMode, useLocalStorage).
* utils/: Ayudantes técnicos (formateo de divisas y fechas).
* data/: Información predefinida y Mock Data de respaldo.
5.3 Seguridad en el Frontend
Se implementa el componente ProtectedRoute, el cual actúa como un filtro de seguridad que valida la sesión y el rol antes de renderizar páginas privadas, redirigiendo accesos no autorizados al login.
6. Especificaciones del Backend: Lógica de Servidor
El Backend es el motor invisible que procesa la lógica de negocio, validaciones y persistencia de datos. Bajo la analogía culinaria, es la "cocina" donde se preparan los datos antes de servirlos al cliente.
6.1 Tecnologías Core
* Java 17: Lenguaje robusto y tipado, seleccionado por su estabilidad empresarial.
* HttpServer Nativo: Servidor ligero integrado en Java para máxima eficiencia y bajo consumo de recursos.
* GSON: Traductor bidireccional entre objetos Java y formato JSON.
* JDBC + PostgreSQL Driver: Protocolo de comunicación con la base de datos.
6.2 Arquitectura del Servidor (backend-java/)
* App & ApiServer: Puntos de entrada que inicializan la conexión a la base de datos y configuran las políticas CORS para permitir el diálogo con el frontend.
* Handlers (Manejadores): Empleados especializados en ventanillas de atención específica:
o LoginHandler: Procesa autenticación y validación de hashes.
o ProductsHandler: Gestiona el ciclo de vida de los productos (CRUD).
* DAO (Data Access Objects): Capa de persistencia que ejecuta sentencias SQL en PostgreSQL. Incluye un sistema de reconexión automática para evitar caídas de servicio.
* Modelos: Estructuras de datos (POJOs) que representan entidades como Product.java o User.java.
6.3 Comunicación Frontend-Backend
El proceso ocurre en milisegundos:
1. El usuario ejecuta una acción (ej. Login).
2. El frontend empaqueta los datos en un JSON.
3. Se envía una solicitud HTTP al servidor (puerto 8080).
4. El backend valida contra la DB y devuelve una respuesta estructurada.
5. El frontend actualiza el estado de la UI según el resultado recibido.
7. Persistencia: La Base de Datos dyd_textil
Utiliza PostgreSQL para garantizar la integridad y durabilidad de la información.
* Tabla de Usuarios: Almacena perfiles, roles y contraseñas protegidas mediante SHA-256. Nunca se guarda texto plano.
* Tabla de Productos: Registro de textiles con campos para imágenes (arrays de URLs), stock, precio y descripción.
* Tabla de Pedidos: Registro transaccional con historial de precios y estados logísticos.
8. Implementación Detallada y Lógica de Negocio (Deep Dive)
8.1 El Banner Principal (Hero)
* Animación de Texto: Se utiliza un efecto de "escritura" donde el texto se descompone en un array y cada carácter tiene un retraso de 0.03 segundos.
* Imágenes Dinámicas: El banner detecta la posición horizontal del cursor para cambiar entre 4 fotografías de alta calidad, aplicando desenfoque y zoom suave.
* Micro-interacciones: Badges flotantes de "Envío Gratis" con ciclos infinitos de 4 segundos y contadores que incrementan de 0 al valor objetivo al cargar la página.
8.2 Lógica de la Calculadora de Metraje
Diseñada para convertir medidas de usuario en necesidades industriales:
* Falda Circular:
1. Calcula el radio de cintura: $R_c = \text{cintura} / (2\pi)$.
2. Calcula el radio total: $R_t = R_c + \text{largo de falda}$.
3. Determina el diámetro ($2R_t$) y evalúa paneles según el ancho de la tela disponible.
4. Añade un 10% extra de seguridad.
* Cortinaje: Multiplica el ancho por factores de fruncido (1.5x, 2.0x, 3.0x) y añade 30cm fijos para acabados.
* Mobiliario: Suma márgenes de caída perimetral y costura.
8.3 Resiliencia y Fallback Inteligente
Para evitar que la tienda se vea "vacía" si el servidor está inactivo:
1. El MetricsContext carga primero datos locales (mockData.js).
2. Intenta una conexión asíncrona al backend Java.
3. Si tiene éxito, reemplaza los datos locales por los del servidor en tiempo real.
4. Si falla, el usuario sigue navegando con los datos locales sin percibir errores.
8.4 Gestión de Imágenes
Las fotografías se almacenan como URLs. El frontend selecciona images[0] como portada. Si el enlace está roto, un controlador de errores inyecta automáticamente una imagen de reserva (placeholder.png).
9. Seguridad y Autenticación
1. Empaquetado: Datos capturados en formularios se convierten a JSON.
2. Hash SHA-256: La contraseña se encripta antes de viajar o compararse.
3. Validación: El servidor compara hashes, no palabras.
4. Respuesta: Se devuelve un objeto de usuario con el rol correspondiente para la redirección lógica.
10. Guía de Acceso para Pruebas (Staging)
Perfil
Email de Acceso
Contraseña
Cliente
cliente@ddtextil.com
cliente123
Vendedor
vendedor@ddtextil.com
vendedor123
Administrador
admin@ddtextil.com
admin123
11. FAQ: Preguntas Frecuentes
* ¿Es necesario registrarse? No para navegar, sí para transaccionar y usar herramientas de panel.
* ¿Qué sucede si no hay stock suficiente? El sistema bloquea pedidos que excedan el inventario disponible en tiempo real.
* ¿Cómo se calculan los envíos? Actualmente se gestiona un valor estándar o dinámico según la zona ingresada en el checkout.
Documentación Oficial de D&D Textil  Propiedad de la Marca  Versión 2026.

