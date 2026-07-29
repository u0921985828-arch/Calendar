"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * BRAIN DUMP — captura de friccion cero.
 * Un solo input. Enter = guardar y limpiar. Sin campos, sin categorias,
 * sin decisiones. El objetivo es no romper el flujo de trabajo.
 */
export function BrainDump({
  onCapture,
  count,
}: {
  onCapture: (text: string) => void;
  count: number;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const text = value.trim();
    if (!text) return;
    onCapture(text);
    setValue("");
  }

  return (
    <section className="block-hard p-5">
      <SectionHeader index="00" title="Brain Dump" sub={`${count} en bandeja`} />
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Suelta lo que tengas en la cabeza. No pienses, escribe."
          autoComplete="off"
          className="flex-1 border border-ink bg-cement px-4 py-3 font-mono text-base text-ink placeholder:text-ink/40"
          aria-label="Captura rapida"
        />
        <button type="submit" className="btn-action shrink-0">
          Capturar
        </button>
      </form>
    </section>
  );
}
