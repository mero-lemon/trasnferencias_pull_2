"use client";

import { ChevronLeft } from "lucide-react";
import { PullTransferState, PullTransferRequest, PullTransferResponse } from "@/types/pullTransfer.types";
import { StatusBar } from "./StatusBar";
import { SecurityBadge } from "./SecurityBadge";
import { EntityHeader } from "./EntityHeader";
import { AmountDisplay } from "./AmountDisplay";
import { TransactionDetails } from "./TransactionDetails";
import { ProjectedBalance } from "./ProjectedBalance";
import { SwipeToConfirm } from "./SwipeToConfirm";
import { BiometricOverlay } from "./BiometricOverlay";
import { SuccessView } from "./SuccessView";
import { ErrorView } from "./ErrorView";

interface Props {
  state: PullTransferState;
  request: PullTransferRequest;
  response: PullTransferResponse | null;
  secondsLeft: number;
  onConfirm: () => void;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function PullAuthorizationModal({
  state,
  request,
  response,
  secondsLeft,
  onConfirm,
  onDismiss,
  onRetry,
}: Props) {
  return (
    <div className="relative w-full h-full bg-surface-primary overflow-hidden flex flex-col">
      {/* Status bar */}
      <StatusBar />

      {/* Header nav */}
      <div className="flex justify-between items-center px-4 py-3">
        <button
          onClick={onDismiss}
          className="w-8 h-8 rounded-full border border-surface-elevated flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft size={16} className="text-txt-secondary" />
        </button>
        <span className="text-txt-secondary text-xs tracking-wider uppercase">
          Solicitud de débito
        </span>
        <div className="w-8" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
        <SecurityBadge />
        <EntityHeader entity={request.entity} />
        <AmountDisplay amount={request.amount} />
        <TransactionDetails request={request} />
        <ProjectedBalance
          currentBalance={request.currentBalance}
          amount={request.amount}
        />
        <SwipeToConfirm
          onComplete={onConfirm}
          disabled={state !== "modal_visible"}
          secondsLeft={secondsLeft}
        />
      </div>

      {/* Overlay states */}
      {state === "loading_biometrics" && <BiometricOverlay />}
      {state === "success" && response && (
        <SuccessView response={response} onDismiss={onDismiss} />
      )}
      {(state === "error_balance" || state === "timeout") && (
        <ErrorView
          state={state}
          response={response}
          onDismiss={onDismiss}
          onRetry={onRetry}
        />
      )}
    </div>
  );
}
