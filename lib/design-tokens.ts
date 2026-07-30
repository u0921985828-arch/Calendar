import type { DayPhase, EnergyLevel, WeekDay } from "./types";

/**
 * Mapas de senaletica. El color codifica ESTADO, no estetica.
 * Se centraliza aqui para que ningun componente invente colores.
 */

// Energia baja ya NO usa rojo (color de alerta): un dia bajo es normal, no
// una emergencia. Se codifica en un neutro (`calm`) para no estigmatizar.
export const ENERGY_META: Record<
  EnergyLevel,
  { label: string; token: string; bg: string; text: string }
> = {
  alta: { label: "ALTA", token: "action", bg: "bg-action", text: "text-ink" },
  media: { label: "MEDIA", token: "signal", bg: "bg-signal", text: "text-ink" },
  baja: { label: "BAJA", token: "calm", bg: "bg-calm", text: "text-ink" },
};

// Fases en lenguaje llano (la jerga "ARRANQUE/PICO/MESETA/CIERRE" no se
// entendia sin manual). `hours` mapea la fase a una franja para marcar "ahora".
export const PHASE_META: Record<
  DayPhase,
  { label: string; hint: string; hours: [number, number] }
> = {
  arranque: { label: "PARA EMPEZAR", hint: "Encendido lento. Cosas suaves.", hours: [5, 9] },
  pico: { label: "A TOPE", hint: "Maxima capacidad. Lo dificil.", hours: [9, 13] },
  meseta: { label: "RITMO SUAVE", hint: "Sostener. Ejecucion media.", hours: [13, 18] },
  cierre: { label: "CERRAR EL DIA", hint: "Descarga. Rutina y ordenar.", hours: [18, 29] },
};

export const PHASE_ORDER: DayPhase[] = ["arranque", "pico", "meseta", "cierre"];

/** Fase que corresponde a la hora actual (para el marcador "ahora"). */
export function currentPhase(): DayPhase {
  const h = new Date().getHours();
  for (const key of PHASE_ORDER) {
    const [a, b] = PHASE_META[key].hours;
    const end = b > 24 ? b - 24 : b;
    if (b > 24 ? h >= a || h < end : h >= a && h < b) return key;
  }
  return "cierre";
}

/** Etiquetas de la semana, lunes primero. Indice = WeekDay (0=Lun..6=Dom). */
export const WEEK_DAYS: string[] = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

/** Dia de hoy como WeekDay (lunes-primero). Llamar en cliente para evitar
 *  desajustes de hidratacion en SSR. */
export function todayWeekDay(): WeekDay {
  return (((new Date().getDay() + 6) % 7) as WeekDay);
}
