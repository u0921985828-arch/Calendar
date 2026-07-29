import type { Task, DopamineMetric } from "./types";

/** Datos de arranque para desarrollo / demo del dashboard. */
export const SEED_TASKS: Task[] = [
  {
    id: "t1",
    title: "Cerrar propuesta cliente Nordvik",
    status: "planificada",
    energy: "alta",
    phase: "pico",
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
    steps: [],
  },
  {
    id: "t3",
    title: "Lavar y guardar la ropa",
    status: "planificada",
    energy: "baja",
    phase: "cierre",
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
    isRoutine: true,
    steps: [],
  },
];

export const SEED_DOPAMINE: DopamineMetric = {
  routineDoneToday: 3,
  routineTotalToday: 6,
  streakDays: 12,
};
