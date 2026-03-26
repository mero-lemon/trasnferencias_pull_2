"use client";

import { ChevronRight } from "lucide-react";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

interface Props {
  onComplete: () => void;
  disabled?: boolean;
  secondsLeft: number;
}

export function SwipeToConfirm({ onComplete, disabled, secondsLeft }: Props) {
  const { trackRef, progress, isDragging, handlers } = useSwipeGesture({
    onComplete,
    disabled,
  });

  const thumbOffset = 4 + progress * (100 - 4); // percentage
  const textOpacity = Math.max(0, 1 - progress / 0.5);
  const isComplete = progress >= 1;

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div
        ref={trackRef}
        className={`relative h-14 rounded-4xl border overflow-hidden select-none ${
          disabled
            ? "bg-surface-elevated border-surface-elevated opacity-50"
            : "bg-surface-card border-[#2a2a2a] cursor-grab active:cursor-grabbing"
        }`}
      >
        {/* Center text */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          <span className="text-txt-muted text-sm font-medium">
            Deslizá para autorizar
          </span>
        </div>

        {/* Fill */}
        <div
          className="absolute left-0 top-0 bottom-0 swipe-fill-gradient rounded-4xl pointer-events-none"
          style={{
            width: `${Math.max(14, progress * 100)}%`,
            transition: isDragging ? "none" : "width 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* Thumb */}
        <div
          className="absolute top-1 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-none"
          style={{
            left: `${thumbOffset}%`,
            transform: "translateX(-50%)",
            transition: isDragging ? "none" : "left 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {isComplete ? (
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path
                d="M5 10l3.5 3.5L15 7"
                stroke="#0D0D0D"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <ChevronRight size={20} className="text-surface-primary" />
          )}
        </div>

        {/* Invisible touch target */}
        <div
          className="absolute top-0 h-full w-16 z-10 touch-none"
          style={{
            left: `calc(${thumbOffset}% - 32px)`,
            transition: isDragging ? "none" : "left 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
          {...handlers}
        />
      </div>

      <div className="flex justify-between items-center mt-2.5 px-1">
        <p className="text-txt-muted text-[11px]">
          Se requerirá verificación biométrica
        </p>
        <p className="text-txt-tertiary text-[11px] font-mono tabular-nums">
          {secondsLeft}s
        </p>
      </div>
    </div>
  );
}
