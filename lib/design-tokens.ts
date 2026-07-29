import type { DayPhase, EnergyLevel, WeekDay } from "./types";

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

/** Etiquetas de la semana, lunes primero. Indice = WeekDay (0=Lun..6=Dom). */
export const WEEK_DAYS: string[] = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

/** Dia de hoy como WeekDay (lunes-primero). Llamar en cliente para evitar
 *  desajustes de hidratacion en SSR. */
export function todayWeekDay(): WeekDay {
  return (((new Date().getDay() + 6) % 7) as WeekDay);
}
