import type { MicroStep } from "./types";
import { makeId } from "./id";

/**
 * DESGLOSE ALGORITMICO.
 *
 * Descompone una tarea macro en micro-pasos moleculares que hablan de ESA
 * tarea, no de un molde generico. Estrategia en dos capas:
 *
 *  1. PRODUCCION: `breakdownWithLLM` delega en Claude, que lee el titulo +
 *     contexto y devuelve pasos realmente especificos. Es el camino real.
 *  2. LOCAL / OFFLINE: `breakdownHeuristic` clasifica la tarea por naturaleza
 *     (correo, propuesta, llamada, limpieza, compra, pago, estudio, escribir,
 *     codigo, ejercicio) e inyecta el objeto de la frase. Sirve de fallback
 *     deterministico y para demos sin backend.
 */

interface Recipe {
  kw: string[];
  steps: { label: string; est: number }[];
}

const VERBS = new Set([
  "cerrar", "abrir", "escribir", "redactar", "contestar", "responder", "enviar",
  "llamar", "agendar", "reunir", "lavar", "limpiar", "ordenar", "comprar", "pedir",
  "pagar", "estudiar", "leer", "repasar", "arreglar", "implementar", "programar",
  "preparar", "hacer", "revisar", "terminar", "organizar", "planificar", "buscar",
  "actualizar", "mandar", "entregar",
]);

const ARTICLES = /^(a|el|la|los|las|un|una|de|del|mi|mis|tu)$/i;

/** Extrae el objeto de la tarea: la frase sin el verbo/articulo inicial. */
function objectOf(title: string): string {
  let words = title.trim().split(/\s+/);
  if (words.length > 1) {
    const w0 = words[0].toLowerCase();
    const isVerb = VERBS.has(w0) || (w0.length > 3 && /(ar|er|ir)$/.test(w0));
    if (isVerb) words = words.slice(1);
    while (words.length > 1 && ARTICLES.test(words[0])) words = words.slice(1);
  }
  return words.slice(0, 6).join(" ") || title.trim();
}

const RECIPES: Recipe[] = [
  {
    kw: ["correo", "correos", "email", "mail", "bandeja", "responder", "contestar"],
    steps: [
      { label: "Abrir la bandeja y filtrar: %s", est: 3 },
      { label: "Marcar los 3 mas urgentes", est: 2 },
      { label: "Responder el mas urgente (respuesta corta)", est: 8 },
      { label: "Contestar el resto en bloque", est: 12 },
      { label: "Archivar y vaciar la bandeja", est: 3 },
    ],
  },
  {
    kw: ["propuesta", "documento", "doc", "informe", "reporte", "memo", "presentacion"],
    steps: [
      { label: "Abrir el documento y releer el objetivo de: %s", est: 5 },
      { label: "Esquematizar el alcance en 3 bullets", est: 10 },
      { label: "Redactar el cuerpo seccion por seccion", est: 20 },
      { label: "Revisar datos, precios y formato", est: 8 },
      { label: "Enviar a revision / entregar", est: 3 },
    ],
  },
  {
    kw: ["llamar", "llamada", "reunion", "cita", "contactar", "agendar"],
    steps: [
      { label: "Anotar en 1 frase el objetivo de: %s", est: 2 },
      { label: "Buscar el contacto y el mejor horario", est: 3 },
      { label: "Escribir los 3 puntos a tratar", est: 5 },
      { label: "Hacer la llamada / reunion", est: 15 },
      { label: "Anotar acuerdos y el siguiente paso", est: 3 },
    ],
  },
  {
    kw: ["lavar", "ropa", "limpiar", "limpieza", "ordenar", "cocina", "platos", "basura", "aspirar", "casa"],
    steps: [
      { label: "Reunir lo necesario para: %s", est: 3 },
      { label: "Empezar por la zona mas visible", est: 5 },
      { label: "Completar la tarea fisica", est: 15 },
      { label: "Guardar / tender / secar", est: 8 },
      { label: "Dejar el espacio despejado", est: 4 },
    ],
  },
  {
    kw: ["comprar", "compra", "mercado", "super", "supermercado", "pedir"],
    steps: [
      { label: "Listar lo que hace falta: %s", est: 4 },
      { label: "Revisar que ya hay en casa", est: 3 },
      { label: "Elegir tienda / app y horario", est: 3 },
      { label: "Hacer la compra", est: 20 },
      { label: "Guardar y tachar de la lista", est: 5 },
    ],
  },
  {
    kw: ["pagar", "pago", "factura", "banco", "recibo", "impuesto", "transferencia"],
    steps: [
      { label: "Reunir monto y datos de: %s", est: 3 },
      { label: "Abrir la app / banco y verificar saldo", est: 2 },
      { label: "Introducir los datos del pago", est: 4 },
      { label: "Confirmar y guardar el comprobante", est: 2 },
      { label: "Anotarlo en el registro de gastos", est: 2 },
    ],
  },
  {
    kw: ["estudiar", "leer", "lectura", "repasar", "aprender", "curso", "examen", "apuntes"],
    steps: [
      { label: "Abrir el material: %s", est: 3 },
      { label: "Ojear el indice y fijar la meta de hoy", est: 4 },
      { label: "Leer / estudiar un bloque (25 min)", est: 25 },
      { label: "Resumir en 3 frases lo clave", est: 8 },
      { label: "Marcar donde retomar", est: 2 },
    ],
  },
  {
    kw: ["escribir", "redactar", "articulo", "post", "blog", "texto", "guion", "ensayo"],
    steps: [
      { label: "Definir en 1 frase de que trata: %s", est: 3 },
      { label: "Volcar ideas en bruto (sin editar)", est: 10 },
      { label: "Ordenar en intro · cuerpo · cierre", est: 8 },
      { label: "Redactar el borrador completo", est: 25 },
      { label: "Revisar y pulir", est: 10 },
    ],
  },
  {
    kw: ["codigo", "bug", "programar", "implementar", "deploy", "test", "funcion", "arreglar"],
    steps: [
      { label: "Reproducir / entender: %s", est: 8 },
      { label: "Localizar el archivo o la causa", est: 10 },
      { label: "Escribir el cambio minimo", est: 20 },
      { label: "Probar (test / manual)", est: 8 },
      { label: "Commit y push", est: 3 },
    ],
  },
  {
    kw: ["ejercicio", "correr", "gimnasio", "entrenar", "caminar", "yoga", "estirar", "agua", "hidrat"],
    steps: [
      { label: "Preparar ropa / espacio para: %s", est: 3 },
      { label: "Calentar 3 min", est: 3 },
      { label: "Hacer el bloque principal", est: 20 },
      { label: "Enfriar / estirar", est: 5 },
      { label: "Registrar que lo hiciste", est: 1 },
    ],
  },
];

/** Fallback: aun referencia la tarea concreta, no un molde vacio. */
const FALLBACK: Recipe["steps"] = [
  { label: "Aclarar en 1 frase que es 'hecho' para: %s", est: 3 },
  { label: "Definir el primer movimiento concreto (2 min)", est: 2 },
  { label: "Ejecutar el nucleo de: %s", est: 15 },
  { label: "Revisar el resultado", est: 5 },
  { label: "Cerrar / entregar / guardar", est: 3 },
];

/** Desglose heuristico local (sin red). Contrato: 3-5 micro-pasos. */
export function breakdownHeuristic(title: string): MicroStep[] {
  const obj = objectOf(title);
  const low = title.toLowerCase();
  const recipe = RECIPES.find((r) => r.kw.some((k) => low.includes(k)));
  const steps = recipe ? recipe.steps : FALLBACK;
  return steps.map((s) => ({
    id: makeId("step"),
    label: s.label.replace(/%s/g, obj),
    done: false,
    estimateMin: s.est,
  }));
}

/**
 * Punto de enganche para el desglose real con Claude.
 *
 * Implementacion sugerida (server action / route handler):
 *   const res = await anthropic.messages.create({
 *     model: "claude-sonnet-5",
 *     max_tokens: 512,
 *     system: "Descompon la tarea en 3-5 micro-pasos ejecutables y pequenos. " +
 *             "Cada paso empieza por un verbo. Devuelve JSON: {steps:[{label,estimateMin}]}.",
 *     messages: [{ role: "user", content: title }],
 *   });
 * Parsear la respuesta a MicroStep[]. Ante error de red -> breakdownHeuristic.
 */
export async function breakdownWithLLM(title: string): Promise<MicroStep[]> {
  // TODO: conectar a la API de Claude. Por ahora, fallback deterministico.
  return breakdownHeuristic(title);
}

/** Entrada por defecto usada por la UI base (sincrona, offline). */
export function breakdownTask(title: string): MicroStep[] {
  return breakdownHeuristic(title);
}
