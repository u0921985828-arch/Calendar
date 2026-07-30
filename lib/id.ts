/** Generador de ids para nodos creados en cliente. Usa crypto cuando existe
 *  (sin colision practica); cae a un contador+random como respaldo. */
let counter = 0;
export function makeId(prefix = "n"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  counter += 1;
  return `${prefix}_${counter}_${Math.random().toString(36).slice(2, 8)}`;
}
