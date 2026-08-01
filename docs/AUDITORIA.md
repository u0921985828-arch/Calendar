# NEUROFLOW — Auditoría Maestra

> **Nota (registro histórico).** Esta auditoría es de una versión anterior. Por
> decisión de producto, **toda función de medicación/medicina se eliminó** de la
> app (no se enfoca la organización del TDAH/AACC en la medicación). Las menciones
> y recomendaciones sobre medicación que aparecen abajo **ya no aplican**: no
> existe tipo de evento "medicación", ni recordatorios, ni aviso médico.

Revisión multidisciplinar de la app (TDAH + AACC). Cinco lentes independientes
auditaron el código real y la demo por separado, sin verse entre sí:

- ◐ **Psicólogo/a clínico** (TDAH / función ejecutiva)
- ✚ **Psiquiatra** (seguridad clínica, comorbilidades)
- ● **Persona de a pie** (claridad, usabilidad)
- ◆ **Persona con TDAH + AACC** (experiencia vivida)
- ⌨ **Developer senior** (arquitectura, a11y, seguridad)

La estética funciona; lo que está en juego es la **adherencia** y la **seguridad clínica**.

---

## A · Consenso entre lentes

Hallazgos señalados por dos o más auditores. Aquí es donde hay que actuar primero.

### 1. La racha frágil se convierte en vergüenza y abandono — `ALTA` · 4 lentes
La racha de 12 días motiva hasta que se rompe; un fallo la resetea a cero y se lee
como fracaso (crítico en RSD). Sin congelación, mejor marca ni reencuadre.
**Lentes:** Psicólogo · Psiquiatra · Persona TDAH · Developer (bug de doble conteo).
**Arreglo:** racha indulgente (escudo de 1 día, mejor marca, texto neutro, nunca 0 en
rojo) y corregir el doble incremento en `Dashboard.tsx:109-116`.

### 2. El nudge de hiperfoco a los 5 min expulsa del flow — `ALTA` · 2 lentes
Los avisos saltan en min 5/12/20/30. Con TDAH arrancar cuesta ~20 min; interrumpir a
los 5 es "sabotaje disfrazado de autocuidado". La persona con el trastorno lo marca
como *el detalle que decide si usa o borra la app*.
**Lentes:** Persona TDAH · Psicólogo.
**Arreglo:** primer nudge ≥ 25 min; silenciables por sesión; micro-descanso real al cierre.

### 3. "Sin horas" sin ancla temporal empeora la ceguera temporal — `ALTA` · 2 lentes
Quitar todo anclaje de reloj retira la señal externa que el cerebro TDAH ya no genera:
sin indicador de fase actual, sin "ahora", sin suma de estimaciones por fase.
**Lentes:** Psicólogo · Persona TDAH.
**Arreglo:** marcador de fase actual/"ahora", suma de `estimateMin` por fase (aviso de
sobrecarga en "Pico"), y anclas que avisen.

### 4. Persistencia ausente + datos de salud sin cifrar — `CRÍTICA` · 3 lentes
Todo vive en `useState`: recargar borra todo (`Dashboard.tsx:36-40`). El modelo ya
contempla datos sensibles (medicación como anclas, `types.ts:46-56`) sin cifrado ni
política de privacidad.
**Lentes:** Developer (crítica) · Psiquiatra · Persona TDAH.
**Arreglo:** persistencia local cifrada (IndexedDB + WebCrypto) o backend con control de
acceso; política de privacidad y consentimiento antes de guardar datos de salud.

### 5. El triaje de energía a priori paraliza; la Bandeja se vuelve buzón de culpa — `ALTA` · 3 lentes
La captura es cero fricción, pero obliga a asignar energía para crear la tarea. "No sé
mi energía hasta que empiezo." Diferir el triaje solo acumula la decisión.
**Lentes:** Persona TDAH · Persona de a pie · Psicólogo.
**Arreglo:** default "media" y opción "decidir después"; triaje por lotes; energía baja
en neutro (hoy `alert` rojo = estigmatizante).

### 6. Hiperfoco sin contención clínica — `ALTA` · 2 lentes
El timer de 50 min no fuerza pausa ni limita sesiones; los nudges son fisiológicos pero
**ninguno de comida, medicación o sueño**.
**Lentes:** Psiquiatra · Psicólogo.
**Arreglo:** tope de sesiones seguidas, pausa obligatoria al cierre, nudges de
comida/medicación/descanso.

---

## B · Hallazgos clave por lente

- **Seguridad clínica** (`ALTA`, Psiquiatra): sin disclaimer "no sustituye tratamiento",
  sin recordatorio de medicación (crítico con estimulantes), y "energía alta → pico →
  hiperfoco" podría amplificar un episodio hipomaníaco sin advertencia.
- **Integración con Claude insegura** (`CRÍTICA`, Developer): el hook `breakdownWithLLM`
  (`breakdown.ts:171-187`) no fija el límite servidor/cliente; falta rate-limit, control
  de coste y validación de salida; el id `claude-sonnet-5` citado no es válido. Debe ir
  en route handler / server action con la key en env.
- **Accesibilidad** (`ALTA`, Developer): modal de hiperfoco sin focus trap; verde neón
  como *texto* sobre blanco ~1.3:1 (falla WCAG AA, `WeekNav.tsx:51`); estado de checks
  solo por color; cero tests.
- **Vocabulario** (`ALTA`, Persona de a pie): "estocástico", "molecular", "anclas",
  "AACC", "ARRANQUE/PICO/MESETA/CIERRE" no se entienden sin manual; estética percibida
  como "fría, de app de finanzas".

---

## C · Roadmap priorizado

**P0 — Bloqueante para publicar (seguridad, no negociable)**
1. Disclaimer "no es dispositivo médico ni sustituye tratamiento", persistente.
2. Persistencia cifrada de datos de salud + política de privacidad.
3. LLM del lado servidor (key en env, validación, rate-limit, fallback).
4. Contención de hiperfoco: nudge ≥ 25 min, tope de sesiones, pausa real, nudges de comida/medicación.

**P1 — Adherencia (evita el abandono)**
1. Racha indulgente (escudo, mejor marca, sin castigo, sin rojo) + fix doble conteo.
2. Recordatorio de medicación como feature dedicada con notificación.
3. Ancla temporal: indicador de fase actual/"ahora", suma de estimaciones, anclas que avisan.

**P2 — Comprensión (que se entienda sin manual)**
1. Renombrar la jerga + subtítulo humano + onboarding de 3 pasos.
2. Triaje por lotes con default "media" y "decidir después"; energía baja en neutro.
3. Micro-pasos editables y reordenables; rehacer la clasificación del desglose.

**P3 — Calidad técnica**
1. Focus trap + contraste WCAG AA + glifo en checks.
2. Suite de tests; detener el timer al llegar a 0; `next/font`; i18n; `makeId` sin colisión.

---

## D · Veredicto por lente

| Lente | Veredicto |
|-------|-----------|
| ◐ Psicólogo/a clínico | Excelente reducción de fricción de entrada, pero la ausencia total de señales temporales y una racha frágil pueden reintroducir la ceguera temporal y la vergüenza que pretende eliminar. |
| ✚ Psiquiatra | Prototipo de UX prometedor, pero clínicamente inseguro para publicar sin disclaimer, recordatorio de medicación y contención del hiperfoco. |
| ● Persona de a pie | Volvería solo por el Brain Dump y el Hiperfoco; el resto del vocabulario me echa para atrás y lo abandonaría en una semana. |
| ◆ Persona con TDAH + AACC | Captura brillante, ejecución que me castiga: arréglame el nudge y la racha, o soy otra app abandonada. |
| ⌨ Developer senior | Base arquitectónica sólida y accesibilidad prometedora, pero no apta para producción sin persistencia segura, LLM del lado servidor y tests. |

### Veredicto global
La tesis es correcta y la captura es de las mejores que se ven. Pero tres decisiones
—racha que castiga, hiperfoco que interrumpe demasiado pronto, y tiempo sin ningún
ancla— reintroducen por la puerta de atrás la vergüenza y la ceguera temporal que la
app promete eliminar. Con **P0 y P1** resueltos, pasa de prototipo brillante a producto
defendible.

---

> **Nota:** esta auditoría usa cinco lentes para estructurar el análisis; no constituye
> consejo médico ni sustituye la evaluación de profesionales sanitarios reales. La app
> no es un dispositivo médico.
