package com.neuroflow.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * Widget de inicio: muestra SOLO contadores (nº de tareas de hoy por energía +
 * citas, y un resumen numérico de los próximos días). Lee la proyección que la
 * web app escribió (WidgetBridge). Sin títulos ni contenido de tareas.
 */
public class NeuroWidget extends AppWidgetProvider {

    static final String PREFS = "neuroflow_widget";
    static final String KEY_DATA = "data";

    private static final int C_ALTA  = 0xFFB8FF3C;
    private static final int C_MEDIA = 0xFFFFE500;
    private static final int C_BAJA  = 0xFFE7E7E7;
    private static final int C_EV    = 0xFF00E5FF;
    private static final String[] WD = {"lun", "mar", "mié", "jue", "vie", "sáb", "dom"};

    static void refresh(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, NeuroWidget.class));
        for (int id : ids) render(ctx, mgr, id);
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) render(ctx, mgr, id);
    }

    private static String todayIso() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    private static void render(Context ctx, AppWidgetManager mgr, int id) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_neuro);

        v.setInt(R.id.cellAlta,  "setBackgroundColor", C_ALTA);
        v.setInt(R.id.cellMedia, "setBackgroundColor", C_MEDIA);
        v.setInt(R.id.cellBaja,  "setBackgroundColor", C_BAJA);
        v.setInt(R.id.cellEv,    "setBackgroundColor", C_EV);

        int hoy = 0, a = 0, m = 0, b = 0, ev = 0;
        StringBuilder prox = new StringBuilder("PRÓXIMOS  ");
        boolean any = false;
        try {
            SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String raw = p.getString(KEY_DATA, "");
            if (raw != null && raw.length() > 0) {
                JSONObject o = new JSONObject(raw);
                JSONArray days = o.optJSONArray("days");
                String today = todayIso();
                if (days != null) {
                    for (int i = 0; i < days.length(); i++) {
                        JSONObject d = days.getJSONObject(i);
                        String ds = d.optString("d", "");
                        int total = d.optInt("total", 0);
                        if (ds.equals(today)) {
                            hoy = total;
                            a = d.optInt("alta", 0);
                            m = d.optInt("media", 0);
                            b = d.optInt("baja", 0);
                            ev = d.optInt("ev", 0);
                        } else if (ds.compareTo(today) > 0) {
                            if (any) prox.append("  ·  ");
                            prox.append(labelFor(ds, today)).append(" ").append(total);
                            any = true;
                        }
                    }
                }
            }
        } catch (Throwable ignored) { }

        v.setTextViewText(R.id.hoyNum, String.valueOf(hoy));
        v.setTextViewText(R.id.nAlta, String.valueOf(a));
        v.setTextViewText(R.id.nMedia, String.valueOf(m));
        v.setTextViewText(R.id.nBaja, String.valueOf(b));
        v.setTextViewText(R.id.nEv, String.valueOf(ev));
        v.setTextViewText(R.id.prox, any ? prox.toString() : "PRÓXIMOS  —");

        Intent open = new Intent(ctx, MainActivity.class);
        open.putExtra("nf_go", "dia");
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, flags);
        v.setOnClickPendingIntent(R.id.widgetRoot, pi);

        mgr.updateAppWidget(id, v);
    }

    // "mañana" para today+1; en otro caso el día de la semana abreviado.
    private static String labelFor(String ds, String today) {
        try {
            SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            long a = f.parse(today).getTime();
            long b = f.parse(ds).getTime();
            long diff = Math.round((b - a) / 86400000.0);
            if (diff == 1) return "mañana";
            Calendar cal = Calendar.getInstance();
            cal.setTime(f.parse(ds));
            int dow = (cal.get(Calendar.DAY_OF_WEEK) + 5) % 7; // 0 = lunes
            return WD[dow];
        } catch (Throwable e) {
            return "próx";
        }
    }
}
