# Solución de Problemas de API y Navegación

Se han corregido los bloqueos que impedían la comunicación con la API local y afectaban las interacciones de la interfaz (Navbar, Modo Oscuro, Carrito).

## Cambios Realizados

### 1. Habilitación de API Local (`10.0.2.2`)
*   Se modificó `network_security_config.xml` para permitir explícitamente tráfico **HTTP (sin cifrar)** hacia el dominio `10.0.2.2`.
*   Esto es crítico porque el emulador usa esa dirección para comunicarse con el servidor que corre en tu computadora.

### 2. Bypass de Contenido Mixto en WebView
*   Se activó la propiedad `MIXED_CONTENT_ALWAYS_ALLOW`.
*   **Por qué**: Tu aplicación principal carga vía `HTTPS` (seguro), pero intentaba llamar a la API vía `HTTP` (inseguro). Android bloquea esto por defecto, lo que causaba que los iconos no respondieran.

### 3. Persistencia y Almacenamiento
*   Se aseguró que `domStorageEnabled = true` y `databaseEnabled = true` estén activos.
*   Muchos sistemas de **Modo Oscuro** y **Carritos de compra** en aplicaciones web guardan la preferencia del usuario en el navegador localmente. Sin esto, los cambios no se aplican o no se guardan.

## Verificación

*   **Compilación**: Exitosa.
*   **Logcat**: Se debería observar que el error `Mixed Content: ... has been blocked` ya no aparece.

> [!TIP]
> Si el modo oscuro sigue sin activarse, asegúrate de que tu código web esté detectando correctamente el cambio de estado y guardándolo en `localStorage`. El WebView ahora tiene todos los permisos para permitirlo.
