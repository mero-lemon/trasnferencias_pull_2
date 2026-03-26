"use client";

import { formatAmountParts } from "@/lib/format";

interface Props {
  amount: number;
}

export function AmountDisplay({ amount }: Props) {
  const { integer, decimal } = formatAmountParts(amount);

  return (
    <div className="text-center animate-slide-up" style={{ animationDelay: "0.05s" }}>
      <p className="text-txt-tertiary text-sm mb-1.5">Monto a debitar</p>
      <p className="text-white text-[40px] font-semibold tracking-tight leading-none">
        ${integer}
        <span className="text-[22px] text-txt-secondary">,{decimal}</span>
      </p>
    </div>
  );
}
