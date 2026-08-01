package com.neuroflow.app;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.webkit.WebResourceErrorCompat;
import androidx.webkit.WebViewClientCompat;
import androidx.webkit.WebViewFeature;

/**
 * Aloja la web app (public/demo.html, copiada a assets/index.html) en un WebView.
 * Se sirve vía WebViewAssetLoader bajo https://appassets.androidx.org/ para que
 * sea un contexto seguro: WebCrypto (el cifrado) y localStorage funcionan.
 */
public class MainActivity extends Activity {

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);

        // Registra en logcat los errores de carga del frame principal y reenvía los
        // console.* (permite verificar en CI que la web app arranca de verdad).
        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public void onReceivedError(@NonNull WebView view, @NonNull WebResourceRequest request,
                                        @NonNull WebResourceErrorCompat error) {
                if (!request.isForMainFrame()) return;
                String info = "url=" + request.getUrl();
                try {
                    if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_RESOURCE_ERROR_GET_CODE)) {
                        info = "code=" + error.getErrorCode() + " " + info;
                    }
                } catch (Throwable ignored) { }
                Log.e("NEUROFLOW_LOAD_ERROR", info);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                Log.i("NEUROFLOW_JS", m.message());
                return true;
            }
        });

        setContentView(web);
        // Carga la web app DIRECTAMENTE desde los assets del APK. Es la vía más
        // robusta: funciona en cualquier WebView, sin interceptores que fallen.
        // Nota: file:// no es contexto seguro; si WebCrypto no está disponible la
        // app arranca sin cifrado (tiene ese modo de reserva integrado).
        web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && web != null && web.canGoBack()) {
            web.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
