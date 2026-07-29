/** Generador de ids ligero para nodos creados en cliente. */
export function makeId(prefix = "n"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
