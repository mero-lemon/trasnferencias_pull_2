"use client";

import { formatAmountParts } from "@/lib/format";

interface Props {
  currentBalance: number;
  amount: number;
}

export function ProjectedBalance({ currentBalance, amount }: Props) {
  const projected = currentBalance - amount;
  const isNegative = projected < 0;
  const projectedParts = formatAmountParts(Math.abs(projected));
  const currentParts = formatAmountParts(currentBalance);

  return (
    <div
      className={`rounded-xl p-3.5 border animate-slide-up ${
        isNegative
          ? "bg-status-error-bg border-status-error/20"
          : "bg-lemon-green-muted border-lemon-green-border"
      }`}
      style={{ animationDelay: "0.15s" }}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-txt-secondary text-[11px] uppercase tracking-wider mb-0.5">
            Saldo posterior
          </p>
          <p
            className={`text-[22px] font-semibold ${
              isNegative ? "text-status-error" : "text-lemon-green"
            }`}
          >
            {isNegative ? "-" : ""}${projectedParts.integer}
            <span
              className={`text-sm ${
                isNegative ? "text-status-error/70" : "text-lemon-green/70"
              }`}
            >
              ,{projectedParts.decimal}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-txt-tertiary text-[11px] mb-0.5">Saldo actual</p>
          <p className="text-txt-secondary text-[15px]">
            ${currentParts.integer},{currentParts.decimal}
          </p>
        </div>
      </div>
      {isNegative && (
        <p className="text-status-error text-xs mt-2">
          No tenés saldo suficiente para esta operación
        </p>
      )}
    </div>
  );
}
