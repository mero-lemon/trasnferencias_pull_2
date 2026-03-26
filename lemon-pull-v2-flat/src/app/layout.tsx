import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lemon · Transferencias Pull",
  description: "Prototipo Fase 1 Receptor — BCRA Com. A 7514/7996",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
