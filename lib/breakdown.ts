import type { MicroStep } from "./types";
import { makeId } from "./id";

/**
 * DESGLOSE ALGORITMICO (stub deterministico).
 *
 * Descompone una tarea macro en micro-pasos moleculares. Aqui va una
 * heuristica local; en produccion este modulo es el punto de enganche
 * para un LLM (Claude) que genere los pasos a partir del titulo + contexto.
 *
 * Contrato: recibe un titulo, devuelve 3-5 pasos accionables y pequenos.
 */
export function breakdownTask(title: string): MicroStep[] {
  const t = title.trim();
  const scaffold = [
    `Abrir/preparar lo necesario para: ${firstWords(t)}`,
    "Definir el primer movimiento concreto (2 min)",
    "Ejecutar el nucleo de la tarea",
    "Revisar rapido el resultado",
    "Cerrar / enviar / guardar",
  ];
  return scaffold.map((label, i) => ({
    id: makeId("step"),
    label,
    done: false,
    estimateMin: [3, 2, 15, 5, 3][i],
  }));
}

function firstWords(text: string, n = 5): string {
  const words = text.split(/\s+/).slice(0, n).join(" ");
  return words.length ? words.toLowerCase() : "la tarea";
}
