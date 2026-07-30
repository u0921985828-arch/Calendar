# NEUROFLOW — Estudio de producto

**Tesis:** no es otro gestor de tareas ni un tracker de salud. Es un **calendario
que piensa por ti la parte difícil** — coger algo enorme y vago ("hacer la
mudanza") y convertirlo, con IA, en pasos diminutos colocados en el día correcto
según tu energía. El resto de features existen para proteger ese momento.

## 1. La oportunidad
El problema no es la falta de apps de tareas: es que **casi todas asumen un
cerebro que ya sabe empezar** (que tú descompongas, priorices, estimes y
recuerdes). Para TDAH / AACC / gente saturada, esa carga ejecutiva es el muro.
Vientos a favor: la IA hace por fin viable el **desglose automático** de calidad;
comunidad TDAH grande y desatendida dispuesta a pagar (lo demuestra Tiimo);
hartazgo con apps sobre-gamificadas.

**Competencia y hueco:** Todoist/TickTick (tú descompones todo), Motion/Reclaim
(caro, rígido por horas, abruma), Sunsama/Akiflow (ritual manual pesado), Tiimo
(poca inteligencia de organización), Structured/Amie (bonito pero manual).
**Ángulo defendible:** desglose por IA + colocación por energía en un calendario
real (mes/semana/día), obsesionado con **reducir decisiones**.

## 2. Jobs-to-be-done
- "No sé por dónde empezar" → captura + desglose.
- "La tarea es tan grande que me paralizo" → micro-pasos.
- "El día se me evapora" → calendario visible + fases.
- "Planifico de más y me odio" → estimación honesta + sin castigo.
- "Lo que no hago desaparece" → rollover.

## 3. Fundamentos → lógicas (evidencia, no corazonadas)
| Hallazgo | Fuente | Lógica de producto |
|---|---|---|
| Ceguera temporal | Barkley (función ejecutiva TDAH) | El mes como superficie principal + marcador "ahora" |
| Falacia de planificación | Kahneman & Tversky | Calibración estimado/real personal |
| Intenciones de implementación | Gollwitzer | Tareas ancladas a fase/energía, no a reloj |
| Efecto Zeigarnik | Zeigarnik 1927 | Captura de fricción cero (descargar la RAM) |
| Sobrecarga de elección | Iyengar & Lepper | Defaults agresivos; minimizar decisiones |
| Atención sostenida | Pomodoro / body doubling | Foco con descanso forzado, sin gamificar |

## 4. Núcleo: lógicas y algoritmos

### 4.1 Motor de desglose  *(motor offline entrenado + hook IA)*

Dos motores: **offline entrenado aquí** (recuperación TF-IDF + kNN sobre corpus
curado, en `engine/`; reconoce el tipo de tarea aunque se escriba distinta y
adapta la receta, sin red) y, con servidor, **Claude** para tareas arbitrarias.

```
entrada: título + contexto (fecha/deadline, energía, tamaño, historial)
1. clasificar naturaleza (correo, informe, mudanza, estudio, trámite…)
2. profundidad: nº de pasos ∝ tamaño (2-3 trivial, 5-7 grande)
3. pasos: verbo + objeto; el 1º = "arranque de 2 minutos" (vencer inercia)
4. estimar minutos (base + calibración personal)
5. validar (schema) → si falla/no hay red: heurística local
salida: MicroStep[]  ·  clave: SIEMPRE responde
```
Servidor: key en env, rate-limit, caché por título normalizado, validación.
La demo usa la heurística local como sustituto; el producto usa Claude con esa
heurística de red de seguridad.

### 4.2 Colocación por energía + sobrecarga  *(implementado)*
```
CAP = { arranque:60, pico:120, meseta:120, cierre:60 }  // minutos
carga(fase, día) = Σ estimación de pasos no hechos
si carga > CAP[fase]: marcar "demasiado" → sugerir mover
"come la rana": lo de energía ALTA se ofrece primero en el pico
```

### 4.3 Rollover inteligente  *(implementado)*
```
al abrir HOY:
  atrasadas = tareas con fecha < hoy y no hechas
  bloque "Vienen de atrás (N)": "mover a hoy" / "todo a hoy"
  nunca mover en silencio → la persona decide, sin sermón
```

### 4.4 Priorización / próxima acción  *(implementado)*
```
score = w1·urgencia(deadline) + w2·encaje_energía(fase_actual)
      + w3·(tiene_primer_paso?1:0) − w4·tamaño
fase actual primero; dentro, no hechas antes que hechas
```

### 4.5 Calibración de estimaciones  *(implementado)*
```
factor = mediana(real_i / estimado_i) sobre últimas N
estimación_mostrada = IA · factor  (suavizado, techo 2.5×)
```

### 4.6 Recurrencia  *(implementado: diaria/semanal)*
Evento base con `repeat`; ocurrencias **expandidas virtualmente** al pintar cada
fecha (sin duplicar datos). Editar/borrar afecta a la serie.

### 4.7 Modo Foco  *(implementado)*
Aislamiento + timer; 1er aviso ≥25 min; pausa obligatoria al terminar; aviso al
encadenar sesiones. Sin puntos ni rachas.

## 5. Éxito
- **North Star:** días/semana que la persona completa ≥1 tarea que la app
  ayudó a desglosar.
- **Aha (<60 s):** escribir algo enorme y ver 5 pasos + "empezar".
- **Activación día 1:** 1 captura + 1 desglose + 1 paso marcado.
- **Anti-abandono:** nunca castigar, nunca pantalla vacía sin salida, nunca
  pedir configurar antes de dar valor.

## 6. Negocio
Freemium con la IA como palanca de plan. Free: calendario + captura + desglose
heurístico + foco. Pro (~5–8 €/mes): IA ilimitada, calibración, recurrencia
avanzada, sync. B2B2C (universidades, apoyo a neurodivergencia, coaches) sin
vender datos de salud.

## 7. Riesgos
Otra app abandonada (matar con defaults), sobre-features (cada feature quita una
decisión o sobra), coste de IA (caché + fallback + límite), datos sensibles
(cifrado en reposo; medicación opcional y secundaria), gamificación tóxica
(descartada: rachas rotas = vergüenza/RSD).

## 8. Roadmap
- **MVP + V1/V2 client-side (ya):** calendario mes/semana/día, captura, desglose
  heurístico, energía + carga, rollover, recurrencia diaria/semanal, foco,
  fechas límite + priorización / "lo siguiente", onboarding que desglosa tu
  tarea real, calibración de estimaciones, aligerar fases sobrecargadas,
  import/export `.ics` (Google/Apple), instalable (PWA, offline), editar todo,
  arranque vacío, cifrado local.
- **Necesita servidor / credenciales:** desglose IA real con Claude (enganche
  listo en `app/api/breakdown`), sync multi-dispositivo en la nube, sync OAuth
  bidireccional con Google/Apple Calendar, body doubling (servidor de presencia).

> Lógicas basadas en evidencia. No constituye consejo médico; la app no es un
> dispositivo médico.
