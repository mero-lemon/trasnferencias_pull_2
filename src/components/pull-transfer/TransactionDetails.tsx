"use client";

import { PullTransferRequest } from "@/types/pullTransfer.types";

interface Props {
  request: PullTransferRequest;
}

function DetailRow({
  label,
  value,
  mono,
  green,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  green?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-2.5 ${
        !last ? "border-b border-surface-elevated" : ""
      }`}
    >
      <span className="text-txt-tertiary text-sm">{label}</span>
      <span
        className={`text-sm font-medium ${
          green
            ? "text-lemon-green"
            : mono
            ? "font-mono text-txt-secondary"
            : "text-txt-secondary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function TransactionDetails({ request }: Props) {
  return (
    <div
      className="bg-surface-card rounded-2xl p-4 animate-slide-up"
      style={{ animationDelay: "0.1s" }}
    >
      <DetailRow label="Concepto" value={request.concept} />
      <DetailRow label="CBU origen" value={request.entity.cbuMasked} mono />
      <DetailRow
        label="CVU destino"
        value={`${request.destinationCvu} (Lemon)`}
        mono
      />
      <DetailRow
        label="Titular"
        value={
          request.holderVerified
            ? "Mismo titular verificado"
            : "Pendiente de verificación"
        }
        green={request.holderVerified}
        last
      />
    </div>
  );
}
