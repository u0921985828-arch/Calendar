import type { DopamineMetric } from "@/lib/types";

/**
 * DOPAMINA OPERATIVA — hitos visuales inmediatos, con racha INDULGENTE.
 * Muestra mejor marca y escudo para no castigar con vergueenza al romperse (RSD).
 */
export function DopamineBar({
  metric,
}: {
  metric: DopamineMetric;
}) {
  const { routineDoneToday, routineTotalToday, streakDays, bestStreak, shieldAvailable } =
    metric;
  const cells = Array.from({ length: routineTotalToday });

  return (
    <section className="block-hard bg-ink p-5 text-paper">
      <div className="flex items-center justify-between gap-2 border-b border-paper/30 pb-2">
        <h2 className="text-display font-black uppercase tracking-tight">Racha</h2>
        <span className="font-mono text-mega leading-none text-action tabular-nums">
          {streakDays}
          <span className="ml-1 align-top text-sm text-paper/60">días</span>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="border border-action px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-action">
          ★ Mejor: {bestStreak}
        </span>
        <span
          className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
            shieldAvailable ? "border-focus text-focus" : "border-paper/40 text-paper/60"
          }`}
        >
          {shieldAvailable ? "◈ Escudo listo" : "◇ Sin escudo"}
        </span>
      </div>

      <p className="mt-4 font-mono text-xs uppercase tracking-wider text-paper/60">
        Rutina de hoy · {routineDoneToday}/{routineTotalToday}
      </p>
      <div
        className="mt-2 flex gap-1.5"
        role="img"
        aria-label={`${routineDoneToday} de ${routineTotalToday} rutinas completadas`}
      >
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
