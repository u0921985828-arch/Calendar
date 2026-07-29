import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEUROFLOW / Gestion estocastica del tiempo",
  description:
    "Sistema de gestion de tiempo para cerebros TDAH + AACC. Captura sin friccion, bloques por energia, hiperfoco y dopamina operativa.",
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
