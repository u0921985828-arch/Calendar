/**
 * Modelo de dominio de NEUROFLOW.
 *
 * Principios de diseno del dominio:
 *  - El tiempo NO se modela con horas estrictas (hostil para el TDAH).
 *    Se modela con FASES del dia + NIVEL DE ENERGIA requerido.
 *  - Toda tarea macro es descomponible en micro-pasos "moleculares".
 *  - La captura (brain dump) es un nodo plano, sin obligacion de estructura.
 */

/** Nivel de energia requerido / disponible. Base del time-blocking estocastico. */
export type EnergyLevel = "alta" | "media" | "baja";

/** Fases del dia. Reemplazan al reloj de pared. */
export type DayPhase = "arranque" | "pico" | "meseta" | "cierre";

export type TaskStatus = "captura" | "planificada" | "en-curso" | "hecha";

/** Micro-paso ejecutable: la unidad molecular del desglose algoritmico. */
export interface MicroStep {
  id: string;
  label: string;
  done: boolean;
  /** Estimacion en minutos. Orientativa, nunca vinculante. */
  estimateMin?: number;
}

/** Dia de la semana con lunes primero: 0=Lun .. 6=Dom. */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Tarea macro. Vive en un dia + fase + energia, no en una hora. */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  energy: EnergyLevel;
  phase: DayPhase;
  /** Dia de la semana donde cae la tarea. Sigue sin hora estricta. */
  day: WeekDay;
  /** Descomposicion molecular. Vacia = aun sin desglosar. */
  steps: MicroStep[];
  /** Tarea de mantenimiento rutinario -> alimenta la dopamina operativa. */
  isRoutine?: boolean;
}

/** Tipo de ancla. */
export type AnchorKind = "cita";

/**
 * ANCLA: la EXCEPCION con hora fija. Citas y reuniones: lo unico que de verdad
 * necesita reloj. Convive con el time-blocking por fases sin contaminarlo.
 */
export interface Anchor {
  id: string;
  day: WeekDay;
  time: string; // "HH:MM"
  label: string;
  kind: AnchorKind;
}

/** Nodo crudo del Brain Dump antes de ser procesado a Task. */
export interface CaptureNode {
  id: string;
  text: string;
  createdAt: string; // ISO
}

/** Configuracion de una sesion de Hiperfoco. */
export interface FocusSession {
  taskId: string;
  durationMin: number;
  /** Interrupciones suaves programadas (fisiologia / hidratacion). */
  nudges: SoftNudge[];
}

export interface SoftNudge {
  atMin: number;
  /** `vital` marca cuidado basico (comida/descanso): no descartable a la ligera. */
  kind: "hidratacion" | "postura" | "vista" | "respiracion" | "comida" | "descanso";
  label: string;
  vital?: boolean;
}

/**
 * Metrica visible del sistema de dopamina operativa.
 * Racha INDULGENTE: guarda la mejor marca y un "escudo" que absorbe un fallo,
 * para no castigar con vergueenza (relevante en RSD).
 */
export interface DopamineMetric {
  routineDoneToday: number;
  routineTotalToday: number;
  streakDays: number;
  /** Mejor racha historica: se muestra aunque la actual caiga. */
  bestStreak: number;
  /** Escudo disponible: un fallo no rompe la racha si queda escudo. */
  shieldAvailable: boolean;
}
