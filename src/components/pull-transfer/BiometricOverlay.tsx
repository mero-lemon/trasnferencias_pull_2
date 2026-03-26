"use client";

import { ScanFace } from "lucide-react";

export function BiometricOverlay() {
  return (
    <div className="absolute inset-0 bio-overlay z-50 flex flex-col items-center justify-center animate-fade-in">
      {/* Scan rings */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-lemon-green/30 animate-pulse-ring" />
        {/* Middle ring */}
        <div
          className="absolute inset-3 rounded-full border-2 border-lemon-green/50 animate-pulse-ring"
          style={{ animationDelay: "0.3s" }}
        />
        {/* Inner ring */}
        <div
          className="absolute inset-6 rounded-full border-2 border-lemon-green/70 animate-pulse-ring"
          style={{ animationDelay: "0.6s" }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ScanFace size={40} className="text-lemon-green" />
        </div>

        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-lemon-green to-transparent animate-scan-line" />
        </div>
      </div>

      <p className="text-white text-base font-medium mb-1">
        Verificando tu identidad
      </p>
      <p className="text-txt-secondary text-sm">
        Mirá a la cámara para continuar
      </p>
    </div>
  );
}
