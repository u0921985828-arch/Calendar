/** Encabezado de bloque: numero de indice + titulo masivo. Estilo C40. */
export function SectionHeader({
  index,
  title,
  sub,
}: {
  index: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-baseline gap-3 border-b border-ink pb-2">
      <span className="font-mono text-sm font-bold text-ink/60">{index}</span>
      <h2 className="text-display font-black uppercase tracking-tight">{title}</h2>
      {sub ? (
        <span className="ml-auto hidden font-mono text-xs uppercase text-ink/60 sm:block">
          {sub}
        </span>
      ) : null}
    </div>
  );
}
