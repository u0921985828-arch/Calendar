# La app es una única Activity que aloja un WebView servido por WebViewAssetLoader.
# Mantener la Activity (referenciada desde el manifest) y androidx.webkit intactos:
# R8 no debe eliminar/renombrar lo que usa el loader ni la clase de entrada.
-keep class com.neuroflow.app.** { *; }
-keep class androidx.webkit.** { *; }
-dontwarn androidx.webkit.**

# No hay puente JS->Java (@JavascriptInterface) en esta app; si se añadiera,
# habría que mantener sus métodos anotados. Se deja anotado como recordatorio.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
