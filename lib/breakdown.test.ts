import { describe, it, expect } from "vitest";
import { breakdownHeuristic } from "./breakdown";

describe("breakdownHeuristic", () => {
  it("devuelve 3-5 micro-pasos", () => {
    const steps = breakdownHeuristic("Cerrar propuesta cliente Nordvik");
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps.length).toBeLessThanOrEqual(5);
  });

  it("clasifica por tipo e inyecta el objeto de la tarea", () => {
    const steps = breakdownHeuristic("pagar la factura de la luz");
    // La receta de "pago" abre reuniendo monto y datos del objeto.
    expect(steps[0].label.toLowerCase()).toContain("monto");
    expect(steps[0].label.toLowerCase()).toContain("factura de la luz");
  });

  it("usa el fallback nombrando la tarea cuando no reconoce el tipo", () => {
    const steps = breakdownHeuristic("cosa rara sin categoria xyz");
    expect(steps.length).toBe(5);
    expect(steps[0].label.toLowerCase()).toContain("hecho");
  });

  it("todos los pasos empiezan sin marcar y con id unico", () => {
    const steps = breakdownHeuristic("estudiar para el examen");
    expect(steps.every((s) => s.done === false)).toBe(true);
    const ids = new Set(steps.map((s) => s.id));
    expect(ids.size).toBe(steps.length);
  });
});
