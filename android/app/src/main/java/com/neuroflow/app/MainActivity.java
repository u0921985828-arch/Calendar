package com.neuroflow.app;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.webkit.WebResourceErrorCompat;
import androidx.webkit.WebViewAssetLoader;
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

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidx.org")
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);

        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse r = loader.shouldInterceptRequest(request.getUrl());
                Log.i("NEUROFLOW_INTERCEPT", request.getUrl() + " -> " + (r == null ? "NULL(red)" : "asset"));
                return r;
            }

            @Override
            public void onReceivedError(@NonNull WebView view, @NonNull WebResourceRequest request,
                                        @NonNull WebResourceErrorCompat error) {
                // Solo importa el fallo del documento principal (la app en sí).
                if (!request.isForMainFrame()) return;
                String info = "url=" + request.getUrl();
                try {
                    if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_RESOURCE_ERROR_GET_CODE)) {
                        info = "code=" + error.getErrorCode() + " " + info;
                    }
                } catch (Throwable ignored) { }
                Log.e("NEUROFLOW_LOAD_ERROR", info);
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request,
                                            WebResourceResponse errorResponse) {
                if (request.isForMainFrame()) {
                    Log.e("NEUROFLOW_HTTP_ERROR", "status=" + errorResponse.getStatusCode()
                            + " url=" + request.getUrl());
                }
            }
        });

        // Reenvía los console.* de la web app a logcat: permite verificar el arranque real.
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                Log.i("NEUROFLOW_JS", m.message());
                return true;
            }
        });

        setContentView(web);
        web.loadUrl("https://appassets.androidx.org/assets/index.html");
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
