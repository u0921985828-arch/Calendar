# NEUROFLOW

Gestión de tiempo **estocástica** para cerebros **TDAH + AACC**. Sistema base con UI de *autoridad climática* (referencia estética [C40.org](https://www.c40.org)).

> El tiempo no se mide en horas de reloj, se mide en **fases del día** y **niveles de energía**. La app quita fricción, no la añade.

---

## 1. Stack

| Capa | Elección | Por qué |
|------|----------|---------|
| Framework | **Next.js 14** (App Router) | SSR/streaming, layout anidado, un solo despliegue. Escala a backend sin cambiar de casa. |
| UI | **React 18** + Server/Client Components | Componentes puros y controlados; estado local en el orquestador. |
| Estilos | **Tailwind CSS 3** | Design-system por tokens. Impone la estética C40 (bordes duros, cero sombras difusas) desde la config. |
| Lenguaje | **TypeScript** (strict) | El dominio (energía, fases, micro-pasos) es tipado; evita estados imposibles. |
| Tipografía | Inter (geométrica) + Roboto Mono (métricas) | Alto peso para títulos masivos; monospace para datos. |

**Por delante (enganches ya previstos):**
- `lib/breakdown.ts` → punto de conexión para un LLM (Claude) que genere el desglose molecular.
- Estado en memoria en `Dashboard.tsx` → sustituible por store (Zustand) + persistencia (Postgres/Prisma o local-first con IndexedDB).

---

## 2. Sistema de diseño — "Autoridad Climática"

Definido en `tailwind.config.ts` y `app/globals.css`. **El color codifica estado, nunca decora.**

| Token | Valor | Uso |
|-------|-------|-----|
| `ink` | `#111111` | Texto y bordes (negro sólido) |
| `paper` / `cement` | `#FFFFFF` / `#F4F4F4` | Fondos |
| `action` | Verde neón `#B8FF3C` | Ejecutar / completar / energía alta |
| `focus` | Cian `#00E5FF` | Foco / atención |
| `signal` | Amarillo `#FFE500` | Aviso / energía media |
| `alert` | Rojo `#FF3B30` | Detener / energía baja |

Reglas duras: bordes `1px solid #111`, radio `0`, **sin** sombras difuminadas (solo desplazamiento sólido `shadow-hard`), foco de teclado visible (anillo cian 3px), reducción absoluta de ruido visual.

---

## 3. Core features → dónde vive cada una

| Feature | Componente | Nota de diseño |
|---------|-----------|----------------|
| **Brain Dump** (captura cero fricción) | `components/dashboard/BrainDump.tsx` | Un input. Enter guarda y limpia. Triaje diferido a la Bandeja. |
| **Time-Blocking estocástico** | `components/dashboard/TimeBlocks.tsx` | Columnas por **fase** (Arranque/Pico/Meseta/Cierre), no por hora. |
| **Calendario híbrido** | `WeekNav.tsx` + `AnchorStrip.tsx` | Semana por días (Lun–Dom, sin horas) + franja de **anclas** con hora fija para las excepciones (citas, reuniones). |
| **Desglose algorítmico** | `lib/breakdown.ts` + `TaskCard.tsx` | Macro → 3–5 micro-pasos moleculares ejecutables. |
| **Modo Hiperfoco** | `components/dashboard/HyperfocusPanel.tsx` | Overlay opaco, temporizador de sesión, interrupciones suaves (hidratación/postura/vista). |
| **Dopamina Operativa** | `components/dashboard/DopamineBar.tsx` | Bloques macizos que se rellenan al cerrar rutinas + racha. Refuerzo visual inmediato. |

### Árbol del proyecto

```
app/
  layout.tsx          Root layout (lang=es, metadata)
  page.tsx            Monta <Dashboard/>
  globals.css         Base Tailwind + utilidades C40 (.block-hard, .btn-action)
  api/breakdown/route.ts  Desglose LLM del lado servidor (key en env, rate-limit,
                          validación de salida, fallback heurístico)
components/
  dashboard/
    VaultGate.tsx     Puerta con passphrase: descifra y arranca el Dashboard
    Dashboard.tsx     Orquestador con estado + guardado cifrado
    Disclaimer.tsx    Aviso clínico "no es dispositivo médico" (persistente)
    Onboarding.tsx    Bienvenida de 3 pasos (primera visita)
    BrainDump.tsx     Captura de fricción cero
    CaptureInbox.tsx  Triaje sin parálisis (default MEDIA + por lotes)
    TimeBlocks.tsx    Vista Semana: días + anclas + fases + "◀ ahora" + carga
    WeekNav.tsx       Pills de día (Lun–Dom), HOY con contraste AA
    AnchorStrip.tsx   Citas y medicación con hora fija
    TaskCard.tsx      Tarea + pasos editables (✓ glifo, añadir/borrar/rehacer)
    HyperfocusPanel.tsx  Aislamiento + timer + nudges tardíos + pausa obligatoria
    DopamineBar.tsx   Racha indulgente (mejor marca + escudo) + medicación
  ui/
    EnergyChip.tsx    Señalética de energía
    SectionHeader.tsx Encabezado de bloque (índice + título masivo)
lib/
  types.ts            Modelo de dominio
  design-tokens.ts    Señalética energía/fase + fase actual
  breakdown.ts        Desglose contextual + breakdownWithLLM (→ /api/breakdown)
  breakdown.test.ts   Tests del desglose (vitest)
  status.ts / .test.ts  Estado derivado de pasos + tests
  crypto.ts           Cifrado AES-GCM + PBKDF2 (WebCrypto)
  persist.ts          Caja fuerte cifrada en reposo (create/unlock/save)
  seed.ts             Datos de demo
  id.ts               IDs de cliente (crypto)
docs/
  AUDITORIA.md        Auditoría maestra (5 lentes) + roadmap
```

## Auditoría aplicada

El repo incorpora los hallazgos de `docs/AUDITORIA.md` (P0–P3): disclaimer
clínico, **cifrado en reposo de los datos de salud** (AES-GCM 256 con clave
derivada por PBKDF2 de una passphrase que no se guarda; ver `VaultGate` +
`lib/crypto.ts` + `lib/persist.ts`), LLM del lado servidor, contención del
hiperfoco (nudges ≥ 25 min, pausa obligatoria, avisos de comida/medicación),
racha indulgente, recordatorio de medicación, marcador de fase actual, lenguaje
llano + onboarding, triaje sin parálisis, accesibilidad (focus trap, contraste
AA, glifo en checks) y tests. Config: `ANTHROPIC_API_KEY` en el entorno activa
el desglose con Claude; sin ella, usa la heurística local.

Límite honesto del cifrado: protege el dato en reposo en el dispositivo; la
seguridad depende de la fuerza de la passphrase y de que el dispositivo no esté
comprometido. No sustituye un backend con control de acceso.

---

## 4. Arrancar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run typecheck  # tsc --noEmit
```

Estado actual: **base funcional en memoria** (sin backend). El estado se pierde al recargar — es intencional para la fase base. El siguiente paso es persistencia + conexión del desglose a Claude.
