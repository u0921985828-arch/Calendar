"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Task, SoftNudge } from "@/lib/types";

/**
 * Interrupciones suaves. El primer aviso NO llega antes del min 25: arrancar
 * con TDAH cuesta ~20 min y un nudge temprano expulsa del flow (auditoria).
 * Las marcas `vital` cubren cuidado basico ausente antes: comida y medicacion.
 */
const DEFAULT_NUDGES: SoftNudge[] = [
  { atMin: 25, kind: "hidratacion", label: "Bebe agua. Mira lejos 20 segundos." },
  { atMin: 40, kind: "postura", label: "Postura: hombros abajo, espalda recta." },
  { atMin: 45, kind: "comida", label: "¿Comiste? ¿Toca medicación? Revísalo.", vital: true },
];

const BREAK_SEC = 120;

/**
 * MODO HIPERFOCO — aislamiento visual con CONTENCION (auditoria P0):
 *  - nudges tardios + silenciables por sesion,
 *  - aviso al encadenar sesiones,
 *  - pausa OBLIGATORIA al terminar (no se puede reentrar en caliente),
 *  - focus trap + restauracion de foco para accesibilidad.
 */
export function HyperfocusPanel({
  task,
  durationMin = 50,
  sessionNumber,
  onClose,
}: {
  task: Task;
  durationMin?: number;
  sessionNumber: number;
  onClose: () => void;
}) {
  const totalSec = durationMin * 60;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [muted, setMuted] = useState(false);
  const [nudge, setNudge] = useState<SoftNudge | null>(null);
  const [breakLeft, setBreakLeft] = useState<number | null>(null); // null = sin pausa
  const firedRef = useRef<Set<number>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Reloj de sesion.
  useEffect(() => {
    if (!running || breakLeft !== null) return;
    const t = setInterval(() => setElapsed((e) => Math.min(e + 1, totalSec)), 1000);
    return () => clearInterval(t);
  }, [running, breakLeft, totalSec]);

  // Al llegar a 0: pausa obligatoria.
  useEffect(() => {
    if (elapsed >= totalSec && breakLeft === null) setBreakLeft(BREAK_SEC);
  }, [elapsed, totalSec, breakLeft]);

  // Cuenta atras de la pausa obligatoria.
  useEffect(() => {
    if (breakLeft === null || breakLeft <= 0) return;
    const t = setInterval(() => setBreakLeft((b) => (b === null ? null : b - 1)), 1000);
    return () => clearInterval(t);
  }, [breakLeft]);

  // Nudges (una vez por marca), salvo silenciados.
  useEffect(() => {
    if (muted || breakLeft !== null) return;
    const min = Math.floor(elapsed / 60);
    const due = DEFAULT_NUDGES.find((n) => n.atMin === min && !firedRef.current.has(n.atMin));
    if (due) {
      firedRef.current.add(due.atMin);
      setNudge(due);
    }
  }, [elapsed, muted, breakLeft]);

  // Foco: mover al abrir, restaurar al cerrar, atrapar Tab, Escape cierra.
  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [onClose]);

  const remaining = totalSec - elapsed;
  const clock = useMemo(() => {
    const m = String(Math.floor(Math.max(remaining, 0) / 60)).padStart(2, "0");
    const s = String(Math.max(remaining, 0) % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [remaining]);
  const brk = useMemo(() => {
    const v = breakLeft ?? 0;
    return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
  }, [breakLeft]);

  const nextStep = task.steps.find((s) => !s.done);
  const done = remaining <= 0;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Modo hiperfoco"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink px-6 text-paper"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 border border-paper/40 px-3 py-1.5 font-mono text-xs uppercase text-paper/70 hover:bg-paper hover:text-ink"
      >
        Salir · Esc
      </button>

      <p className="font-mono text-xs uppercase tracking-[0.3em] text-paper/50">Hiperfoco</p>
      {sessionNumber > 1 ? (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-paper/40">
          {sessionNumber >= 3
            ? `⚠ ${sessionNumber}ª sesión seguida — considera parar por hoy`
            : `${sessionNumber}ª sesión seguida`}
        </p>
      ) : null}
      <h2 className="mt-3 max-w-2xl text-center text-display font-black uppercase tracking-tight">
        {task.title}
      </h2>
      {nextStep ? (
        <p className="mt-3 border border-paper/30 px-4 py-2 font-mono text-sm text-focus">
          → {nextStep.label}
        </p>
      ) : null}

      <div className={`mt-10 font-mono text-mega tabular-nums ${done ? "text-action" : "text-focus"}`}>
        {done ? "LISTO" : clock}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {!done ? (
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="border border-paper bg-transparent px-6 py-3 font-extrabold uppercase tracking-tight text-paper hover:bg-paper hover:text-ink"
          >
            {running ? "Pausa" : "Sigue"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="border border-action bg-action px-6 py-3 font-extrabold uppercase tracking-tight text-ink"
        >
          {done ? "Cerrar sesión" : "Terminar"}
        </button>
        {!done ? (
          <button
            type="button"
            onClick={() => {
              setMuted((m) => !m);
              if (!muted) setNudge(null);
            }}
            className="border border-paper/40 bg-transparent px-4 py-3 font-mono text-xs uppercase text-paper/60 hover:bg-paper hover:text-ink"
          >
            {muted ? "Avisos silenciados" : "Silenciar avisos"}
          </button>
        ) : null}
      </div>

      {/* Interrupcion suave. `vital` (comida/medicacion) resaltada. */}
      {nudge && breakLeft === null ? (
        <div
          className={`absolute inset-x-0 bottom-0 border-t px-6 py-4 text-center text-ink ${
            nudge.vital ? "border-ink bg-signal" : "border-focus bg-focus"
          }`}
        >
          <p className="font-mono text-sm font-bold uppercase tracking-wide">
            {nudge.vital ? "Cuídate · " : "Pausa suave · "}
            {nudge.label}
          </p>
          <button
            type="button"
            onClick={() => setNudge(null)}
            className="mt-2 border border-ink px-4 py-1.5 text-xs font-bold uppercase hover:bg-ink hover:text-paper"
          >
            Hecho, sigo
          </button>
        </div>
      ) : null}

      {/* Pausa obligatoria al cerrar la sesion. */}
      {breakLeft !== null ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
          <div className="text-display font-black uppercase text-action">Pausa obligatoria</div>
          <div className="font-mono text-6xl tabular-nums text-paper">{brk}</div>
          <p className="max-w-md font-mono text-sm text-paper/70">
            Levántate, estira, bebe agua. El hiperfoco quema; el descanso es parte del
            trabajo, no una interrupción.
          </p>
          <button
            type="button"
            disabled={breakLeft > 0}
            onClick={onClose}
            className="btn-action px-6 py-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {breakLeft > 0 ? "Espera…" : "Listo, descansé"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
