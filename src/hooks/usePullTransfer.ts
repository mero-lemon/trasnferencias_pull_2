"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PullTransferState,
  PullTransferRequest,
  PullTransferResponse,
  RESPONSE_CODES,
  TIMEOUT_SECONDS,
} from "@/types/pullTransfer.types";
import {
  getMockPullRequest,
  authorizePullTransfer,
  authenticateBiometric,
} from "@/services/pullTransferService";

export function usePullTransfer() {
  const [state, setState] = useState<PullTransferState>("idle");
  const [request, setRequest] = useState<PullTransferRequest | null>(null);
  const [response, setResponse] = useState<PullTransferResponse | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const startTimeout = useCallback(() => {
    setSecondsLeft(TIMEOUT_SECONDS);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          setState("timeout");
          setResponse({ code: "95", message: "La solicitud expiró" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimers]);

  // Simulate receiving a pull request
  const simulateIncoming = useCallback(() => {
    const req = getMockPullRequest();
    setRequest(req);
    setResponse(null);
    setState("modal_visible");
    startTimeout();
  }, [startTimeout]);

  // User completed swipe → trigger biometrics
  const confirmSwipe = useCallback(async () => {
    if (state !== "modal_visible" || !request) return;

    clearTimers();
    setState("loading_biometrics");

    const bioResult = await authenticateBiometric();

    if (!bioResult.success) {
      setState("modal_visible");
      startTimeout();
      return;
    }

    const res = await authorizePullTransfer(request.id, bioResult.token!);
    setResponse(res);

    const mapped = RESPONSE_CODES[res.code];
    setState(mapped?.state || "error_balance");
  }, [state, request, clearTimers, startTimeout]);

  // Dismiss and go back to idle
  const dismiss = useCallback(() => {
    clearTimers();
    setState("idle");
    setRequest(null);
    setResponse(null);
    setSecondsLeft(TIMEOUT_SECONDS);
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    state,
    request,
    response,
    secondsLeft,
    simulateIncoming,
    confirmSwipe,
    dismiss,
  };
}
