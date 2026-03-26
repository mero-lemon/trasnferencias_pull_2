"use client";

import { useRef, useCallback, useState } from "react";
import { SWIPE_THRESHOLD } from "@/types/pullTransfer.types";

interface UseSwipeGestureProps {
  onComplete: () => void;
  disabled?: boolean;
}

export function useSwipeGesture({ onComplete, disabled }: UseSwipeGestureProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const trackWidthRef = useRef(0);

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled) return;
      const track = trackRef.current;
      if (!track) return;
      trackWidthRef.current = track.offsetWidth - 56; // thumb width
      startXRef.current = clientX;
      setIsDragging(true);
    },
    [disabled]
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled) return;
      const delta = clientX - startXRef.current;
      const pct = Math.max(0, Math.min(1, delta / trackWidthRef.current));
      setProgress(pct);
    },
    [isDragging, disabled]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (progress >= SWIPE_THRESHOLD) {
      setProgress(1);
      onComplete();
    } else {
      setProgress(0);
    }
  }, [isDragging, progress, onComplete]);

  const reset = useCallback(() => {
    setProgress(0);
    setIsDragging(false);
  }, []);

  return {
    trackRef,
    progress,
    isDragging,
    reset,
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        handleStart(e.clientX);
      },
      onPointerMove: (e: React.PointerEvent) => handleMove(e.clientX),
      onPointerUp: () => handleEnd(),
      onPointerCancel: () => handleEnd(),
    },
  };
}
