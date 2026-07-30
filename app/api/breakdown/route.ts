import { NextResponse } from "next/server";
import { breakdownHeuristic } from "@/lib/breakdown";
import type { MicroStep } from "@/lib/types";

/**
 * Desglose de tareas del lado SERVIDOR (P0 de la auditoria).
 *
 * Por que aqui y no en el cliente:
 *  - La API key de Claude vive en `process.env.ANTHROPIC_API_KEY`, nunca en el
 *    bundle del navegador.
 *  - Es el punto para rate-limit y control de coste (cache/dedupe).
 *  - Se valida la salida del modelo antes de devolverla.
 *
 * Sin API key configurada, cae al desglose heuristico local (determinista),
 * de modo que la app funciona siempre.
 */

export const runtime = "nodejs";

// Rate-limit minimo en memoria (por instancia). En produccion: Redis / KV.
const HITS = new Map<string, { n: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = HITS.get(ip);
  if (!cur || now - cur.ts > WINDOW_MS) {
    HITS.set(ip, { n: 1, ts: now });
    return false;
  }
  cur.n += 1;
  return cur.n > MAX_PER_WINDOW;
}

/** Valida que la salida del modelo tenga la forma esperada. */
function isValidSteps(x: unknown): x is { label: string; estimateMin?: number }[] {
  return (
    Array.isArray(x) &&
    x.length > 0 &&
    x.length <= 8 &&
    x.every(
      (s) =>
        s &&
        typeof (s as { label: unknown }).label === "string" &&
        (s as { label: string }).label.trim().length > 0,
    )
  );
}

export async function POST(req: Request): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let title = "";
  try {
    const body = (await req.json()) as { title?: unknown };
    title = typeof body.title === "string" ? body.title.slice(0, 200) : "";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!title.trim()) {
    return NextResponse.json({ error: "empty_title" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Sin key -> heuristica local. La app nunca se queda sin respuesta.
  if (!apiKey) {
    return NextResponse.json({ steps: breakdownHeuristic(title), source: "heuristic" });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 512,
        system:
          "Descompon la tarea en 3-5 micro-pasos ejecutables y pequenos. Cada " +
          "paso empieza por un verbo. Responde SOLO con JSON: " +
          '{"steps":[{"label":"...","estimateMin":5}]}',
        messages: [{ role: "user", content: title }],
      }),
    });

    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = (await res.json()) as { content?: { text?: string }[] };
    const text = data.content?.[0]?.text ?? "";
    const parsed = JSON.parse(text) as { steps?: unknown };

    if (!isValidSteps(parsed.steps)) throw new Error("invalid_shape");

    const steps: MicroStep[] = parsed.steps.map((s, i) => ({
      id: `llm_${i}`,
      label: s.label.trim(),
      done: false,
      estimateMin: typeof s.estimateMin === "number" ? s.estimateMin : undefined,
    }));
    return NextResponse.json({ steps, source: "llm" });
  } catch {
    // Cualquier fallo (red, formato, cuota) -> heuristica local.
    return NextResponse.json({ steps: breakdownHeuristic(title), source: "fallback" });
  }
}
