"use client";

import { AlertCircle, Clock } from "lucide-react";
import { PullTransferState, PullTransferResponse } from "@/types/pullTransfer.types";

interface Props {
  state: PullTransferState;
  response: PullTransferResponse | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

const CONFIG: Record<string, {
  icon: typeof AlertCircle;
  title: string;
  iconColor: string;
  iconBg: string;
  borderColor: string;
}> = {
  error_balance: {
    icon: AlertCircle,
    title: "No se pudo completar",
    iconColor: "text-status-error",
    iconBg: "bg-status-error/10",
    borderColor: "border-status-error/20",
  },
  timeout: {
    icon: Clock,
    title: "La solicitud expiró",
    iconColor: "text-status-warning",
    iconBg: "bg-status-warning/10",
    borderColor: "border-status-warning/20",
  },
};

export function ErrorView({ state, response, onDismiss, onRetry }: Props) {
  const config = CONFIG[state] || CONFIG.error_balance;
  const Icon = config.icon;

  const body =
    state === "timeout"
      ? "Pasaron 30 segundos sin confirmación. No se debitó nada de tu cuenta. Podés generar una nueva solicitud."
      : response?.message ||
        "La cuenta de origen no tiene saldo suficiente para cubrir este débito.";

  return (
    <div className="absolute inset-0 bg-surface-primary z-50 flex flex-col items-center justify-center px-6 animate-fade-in">
      {/* Icon */}
      <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mb-5`}>
        <Icon size={32} className={config.iconColor} />
      </div>

      <h2 className="text-white text-xl font-semibold mb-3 text-center">
        {config.title}
      </h2>

      <p className="text-txt-secondary text-sm text-center leading-relaxed mb-8 max-w-[280px]">
        {body}
      </p>

      {/* Actions */}
      <div className="w-full max-w-[280px] space-y-3">
        {state === "timeout" && onRetry && (
          <button
            onClick={onRetry}
            className="w-full h-12 rounded-xl bg-lemon-green text-surface-primary font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            Solicitar de nuevo
          </button>
        )}
        <button
          onClick={onDismiss}
          className={`w-full h-12 rounded-xl font-medium text-sm active:scale-[0.98] transition-transform ${
            state === "timeout" && onRetry
              ? "bg-surface-card text-txt-secondary border border-surface-elevated"
              : "bg-surface-card text-white border border-surface-elevated"
          }`}
        >
          {state === "error_balance" ? "Entendido" : "Volver al inicio"}
        </button>
      </div>
    </div>
  );
}
