# 📖 Documentación de D&D Textil — Guía Completa

**D&D Textil** es una tienda en línea especializada en la venta de telas por metraje. Fue construida para que cualquier persona, empresa o costurera pueda comprar sus materiales de forma fácil, ver el catálogo completo y calcular cuánta tela necesita para su proyecto — todo desde su computador o celular.

Esta guía explica todo lo que hace la plataforma, cómo se organiza, quiénes la usan y qué pueden hacer dentro de ella. Está escrita para que cualquier persona la entienda, sin importar si sabe de computadores o no.

---

## 🧵 ¿Qué es D&D Textil?

Es una página web de venta de telas. Los clientes pueden ver el catálogo de telas disponibles, filtrar por tipo, color o precio, y realizar compras en línea. La plataforma también permite que los vendedores administren su propio catálogo de productos y que los administradores de la tienda controlen todo el negocio desde un solo panel.

Piénsalo así: **es como una tienda física, pero en internet**, con la ventaja de que puedes ver todo el inventario, recibir ayuda para calcular cuánta tela necesitas y hacer tu pedido desde casa.

---

## 👥 ¿Quiénes usan la plataforma?

La plataforma tiene **tres tipos de usuarios**, cada uno con acceso a diferentes funciones:

### 👤 Cliente
Es la persona que compra telas. Puede:
- Navegar el catálogo completo de telas disponibles.
- Filtrar por tipo de tela (algodón, seda, lino, etc.), color o precio.
- Agregar telas al carrito de compras.
- Usar la **Calculadora de Metraje** para saber exactamente cuánta tela necesita para su proyecto.
- Guardar telas en su **Lista de Deseos** para comprarlas después.
- Ver el estado y seguimiento de sus pedidos en tiempo real.
- Abrir un **ticket de soporte** si tuvo algún problema con su compra.

### 🏭 Vendedor
Es la persona o empresa que ofrece telas en la plataforma. Puede:
- Agregar nuevas telas al catálogo con fotos, descripción y precio.
- Actualizar el inventario (cuántos metros quedan de cada tela).
- Recibir alertas cuando una tela está a punto de agotarse (menos de 5 metros).
- Ver sus propias ventas, ganancias y pedidos.
- Responder a reclamos de sus clientes.

### ⚙️ Administrador
Es el dueño o gerente de D&D Textil. Tiene acceso total y puede:
- Ver todas las ventas, todos los vendedores y todos los clientes.
- Aprobar o suspender cuentas de vendedores.
- Registrar desperdicios o mermas de tela (tela dañada o mal cortada).
- Gestionar cupones de descuento para clientes.
- Revisar todos los reclamos y asignarles prioridad.
- Ver reportes y estadísticas globales del negocio.

---

## 🌐 ¿Qué páginas tiene la plataforma?

### Páginas de acceso público (cualquier persona las puede ver sin iniciar sesión):

*   **Página de inicio (/)**: La pantalla principal. Muestra un banner atractivo con la marca, las categorías más populares de telas y los productos destacados del momento.

*   **Catálogo de Telas (/catalogo)**: El corazón de la tienda. Aquí aparecen todas las telas disponibles en forma de tarjetas con foto, nombre, categoría, precio por metro y opción de compra rápida. Se pueden buscar por nombre, filtrar por categoría y ordenar de mayor a menor precio.

*   **Detalle de Producto (/producto/...)**: Al hacer clic en una tela, se abre una página completa con su galería de fotos, descripción detallada, composición de la tela, colores disponibles, precio y un selector para elegir cuántos metros se quieren comprar.

*   **Carrito de Compras (/carrito)**: Aquí se acumulan todas las telas que el cliente seleccionó. Se pueden quitar productos, cambiar la cantidad de metros y ver el total a pagar antes de confirmar.

*   **Proceso de Pago (/checkout)**: Formulario donde el cliente ingresa su nombre, dirección de entrega, ciudad y teléfono para finalizar la compra. Al confirmar, el sistema genera una orden y el cliente recibe un número de pedido.

*   **Confirmación (/checkout/success)**: Pantalla de éxito que aparece tras completar el pago. Muestra el resumen del pedido y un número de guía.

*   **Sobre Nosotros (/nosotros)**: La historia detrás de D&D Textil, los valores de la empresa y por qué se diferencia de otras tiendas.

*   **Contacto (/contactos)**: Formulario para enviar mensajes al equipo de D&D Textil. Incluye también un mapa de ubicación.

*   **Registro e Inicio de Sesión (/registro y /login)**: Formularios para crear una cuenta nueva o ingresar a la plataforma.

---

### Panel del Cliente (requiere iniciar sesión como cliente):

*   **Mi Panel (/cliente)**: Pantalla de bienvenida con un resumen de sus pedidos recientes, su gasto total y accesos directos a todas sus funciones.

*   **Historial de Compras (/cliente/pedidos)**: Lista de todos los pedidos que ha realizado, con la fecha, los productos, el total y el estado actual (pendiente, enviado, entregado).

*   **Rastreo de Pedidos (/cliente/rastreo)**: Una línea de tiempo visual que muestra en qué etapa está su envío: pedido confirmado, en preparación, en camino o entregado.

*   **Lista de Deseos (/cliente/favoritos)**: Colección de telas que el cliente guardó para comprar más adelante. Las imágenes se actualizan automáticamente desde la base de datos de la tienda.

*   **Calculadora de Metraje (/cliente/calculadora)**: Una herramienta inteligente donde el cliente elige qué quiere hacer (una falda, cortinas, un mantel, cojines, etc.) y la aplicación le dice exactamente cuántos metros de tela necesita comprar. Tiene en cuenta el ancho de la tela y añade un 10% extra por seguridad para que no le falte material.

*   **Soporte y Reclamos (/cliente/soporte)**: Sección donde el cliente puede crear un ticket si tuvo problemas con su pedido (tela equivocada, metraje incorrecto, etc.) y ver el estado de sus reclamos anteriores.

*   **Mi Perfil**: Edición de datos personales como nombre, correo y contraseña.

---

### Panel del Vendedor (requiere iniciar sesión como vendedor):

*   **Mi Tienda**: Resumen de sus ventas recientes, total de ingresos del mes y alertas de productos con poco inventario.

*   **Mis Productos**: Listado de todos los productos que el vendedor tiene publicados, con opciones para editar la información, cambiar las fotos o actualizar el stock.

*   **Agregar producto**: Formulario para publicar una nueva tela con nombre, descripción, precio por metro, stock, categoría, colores disponibles y fotografías.

*   **Analítica de Ventas**: Gráficos que muestran cuáles son las telas más vendidas, en qué períodos del año hay más ventas y cuánto ha ganado en total.

*   **Alertas de Stock**: Notificaciones automáticas cuando alguna tela tiene menos de 5 metros disponibles, para que el vendedor pueda reponer el inventario a tiempo.

---

### Panel del Administrador (requiere iniciar sesión como administrador):

*   **Dashboard General**: Una vista global de todo el negocio: ingresos totales, número de ventas, usuarios activos y productos en el catálogo.

*   **Gestión de Usuarios**: Lista de todos los clientes y vendedores registrados. El administrador puede activar o desactivar cuentas y cambiar roles.

*   **Control de Mermas**: Registro de tela que fue desperdiciada (cortada mal, dañada en bodega, defecto de fábrica). Esto permite calcular las pérdidas reales del negocio.

*   **Cupones de Descuento**: Creación y gestión de códigos de descuento. Los cupones pueden ser de porcentaje (ej. 20% de descuento) o de valor fijo (ej. $30.000 de descuento), y pueden tener condiciones como compra mínima o solo aplicar a cierta categoría de telas.

*   **Reclamos y Soporte**: Vista completa de todos los tickets de soporte de todos los clientes, con opción de asignar prioridad y marcarlos como resueltos.

---

## 🖥️ La Cara Visible: El Frontend (Lo que el usuario ve)

El **Frontend** es todo lo que una persona ve y toca al usar D&D Textil: los botones, las imágenes, el menú, el carrito de compras, los formularios, las animaciones. Es, básicamente, la "apariencia" de la tienda.

### ¿Con qué está construido?

Para construir la interfaz visual se utilizó un conjunto de herramientas modernas, cada una con una función específica:

*   **React 18**: Es el "motor" principal del frontend. React funciona dividiendo toda la pantalla en piezas pequeñas llamadas "componentes". Por ejemplo, el menú de navegación es un componente, cada tarjeta de producto es otro componente, y el carrito de compras es otro. Todos estos componentes se ensamblan para formar las páginas completas. React es muy eficiente porque **solo actualiza la parte de la pantalla que cambió**, sin recargar toda la página.

*   **Vite**: Es la herramienta que "ensambla" todo el código y lo hace funcionar. Cuando el desarrollador guarda un cambio, Vite lo refleja en el navegador en menos de un segundo, haciendo el desarrollo muy ágil.

*   **Tailwind CSS**: Es el sistema de estilos que define los colores, tamaños, márgenes y la apariencia general. Permite crear un diseño elegante y consistente en todas las páginas. Para D&D Textil se usó el estilo **Glassmorphism** (efecto de cristal esmerilado) con paneles translúcidos y sombras suaves.

*   **Framer Motion**: Es la librería responsable de todas las animaciones de la página. Cuando una página aparece con un efecto suave, cuando un botón reacciona al pasar el cursor o cuando el menú se desliza, todo eso es obra de Framer Motion.

*   **React Router**: Es el sistema de navegación. Cuando el usuario hace clic en "Ver catálogo" o "Mi panel", React Router determina qué pantalla mostrar sin necesidad de cargar una página nueva desde el servidor.

---

### ¿Cómo está organizado el frontend?

El código del frontend vive dentro de la carpeta `src/`. Se divide en:

*   **`pages/`**: Aquí están todas las pantallas de la aplicación (catálogo, perfil, carrito, paneles de admin, vendedor y cliente). Cada archivo `.jsx` dentro de esta carpeta es una pantalla completa.

*   **`components/`**: Son las piezas reutilizables de la interfaz. Por ejemplo, la tarjeta de un producto (`ProductCard.jsx`) se construyó una sola vez y se usa en múltiples pantallas. Otros ejemplos: el encabezado (`Header.jsx`), el pie de página (`Footer.jsx`), los mensajes de notificación emergentes (`Toast.jsx`) y la barra lateral de los paneles (`DashboardLayout.jsx`).

*   **`context/`**: Son los "cerebros internos" del frontend. Un contexto es un sistema que guarda información importante y la comparte con todas las pantallas que la necesiten, sin tener que pasarla manualmente de una pantalla a otra:
    -   `AuthContext`: Guarda la información del usuario que inició sesión (nombre, correo, rol) y controla el acceso a las páginas protegidas.
    -   `MetricsContext`: Es el almacén central de datos. Guarda los productos, los pedidos, los usuarios y las estadísticas del negocio. Cuando alguna pantalla necesita mostrar estos datos, los toma de aquí directamente.
    -   `CartContext`: Lleva el registro de todos los productos que el usuario agregó al carrito de compras, incluyendo la cantidad de metros de cada tela.

*   **`hooks/`**: Son pequeñas funciones especializadas que realizan tareas repetitivas de forma eficiente:
    -   `useDarkMode`: Detecta si el sistema operativo del usuario prefiere modo oscuro y activa o desactiva el tema automáticamente.
    -   `useLocalStorage`: Permite que la aplicación guarde y recupere información en el navegador del usuario (por eso, al cerrar y volver a abrir la página, el carrito no se pierde).

*   **`utils/`**: Funciones de utilidad. Por ejemplo, `formatCurrency` convierte el número `35000` en `$35.000` con el formato correcto para Colombia.

*   **`data/`**: Archivos con información predefinida, como los enlaces del menú de cada dashboard, configuraciones, y datos de demostración que se usan cuando el servidor no está disponible.

---

### ¿Cómo protege el frontend las páginas privadas?

Existe un componente llamado `ProtectedRoute`. Funciona como un "guardia de seguridad": antes de mostrar cualquier página del panel de control, verifica si el usuario ha iniciado sesión y si tiene el rol correcto (admin, vendedor o cliente). Si no cumple las condiciones, lo redirige automáticamente a la página de inicio de sesión. Así, un cliente nunca puede acceder accidentalmente al panel del administrador.

---

### ¿Cómo se ven las imágenes de los productos?

Las imágenes de las telas se guardan como direcciones de internet (URLs) dentro de la base de datos. Cuando el frontend carga una tarjeta de producto, toma esa URL y la usa para mostrar la foto. Si la imagen no carga por algún error de red, el sistema muestra automáticamente una imagen de reemplazo genérica para que la página no quede con espacios vacíos.

---

## ⚙️ El Cerebro: El Backend (Lo que el usuario no ve)

El **Backend** es la parte "invisible" de la aplicación. Trabaja en silencio desde un servidor y es el responsable de toda la lógica de negocio: validar contraseñas, guardar pedidos, consultar el inventario, responder a las solicitudes del frontend.

Imagínalo como la "cocina de un restaurante": el cliente solo ve el menú y los platos cuando llegan a la mesa, pero detrás hay todo un equipo trabajando para que todo salga bien.

---

### ¿Con qué está construido el backend?

*   **Java 17 (lenguaje de programación)**: El backend está escrito completamente en Java, un lenguaje de programación robusto y muy estable que se usa en sistemas bancarios y empresariales de todo el mundo. Fue elegido por su confiabilidad y rendimiento.

*   **HttpServer (servidor HTTP nativo)**: En lugar de usar un framework pesado, se utilizó el servidor HTTP que viene integrado directamente en Java (`com.sun.net.httpserver`). Esto hace que el servidor sea muy liviano y rápido, consumiendo poca memoria.

*   **GSON**: Es una librería de Google que permite convertir objetos de Java a formato JSON (el formato que usa el frontend para comunicarse) y viceversa. Es el "traductor" entre los dos mundos.

*   **JDBC + Driver de PostgreSQL**: Son las herramientas que permiten al servidor Java conectarse y hablar con la base de datos PostgreSQL. JDBC es como el "cable" de conexión y el Driver es el adaptador que hace que Java y PostgreSQL se entiendan.

---

### ¿Cómo está organizado el backend?

El código del backend vive en la carpeta `backend-java/`. Se divide en capas bien definidas:

*   **`App.java` y `ApiServer.java`**: Son el punto de entrada. Cuando el servidor arranca, estos archivos inicializan la conexión con la base de datos y ponen a escuchar el servidor en el puerto 8080. También configuran las cabeceras CORS, que son permisos que le dicen al navegador: "está bien que el frontend de este sitio hable con este servidor".

*   **Handlers (Manejadores)**: Son los archivos que atienden cada tipo de solicitud del frontend, como empleados en una oficina que atienden diferentes ventanillas:
    -   `LoginHandler.java`: Atiende las solicitudes de inicio de sesión. Recibe el correo y la contraseña, verifica el hash y responde si el acceso es válido o no.
    -   `ProductsHandler.java`: Atiende todo lo relacionado con productos. Puede listar todos los productos, agregar uno nuevo, actualizar los datos de uno existente o eliminarlo.

*   **DAO (Data Access Objects)**: Son los archivos que hablan directamente con la base de datos. Ejecutan las consultas SQL (el lenguaje que usa PostgreSQL) y devuelven los resultados:
    -   `ProductDAO.java`: Tiene las consultas para obtener, crear, actualizar y borrar productos.
    -   `UserDAO.java`: Tiene las consultas para gestionar usuarios.
    -   `Conexion.java`: Administra la conexión física con PostgreSQL. Tiene un sistema de "reconexión automática": si PostgreSQL cierra la conexión por inactividad, Java se conecta de nuevo automáticamente sin que el usuario lo note.

*   **Modelos (`/models`)**: Son representaciones de los objetos de la aplicación en Java. Por ejemplo, `Product.java` es una estructura que contiene todos los atributos de un producto (nombre, precio, stock, imágenes). Estos modelos se usan para organizar los datos antes de enviarlos al frontend en formato JSON.

---

### ¿Cómo se comunican el Frontend y el Backend?

La comunicación funciona así:

1.  El usuario hace algo en la pantalla (ej. hace clic en "Iniciar sesión").
2.  El frontend prepara un mensaje con los datos (correo y contraseña) y lo envía al servidor mediante una solicitud HTTP a una dirección específica (ej. `http://localhost:8080/api/login`).
3.  El servidor Java recibe la solicitud, verifica los datos contra la base de datos y prepara una respuesta.
4.  La respuesta llega al frontend en formato JSON. Si el login fue exitoso, incluye los datos del usuario. Si falló, incluye un mensaje de error.
5.  El frontend lee esa respuesta y actualiza la pantalla: muestra el panel del usuario o un mensaje de "credenciales incorrectas".

Todo esto ocurre en **fracciones de segundo**, de forma completamente transparente para el usuario.

---

### ¿Qué pasa si el servidor está apagado?

El `MetricsContext` del frontend tiene un sistema de **falla inteligente**: cada vez que carga, intenta conectarse al servidor Java. Si el servidor no responde (por ejemplo, porque el computador del desarrollador está apagado), automáticamente carga los "datos de demostración" (`mockData.js`) que están guardados directamente en el frontend. Así, la tienda nunca se ve vacía o rota, aunque el servidor esté temporalmente inactivo.

---

## 🗄️ La Memoria: La Base de Datos (Dónde se guarda todo)

La base de datos se llama **`dyd_textil`** y funciona en PostgreSQL. Es el repositorio permanente de toda la información de la tienda.

### Tabla de Usuarios
Guarda todos los registros de clientes, vendedores y administradores. Para cada usuario almacena su nombre, correo, rol y la versión encriptada de su contraseña. Nunca se guarda la contraseña real.

### Tabla de Productos
Guarda el catálogo completo de telas. Para cada producto almacena su nombre, categoría, precio por metro, stock disponible, descripción y un campo especial llamado `images` que puede contener múltiples fotos de la tela.

### Tabla de Pedidos
Registra cada transacción. Guarda la lista de productos comprados, el total pagado, la información de envío y el estado del pedido (pendiente, enviado, entregado).

### Seguridad de Contraseñas
Al registrarse, la contraseña ingresada por el usuario se transforma mediante el algoritmo **SHA-256** en una cadena de caracteres irreconocible (llamada "hash"). Solo ese hash se guarda en la base de datos. Cuando el usuario vuelve a iniciar sesión, se aplica el mismo proceso a la contraseña que escribió y se compara el resultado con el hash guardado. Si coinciden, el acceso es válido. Así, **ni el propio sistema conoce la contraseña original**.

---

## 🔬 Cómo se Hicieron las Cosas (Implementación Detallada)

Esta sección explica, con mucho más detalle, cómo se construyeron las funcionalidades más importantes de la plataforma. No es necesario saber de programación para entender esto: usaremos analogías y descripciones paso a paso.

---

### 🎬 La Pantalla de Inicio: El Banner Principal (Hero)

Lo primero que cualquier visitante ve al entrar a D&D Textil es un gran banner con imágenes de telas premium y un texto animado. Esta sección se llama **Hero** y fue construida así:

**¿Cómo se anima el texto letra por letra?**
El título "Telas de Calidad alta gama" no simplemente aparece de golpe. Está programado para que **cada letra aparezca de forma individual con un ligero retardo entre ellas**. Imagina que alguien está escribiendo a máquina muy rápido: primero aparece la "T", luego la "e", luego la "l"... pero a gran velocidad. Esto se logró descomponiendo el texto en un array de letras y asignando a cada una un tiempo de retraso diferente (0.03 segundos entre cada letra). El efecto final es un texto que "se escribe solo" al entrar a la página.

**¿Cómo funcionan las imágenes que cambian solas?**
El banner tiene 4 fotografías de telas. Al pasar el cursor por la imagen principal, el sistema detecta en qué zona horizontal está el cursor (izquierda, centro-izquierda, centro-derecha, derecha) y cambia la imagen correspondiente a esa zona. Si el cursor está en el lado izquierdo, se muestra la primera imagen; si está a la derecha, la cuarta. Al retirar el cursor, vuelve a la imagen principal. La transición entre imágenes usa un efecto de desenfoque y reducción que simula una cámara haciendo zoom.

**El badge flotante de "Envío Gratis"**
Ese pequeño panel que aparece en la esquina inferior de la imagen y que sube y baja suavemente como si flotara — eso es una animación de ciclo infinito programada en Framer Motion. El panel se mueve 10 píxeles hacia arriba, luego vuelve a su posición original, y repite esto para siempre, con una duración de 4 segundos por ciclo. Es un truco visual para llamar la atención sin ser invasivo.

**Los contadores animados (500+ Productos, 100% Calidad)**
Los tres números de estadísticas en la parte inferior del Banner no simplemente aparecen. Cuando la página carga, cada contador **cuenta desde 0 hasta el número objetivo** con una animación fluida. Esto crea una sensación de actividad y dinamismo que hace que el usuario sienta que está viendo datos en tiempo real.

---

### 🏷️ La Página de Detalle de Producto

Cuando el usuario hace clic en una tela del catálogo, llega a la página de detalle. Esta página fue construida con varias lógicas importantes:

**¿Cómo sabe la página qué producto mostrar?**
Cada producto tiene un número identificador único (ID) en la base de datos. Cuando el usuario hace clic en, por ejemplo, la "Tela de Algodón Pima", la dirección del navegador cambia a algo como `/producto/5`. El número `5` al final es el ID del producto. La página lee ese número de la URL, busca el producto con ese ID en la base de datos (o en los datos del contexto) y muestra toda su información: nombre, precio, fotos, descripción, colores disponibles.

**¿Qué pasa si el producto no existe?**
Si alguien escribe manualmente una dirección con un ID que no existe (ej. `/producto/99999`), el sistema detecta que no encontró nada y muestra automáticamente un mensaje amigable: "Producto no encontrado" con un botón para volver al catálogo. Nunca se muestra una página rota o un error técnico.

**¿Cómo funciona el botón "Agregar al carrito"?**
Al hacer clic, tres cosas ocurren simultáneamente:
1. El producto y la cantidad seleccionada se agregan al carrito del `CartContext`.
2. El botón cambia visualmente a un icono de "✓" (checkmark) verde por 3 segundos para confirmar al usuario que la acción fue exitosa.
3. Después de 3 segundos, el botón vuelve a su estado original automáticamente.

**Productos relacionados**
Al final de la página del producto, aparece una sección de "también te puede interesar". Esto no está programado manualmente: el sistema toma el catálogo completo de telas, **filtra automáticamente solo las que son de la misma categoría** que el producto que se está viendo, y muestra hasta 4 de ellas. Si estás viendo una tela de "Seda", verás otras telas de seda.

---

### 🛒 El Proceso de Pago (Checkout)

El formulario de pago es uno de los componentes más cuidadosamente construidos del sistema:

**Validación en tiempo real**
El formulario no espera a que el usuario haga clic en "Confirmar" para decirle si algo está mal. Cada campo valida su contenido **mientras el usuario escribe**. Por ejemplo:
- Si el usuario empieza a escribir su correo y no tiene el símbolo `@`, aparece inmediatamente un mensaje en rojo: "Correo electrónico inválido".
- Si escribe el teléfono y no tiene exactamente 10 dígitos, aparece "Teléfono inválido (10 dígitos)".
- Si el nombre tiene menos de 3 letras, aparece "El nombre debe tener al menos 3 caracteres".

Esto mejora enormemente la experiencia porque el usuario corrige los errores sobre la marcha, sin tener que esperar a enviar el formulario para descubrir que algo estaba mal.

**¿Qué pasa al confirmar el pedido?**
Cuando el usuario hace clic en "Confirmar Pedido":
1. El sistema hace una verificación final de todos los campos.
2. Si hay algún error, los marca en rojo y no permite avanzar.
3. Si todo está correcto, genera un número de pedido único y guarda la información del pedido.
4. El carrito se vacía completamente.
5. El usuario es redirigido a la pantalla de confirmación con su número de guía.

---

### 📐 La Calculadora de Metraje (¿Cómo hace los cálculos?)

Esta herramienta fue diseñada para que incluso quien no sabe de costura pueda obtener la medida exacta de tela que necesita. Veamos cómo funcionan los cálculos por dentro:

**Falda Circular**
Una falda circular requiere cortar un círculo grande de tela con un hueco en el centro para la cintura. El sistema calcula:
- El radio del hueco de cintura: `cintura ÷ (2 × 3.14159)`. Si la cintura es 70cm, el radio del hueco es ≈ 11.14cm.
- El radio total del círculo: `radio del hueco + largo de la falda`. Si quieres 60cm de largo, el radio total es ≈ 71.14cm.
- El diámetro del círculo completo: `radio total × 2` ≈ 142.28cm.
- Dependiendo del ancho de la tela elegida, calcula cuántos "paneles" necesitas y multiplica.
- Al resultado final le suma un **10% extra** de seguridad.

**Cortinas**
Las cortinas necesitan más tela que el ancho de la ventana porque se fruncen para hacer pliegues y dar volumen:
- Si eliges "fruncido simple", necesitas `1.5 veces el ancho` de la ventana.
- Si eliges "fruncido doble", necesitas `2 veces el ancho`.
- Si eliges "fruncido triple", necesitas `3 veces el ancho`.
- Además, se agregan automáticamente **30 centímetros extra de altura** para los dobladillos arriba y abajo.

**Mantel**
El sistema suma la caída deseada a cada lado para calcular el total de tela. Si la mesa mide 180cm de largo y quieres 30cm de caída a cada lado, el total de largo es `180 + 30 + 30 = 240cm`. Lo mismo aplica al ancho.

**Cojines**
Cada cojín necesita dos piezas de tela (la parte de adelante y la de atrás). El sistema calcula cuántos cojines caben en un ancho de tela (considerando 3cm de margen para costuras), y luego determina cuántas filas de corte se necesitan para hacer todos los cojines del pedido.

---

### 🔐 El Sistema de Login (¿Cómo funciona el inicio de sesión?)

Cuando un usuario escribe su correo y contraseña y hace clic en "Entrar", sucede lo siguiente exactamente:

1. **El frontend empaca los datos**: Toma el correo y la contraseña e los convierte a formato JSON (un formato estándar para enviar información por internet).

2. **Envía la solicitud al backend**: La aplicación envía ese paquete de datos al servidor Java, que está escuchando en la dirección `http://localhost:8080/api/login`.

3. **El backend recibe y procesa**: El `LoginHandler.java` desempaca el JSON, extrae el correo y la contraseña.

4. **Consulta la base de datos**: Le pregunta a PostgreSQL: "¿Existe un usuario con este correo?". Si no existe, responde con "Credenciales inválidas".

5. **Verifica la contraseña**: Si el correo existe, toma la contraseña que el usuario escribió, la convierte en un hash SHA-256, y compara ese hash con el que está guardado en la base de datos. **Las contraseñas nunca se comparan directamente**, siempre se comparan sus versiones encriptadas.

6. **El backend responde**: Si el hash coincide, el backend envía de vuelta el nombre, correo y rol del usuario (cliente, vendedor o admin). Si no coincide, envía un código de error 401 (que significa "No autorizado").

7. **El frontend actúa**: Si recibió la información del usuario, la guarda en el `AuthContext` y redirige al panel correspondiente según el rol. Si recibió el error 401, muestra el mensaje "Credenciales incorrectas" en el formulario.

Todo este proceso dura menos de **medio segundo**.

---

### 📸 ¿Cómo se sincronizan las imágenes de los productos?

Las fotos de las telas están almacenadas en la base de datos como **listas de enlaces (URLs)**. Cada producto puede tener múltiples imágenes (ej. una foto de frente, una de detalle, una con luz natural).

Cuando la aplicación carga el catálogo:
1. El `MetricsContext` hace una solicitud al backend Java pidiendo todos los productos.
2. El backend consulta la tabla `products` en PostgreSQL.
3. Para cada producto, la base de datos devuelve el campo `images`, que contiene una lista como: `["https://ejemplo.com/foto1.jpg", "https://ejemplo.com/foto2.jpg"]`.
4. El frontend toma el primer enlace de esa lista (`images[0]`) y lo usa como la foto principal.
5. Si por alguna razón el enlace está roto (la imagen fue borrada del servidor de fotos), el sistema tiene un "plan B": muestra automáticamente una imagen genérica de reemplazo llamada `/placeholder.png`.

---

### 🔄 El Sistema de Datos Inteligente (Mock Fallback)

Una decisión de diseño muy importante fue garantizar que D&D Textil **nunca se vea vacía o rota**, incluso si el servidor Java está apagado.

Esto se logró de la siguiente manera:
- Al iniciar la aplicación, el `MetricsContext` carga inmediatamente todos los datos de los archivos `mockData.js` y `products.json` que están guardados directamente en el frontend. Así, en el instante cero, la página ya tiene datos.
- Simultáneamente, intenta conectarse al servidor Java en segundo plano.
- Si el servidor responde y tiene datos, **reemplaza los datos mock por los datos reales**. El usuario puede ver cómo el catálogo se actualiza si hay diferencias.
- Si el servidor no responde (está apagado, hay un error de red, etc.), el sistema simplemente **continúa usando los datos mock sin mostrar ningún error al usuario**.

Para el desarrollador, esto significa que puede trabajar en el frontend sin necesidad tener el servidor Java corriendo todo el tiempo.

---

## 🔑 Cómo ingresar al sistema

Para probar la plataforma, puedes usar estas cuentas de demostración:

| Rol | Correo | Contraseña |
|---|---|---|
| 👤 Cliente | cliente@ddtextil.com | cliente123 |
| 🏭 Vendedor | vendedor@ddtextil.com | vendedor123 |
| ⚙️ Administrador | admin@ddtextil.com | admin123 |

---

## ❓ Preguntas Frecuentes

**¿Necesito crear una cuenta para ver las telas?**
No. Cualquier persona puede navegar el catálogo sin necesidad de registrarse. Solo se necesita cuenta para hacer compras o acceder a los paneles.

**¿Qué pasa si la tela que quiero no tiene suficiente stock?**
El sistema muestra la cantidad disponible en cada producto. Si no hay suficientes metros, el carrito no te dejará pedir más de lo que hay en inventario.

**¿Cómo sé cuánta tela necesito para mis cortinas?**
¡Para eso está la **Calculadora de Metraje**! Disponible en el panel del cliente, solo debes ingresar el ancho y alto de tu ventana y el tipo de fruncido, y la calculadora te dice exactamente cuántos metros comprar.

**¿Es seguro pagar en esta plataforma?**
Sí. Toda la información sensible, como las contraseñas, está protegida con encriptación de nivel industrial (SHA-256).

---

*Documentación oficial de D&D Textil — Versión 2026.*

