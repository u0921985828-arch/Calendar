import type { Task, DopamineMetric, Anchor } from "./types";

/**
 * Datos de arranque para desarrollo / demo del dashboard.
 * `day` sigue el indice lunes-primero (0=Lun..6=Dom). En una app real la
 * tarea llevaria una fecha; aqui se fija para que la demo sea coherente.
 */
export const SEED_TODAY = 2; // miercoles, referencia de la demo

export const SEED_TASKS: Task[] = [
  {
    id: "t1",
    title: "Cerrar propuesta cliente Nordvik",
    status: "planificada",
    energy: "alta",
    phase: "pico",
    day: 2,
    steps: [
      { id: "t1s1", label: "Abrir el doc y releer brief", done: true, estimateMin: 5 },
      { id: "t1s2", label: "Escribir 3 bullets de alcance", done: false, estimateMin: 15 },
      { id: "t1s3", label: "Pegar precios de la plantilla", done: false, estimateMin: 10 },
      { id: "t1s4", label: "Enviar a revision interna", done: false, estimateMin: 3 },
    ],
  },
  {
    id: "t2",
    title: "Contestar correos atrasados",
    status: "planificada",
    energy: "media",
    phase: "meseta",
    day: 2,
    steps: [],
  },
  {
    id: "t3",
    title: "Lavar y guardar la ropa",
    status: "planificada",
    energy: "baja",
    phase: "cierre",
    day: 3,
    isRoutine: true,
    steps: [
      { id: "t3s1", label: "Meter carga a la lavadora", done: true },
      { id: "t3s2", label: "Tender / secadora", done: true },
      { id: "t3s3", label: "Doblar", done: false },
    ],
  },
  {
    id: "t4",
    title: "Tomar agua + estiramiento matutino",
    status: "hecha",
    energy: "baja",
    phase: "arranque",
    day: 2,
    isRoutine: true,
    steps: [],
  },
];

/** Citas con hora fija: la excepcion que si necesita reloj. */
export const SEED_ANCHORS: Anchor[] = [
  { id: "a1", day: 2, time: "09:30", label: "Dentista" },
  { id: "a2", day: 2, time: "16:00", label: "Reunion de equipo" },
  { id: "a3", day: 3, time: "11:00", label: "Llamada cliente Nordvik" },
];

export const SEED_DOPAMINE: DopamineMetric = {
  routineDoneToday: 3,
  routineTotalToday: 6,
  streakDays: 12,
};
