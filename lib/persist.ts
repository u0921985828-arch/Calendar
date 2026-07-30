import type { Task, CaptureNode, DopamineMetric, Anchor } from "./types";

/**
 * Persistencia local del estado (P0 de la auditoria).
 *
 * IMPORTANTE — datos de salud: este modulo guarda en `localStorage` en claro,
 * suficiente para la fase base pero NO para produccion. Antes de publicar:
 *  - cifrado en reposo (WebCrypto: AES-GCM con clave derivada de una
 *    passphrase del usuario), o
 *  - backend con control de acceso y consentimiento explicito.
 * La medicacion y los patrones de energia son datos sensibles.
 */

const KEY = "neuroflow_state_v1";

export interface PersistedState {
  tasks: Task[];
  captures: CaptureNode[];
  dopamine: DopamineMetric;
  anchors: Anchor[];
}

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* cuota llena o modo privado: se ignora, el estado sigue en memoria */
  }
}

/** Flag de consentimiento del disclaimer clinico. */
const DISC_KEY = "neuroflow_disclaimer_ack";
export function disclaimerAcknowledged(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISC_KEY) === "1";
  } catch {
    return false;
  }
}
export function acknowledgeDisclaimer(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISC_KEY, "1");
  } catch {
    /* noop */
  }
}
