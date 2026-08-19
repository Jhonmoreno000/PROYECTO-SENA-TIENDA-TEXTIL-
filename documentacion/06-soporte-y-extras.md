# Soporte, Solución de Problemas y Extras

Esta sección agrupa las preguntas frecuentes (FAQ), soluciones a errores comunes del sistema, detalles sobre la aplicación móvil integrada y pautas para contribuidores.

---

## 1. Preguntas Frecuentes (FAQ)

### 1.1 ¿Es necesario estar autenticado para explorar el catálogo de telas?
No. Las consultas de tipo `GET` sobre productos en el backend (`ProductsHandler`) y frontend (`ProductContext`) no requieren validación de identidad o sesión activa. Esto permite una navegación fluida a los usuarios no registrados y facilita el indexado de contenidos en motores de búsqueda (SEO). La autenticación es obligatoria únicamente al intentar agregar telas al carrito, calcular metrajes guardados o realizar el proceso de checkout.

### 1.2 ¿Cómo controla el sistema la venta de metrajes inexistentes?
El sistema implementa una doble validación:
1.  **Frontend**: El control numérico del metraje valida que el valor ingresado no supere la propiedad `stock` del producto.
2.  **Backend**: Antes de confirmar cualquier pedido, el backend valida en base de datos que el stock físico de la tela sea suficiente. En caso de no contar con metraje disponible, la transacción se revierte informando al cliente.

---

## 2. Solución de Problemas Comunes

### 2.1 Error de Autenticación ("Credenciales Incorrectas") en el Inicio de Sesión
Si al intentar ingresar con las credenciales de prueba predefinidas el sistema devuelve "Credenciales incorrectas" de forma continua:

*   **Causa**: La estructura de la tabla `users` en la base de datos local no coincide con la versión requerida por el backend actual (columnas faltantes como `suspended`, `active`, etc.) o el seeder no ha sido ejecutado.
*   **Solución**:
    1.  Asegurarse de tener el repositorio sincronizado:
        ```bash
        git pull origin master
        ```
    2.  Ingresar a PostgreSQL y reconstruir la base de datos:
        ```sql
        DROP DATABASE tienda_digital_textiles_db;
        CREATE DATABASE tienda_digital_textiles_db;
        ```
    3.  Importar el archivo SQL actualizado:
        ```bash
        psql -U postgres -d tienda_digital_textiles_db -f "BASE DE DATOS/TIENDA DIGITAL TEXTIL.sql"
        ```
    4.  **Alternativa (Seeder de Java)**: En la carpeta del backend, ejecutar la herramienta de siembra de datos de prueba:
        ```bash
        java -cp "bin;lib/*" MockDataSeeder
        ```
        Esto truncará las tablas e inyectará de forma automática usuarios de prueba con contraseñas encriptadas en SHA-256.

---

## 3. Aplicación Móvil (Android Wrapper)

Ubicada en la carpeta `TiendaTextilApp/`, es la versión optimizada para dispositivos móviles de la tienda.

### 3.1 Diseño Arquitectónico Móvil
Implementa una arquitectura híbrida:
*   **Contenedor Nativo (Kotlin)**: Administra el ciclo de vida del WebView de alto rendimiento y las integraciones con el hardware del dispositivo.
*   **WebView con `WebViewAssetLoader`**: Carga el bundle estático compilado de React localmente eliminando tiempos de latencia de carga inicial por red.
*   **Puente Seguro de Datos**: Habilita el contenido mixto para permitir llamadas fetch HTTP de la interfaz al servidor API REST local a través de la dirección virtual `10.0.2.2`.

---

## 4. Guía de Contribución

Agradecemos las contribuciones para mejorar la plataforma de **D&D Textil**. Pasos para contribuir:

1.  Realizar un Fork del repositorio principal en GitHub.
2.  Clonar el fork en la máquina local:
    ```bash
    git clone https://github.com/tu-usuario/PROYECTO-SENA-TIENDA-TEXTIL-.git
    ```
3.  Crear una rama para la nueva característica:
    ```bash
    git checkout -b feature/nueva-caracteristica
    ```
4.  Realizar commits descriptivos y ordenados.
5.  Subir la rama al repositorio fork:
    ```bash
    git push origin feature/nueva-caracteristica
    ```
6.  Abrir un Pull Request detallando los cambios introducidos.
