import type { MicroStep, TaskStatus } from "./types";

/**
 * Estado derivado de una tarea a partir de sus pasos.
 * Extraido para poder testear la logica sin React.
 */
export function statusFromSteps(steps: MicroStep[]): TaskStatus {
  if (steps.length > 0 && steps.every((s) => s.done)) return "hecha";
  if (steps.some((s) => s.done)) return "en-curso";
  return "planificada";
}
