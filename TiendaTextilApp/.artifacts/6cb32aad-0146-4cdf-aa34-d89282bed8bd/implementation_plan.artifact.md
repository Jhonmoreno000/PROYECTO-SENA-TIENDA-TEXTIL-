# Plan de Implementación - Habilitación de API Local y Corrección de Interacciones

Este plan aborda el bloqueo de "Mixed Content" que impide que la aplicación web se comunique con el servidor local, lo que causa que los iconos del navbar y el modo oscuro no funcionen correctamente.

## User Review Required

> [!IMPORTANT]
> Se permitirá el tráfico HTTP inseguro específicamente para el dominio de desarrollo (`10.0.2.2`). Esto es necesario para la comunicación con la API local durante las pruebas.

## Proposed Changes

### Componente de Red y Seguridad

#### [MODIFY] [network_security_config.xml](file:///home/jhonm/PROYECTO-SENA-TIENDA-TEXTIL-/TiendaTextilApp/app/src/main/res/xml/network_security_config.xml)
- Añadir una excepción explícita para `10.0.2.2` (la dirección del host vista desde el emulador) para permitir tráfico sin cifrar.

---

### Componente Core (WebView)

#### [MODIFY] [MainActivity.kt](file:///home/jhonm/PROYECTO-SENA-TIENDA-TEXTIL-/TiendaTextilApp/app/src/main/java/com/tiendatextil/app/MainActivity.kt)
- Configurar `mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW`.
- Asegurar que `databaseEnabled` y `domStorageEnabled` estén activos para el correcto funcionamiento del modo oscuro y el carrito (que suelen usar localStorage).
- Refinar el filtrado de URLs en `shouldOverrideUrlLoading` para no bloquear llamadas a la API.

## Verification Plan

### Automated Tests
- Ejecutar `./gradlew assembleDebug` para verificar que la configuración XML de red sea válida.

### Manual Verification
- Iniciar la app en el emulador.
- Abrir **Logcat** y filtrar por `CONSOLE`.
- Verificar que ya no aparecen mensajes de "Mixed Content: ... has been blocked".
- Comprobar que al hacer clic en el carrito o login, la interfaz reacciona.
- Probar el cambio de modo oscuro.
