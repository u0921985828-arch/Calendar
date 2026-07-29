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

/** Tarea macro. Vive en una fase + energia, no en una hora. */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  energy: EnergyLevel;
  phase: DayPhase;
  /** Descomposicion molecular. Vacia = aun sin desglosar. */
  steps: MicroStep[];
  /** Tarea de mantenimiento rutinario -> alimenta la dopamina operativa. */
  isRoutine?: boolean;
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
  kind: "hidratacion" | "postura" | "vista" | "respiracion";
  label: string;
}

/** Metrica visible del sistema de dopamina operativa. */
export interface DopamineMetric {
  routineDoneToday: number;
  routineTotalToday: number;
  streakDays: number;
}
