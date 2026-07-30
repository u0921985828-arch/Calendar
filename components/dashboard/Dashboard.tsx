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
import { todayWeekDay, currentPhase } from "@/lib/design-tokens";
import { breakdownWithLLM } from "@/lib/breakdown";
import { makeId } from "@/lib/id";
import { loadState, saveState } from "@/lib/persist";
import { statusFromSteps } from "@/lib/status";
import { Disclaimer } from "./Disclaimer";
import { Onboarding } from "./Onboarding";
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
 * Estado controlado por props hacia los hijos (puros). Se PERSISTE en local
 * (ver lib/persist) para no perder nada al recargar. Aviso clinico y
 * onboarding se montan aqui.
 */
export default function Dashboard() {
  const [captures, setCaptures] = useState<CaptureNode[]>([]);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [anchors, setAnchors] = useState<Anchor[]>(SEED_ANCHORS);
  const [dopamine, setDopamine] = useState<DopamineMetric>(SEED_DOPAMINE);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  // La semana arranca en el dia de referencia del seed; al montar en cliente
  // se marca el HOY real (evita desajuste de hidratacion en SSR).
  const [selectedDay, setSelectedDay] = useState<WeekDay>(SEED_TODAY as WeekDay);
  const [today, setToday] = useState<WeekDay | null>(null);
  const [phaseNow, setPhaseNow] = useState<Task["phase"] | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Carga inicial: hoy real + estado persistido.
  useEffect(() => {
    setToday(todayWeekDay());
    setPhaseNow(currentPhase());
    const saved = loadState();
    if (saved) {
      setTasks(saved.tasks);
      setCaptures(saved.captures);
      setDopamine(saved.dopamine);
      setAnchors(saved.anchors);
    }
    setHydrated(true);
  }, []);

  // Persistencia: guarda tras cada cambio, una vez hidratado.
  useEffect(() => {
    if (!hydrated) return;
    saveState({ tasks, captures, dopamine, anchors });
  }, [hydrated, tasks, captures, dopamine, anchors]);

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
    setCaptures((prevCaps) => {
      const node = prevCaps.find((c) => c.id === id);
      if (node) {
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
      }
      return prevCaps.filter((c) => c.id !== id);
    });
  }

  function dismissCapture(id: string) {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  }

  // --- Desglose (via servidor -> Claude, fallback heuristico) -------------
  async function breakdown(taskId: string) {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const steps = await breakdownWithLLM(target.title);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, steps } : t)));
  }

  function addStep(taskId: string, label: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const steps = [...t.steps, { id: makeId("step"), label, done: false }];
        return { ...t, steps, status: statusFromSteps(steps) };
      }),
    );
  }

  function deleteStep(taskId: string, stepId: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const steps = t.steps.filter((s) => s.id !== stepId);
        return { ...t, steps, status: statusFromSteps(steps) };
      }),
    );
  }

  // --- Micro-pasos + auto-completado -------------------------------------
  function toggleStep(taskId: string, stepId: string) {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const steps = target.steps.map((s) =>
      s.id === stepId ? { ...s, done: !s.done } : s,
    );
    const allDone = steps.length > 0 && steps.every((s) => s.done);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, steps, status: statusFromSteps(steps) } : t,
      ),
    );

    // Dopamina: solo en la transicion a hecha de una rutina (evita doble conteo).
    if (target.isRoutine && allDone && target.status !== "hecha") {
      setDopamine((d) => ({
        ...d,
        routineDoneToday: Math.min(d.routineDoneToday + 1, d.routineTotalToday),
      }));
    }
  }

  function openFocus(taskId: string) {
    setSessionCount((n) => n + 1);
    setFocusTaskId(taskId);
  }

  return (
    <>
      <Disclaimer />
      <Onboarding />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-2 border-b-3 border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-mega font-black uppercase tracking-tighter">Neuroflow</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
              Organiza tu día por energía, no por horas
            </p>
          </div>
          <p className="font-mono text-xs uppercase text-ink/60">
            {tasks.filter((t) => t.status !== "hecha").length} cosas por hacer
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <BrainDump onCapture={handleCapture} count={captures.length} />
            <CaptureInbox
              captures={captures}
              onPromote={promoteCapture}
              onDismiss={dismissCapture}
            />
          </div>
          <div className="lg:col-span-1">
            <DopamineBar metric={dopamine} anchors={anchors} today={today} />
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
            onFocus={openFocus}
            onAddStep={addStep}
            onDeleteStep={deleteStep}
            currentPhaseKey={selectedDay === today ? phaseNow : null}
          />
        </div>

        {focusTask ? (
          <HyperfocusPanel
            task={focusTask}
            sessionNumber={sessionCount}
            onClose={() => setFocusTaskId(null)}
          />
        ) : null}
      </main>
    </>
  );
}
