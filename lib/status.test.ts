import { describe, it, expect } from "vitest";
import { statusFromSteps } from "./status";
import type { MicroStep } from "./types";

const step = (done: boolean): MicroStep => ({ id: Math.random().toString(), label: "x", done });

describe("statusFromSteps", () => {
  it("sin pasos -> planificada", () => {
    expect(statusFromSteps([])).toBe("planificada");
  });
  it("todos hechos -> hecha", () => {
    expect(statusFromSteps([step(true), step(true)])).toBe("hecha");
  });
  it("alguno hecho -> en-curso", () => {
    expect(statusFromSteps([step(true), step(false)])).toBe("en-curso");
  });
  it("ninguno hecho -> planificada", () => {
    expect(statusFromSteps([step(false), step(false)])).toBe("planificada");
  });
});
