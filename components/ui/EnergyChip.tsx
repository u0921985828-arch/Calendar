import { ENERGY_META } from "@/lib/design-tokens";
import type { EnergyLevel } from "@/lib/types";

/** Etiqueta-senaletica de nivel de energia. Bloque solido, borde duro. */
export function EnergyChip({ energy }: { energy: EnergyLevel }) {
  const meta = ENERGY_META[energy];
  return (
    <span
      className={`inline-flex items-center border border-ink px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </span>
  );
}
