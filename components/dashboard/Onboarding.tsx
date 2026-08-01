"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    t: "Suéltalo, sin pensar",
    b: "Escribe lo que tengas en la cabeza y pulsa Guardar. No elijas nada todavía: solo vaciar la cabeza.",
  },
  {
    t: "Por energía, no por horas",
    b: "Cada cosa vive en un momento del día (Para empezar / A tope / Ritmo suave / Cerrar) según cuánta cabeza pide. Sin horarios que cumplir.",
  },
  {
    t: "Hiperfoco con cuidado",
    b: "Aíslate con un temporizador. Te avisará de beber agua y de cuidarte, y te obligará a una pausa al terminar.",
  },
];

const KEY = "neuroflow_onboarding_done";

/** Onboarding de 3 pasos en la primera visita (P2). */
export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY) !== "1") setOpen(true);
    } catch {
      /* noop */
    }
  }, []);

  function close() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* noop */
    }
    setOpen(false);
  }

  if (!open) return null;
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 px-6"
    >
      <div className="w-full max-w-md border-3 border-ink bg-paper p-7">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          Paso {i + 1} de {STEPS.length}
        </div>
        <h3 className="mt-1.5 text-2xl font-black uppercase tracking-tight">{step.t}</h3>
        <p className="mt-3 text-base">{step.b}</p>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={close}
            className="font-mono text-xs uppercase text-ink/50 underline"
          >
            Saltar
          </button>
          <div className="flex items-center gap-3.5">
            <div className="flex gap-1.5">
              {STEPS.map((_, d) => (
                <span
                  key={d}
                  className={`block h-2.5 w-2.5 border border-ink ${d === i ? "bg-ink" : ""}`}
                />
              ))}
            </div>
            <button
              onClick={() => (last ? close() : setI(i + 1))}
              className="btn-action px-4 py-2.5"
            >
              {last ? "Empezar" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
