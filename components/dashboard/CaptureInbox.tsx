"use client";

import type { CaptureNode, EnergyLevel } from "@/lib/types";
import { ENERGY_META } from "@/lib/design-tokens";

/**
 * Bandeja de capturas crudas del Brain Dump.
 * Cada nodo se promueve a Task asignandole una energia (un solo click).
 * Mantiene la friccion en la captura a cero y la difiere el triaje.
 */
export function CaptureInbox({
  captures,
  onPromote,
  onDismiss,
}: {
  captures: CaptureNode[];
  onPromote: (id: string, energy: EnergyLevel) => void;
  onDismiss: (id: string) => void;
}) {
  if (captures.length === 0) return null;

  const energies: EnergyLevel[] = ["alta", "media", "baja"];

  // Clases estaticas: Tailwind no compila clases construidas dinamicamente.
  const hoverByEnergy: Record<EnergyLevel, string> = {
    alta: "hover:bg-action",
    media: "hover:bg-signal",
    baja: "hover:bg-alert hover:text-paper",
  };

  return (
    <section className="block-hard p-5">
      <div className="flex items-baseline gap-3 border-b border-ink pb-2">
        <span className="font-mono text-sm font-bold text-ink/60">01</span>
        <h2 className="text-display font-black uppercase tracking-tight">Bandeja</h2>
        <span className="ml-auto font-mono text-xs uppercase text-ink/60">
          triaje diferido
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {captures.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-2 border border-ink bg-cement p-3 sm:flex-row sm:items-center"
          >
            <span className="flex-1 font-mono text-sm">{c.text}</span>
            <div className="flex items-center gap-1">
              <span className="mr-1 font-mono text-[10px] uppercase text-ink/50">
                energia:
              </span>
              {energies.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => onPromote(c.id, e)}
                  className={`border border-ink px-2 py-1 font-mono text-[10px] font-bold uppercase ${hoverByEnergy[e]}`}
                  aria-label={`Asignar energia ${e}`}
                >
                  {ENERGY_META[e].label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onDismiss(c.id)}
                className="ml-1 border border-ink px-2 py-1 font-mono text-[10px] font-bold uppercase hover:bg-alert hover:text-paper"
                aria-label="Descartar captura"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
