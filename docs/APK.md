# APK de Neuroflow (Android)

La app web (`public/demo.html`, autónoma) se empaqueta en un APK envolviéndola
en un `WebView` a pantalla completa. Toda la lógica corre en la página; la parte
nativa (`android/`) solo la aloja.

Se sirve con `WebViewAssetLoader` bajo `https://appassets.androidx.org/`, un
contexto seguro, así que **el cifrado (WebCrypto) y el guardado local siguen
funcionando** dentro del APK.

## Cómo obtener el APK (sin instalar nada)

Se compila en **GitHub Actions** (el runner tiene internet y SDK; este entorno no):

1. En GitHub, pestaña **Actions → Build APK**.
   - Se ejecuta solo al hacer push a la rama (si cambian `android/**` o
     `public/demo.html`), o pulsa **Run workflow** (workflow_dispatch, visible
     cuando el workflow está en la rama por defecto).
2. Al terminar (verde), descarga el APK desde:
   - **el run → Artifacts → `neuroflow-apk`**, o
   - la release `apk`: `https://github.com/<OWNER>/<REPO>/releases/download/apk/Neuroflow.apk`.

## Instalar en el móvil
1. Descarga `Neuroflow.apk` al teléfono.
2. Ábrelo; si lo pide, activa **"Instalar apps desconocidas"** para tu navegador.
3. O por USB: `adb install -r Neuroflow.apk`.

El APK es *debug* (firmado con la clave de depuración): perfecto para probar e
instalar tú. Para Play Store hay que firmarlo con un keystore propio.

## Compilar en local (opcional)
Con el Android SDK instalado (Android Studio lo hace):
```
cd android
echo "sdk.dir=$ANDROID_HOME" > local.properties
gradle assembleDebug        # o ./gradlew si generas el wrapper
#   -> app/build/outputs/apk/debug/app-debug.apk
```
O: **Android Studio → abrir `android/` → Run ▶**.

## Detalles
- `applicationId`: `com.neuroflow.app` · minSdk 26 · targetSdk 34.
- La web app se copia a `assets/index.html` en cada build (fuente única:
  `public/demo.html`); no se versiona la copia.
- Sin permisos de red: la app funciona 100% offline.
