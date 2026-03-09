# D&D Textil - Tienda Digital de Telas


- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **React Router** - Navegación
- **React Icons** - Iconos

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

##  Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Hero.jsx
│   ├── Carousel.jsx
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ImageGallery.jsx
│   ├── QuantitySelector.jsx
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── FeaturedProducts.jsx
│   └── Benefits.jsx
├── pages/              # Páginas principales
│   ├── Home.jsx
│   ├── Catalog.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   └── OrderConfirmation.jsx
├── context/            # Context API
│   └── CartContext.jsx
├── hooks/              # Custom hooks
│   ├── useDarkMode.js
│   └── useLocalStorage.js
├── utils/              # Utilidades
│   └── formatters.js
├── data/               # Datos mock
│   └── products.json
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales
```

##  Funcionalidades Principales

### Página de Inicio
- Hero section con llamados a la acción
- Carrusel de promociones
- Productos destacados
- Sección de beneficios

### Catálogo
- Grid responsivo de productos
- Filtros por categoría
- Ordenamiento (precio, nombre, destacados)
- Rango de precio

### Detalle de Producto
- Galería de imágenes con zoom
- Especificaciones técnicas
- Selector de cantidad con validación
- Productos relacionados

### Carrito de Compras
- Agregar/eliminar productos
- Modificar cantidades
- Cálculo automático de totales
- Persistencia en localStorage

### Checkout
- Formulario con validación en tiempo real
- Resumen del pedido
- Cálculo de envío e impuestos
- Confirmación de pedido

## Personalización

Los colores principales se pueden modificar en `tailwind.config.js`:

```javascript
colors: {
  primary: { ... },    // Color principal
  secondary: { ... },  // Color secundario
  accent: { ... },     // Color de acento
}
```

##  Notas

- Los productos son datos mock en `src/data/products.json`
- El checkout es simulado (no procesa pagos reales)
- Los pedidos se guardan temporalmente en localStorage

##  Navegación

- `/` - Página de inicio
- `/catalogo` - Catálogo de productos
- `/producto/:id` - Detalle de producto
- `/carrito` - Carrito de compras
- `/checkout` - Proceso de pago
- `/confirmacion` - Confirmación de pedido

## Desarrollado

jhon anderson moreno posso 

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

