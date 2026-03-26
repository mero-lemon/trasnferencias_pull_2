"use client";

import { usePullTransfer } from "@/hooks/usePullTransfer";
import { PullAuthorizationModal } from "@/components/pull-transfer";
import { Bell, RotateCcw, Github } from "lucide-react";

export default function Home() {
  const {
    state,
    request,
    response,
    secondsLeft,
    simulateIncoming,
    confirmSwipe,
    dismiss,
  } = usePullTransfer();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#0a0a0a]">
      {/* Header */}
      <div className="text-center mb-8 max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-lemon-green flex items-center justify-center">
            <span className="text-black font-bold text-lg">L</span>
          </div>
          <h1 className="text-white text-2xl font-semibold">
            Transferencias Pull
          </h1>
        </div>
        <p className="text-txt-secondary text-sm leading-relaxed">
          Prototipo interactivo — Fase 1 Receptor · BCRA Com. A 7514/7996
        </p>
      </div>

      {/* Device frame */}
      <div className="relative">
        {/* Phone frame */}
        <div className="w-[390px] h-[844px] bg-surface-primary rounded-[50px] border-[3px] border-[#2a2a2a] overflow-hidden shadow-2xl shadow-black/50 relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-black rounded-b-2xl z-[60]" />

          {/* Screen content */}
          {state === "idle" ? (
            <IdleScreen onSimulate={simulateIncoming} />
          ) : request ? (
            <PullAuthorizationModal
              state={state}
              request={request}
              response={response}
              secondsLeft={secondsLeft}
              onConfirm={confirmSwipe}
              onDismiss={dismiss}
              onRetry={simulateIncoming}
            />
          ) : null}

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-8">
        {state === "idle" ? (
          <button
            onClick={simulateIncoming}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lemon-green text-black font-medium text-sm active:scale-[0.97] transition-transform"
          >
            <Bell size={16} />
            Simular solicitud pull
          </button>
        ) : (
          <button
            onClick={dismiss}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-card border border-surface-elevated text-txt-secondary font-medium text-sm active:scale-[0.97] transition-transform"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        )}
      </div>

      {/* State indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            state === "idle"
              ? "bg-txt-tertiary"
              : state === "success"
              ? "bg-lemon-green"
              : state === "error_balance" || state === "timeout"
              ? "bg-status-error"
              : "bg-status-warning animate-pulse"
          }`}
        />
        <span className="text-txt-secondary text-xs font-mono">{state}</span>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center">
        <p className="text-txt-muted text-xs">
          Lemon Cash Inc. · Prototipo interno · No es una versión de producción
        </p>
      </footer>
    </div>
  );
}

function IdleScreen({ onSimulate }: { onSimulate: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8">
      {/* Lemon logo */}
      <div className="w-16 h-16 rounded-2xl bg-lemon-green/10 border border-lemon-green/20 flex items-center justify-center mb-6">
        <span className="text-lemon-green text-2xl font-bold">L</span>
      </div>

      <h2 className="text-white text-lg font-medium mb-2">
        Esperando solicitud
      </h2>
      <p className="text-txt-secondary text-sm text-center leading-relaxed mb-8">
        Cuando un banco envíe una solicitud de débito pull, aparecerá una
        notificación y se abrirá este modal de autorización.
      </p>

      <button
        onClick={onSimulate}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-lemon-green text-surface-primary font-semibold text-sm active:scale-[0.97] transition-transform"
      >
        <Bell size={18} />
        Simular push entrante
      </button>

      <div className="mt-12 w-full space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-card/50">
          <span className="text-txt-tertiary text-xs">Estado</span>
          <span className="text-txt-secondary text-xs font-mono">idle</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-card/50">
          <span className="text-txt-tertiary text-xs">Normativa</span>
          <span className="text-txt-secondary text-xs">Com. A 7514</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-card/50">
          <span className="text-txt-tertiary text-xs">Fase</span>
          <span className="text-txt-secondary text-xs">1 — Receptor</span>
        </div>
      </div>
    </div>
  );
}
