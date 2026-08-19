# Arquitectura del Frontend (React)

Esta sección describe la arquitectura del frontend, las tecnologías aplicadas para la interfaz de usuario, y la estructura interna del código React.

---

## 1. Diseño Tecnológico

El frontend de **D&D Textil** está estructurado como una Single Page Application (SPA) utilizando **React 18** y compilado con **Vite**. 

### 1.1 Stack Tecnológico Principal
*   **React 18**: Librería basada en componentes reactivos. Utiliza el Virtual DOM para reconciliar los cambios del navegador de forma eficiente, actualizando únicamente los elementos de la interfaz que han mutado, garantizando una visualización fluida de hasta 60 FPS.
*   **Vite**: Entorno de desarrollo rápido. Reemplaza el empaquetado tradicional de Webpack permitiendo recargas en vivo instantáneas mediante Hot Module Replacement (HMR).
*   **Tailwind CSS**: Framework CSS "utility-first" utilizado para la inyección de estilos atómicos sobre el HTML. Permite una fácil personalización del diseño visual *Glassmorphic* (colores traslúcidos, desenfoques de fondo, etc.).
*   **Framer Motion**: Librería de física de movimiento usada para animar la navegación entre vistas y transiciones de elementos SVG e interfaces interactivas.
*   **React Router v6**: Gestor de enrutamiento dinámico en el cliente que implementa además la protección lógica de páginas basada en roles de usuario.

---

## 2. Organización del Directorio `src/`

El código se organiza modularmente bajo la carpeta de origen `src/`:

```text
src/
 ├── components/              # Componentes de UI puros y reutilizables (Stateless / Pure Components).
 │    ├── ProductCard.jsx       # Tarjeta individual de producto para el catálogo.
 │    ├── Alerts.jsx            # Modales de notificación globales.
 │    └── AnimatedPage.jsx      # Contenedor de transiciones y animaciones Framer Motion.
 ├── context/                 # Ganchos de estado global (React Context API).
 │    ├── AuthContext.jsx       # Almacenamiento del token de usuario e inicio de sesión.
 │    ├── CartContext.jsx       # Gestión inmutable del carrito de compras.
 │    └── MetricsContext.jsx    # Almacenamiento en caché de productos y analíticas de la API.
 ├── pages/                   # Vistas principales del sistema (agrupadas por rol).
 │    ├── public/               # Páginas públicas: Home, Catalogo, Login, Registro.
 │    ├── cliente/              # Panel del cliente y calculadora de metraje.
 │    ├── vendedor/             # Gestión de productos y analíticas del vendedor.
 │    └── admin/                # Dashboards de administración de usuarios e inventario.
 ├── services/                # Funciones de consumo y llamadas de red fetch() al backend Java.
 ├── utils/                   # Funciones utilitarias comunes (ej. formateadores de monedas y fechas).
 ├── App.jsx                  # Declaración de rutas de React Router y proveedores de contextos.
 ├── main.jsx                 # Punto de entrada de renderizado de React en el DOM.
 └── index.css                # Inyección global de Tailwind CSS y tipografías personalizadas.
```

---

## 3. Estado Global y Contextos (`Context API`)

Para evitar la propagación compleja de propiedades en cascada (prop drilling), se han descentralizado los estados en tres contextos:

1.  **`AuthContext`**: Controla el inicio de sesión del usuario. Almacena de forma persistente la identidad y los roles del usuario activo.
2.  **`CartContext`**: Gestiona el arreglo del carrito de compras del cliente. Las modificaciones al carrito se realizan de forma inmutable (utilizando métodos como `.map()` o `.filter()` para disparar la actualización de la interfaz en lugar de mutar el array existente).
3.  **`MetricsContext`**: Almacena en memoria caché los datos consultados al backend Java (por ejemplo, el catálogo de telas completo), previniendo llamadas de red repetitivas y mejorando los tiempos de respuesta.

---

## 4. Control de Accesos y Rutas Protegidas

Las rutas que requieren un inicio de sesión se protegen mediante el componente `<ProtectedRoute>` en `App.jsx`:

```jsx
<Route path="/admin/*" element={
    <ProtectedRoute allowedRoles={['admin']}>
        <AdminOverview />
    </ProtectedRoute>
} />
```

Este componente evalúa el estado del `AuthContext`. Si no existe un usuario activo, redirige al usuario a la vista `/login`. En caso de que el rol del usuario no tenga privilegios suficientes para acceder a la ruta solicitada, el sistema aborta la petición localmente y lo redirige a la vista inicial, mostrando un aviso de acceso denegado.

---

## 5. Sistema de Animaciones de Transición (`AnimatedPage`)

Para lograr una sensación de fluidez y respuesta premium, las páginas se envuelven en un componente contenedor animado utilizando Framer Motion:

```jsx
import { motion } from 'framer-motion';

const PageLayout = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};
```
Esto previene saltos bruscos en el renderizado y proporciona transiciones de desvanecimiento fluidas durante la navegación.
