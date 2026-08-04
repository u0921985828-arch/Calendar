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
 *
 * Se sirve vía WebViewAssetLoader bajo https://appassets.androidx.org/ para que sea
 * un CONTEXTO SEGURO (isSecureContext=true). Eso garantiza WebCrypto (crypto.subtle)
 * y localStorage persistente, de los que depende el cifrado de la bóveda. Cargar
 * desde file:// NO es contexto seguro y WebCrypto puede no existir; por eso no se usa.
 * La app sigue siendo 100% offline: el loader intercepta y responde desde los assets
 * locales (el permiso INTERNET solo lo exige el esquema https del loader).
 */
public class MainActivity extends Activity {

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidx.org")
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);

        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(@NonNull WebView view,
                                                              @NonNull WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

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
