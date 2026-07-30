"use client";

import type { Task, WeekDay } from "@/lib/types";
import { WEEK_DAYS } from "@/lib/design-tokens";

/**
 * Navegador de la semana. Pills por dia (Lun-Dom), sin horas.
 * Marca HOY y el dia seleccionado, y muestra cuantas tareas activas
 * tiene cada dia. Es el eje temporal de la vista hibrida.
 */
export function WeekNav({
  tasks,
  today,
  selected,
  onSelect,
}: {
  tasks: Task[];
  today: WeekDay | null;
  selected: WeekDay;
  onSelect: (day: WeekDay) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Dias de la semana"
      className="mt-4 flex gap-1.5 overflow-x-auto pb-0.5"
    >
      {WEEK_DAYS.map((name, i) => {
        const day = i as WeekDay;
        const active = tasks.filter(
          (t) => t.day === day && t.status !== "hecha",
        ).length;
        const isToday = day === today;
        const isSel = day === selected;
        return (
          <button
            key={name}
            role="tab"
            aria-selected={isSel}
            onClick={() => onSelect(day)}
            className={[
              "flex min-w-[54px] flex-1 flex-col items-center gap-0.5 border border-ink px-1.5 py-2 font-mono text-xs font-bold uppercase leading-none tracking-wide",
              isSel ? "bg-ink text-paper" : "bg-paper text-ink",
            ].join(" ")}
            style={
              isToday
                ? ({ boxShadow: "inset 0 -4px 0 0 #b8ff3c" } as const)
                : undefined
            }
          >
            <span
              className={`px-1 text-[8px] font-black tracking-wide ${
                isToday ? "bg-action text-ink" : "text-transparent"
              }`}
            >
              {isToday ? "HOY" : " "}
            </span>
            <span className="text-[15px]">{name}</span>
            <span className="text-[9px] tracking-normal opacity-60">
              {active ? `${active} act.` : " "}
            </span>
          </button>
        );
      })}
    </div>
  );
}
