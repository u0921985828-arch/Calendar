import type { Anchor, WeekDay } from "@/lib/types";

/**
 * Franja de ANCLAS del dia seleccionado: las citas con hora fija.
 * Acento cian (foco) y borde izquierdo grueso para separarlas visualmente
 * del time-blocking por fases. Ordenadas por hora.
 */
export function AnchorStrip({
  anchors,
  day,
}: {
  anchors: Anchor[];
  day: WeekDay;
}) {
  const list = anchors
    .filter((a) => a.day === day)
    .sort((a, b) => (a.time < b.time ? -1 : 1));

  if (list.length === 0) {
    return (
      <div className="mt-3 w-full border border-dashed border-ink/30 px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink/40">
        Sin citas con hora fija este dia
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {list.map((a) => {
        return (
          <div
            key={a.id}
            className="inline-flex items-center gap-2 border border-ink border-l-3 border-l-focus bg-paper px-2.5 py-1.5"
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink/45">
              ◇ cita
            </span>
            <span className="font-mono text-sm font-bold tabular-nums">{a.time}</span>
            <span className="text-sm font-bold">{a.label}</span>
          </div>
        );
      })}
    </div>
  );
}
