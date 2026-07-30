"use client";

import { useEffect, useState } from "react";
import { disclaimerAcknowledged, acknowledgeDisclaimer } from "@/lib/persist";

/**
 * Aviso clinico persistente (P0). NEUROFLOW no es un dispositivo medico ni
 * sustituye tratamiento. Se muestra hasta que la persona lo reconoce.
 */
export function Disclaimer() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!disclaimerAcknowledged());
  }, []);

  if (!show) return null;

  return (
    <div
      role="note"
      className="flex flex-wrap items-center justify-center gap-3 bg-ink px-5 py-2.5 text-center font-mono text-xs text-paper"
    >
      <span>
        ⚠ <b className="text-signal">No es un dispositivo médico</b> ni sustituye
        tratamiento, terapia o medicación. Si estás en crisis, busca ayuda
        profesional.
      </span>
      <button
        onClick={() => {
          acknowledgeDisclaimer();
          setShow(false);
        }}
        className="border border-paper px-2 py-1 font-mono text-[11px] uppercase text-paper hover:bg-paper hover:text-ink"
      >
        Entendido
      </button>
    </div>
  );
}
