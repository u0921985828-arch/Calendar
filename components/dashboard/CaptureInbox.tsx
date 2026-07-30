"use client";

import type { CaptureNode, EnergyLevel } from "@/lib/types";

/**
 * Bandeja de capturas crudas del Brain Dump.
 * Triaje SIN parálisis (auditoria P2): "Añadir (media)" es el camino por
 * defecto —no exige adivinar la energía— y "Todo a MEDIA" vacía en un gesto.
 * Alta/Baja quedan como ajuste opcional.
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

  return (
    <section className="block-hard p-5">
      <div className="flex items-baseline gap-3 border-b border-ink pb-2">
        <span className="font-mono text-sm font-bold text-ink/60">02</span>
        <h2 className="text-display font-black uppercase tracking-tight">Bandeja</h2>
        <span className="ml-auto font-mono text-xs uppercase text-ink/60">
          decide luego, sin prisa
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase text-ink/50">Rápido:</span>
        <button
          type="button"
          onClick={() => captures.slice().forEach((c) => onPromote(c.id, "media"))}
          className="border border-ink bg-action px-2.5 py-1 font-mono text-[10px] font-bold uppercase"
        >
          Todo a MEDIA →
        </button>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {captures.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-2 border border-ink bg-cement p-3 sm:flex-row sm:items-center"
          >
            <span className="flex-1 font-mono text-sm">{c.text}</span>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => onPromote(c.id, "media")}
                className="border border-ink bg-action px-2 py-1 font-mono text-[10px] font-bold uppercase"
              >
                Añadir (media)
              </button>
              <span className="mx-0.5 font-mono text-[10px] uppercase text-ink/50">o:</span>
              <button
                type="button"
                onClick={() => onPromote(c.id, "alta")}
                className="border border-ink px-2 py-1 font-mono text-[10px] font-bold uppercase hover:bg-action"
                aria-label="Añadir con energía alta"
              >
                ALTA
              </button>
              <button
                type="button"
                onClick={() => onPromote(c.id, "baja")}
                className="border border-ink px-2 py-1 font-mono text-[10px] font-bold uppercase hover:bg-calm"
                aria-label="Añadir con energía baja"
              >
                BAJA
              </button>
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
