"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Anchor,
  CaptureNode,
  DopamineMetric,
  EnergyLevel,
  Task,
  WeekDay,
} from "@/lib/types";
import { SEED_TASKS, SEED_DOPAMINE, SEED_ANCHORS, SEED_TODAY } from "@/lib/seed";
import { todayWeekDay } from "@/lib/design-tokens";
import { breakdownTask } from "@/lib/breakdown";
import { makeId } from "@/lib/id";
import { BrainDump } from "./BrainDump";
import { CaptureInbox } from "./CaptureInbox";
import { TimeBlocks } from "./TimeBlocks";
import { DopamineBar } from "./DopamineBar";
import { HyperfocusPanel } from "./HyperfocusPanel";

/** Energia -> fase sugerida por defecto al promover una captura. */
const PHASE_BY_ENERGY: Record<EnergyLevel, Task["phase"]> = {
  alta: "pico",
  media: "meseta",
  baja: "cierre",
};

/**
 * DASHBOARD — orquestador principal.
 * Mantiene el estado en memoria (capturas, tareas, dopamina, sesion de foco).
 * En produccion, este estado se sincroniza con un store/servidor; los
 * componentes hijos permanecen puros y controlados por props.
 */
export default function Dashboard() {
  const [captures, setCaptures] = useState<CaptureNode[]>([]);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [anchors] = useState<Anchor[]>(SEED_ANCHORS);
  const [dopamine, setDopamine] = useState<DopamineMetric>(SEED_DOPAMINE);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);

  // La semana arranca en el dia de referencia del seed; al montar en cliente
  // se marca el HOY real (evita desajuste de hidratacion en SSR).
  const [selectedDay, setSelectedDay] = useState<WeekDay>(SEED_TODAY as WeekDay);
  const [today, setToday] = useState<WeekDay | null>(null);
  useEffect(() => {
    setToday(todayWeekDay());
  }, []);

  const focusTask = useMemo(
    () => tasks.find((t) => t.id === focusTaskId) ?? null,
    [tasks, focusTaskId],
  );

  // --- Brain Dump ---------------------------------------------------------
  function handleCapture(text: string) {
    setCaptures((prev) => [
      { id: makeId("cap"), text, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }

  // --- Triaje: captura -> tarea ------------------------------------------
  function promoteCapture(id: string, energy: EnergyLevel) {
    const node = captures.find((c) => c.id === id);
    if (!node) return;
    const task: Task = {
      id: makeId("task"),
      title: node.text,
      status: "planificada",
      energy,
      phase: PHASE_BY_ENERGY[energy],
      day: selectedDay,
      steps: [],
    };
    setTasks((prev) => [task, ...prev]);
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  }

  function dismissCapture(id: string) {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  }

  // --- Desglose algoritmico ----------------------------------------------
  function breakdown(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, steps: breakdownTask(t.title) } : t,
      ),
    );
  }

  // --- Micro-pasos + auto-completado de tarea ----------------------------
  function toggleStep(taskId: string, stepId: string) {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const steps = target.steps.map((s) =>
      s.id === stepId ? { ...s, done: !s.done } : s,
    );
    const allDone = steps.length > 0 && steps.every((s) => s.done);
    const nextStatus: Task["status"] = allDone ? "hecha" : "en-curso";

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, steps, status: nextStatus } : t)),
    );

    // Dopamina operativa: al CERRAR una rutina (transicion a hecha), premia.
    const justClosedRoutine =
      target.isRoutine && allDone && target.status !== "hecha";
    if (justClosedRoutine) {
      setDopamine((d) => ({
        ...d,
        routineDoneToday: Math.min(d.routineDoneToday + 1, d.routineTotalToday),
      }));
    }
  }

  const pendingCount = captures.length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Cabecera de autoridad: titulo masivo, sin adornos. */}
      <header className="mb-8 flex flex-col gap-2 border-b-3 border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-mega font-black uppercase tracking-tighter">
            Neuroflow
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-ink/60">
            Gestion estocastica del tiempo · TDAH + AACC
          </p>
        </div>
        <p className="font-mono text-xs uppercase text-ink/60">
          {tasks.filter((t) => t.status !== "hecha").length} tareas activas
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <BrainDump onCapture={handleCapture} count={pendingCount} />
          <CaptureInbox
            captures={captures}
            onPromote={promoteCapture}
            onDismiss={dismissCapture}
          />
        </div>
        <div className="lg:col-span-1">
          <DopamineBar metric={dopamine} />
        </div>
      </div>

      <div className="mt-6">
        <TimeBlocks
          tasks={tasks}
          anchors={anchors}
          today={today}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onToggleStep={toggleStep}
          onBreakdown={breakdown}
          onFocus={setFocusTaskId}
        />
      </div>

      {focusTask ? (
        <HyperfocusPanel task={focusTask} onClose={() => setFocusTaskId(null)} />
      ) : null}
    </main>
  );
}
