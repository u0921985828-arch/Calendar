package com.neuroflow.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;

/**
 * Puente JS -> nativo. La web app, SOLO estando desbloqueada, llama a
 * NFWidget.set(json) con una proyección de CONTADORES (nº de tareas por energía
 * y citas, por día). Nunca títulos ni contenido. Se guarda en SharedPreferences
 * privadas de la app para que el widget pueda pintarse con la app cerrada.
 */
public class WidgetBridge {

    private final Context ctx;

    public WidgetBridge(Context ctx) {
        this.ctx = ctx.getApplicationContext();
    }

    @JavascriptInterface
    public void set(String json) {
        SharedPreferences p = ctx.getSharedPreferences(NeuroWidget.PREFS, Context.MODE_PRIVATE);
        p.edit().putString(NeuroWidget.KEY_DATA, json == null ? "" : json).apply();
        NeuroWidget.refresh(ctx);
    }
}
