"use client";

import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import { SEED_TASKS, SEED_ANCHORS, SEED_DOPAMINE } from "@/lib/seed";
import {
  hasVault,
  createVault,
  unlockVault,
  saveEncrypted,
  destroyVault,
  type PersistedState,
} from "@/lib/persist";

const SEED_STATE: PersistedState = {
  tasks: SEED_TASKS,
  captures: [],
  dopamine: SEED_DOPAMINE,
  anchors: SEED_ANCHORS,
};

type Mode = "checking" | "create" | "unlock";

/**
 * Puerta de la caja fuerte (auditoria P0).
 * Antes de mostrar datos de salud, exige una passphrase que los cifra en
 * reposo. Se puede optar por NO guardar (solo memoria). Una vez lista,
 * arranca el Dashboard con el estado descifrado y una funcion de guardado
 * que cifra en cada cambio.
 */
export function VaultGate() {
  const [mode, setMode] = useState<Mode>("checking");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [boot, setBoot] = useState<{
    initial: PersistedState;
    onSave: (s: PersistedState) => void;
  } | null>(null);

  useEffect(() => {
    setMode(hasVault() ? "unlock" : "create");
  }, []);

  function start(initial: PersistedState, key: CryptoKey | null) {
    setBoot({
      initial,
      onSave: key ? (s) => void saveEncrypted(s, key) : () => {},
    });
  }

  async function onCreate() {
    setErr("");
    if (pass.length < 6) return setErr("Usa al menos 6 caracteres.");
    if (pass !== pass2) return setErr("Las contraseñas no coinciden.");
    setBusy(true);
    try {
      const key = await createVault(pass, SEED_STATE);
      start(SEED_STATE, key);
    } catch {
      setErr("No se pudo crear la caja.");
    } finally {
      setBusy(false);
    }
  }

  async function onUnlock() {
    setErr("");
    setBusy(true);
    try {
      const { key, state } = await unlockVault(pass);
      start(state, key);
    } catch {
      setErr("Contraseña incorrecta.");
    } finally {
      setBusy(false);
    }
  }

  if (boot) return <Dashboard boot={boot} />;

  // --- Pantalla de la caja ------------------------------------------------
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-mega font-black uppercase leading-none tracking-tighter">
        Neuroflow
      </h1>
      <div className="mt-8 border border-ink bg-paper p-6">
        {mode === "checking" ? (
          <p className="font-mono text-sm text-ink/60">…</p>
        ) : mode === "create" ? (
          <>
            <h2 className="text-display font-black uppercase tracking-tight">
              Protege tus datos
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Tus tareas y tu medicación son datos sensibles. Elige una
              contraseña: cifra todo en este dispositivo. No se guarda en ningún
              sitio — si la olvidas, no hay recuperación.
            </p>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Contraseña"
              aria-label="Contraseña"
              className="mt-4 w-full border border-ink bg-cement px-3 py-2.5 font-mono text-sm"
            />
            <input
              type="password"
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCreate()}
              placeholder="Repite la contraseña"
              aria-label="Repite la contraseña"
              className="mt-2 w-full border border-ink bg-cement px-3 py-2.5 font-mono text-sm"
            />
            {err ? <p className="mt-2 font-mono text-xs text-alert">{err}</p> : null}
            <button onClick={onCreate} disabled={busy} className="btn-action mt-4 w-full">
              {busy ? "Cifrando…" : "Proteger y entrar"}
            </button>
            <button
              onClick={() => start(SEED_STATE, null)}
              className="mt-3 w-full font-mono text-xs uppercase text-ink/50 underline"
            >
              Seguir sin guardar (solo esta sesión)
            </button>
          </>
        ) : (
          <>
            <h2 className="text-display font-black uppercase tracking-tight">Desbloquear</h2>
            <p className="mt-2 text-sm text-ink/70">
              Introduce tu contraseña para descifrar tus datos.
            </p>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onUnlock()}
              placeholder="Contraseña"
              aria-label="Contraseña"
              autoFocus
              className="mt-4 w-full border border-ink bg-cement px-3 py-2.5 font-mono text-sm"
            />
            {err ? <p className="mt-2 font-mono text-xs text-alert">{err}</p> : null}
            <button onClick={onUnlock} disabled={busy} className="btn-action mt-4 w-full">
              {busy ? "Descifrando…" : "Desbloquear"}
            </button>
            <button
              onClick={() => {
                destroyVault();
                setPass("");
                setErr("");
                setMode("create");
              }}
              className="mt-3 w-full font-mono text-xs uppercase text-ink/50 underline"
            >
              Olvidé la contraseña · empezar de cero
            </button>
          </>
        )}
      </div>
      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-ink/40">
        Cifrado local AES-GCM · la contraseña no se guarda
      </p>
    </main>
  );
}
