#!/bin/zsh
export ANDROID_HOME=$HOME/Android
export ANDROID_SDK_ROOT=$HOME/Android
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

echo "=== Iniciando emulador TiendaTextilAVD ==="
echo "Se abrirá una ventana del emulador. Espera a que termine de cargar."
echo ""

# Iniciar emulador en background
$ANDROID_HOME/emulator/emulator -avd TiendaTextilAVD -no-snapshot &
EMU_PID=$!

echo "Emulador PID: $EMU_PID"
echo "Esperando dispositivo..."
adb wait-for-device

echo "Dispositivo detectado. Instalando APK..."
# Asegurarnos de que la APK esté construida
./gradlew app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "=== APK instalada! ==="
echo "La app 'Tienda Textil' ya debería aparecer en el emulador."
echo ""
echo "Para lanzarla manualmente desde terminal:"
echo "  adb shell am start -n com.tiendatextil.app/.MainActivity"
echo ""
echo "Para ver logs:"
echo "  adb logcat | grep -i \"tiendatextil\|webview\""
