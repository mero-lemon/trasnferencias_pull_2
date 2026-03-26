"use client";

export function SecurityBadge() {
  return (
    <div className="flex items-center gap-2 bg-lemon-green-muted border border-lemon-green-border rounded-full px-3.5 py-1.5 w-fit mx-auto animate-fade-in">
      <span className="w-2 h-2 bg-lemon-green rounded-full animate-pulse" />
      <span className="text-lemon-green text-xs font-medium">
        Conexión segura verificada
      </span>
    </div>
  );
}
