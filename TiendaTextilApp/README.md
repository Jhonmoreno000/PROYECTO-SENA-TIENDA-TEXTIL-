# Tienda Textil App - Android Wrapper

Este proyecto es una aplicación nativa de Android diseñada para envolver (wrapper) una aplicación web moderna (SPA) y permitir su ejecución en dispositivos móviles con integración de API local.

## 🚀 Lo Nuevo y Mejoras Realizadas

Recientemente se han aplicado una serie de optimizaciones críticas para mejorar la estabilidad, seguridad y funcionalidad de la aplicación:

### 🛠️ Correcciones en el WebView
- **Migración a OnBackPressedDispatcher**: Se implementó el sistema moderno de Android para manejar el botón de retroceso, evitando cierres inesperados y permitiendo la navegación fluida dentro de la web.
- **Simplificación de WebViewAssetLoader**: Se optimizó la carga de archivos locales (`index.html`, JS, CSS) utilizando el dominio seguro `https://appassets.androidplatform.net/`.
- **Habilitación de Mixed Content**: Se configuró el WebView para permitir llamadas a la API local (`http://10.0.2.2:8081`) desde el entorno seguro HTTPS, permitiendo que el navbar, el carrito y el modo oscuro funcionen correctamente.
- **Optimización de Almacenamiento**: Se habilitaron `domStorageEnabled` y `databaseEnabled` para asegurar que las preferencias del usuario (como el modo oscuro) y el estado del carrito persistan entre sesiones.

### 🔌 Integración de Red
- **Configuración de Seguridad de Red**: Se creó un archivo `network_security_config.xml` específico para permitir el tráfico de texto plano (HTTP) hacia la dirección del host del emulador (`10.0.2.2`).

### 🤖 Herramientas de Desarrollo
- **Script de Emulador Mejorado**: El archivo `run_emulator.sh` fue corregido con las rutas dinámicas del SDK y ahora realiza la compilación (`assembleDebug`) e instalación automática de la APK.
- **Consolidación del SDK**: Se unificaron las rutas de las herramientas de Android para eliminar conflictos en el entorno de desarrollo.

---

## 🏗️ Arquitectura del Proyecto

La aplicación sigue una arquitectura de **Hybrid Web-Native Wrapper**:

1.  **Capa Nativa (Kotlin/Android)**:
    - Actúa como contenedor utilizando un `WebView`.
    - Gestiona el ciclo de vida de la aplicación y la navegación física del dispositivo.
    - Intercepta peticiones para servir archivos locales de alto rendimiento mediante `WebViewAssetLoader`.

2.  **Capa de Aplicación Web (Frontend)**:
    - Ubicada en `app/src/main/assets/`.
    - Desarrollada como una SPA (Single Page Application).
    - Utiliza `localStorage` y `sessionStorage` para la persistencia del lado del cliente.

3.  **Capa de Datos (Backend Integration)**:
    - La app se comunica con un servidor externo/local a través de peticiones `fetch`.
    - Utiliza el dominio virtual `10.0.2.2` para acceder al servidor que corre en la máquina de desarrollo durante las pruebas.

---

## ⚙️ Requisitos y Ejecución

- **Android SDK**: API 24 mínimo, API 35 recomendado.
- **Gradle**: 8.13 o superior.

Para ejecutar el proyecto localmente:
1. Asegúrate de tener el emulador configurado.
2. Ejecuta `./run_emulator.sh` desde la terminal o usa el botón **Run** en Android Studio.

---

## 📝 Notas de Depuración
- Los logs de la consola de JavaScript se redirigen automáticamente al **Logcat** de Android bajo la etiqueta `CONSOLE`.
- Los eventos de carga de página se registran bajo la etiqueta `WEBVIEW`.
