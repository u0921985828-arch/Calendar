"use client";

import type { Task } from "@/lib/types";
import { EnergyChip } from "@/components/ui/EnergyChip";

/**
 * Tarjeta de tarea con DESGLOSE ALGORITMICO visible.
 * Muestra los micro-pasos moleculares. Cada paso es un checkbox macizo.
 * Boton de Hiperfoco para aislar la tarea.
 */
export function TaskCard({
  task,
  onToggleStep,
  onBreakdown,
  onFocus,
}: {
  task: Task;
  onToggleStep: (taskId: string, stepId: string) => void;
  onBreakdown: (taskId: string) => void;
  onFocus: (taskId: string) => void;
}) {
  const total = task.steps.length;
  const done = task.steps.filter((s) => s.done).length;
  const isDone = task.status === "hecha";

  return (
    <article
      className={`block-hard p-4 ${isDone ? "opacity-50" : ""}`}
      aria-label={task.title}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-lg font-extrabold leading-tight ${
            isDone ? "line-through" : ""
          }`}
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

      {/* Desglose molecular */}
      {total > 0 ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {task.steps.map((step) => (
            <li key={step.id}>
              <label className="flex cursor-pointer items-center gap-2 border border-ink bg-cement px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={() => onToggleStep(task.id, step.id)}
                  className="h-4 w-4 shrink-0 appearance-none border border-ink bg-paper checked:bg-action"
                  aria-label={step.label}
                />
                <span
                  className={`font-mono text-sm ${
                    step.done ? "text-ink/40 line-through" : "text-ink"
                  }`}
                >
                  {step.label}
                </span>
                {step.estimateMin ? (
                  <span className="ml-auto font-mono text-xs text-ink/50">
                    {step.estimateMin}m
                  </span>
                ) : null}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <button
          type="button"
          onClick={() => onBreakdown(task.id)}
          className="btn-hard mt-3 w-full text-sm hover:bg-focus"
        >
          Desglosar en micro-pasos
        </button>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-xs uppercase text-ink/60">
          {total > 0 ? `${done}/${total} pasos` : "sin desglosar"}
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
          <span className="font-mono text-xs font-bold uppercase text-ink">
            ✓ Hecha
          </span>
        )}
      </div>
    </article>
  );
}
