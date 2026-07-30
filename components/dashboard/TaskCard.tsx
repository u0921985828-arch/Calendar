"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { EnergyChip } from "@/components/ui/EnergyChip";

/**
 * Tarjeta de tarea con DESGLOSE visible y editable.
 * Los micro-pasos se pueden marcar, anadir, borrar y rehacer: una mala
 * clasificacion del desglose ya no bloquea (auditoria P2).
 */
export function TaskCard({
  task,
  onToggleStep,
  onBreakdown,
  onFocus,
  onAddStep,
  onDeleteStep,
}: {
  task: Task;
  onToggleStep: (taskId: string, stepId: string) => void;
  onBreakdown: (taskId: string) => void;
  onFocus: (taskId: string) => void;
  onAddStep: (taskId: string, label: string) => void;
  onDeleteStep: (taskId: string, stepId: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const total = task.steps.length;
  const done = task.steps.filter((s) => s.done).length;
  const isDone = task.status === "hecha";

  function addNow() {
    const v = draft.trim();
    if (!v) return;
    onAddStep(task.id, v);
    setDraft("");
  }

  return (
    <article
      className={`block-hard p-4 ${isDone ? "opacity-50" : ""}`}
      aria-label={task.title}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-lg font-extrabold leading-tight ${isDone ? "line-through" : ""}`}
        >
          {task.title}
        </h3>
        <EnergyChip energy={task.energy} />
      </div>

      {task.isRoutine ? (
        <span className="mt-2 inline-block border border-ink bg-cement px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
          Rutina
        </span>
      ) : null}

      {total > 0 ? (
        <>
          <ul className="mt-3 flex flex-col gap-1.5">
            {task.steps.map((step) => (
              <li key={step.id} className="flex items-center gap-2 border border-ink bg-cement px-2 py-1.5">
                {/* Estado por glifo ✓ ademas del color (daltonismo, P3). */}
                <label className="relative flex shrink-0 items-center">
                  <input
                    type="checkbox"
                    checked={step.done}
                    onChange={() => onToggleStep(task.id, step.id)}
                    className="peer h-[18px] w-[18px] shrink-0 appearance-none border border-ink bg-paper checked:bg-action"
                    aria-label={step.label}
                  />
                  <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-xs font-black text-ink peer-checked:flex">
                    ✓
                  </span>
                </label>
                <label
                  className={`flex-1 cursor-pointer font-mono text-sm ${
                    step.done ? "text-ink/40 line-through" : "text-ink"
                  }`}
                >
                  {step.label}
                </label>
                {step.estimateMin ? (
                  <span className="font-mono text-xs text-ink/50">{step.estimateMin}m</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onDeleteStep(task.id, step.id)}
                  aria-label="Borrar paso"
                  className="border border-ink bg-paper px-1.5 font-mono text-xs font-bold hover:bg-alert hover:text-paper"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-1.5 flex gap-1.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addNow();
                }
              }}
              placeholder="Añadir un paso…"
              aria-label="Nuevo paso"
              className="flex-1 border border-ink bg-paper px-2 py-1 font-mono text-xs"
            />
            <button type="button" onClick={addNow} className="btn-hard px-2.5 py-1 text-xs">
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onBreakdown(task.id)}
            className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink/55 underline"
          >
            ↻ Rehacer el desglose
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onBreakdown(task.id)}
          className="btn-hard mt-3 w-full text-sm hover:bg-focus"
        >
          Partir en pasos
        </button>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-xs uppercase text-ink/60">
          {total > 0 ? `${done}/${total} pasos` : "sin partir"}
        </span>
        {!isDone ? (
          <button
            type="button"
            onClick={() => onFocus(task.id)}
            className="btn-hard px-3 py-1.5 text-xs hover:bg-focus"
          >
            Hiperfoco →
          </button>
        ) : (
          <span className="font-mono text-xs font-bold uppercase text-ink">✓ Hecha</span>
        )}
      </div>
    </article>
  );
}
