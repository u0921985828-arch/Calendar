"use client";

import type { Task } from "@/lib/types";
import { PHASE_META, PHASE_ORDER } from "@/lib/design-tokens";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TaskCard } from "./TaskCard";

/**
 * TIME-BLOCKING ESTOCASTICO.
 * Columnas por FASE del dia (no por hora). Cada tarea vive en la fase
 * segun su energia. Prohibidas las horas estrictas: el usuario decide
 * *cuando* dentro de la fase, el sistema solo agrupa por carga.
 */
export function TimeBlocks({
  tasks,
  onToggleStep,
  onBreakdown,
  onFocus,
}: {
  tasks: Task[];
  onToggleStep: (taskId: string, stepId: string) => void;
  onBreakdown: (taskId: string) => void;
  onFocus: (taskId: string) => void;
}) {
  return (
    <section className="block-hard p-5">
      <SectionHeader index="02" title="Bloques" sub="por fase · sin reloj" />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PHASE_ORDER.map((phase) => {
          const meta = PHASE_META[phase];
          const phaseTasks = tasks.filter((t) => t.phase === phase);
          return (
            <div key={phase} className="flex flex-col gap-3 border border-ink bg-cement p-3">
              <div className="border-b border-ink pb-2">
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest">
                  {meta.label}
                </h3>
                <p className="mt-1 text-xs text-ink/60">{meta.hint}</p>
              </div>

              {phaseTasks.length === 0 ? (
                <p className="py-6 text-center font-mono text-xs uppercase text-ink/30">
                  vacio
                </p>
              ) : (
                phaseTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStep={onToggleStep}
                    onBreakdown={onBreakdown}
                    onFocus={onFocus}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
