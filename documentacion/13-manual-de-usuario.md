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
