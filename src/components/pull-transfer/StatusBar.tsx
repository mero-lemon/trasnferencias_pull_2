"use client";

export function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-2 text-white text-xs">
      <span className="font-semibold">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal */}
        <div className="flex items-end gap-[2px] h-3">
          <div className="w-[3px] h-[4px] bg-white rounded-[1px]" />
          <div className="w-[3px] h-[6px] bg-white rounded-[1px]" />
          <div className="w-[3px] h-[8px] bg-white rounded-[1px]" />
          <div className="w-[3px] h-[11px] bg-white rounded-[1px]" />
        </div>
        {/* WiFi */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
          <path d="M7 9.5a1 1 0 100-2 1 1 0 000 2zM3.5 6.5C4.4 5.6 5.6 5 7 5s2.6.6 3.5 1.5M1 3.5C2.6 1.9 4.7 1 7 1s4.4.9 6 2.5"
            fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-[2px]">
          <div className="w-[22px] h-[11px] border border-white/60 rounded-[3px] p-[1.5px] relative">
            <div className="h-full w-[70%] bg-lemon-green rounded-[1.5px]" />
          </div>
          <div className="w-[1.5px] h-[5px] bg-white/40 rounded-r-sm" />
        </div>
      </div>
    </div>
  );
}
