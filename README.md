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
| **Desglose algorítmico** | `lib/breakdown.ts` + `TaskCard.tsx` | Macro → 3–5 micro-pasos moleculares ejecutables. |
| **Modo Hiperfoco** | `components/dashboard/HyperfocusPanel.tsx` | Overlay opaco, temporizador de sesión, interrupciones suaves (hidratación/postura/vista). |
| **Dopamina Operativa** | `components/dashboard/DopamineBar.tsx` | Bloques macizos que se rellenan al cerrar rutinas + racha. Refuerzo visual inmediato. |

### Árbol del proyecto

```
app/
  layout.tsx          Root layout (lang=es, metadata)
  page.tsx            Monta <Dashboard/>
  globals.css         Base Tailwind + utilidades C40 (.block-hard, .btn-action)
components/
  dashboard/
    Dashboard.tsx     Orquestador con estado (capturas, tareas, dopamina, foco)
    BrainDump.tsx     Captura de fricción cero
    CaptureInbox.tsx  Triaje captura → tarea (asigna energía)
    TimeBlocks.tsx    Rejilla por fase del día
    TaskCard.tsx      Tarea + desglose molecular + botón hiperfoco
    HyperfocusPanel.tsx  Overlay de aislamiento + timer + nudges
    DopamineBar.tsx   Racha e hitos de rutina
  ui/
    EnergyChip.tsx    Señalética de energía
    SectionHeader.tsx Encabezado de bloque (índice + título masivo)
lib/
  types.ts            Modelo de dominio
  design-tokens.ts    Mapas señalética energía/fase
  breakdown.ts        Desglose algorítmico (stub → LLM)
  seed.ts             Datos de demo
  id.ts               IDs de cliente
```

---

## 4. Arrancar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run typecheck  # tsc --noEmit
```

Estado actual: **base funcional en memoria** (sin backend). El estado se pierde al recargar — es intencional para la fase base. El siguiente paso es persistencia + conexión del desglose a Claude.
