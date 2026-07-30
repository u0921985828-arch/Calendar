/**
 * Cifrado en reposo de los datos de salud (auditoria P0).
 *
 * AES-GCM 256 con clave derivada de una PASSPHRASE del usuario via PBKDF2
 * (SHA-256, 210k iteraciones). La passphrase NUNCA se guarda: sin ella, el
 * blob cifrado es ilegible. El salt (no secreto) se guarda para re-derivar.
 *
 * Limite honesto: la seguridad depende de la fuerza de la passphrase y de que
 * el dispositivo no este comprometido; no protege frente a keyloggers ni
 * sustituye un backend con control de acceso.
 */

const ITERATIONS = 210_000;

function enc(): TextEncoder {
  return new TextEncoder();
}
function dec(): TextDecoder {
  return new TextDecoder();
}

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(n: number): Uint8Array {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

/** Deriva una clave AES-GCM a partir de la passphrase y el salt. */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw",
    enc().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export interface CipherBlob {
  iv: string; // base64
  ct: string; // base64
}

/** Cifra un objeto serializable. */
export async function encryptJSON(data: unknown, key: CryptoKey): Promise<CipherBlob> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc().encode(JSON.stringify(data)),
  );
  return { iv: toB64(iv.buffer), ct: toB64(ct) };
}

/** Descifra; lanza si la clave (passphrase) es incorrecta o el dato esta corrupto. */
export async function decryptJSON<T>(blob: CipherBlob, key: CryptoKey): Promise<T> {
  const iv = fromB64(blob.iv);
  const ct = fromB64(blob.ct);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(dec().decode(plain)) as T;
}

export function saltToB64(salt: Uint8Array): string {
  return toB64(salt.buffer);
}
export function saltFromB64(b64: string): Uint8Array {
  return fromB64(b64);
}
