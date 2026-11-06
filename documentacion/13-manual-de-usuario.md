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
