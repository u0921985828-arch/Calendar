import type { DopamineMetric } from "@/lib/types";

/**
 * DOPAMINA OPERATIVA — hitos visuales inmediatos.
 * Progreso de rutina del dia como bloques macizos que se rellenan, mas racha.
 * El refuerzo es visual e instantaneo, no textual.
 */
export function DopamineBar({ metric }: { metric: DopamineMetric }) {
  const { routineDoneToday, routineTotalToday, streakDays } = metric;
  const cells = Array.from({ length: routineTotalToday });

  return (
    <section className="block-hard bg-ink p-5 text-paper">
      <div className="flex items-center justify-between border-b border-paper/30 pb-2">
        <h2 className="text-display font-black uppercase tracking-tight">Racha</h2>
        <span className="font-mono text-mega leading-none text-action">
          {streakDays}
          <span className="ml-1 align-top text-base text-paper/60">dias</span>
        </span>
      </div>

      <p className="mt-4 font-mono text-xs uppercase tracking-wider text-paper/60">
        Rutina de hoy · {routineDoneToday}/{routineTotalToday}
      </p>
      <div className="mt-2 flex gap-1.5" role="img" aria-label={`${routineDoneToday} de ${routineTotalToday} rutinas completadas`}>
        {cells.map((_, i) => (
          <div
            key={i}
            className={`h-8 flex-1 border border-paper/40 ${
              i < routineDoneToday ? "bg-action" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
