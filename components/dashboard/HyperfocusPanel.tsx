"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Task, SoftNudge } from "@/lib/types";

/** Interrupciones suaves por defecto: fisiologia / hidratacion. */
const DEFAULT_NUDGES: SoftNudge[] = [
  { atMin: 10, kind: "vista", label: "Mira lejos 20 segundos. Descansa la vista." },
  { atMin: 20, kind: "hidratacion", label: "Toma agua." },
  { atMin: 35, kind: "postura", label: "Recoloca la espalda. Hombros abajo." },
  { atMin: 45, kind: "respiracion", label: "3 respiraciones lentas." },
];

/**
 * MODO HIPERFOCO — aislamiento visual total.
 * Overlay opaco a pantalla completa: solo la tarea, el temporizador y,
 * cuando toca, una interrupcion suave. Sin colores de ruido salvo el foco (cian).
 */
export function HyperfocusPanel({
  task,
  durationMin = 50,
  onClose,
}: {
  task: Task;
  durationMin?: number;
  onClose: () => void;
}) {
  const totalSec = durationMin * 60;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [nudge, setNudge] = useState<SoftNudge | null>(null);
  const firedRef = useRef<Set<number>>(new Set());

  // Reloj interno. No usa horas de pared: cuenta segundos de sesion.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => Math.min(e + 1, totalSec)), 1000);
    return () => clearInterval(id);
  }, [running, totalSec]);

  // Dispara la interrupcion suave al cruzar cada marca (una sola vez).
  useEffect(() => {
    const min = Math.floor(elapsed / 60);
    const due = DEFAULT_NUDGES.find((n) => n.atMin === min && !firedRef.current.has(n.atMin));
    if (due) {
      firedRef.current.add(due.atMin);
      setNudge(due);
    }
  }, [elapsed]);

  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const remaining = totalSec - elapsed;
  const clock = useMemo(() => {
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [remaining]);

  const nextStep = task.steps.find((s) => !s.done);
  const done = remaining <= 0;

  return (
    <div
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

      <p className="font-mono text-xs uppercase tracking-[0.3em] text-paper/50">
        Hiperfoco
      </p>
      <h2 className="mt-3 max-w-2xl text-center text-display font-black uppercase tracking-tight">
        {task.title}
      </h2>
      {nextStep ? (
        <p className="mt-3 border border-paper/30 px-4 py-2 font-mono text-sm text-focus">
          → {nextStep.label}
        </p>
      ) : null}

      <div
        className={`mt-10 font-mono text-mega tabular-nums ${
          done ? "text-action" : "text-focus"
        }`}
      >
        {done ? "LISTO" : clock}
      </div>

      <div className="mt-8 flex gap-3">
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
          {done ? "Cerrar sesion" : "Terminar"}
        </button>
      </div>

      {/* Interrupcion suave: bloque solido, no popup agresivo. */}
      {nudge ? (
        <div className="absolute inset-x-0 bottom-0 border-t border-focus bg-focus px-6 py-4 text-center text-ink">
          <p className="font-mono text-sm font-bold uppercase tracking-wide">
            Pausa fisiologica · {nudge.label}
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
    </div>
  );
}
