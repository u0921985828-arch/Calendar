import type { Config } from "tailwindcss";

/**
 * Sistema de diseno "Autoridad Climatica" (referencia C40.org).
 * Alto contraste, bloques macizos, bordes duros, cero ruido visual.
 * Los tokens de color son puros y saturados: se usan como senaletica,
 * nunca como decoracion.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    // Sin escala de opacidad difusa: el sistema es plano y solido.
    extend: {
      colors: {
        // Neutros estructurales
        ink: "#111111", // negro solido (texto / bordes)
        paper: "#FFFFFF", // fondo blanco
        cement: "#F4F4F4", // fondo gris cemento
        // Acentos-senaletica (estados, no decoracion)
        action: "#B8FF3C", // verde neon -> ejecutar / completar
        focus: "#00E5FF", // cian -> foco / atencion
        signal: "#FFE500", // amarillo -> aviso / energia media
        alert: "#FF3B30", // rojo -> detener / alerta (solo emergencia real)
        calm: "#E7E7E7", // neutro -> energia baja (un dia bajo no es alarma)
      },
      // Stack de sistema (sin CDN externo: elimina FOUT y fuga de IP).
      fontFamily: {
        sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Roboto Mono", "monospace"],
      },
      fontSize: {
        // Titulos masivos, jerarquia agresiva
        mega: ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "0.92", letterSpacing: "-0.03em" }],
        display: ["clamp(1.75rem, 3vw, 2.75rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
      },
      borderWidth: {
        DEFAULT: "1px",
        hard: "1px",
        3: "3px",
      },
      ringWidth: {
        3: "3px",
      },
      borderRadius: {
        // Bordes duros: sin curvatura.
        none: "0px",
      },
      boxShadow: {
        // Prohibidas las sombras difuminadas. Solo desplazamiento solido.
        hard: "4px 4px 0 0 #111111",
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
