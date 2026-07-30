import type { Task, CaptureNode, DopamineMetric, Anchor } from "./types";
import {
  deriveKey,
  encryptJSON,
  decryptJSON,
  randomBytes,
  saltToB64,
  saltFromB64,
  type CipherBlob,
} from "./crypto";

/**
 * Persistencia CIFRADA en reposo (auditoria P0).
 *
 * El estado (tareas, medicacion, patrones de energia = datos de salud) se
 * guarda en localStorage cifrado con AES-GCM. La clave se deriva de una
 * passphrase del usuario y solo vive en memoria mientras la pestana esta
 * abierta. En localStorage solo hay: salt (no secreto) + ciphertext.
 */

const BLOB_KEY = "neuroflow_vault_v1";
const SALT_KEY = "neuroflow_vault_salt";

export interface PersistedState {
  tasks: Task[];
  captures: CaptureNode[];
  dopamine: DopamineMetric;
  anchors: Anchor[];
}

function ls(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

/** ¿Hay ya una caja fuerte creada en este dispositivo? */
export function hasVault(): boolean {
  const s = ls();
  return !!s && !!s.getItem(BLOB_KEY) && !!s.getItem(SALT_KEY);
}

/** Crea la caja: deriva clave de la passphrase, cifra el estado inicial. */
export async function createVault(
  passphrase: string,
  initial: PersistedState,
): Promise<CryptoKey> {
  const s = ls();
  const salt = randomBytes(16);
  const key = await deriveKey(passphrase, salt);
  const blob = await encryptJSON(initial, key);
  if (s) {
    s.setItem(SALT_KEY, saltToB64(salt));
    s.setItem(BLOB_KEY, JSON.stringify(blob));
  }
  return key;
}

/** Abre la caja con la passphrase. Lanza si es incorrecta. */
export async function unlockVault(
  passphrase: string,
): Promise<{ key: CryptoKey; state: PersistedState }> {
  const s = ls();
  const saltB64 = s?.getItem(SALT_KEY);
  const raw = s?.getItem(BLOB_KEY);
  if (!saltB64 || !raw) throw new Error("no_vault");
  const key = await deriveKey(passphrase, saltFromB64(saltB64));
  const blob = JSON.parse(raw) as CipherBlob;
  const state = await decryptJSON<PersistedState>(blob, key); // lanza si passphrase mal
  return { key, state };
}

/** Guarda el estado cifrado con la clave ya derivada (reutiliza el salt). */
export async function saveEncrypted(state: PersistedState, key: CryptoKey): Promise<void> {
  const s = ls();
  if (!s) return;
  try {
    const blob = await encryptJSON(state, key);
    s.setItem(BLOB_KEY, JSON.stringify(blob));
  } catch {
    /* cuota / modo privado: el estado sigue en memoria */
  }
}

/** Borra la caja (olvido de passphrase / empezar de cero). Dato irrecuperable. */
export function destroyVault(): void {
  const s = ls();
  if (!s) return;
  s.removeItem(BLOB_KEY);
  s.removeItem(SALT_KEY);
}

/** Flag de consentimiento del disclaimer clinico. */
const DISC_KEY = "neuroflow_disclaimer_ack";
export function disclaimerAcknowledged(): boolean {
  return ls()?.getItem(DISC_KEY) === "1";
}
export function acknowledgeDisclaimer(): void {
  ls()?.setItem(DISC_KEY, "1");
}
