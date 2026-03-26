"use client";

import { useEffect, useState } from "react";
import { formatAmountParts } from "@/lib/format";
import { PullTransferResponse } from "@/types/pullTransfer.types";

interface Props {
  response: PullTransferResponse;
  onDismiss: () => void;
}

function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 80,
      delay: Math.random() * 0.4,
      duration: 0.8 + Math.random() * 0.6,
      color: ["#4ADE80", "#22C55E", "#FBBF24", "#60A5FA", "#F472B6"][
        Math.floor(Math.random() * 5)
      ],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
      spread: (Math.random() - 0.5) * 160,
      height: 80 + Math.random() * 140,
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            bottom: "40%",
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `particle-fall ${p.duration}s cubic-bezier(0.25,0.46,0.45,0.94) ${p.delay}s forwards`,
            ["--spread" as string]: `${p.spread}px`,
            ["--height" as string]: `${p.height}px`,
          }}
        />
      ))}
    </div>
  );
}

export function SuccessView({ response, onDismiss }: Props) {
  const [countdown, setCountdown] = useState(3);
  const balanceParts = response.newBalance
    ? formatAmountParts(response.newBalance)
    : null;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="absolute inset-0 bg-surface-primary z-50 flex flex-col items-center justify-center animate-fade-in">
      <Confetti />

      {/* Check circle */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full bg-lemon-green/10" />
        <div className="absolute inset-2 rounded-full bg-lemon-green/20" />
        <div className="absolute inset-4 rounded-full bg-lemon-green flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <path
              d="M8 14.5l4 4L20 10"
              stroke="white"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              className="animate-check-draw"
              style={{ strokeDashoffset: 24 }}
            />
          </svg>
        </div>
      </div>

      <h2 className="text-white text-xl font-semibold mb-2 animate-slide-up">
        Listo, débito autorizado
      </h2>

      <p className="text-txt-secondary text-sm text-center px-8 mb-6 animate-slide-up"
        style={{ animationDelay: "0.1s" }}>
        El monto se acreditará en tu cuenta Lemon en segundos
      </p>

      {balanceParts && (
        <div
          className="bg-surface-card rounded-2xl px-6 py-4 text-center animate-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          <p className="text-txt-tertiary text-xs uppercase tracking-wider mb-1">
            Tu nuevo saldo
          </p>
          <p className="text-lemon-green text-2xl font-semibold">
            ${balanceParts.integer}
            <span className="text-base text-lemon-green/70">
              ,{balanceParts.decimal}
            </span>
          </p>
        </div>
      )}

      <p className="text-txt-muted text-xs mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        Cerrando en {countdown}s
      </p>
    </div>
  );
}
