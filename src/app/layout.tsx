import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lemon · Transferencias Pull",
  description: "Prototipo de autorización de débitos pull — Fase 1 Receptor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#0a0a0a] min-h-screen">{children}</body>
    </html>
  );
}
