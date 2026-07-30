"use client";

import type { Anchor, Task, WeekDay } from "@/lib/types";
import { PHASE_META, PHASE_ORDER } from "@/lib/design-tokens";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TaskCard } from "./TaskCard";
import { WeekNav } from "./WeekNav";
import { AnchorStrip } from "./AnchorStrip";

/** Minutos pendientes estimados de una tarea (pasos sin hacer; 15 si no hay). */
function pendingMinutes(task: Task): number {
  if (task.steps.length === 0) return 15;
  return task.steps.filter((s) => !s.done).reduce((n, s) => n + (s.estimateMin ?? 0), 0);
}

/**
 * TIME-BLOCKING ESTOCASTICO.
 * Columnas por FASE del dia (no por hora). Cada tarea vive en la fase
 * segun su energia. Prohibidas las horas estrictas: el usuario decide
 * *cuando* dentro de la fase, el sistema solo agrupa por carga.
 */
export function TimeBlocks({
  tasks,
  anchors,
  today,
  selectedDay,
  onSelectDay,
  onToggleStep,
  onBreakdown,
  onFocus,
  onAddStep,
  onDeleteStep,
  currentPhaseKey,
}: {
  tasks: Task[];
  anchors: Anchor[];
  today: WeekDay | null;
  selectedDay: WeekDay;
  onSelectDay: (day: WeekDay) => void;
  onToggleStep: (taskId: string, stepId: string) => void;
  onBreakdown: (taskId: string) => void;
  onFocus: (taskId: string) => void;
  onAddStep: (taskId: string, label: string) => void;
  onDeleteStep: (taskId: string, stepId: string) => void;
  /** Fase actual segun la hora; null si el dia elegido no es hoy. */
  currentPhaseKey: Task["phase"] | null;
}) {
  return (
    <section className="block-hard p-5">
      <SectionHeader
        index="03"
        title="Tu semana"
        sub="por momentos del día · citas con hora aparte"
      />

      <WeekNav
        tasks={tasks}
        today={today}
        selected={selectedDay}
        onSelect={onSelectDay}
      />
      <AnchorStrip anchors={anchors} day={selectedDay} />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PHASE_ORDER.map((phase) => {
          const meta = PHASE_META[phase];
          const phaseTasks = tasks.filter(
            (t) => t.phase === phase && t.day === selectedDay,
          );
          const isNow = phase === currentPhaseKey;
          const pending = phaseTasks.filter((t) => t.status !== "hecha");
          const load = pending.reduce((n, t) => n + pendingMinutes(t), 0);
          const over = phase === "pico" && load > 120;
          return (
            <div
              key={phase}
              className={`flex flex-col gap-3 border border-ink p-3 ${
                isNow ? "bg-paper shadow-[inset_4px_0_0_0_#00e5ff]" : "bg-cement"
              }`}
            >
              <div className="border-b border-ink pb-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest">
                    {meta.label}
                  </h3>
                  {isNow ? (
                    <span className="bg-focus px-1.5 py-0.5 font-mono text-[9px] font-black uppercase text-ink">
                      ◀ ahora
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-ink/60">{meta.hint}</p>
                <p
                  className={`mt-1.5 font-mono text-[10px] uppercase tracking-wide ${
                    over ? "font-bold text-alert" : "text-ink/55"
                  }`}
                >
                  {pending.length
                    ? `≈ ${load} min planeados${over ? " · demasiado" : ""}`
                    : "libre"}
                </p>
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
                    onAddStep={onAddStep}
                    onDeleteStep={onDeleteStep}
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
