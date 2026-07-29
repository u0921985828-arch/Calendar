import type { DayPhase, EnergyLevel } from "./types";

/**
 * Mapas de senaletica. El color codifica ESTADO, no estetica.
 * Se centraliza aqui para que ningun componente invente colores.
 */

export const ENERGY_META: Record<
  EnergyLevel,
  { label: string; token: string; bg: string; text: string }
> = {
  alta: { label: "ALTA", token: "action", bg: "bg-action", text: "text-ink" },
  media: { label: "MEDIA", token: "signal", bg: "bg-signal", text: "text-ink" },
  baja: { label: "BAJA", token: "alert", bg: "bg-alert", text: "text-paper" },
};

export const PHASE_META: Record<DayPhase, { label: string; hint: string }> = {
  arranque: { label: "ARRANQUE", hint: "Encendido lento. Cosas de baja carga." },
  pico: { label: "PICO", hint: "Maxima capacidad. Tareas de alta energia." },
  meseta: { label: "MESETA", hint: "Sostener. Ejecucion media." },
  cierre: { label: "CIERRE", hint: "Descarga. Rutina y ordenar." },
};

export const PHASE_ORDER: DayPhase[] = ["arranque", "pico", "meseta", "cierre"];
