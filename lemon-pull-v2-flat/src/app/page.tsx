"use client";

import { useState, useEffect, useCallback } from "react";
import { Screen, PullRequest } from "@/types";
import { fmtARS, fmtParts } from "@/lib/format";

const PULL: PullRequest = {
  id: "pull_001",
  bankName: "Brubank",
  bankShort: "BB",
  amount: 500000,
  concept: "Fondeo cuenta propia",
  cbu: "1430001713001150420010",
  recipientName: "Jeronimo Campero",
  destinationCvu: "0000003100099182883294",
  currentBalance: 1295053.78,
  timestamp: Date.now(),
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [time, setTime] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const startFlow = useCallback(() => {
    setScreen("lockscreen");
    setShowNotif(false);
    setTimeout(() => setShowNotif(true), 1200);
  }, []);

  const tapNotif = useCallback(() => {
    setShowNotif(false);
    setScreen("modal");
  }, []);

  const handleSwipeStart = useCallback((clientX: number) => {
    setSwiping(true);
    setSwipeStartX(clientX);
  }, []);

  const handleSwipeMove = useCallback((clientX: number) => {
    if (!swiping) return;
    const delta = clientX - swipeStartX;
    setSwipeX(Math.max(0, Math.min(1, delta / 260)));
  }, [swiping, swipeStartX]);

  const handleSwipeEnd = useCallback(() => {
    setSwiping(false);
    if (swipeX > 0.7) {
      setSwipeX(1);
      setTimeout(() => {
        setScreen("biometric");
        setTimeout(() => {
          setScreen("success");
          setTimeout(() => setScreen("activity"), 2500);
        }, 2000);
      }, 300);
    } else {
      setSwipeX(0);
    }
  }, [swipeX]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      {/* Device frame */}
      <div className="w-[393px] h-[852px] bg-black rounded-[55px] border-[3px] border-[#333] overflow-hidden relative shadow-2xl shadow-black/60">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-b-[20px] z-[70]" />

        {screen === "home" && <HomeScreen onStart={startFlow} />}
        {screen === "lockscreen" && (
          <LockScreen time={time} showNotif={showNotif} onTapNotif={tapNotif} pull={PULL} />
        )}
        {screen === "modal" && (
          <ModalScreen
            pull={PULL}
            swipeX={swipeX}
            swiping={swiping}
            onSwipeStart={handleSwipeStart}
            onSwipeMove={handleSwipeMove}
            onSwipeEnd={handleSwipeEnd}
          />
        )}
        {screen === "biometric" && <BiometricScreen />}
        {screen === "success" && <SuccessScreen pull={PULL} />}
        {screen === "activity" && (
          <ActivityScreen pull={PULL} onNotifications={() => setScreen("notifications")} />
        )}
        {screen === "notifications" && (
          <NotificationsScreen onBack={() => setScreen("activity")} />
        )}

        {/* Home indicator */}
        <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/20 rounded-full z-[60]" />
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: HOME — Just the simulate button
   ============================================================ */
function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-10">
      <button
        onClick={onStart}
        className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-medium text-[15px] tracking-lemon active:scale-[0.97] transition-transform"
        style={{ background: "#00f068", color: "#000" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        Simular solicitud pull
      </button>
    </div>
  );
}

/* ============================================================
   SCREEN: iOS LOCK SCREEN with push notification
   ============================================================ */
function LockScreen({
  time, showNotif, onTapNotif, pull,
}: {
  time: string; showNotif: boolean; onTapNotif: () => void; pull: PullRequest;
}) {
  return (
    <div className="h-full relative flex flex-col items-center"
      style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #0a0a15 50%, #000 100%)" }}>
      {/* Status bar */}
      <div className="w-full flex justify-between items-center px-8 pt-[52px] text-white/80 text-[13px] font-medium">
        <span>{time}</span>
        <div className="flex items-center gap-1">
          <div className="flex items-end gap-[2px]">
            <div className="w-[3px] h-[4px] bg-white/80 rounded-[1px]" />
            <div className="w-[3px] h-[6px] bg-white/80 rounded-[1px]" />
            <div className="w-[3px] h-[8px] bg-white/80 rounded-[1px]" />
            <div className="w-[3px] h-[10px] bg-white/80 rounded-[1px]" />
          </div>
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
            <path d="M1 4C2.7 2.2 4.7 1 7 1s4.3 1.2 6 3" /><path d="M3.5 7C4.4 6 5.6 5.3 7 5.3s2.6.7 3.5 1.7" /><circle cx="7" cy="9.5" r="1" fill="white" stroke="none" />
          </svg>
          <div className="flex items-center ml-0.5">
            <div className="w-[24px] h-[12px] border border-white/50 rounded-[3px] p-[1.5px]">
              <div className="h-full w-[60%] bg-white/80 rounded-[1.5px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Lock icon */}
      <div className="mt-4">
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5">
          <rect x="1" y="7" width="12" height="10" rx="2" /><path d="M4 7V5a3 3 0 0 1 6 0v2" />
        </svg>
      </div>

      {/* Time */}
      <p className="text-white text-[72px] font-bold tracking-tight leading-none mt-2">{time}</p>
      <p className="text-white/50 text-[17px] mt-1 tracking-wider">
        {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      {/* Push notification */}
      {showNotif && (
        <div className="absolute top-[220px] left-4 right-4 notif-enter cursor-pointer" onClick={onTapNotif}>
          <div className="bg-white/10 lockscreen-blur rounded-[20px] p-3.5 border border-white/10">
            <div className="flex items-start gap-3">
              {/* Lemon icon */}
              <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: "#00f068" }}>
                <span className="text-black font-bold text-[16px]">L</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-white font-medium text-[14px]">Lemon</span>
                  <span className="text-white/40 text-[12px]">ahora</span>
                </div>
                <p className="text-white font-medium text-[14px] leading-tight">
                  🔒 Solicitud de débito pendiente
                </p>
                <p className="text-white/70 text-[13px] leading-snug mt-0.5">
                  {pull.bankName} solicita ${fmtARS(pull.amount)} desde tu cuenta. Tenés 30 segundos para autorizar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="absolute bottom-12 text-white/30 text-[13px]">
        {showNotif ? "Tocá la notificación para continuar" : "Cargando..."}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: AUTHORIZATION MODAL — Lemon real UI style
   ============================================================ */
function ModalScreen({
  pull, swipeX, swiping, onSwipeStart, onSwipeMove, onSwipeEnd,
}: {
  pull: PullRequest;
  swipeX: number;
  swiping: boolean;
  onSwipeStart: (x: number) => void;
  onSwipeMove: (x: number) => void;
  onSwipeEnd: () => void;
}) {
  const projected = pull.currentBalance - pull.amount;
  const projParts = fmtParts(projected);
  const amtParts = fmtParts(pull.amount);

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Status bar */}
      <StatusBar />

      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </div>
        <span className="text-white font-medium text-[17px] tracking-lemon">Confirma tu envío</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Label */}
        <p className="text-t-secondary text-[14px] text-center mt-2 mb-1 tracking-lemon">Vas a enviar</p>

        {/* Amount — matches Lemon style */}
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/10">
            <svg width="20" height="20" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#338AF3"/><circle cx="18" cy="18" r="8" fill="#FFDA44"/></svg>
          </div>
          <span className="text-white text-[38px] font-bold tracking-tight">{amtParts.int}.{amtParts.dec}</span>
          <span className="text-t-secondary text-[18px] font-medium">ARS</span>
        </div>

        <p className="text-t-secondary text-[13px] text-center mb-1.5 tracking-lemon">
          Disponible: {fmtARS(pull.currentBalance)} ARS
        </p>

        {/* Projected balance */}
        <div className="rounded-xl px-4 py-3 mb-6 border" style={{ background: "rgba(0,240,104,0.06)", borderColor: "rgba(0,240,104,0.15)" }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-t-secondary text-[11px] uppercase tracking-widest mb-0.5">Saldo posterior</p>
              <p className="text-[20px] font-bold" style={{ color: "#00f068" }}>
                ${projParts.int}<span className="text-[14px]" style={{ color: "rgba(0,240,104,0.6)" }}>,{projParts.dec}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-t-tertiary text-[11px]">Saldo actual</p>
              <p className="text-t-secondary text-[15px]">${fmtARS(pull.currentBalance)}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#222] mb-5" />

        {/* Details — matches real Lemon layout */}
        <div className="space-y-4 mb-6">
          <DetailRow label="Nombre" value={pull.recipientName} />
          <div className="h-px bg-[#1a1a1a]" />
          <DetailRow label="Banco" value={pull.bankName} />
          <div className="h-px bg-[#1a1a1a]" />
          <DetailRow label="CBU" value={pull.cbu} mono />
          <div className="h-px bg-[#1a1a1a]" />
          <DetailRow label="Concepto" value={pull.concept} />
          <div className="h-px bg-[#1a1a1a]" />
          <DetailRow label="Titular" value="Mismo titular ✓" green />
        </div>

        <p className="text-t-tertiary text-[13px] text-center mb-4 tracking-lemon">
          Las transferencias en ARS no tienen costo.
        </p>

        {/* Swipe — matches real Lemon: cream/white bg, black text */}
        <div
          className="lemon-swipe-track h-[56px] relative overflow-hidden select-none touch-none"
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); onSwipeStart(e.clientX); }}
          onPointerMove={(e) => onSwipeMove(e.clientX)}
          onPointerUp={onSwipeEnd}
          onPointerCancel={onSwipeEnd}
        >
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: Math.max(0, 1 - swipeX / 0.4) }}>
            <span className="text-[#333] text-[15px] font-medium tracking-lemon">
              Desliza para confirmar
            </span>
          </div>

          {/* Green fill */}
          <div className="absolute left-0 top-0 bottom-0 rounded-2xl pointer-events-none"
            style={{
              width: `${Math.max(16, swipeX * 100)}%`,
              background: "#00f068",
              transition: swiping ? "none" : "width 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          />

          {/* Thumb */}
          <div
            className="absolute top-[6px] w-[44px] h-[44px] bg-black rounded-full flex items-center justify-center pointer-events-none"
            style={{
              left: `calc(${6 + swipeX * (100 - 16)}% - ${swipeX * 22}px + 6px)`,
              transition: swiping ? "none" : "left 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: BIOMETRIC VERIFICATION
   ============================================================ */
function BiometricScreen() {
  return (
    <div className="h-full bg-black flex flex-col items-center justify-center fade-in">
      <div className="relative w-[120px] h-[120px] mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-[#00f068]/30" style={{ animation: "pulse-ring 2s ease-in-out infinite" }} />
        <div className="absolute inset-3 rounded-full border-2 border-[#00f068]/50" style={{ animation: "pulse-ring 2s ease-in-out infinite 0.3s" }} />
        <div className="absolute inset-6 rounded-full border-2 border-[#00f068]/70" style={{ animation: "pulse-ring 2s ease-in-out infinite 0.6s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00f068" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
            <circle cx="12" cy="11" r="3" /><path d="M12 14c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z" />
          </svg>
        </div>
      </div>
      <p className="text-white text-[17px] font-medium tracking-lemon">Verificando tu identidad</p>
      <p className="text-t-secondary text-[14px] mt-1 tracking-lemon">Mirá a la cámara para continuar</p>
    </div>
  );
}

/* ============================================================
   SCREEN: SUCCESS
   ============================================================ */
function SuccessScreen({ pull }: { pull: PullRequest }) {
  const newBal = pull.currentBalance - pull.amount;
  return (
    <div className="h-full bg-black flex flex-col items-center justify-center fade-in relative overflow-hidden">
      {/* Confetti */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute rounded-sm"
          style={{
            width: 5 + Math.random() * 7,
            height: 3 + Math.random() * 4,
            background: ["#00f068", "#00ca57", "#3ff48d", "#FBBF24", "#60A5FA"][i % 5],
            left: `${10 + Math.random() * 80}%`,
            top: "45%",
            animation: `confetti-burst ${0.8 + Math.random() * 0.6}s cubic-bezier(0.25,0.46,0.45,0.94) ${Math.random() * 0.3}s forwards`,
          }}
        />
      ))}

      <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-6 check-pop" style={{ background: "#00f068" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M9 16.5l5 5L23 11" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p className="text-white text-[22px] font-bold tracking-lemon mb-2">Listo, débito autorizado</p>
      <p className="text-t-secondary text-[14px] text-center px-10 mb-6 tracking-lemon">
        ${fmtARS(pull.amount)} ARS se acreditarán en tu cuenta Lemon
      </p>

      <div className="bg-[#1a1a1a] rounded-2xl px-6 py-4 text-center slide-up" style={{ animationDelay: "0.15s" }}>
        <p className="text-t-tertiary text-[11px] uppercase tracking-widest mb-1">Tu nuevo saldo</p>
        <p className="text-[24px] font-bold" style={{ color: "#00f068" }}>${fmtARS(newBal)} ARS</p>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: ACTIVITY — Movimientos (matches real Lemon UI)
   ============================================================ */
function ActivityScreen({ pull, onNotifications }: { pull: PullRequest; onNotifications: () => void }) {
  const [tab, setTab] = useState<"notif" | "mov">("mov");

  if (tab === "notif") {
    return <NotificationsScreen onBack={() => setTab("mov")} />;
  }

  const today = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long" });

  return (
    <div className="h-full bg-black flex flex-col">
      <StatusBar />
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </div>
        <span className="text-white font-medium text-[17px] tracking-lemon">Actividad</span>
        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
        </div>
      </div>

      {/* Segmented control */}
      <div className="mx-4 mt-2 mb-4 flex bg-[#1a1a1a] rounded-xl p-[3px]">
        <button
          onClick={onNotifications}
          className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-medium tracking-lemon transition-colors ${
            false ? "bg-[#333] text-white" : "text-t-secondary"
          }`}
        >
          Notificaciones
        </button>
        <button
          className="flex-1 py-2.5 rounded-[10px] text-[14px] font-medium tracking-lemon bg-[#333] text-white"
        >
          Movimientos
        </button>
      </div>

      {/* Movements list */}
      <div className="flex-1 overflow-y-auto px-4">
        <p className="text-t-secondary text-[14px] font-medium mb-3 tracking-lemon">Hoy</p>

        {/* NEW: Pull transfer that just happened */}
        <MovementRow
          icon={<ArgFlag />}
          title="Transferencia Pull recibida"
          subtitle={today}
          amount={`+ ${fmtARS(pull.amount)}`}
          amountSub=""
          positive
          highlight
        />

        <MovementRow
          icon={<ArgFlag />}
          title="Retiro de ARS"
          subtitle={today}
          amount="- 13.000,00"
          amountSub=""
        />
        <MovementRow
          icon={<ArgFlag />}
          title="Rendimientos"
          subtitle={today}
          amount="+ 172,80 ARS"
          amountSub="20.48%"
          positive
        />
        <MovementRow
          icon={<CryptoIcon color="#2775ca" letter="$" />}
          title="Ganancias diarias"
          subtitle={today}
          amount="+ 0,03 USDC"
          amountSub="≈ 35,72 ARS"
          positive
        />
        <MovementRow
          icon={<CryptoIcon color="#26a17b" letter="₮" />}
          title="Ganancias diarias"
          subtitle={today}
          amount="+ 0,10 USDT"
          amountSub="≈ 141,73 ARS"
          positive
        />

        <p className="text-t-secondary text-[14px] font-medium mb-3 mt-5 tracking-lemon">Anteriores</p>
        <MovementRow
          icon={<ArgFlag />}
          title="Rendimientos"
          subtitle="25 de marzo"
          amount="+ 482,83 ARS"
          amountSub="20.12%"
          positive
        />
        <MovementRow
          icon={<CryptoIcon color="#2775ca" letter="$" />}
          title="Ganancias diarias"
          subtitle="25 de marzo"
          amount="+ 0,03 USDC"
          amountSub="≈ 35,72 ARS"
          positive
        />
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: NOTIFICATIONS — with failed pull attempt
   ============================================================ */
function NotificationsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-black flex flex-col">
      <StatusBar />
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="text-white font-medium text-[17px] tracking-lemon">Actividad</span>
        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
        </div>
      </div>

      {/* Segmented control — Notificaciones selected */}
      <div className="mx-4 mt-2 mb-3 flex bg-[#1a1a1a] rounded-xl p-[3px]">
        <button className="flex-1 py-2.5 rounded-[10px] text-[14px] font-medium tracking-lemon bg-[#333] text-white">
          Notificaciones
        </button>
        <button onClick={onBack} className="flex-1 py-2.5 rounded-[10px] text-[14px] font-medium tracking-lemon text-t-secondary">
          Movimientos
        </button>
      </div>

      {/* Chips */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto">
        <Chip label="Todos" active />
        <Chip label="Amigos" />
        <Chip label="Mercado" />
        <Chip label="Mi cuenta" />
        <Chip label="Benefi..." />
      </div>

      {/* Notification: failed pull attempt */}
      <div className="flex-1 px-4">
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E24B4A]/15 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-medium text-[14px] tracking-lemon">Transferencia Pull rechazada</span>
                <span className="text-t-tertiary text-[12px]">14:23</span>
              </div>
              <p className="text-t-secondary text-[13px] leading-snug tracking-lemon">
                La solicitud de débito de <span className="text-white">Banco Nación</span> por <span className="text-white">$250.000 ARS</span> fue rechazada por saldo insuficiente en la cuenta de origen.
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E24B4A]" />
                <span className="text-[#E24B4A] text-[12px] font-medium tracking-lemon">Código 20 — Saldo insuficiente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second notification — success reference */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] mt-3 slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,240,104,0.12)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f068" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M8 12.5l3 3 5-6" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-medium text-[14px] tracking-lemon">Transferencia Pull exitosa</span>
                <span className="text-t-tertiary text-[12px]">14:20</span>
              </div>
              <p className="text-t-secondary text-[13px] leading-snug tracking-lemon">
                Recibiste <span style={{ color: "#00f068" }}>$500.000 ARS</span> desde <span className="text-white">Brubank</span> en tu cuenta Lemon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
function StatusBar() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick(); const i = setInterval(tick, 1000); return () => clearInterval(i);
  }, []);
  return (
    <div className="flex justify-between items-center px-6 pt-[14px] pb-1 text-white text-[13px] font-medium" style={{ paddingTop: "52px" }}>
      <span>{t}</span>
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-[2px]">
          <div className="w-[3px] h-[4px] bg-white rounded-[1px]" />
          <div className="w-[3px] h-[6px] bg-white rounded-[1px]" />
          <div className="w-[3px] h-[8px] bg-white rounded-[1px]" />
          <div className="w-[3px] h-[10px] bg-white rounded-[1px]" />
        </div>
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round">
          <path d="M1 4C2.7 2.2 4.7 1 7 1s4.3 1.2 6 3" /><path d="M3.5 7C4.4 6 5.6 5.3 7 5.3s2.6.7 3.5 1.7" /><circle cx="7" cy="9.5" r="1" fill="white" stroke="none" />
        </svg>
        <div className="w-[24px] h-[12px] border border-white/50 rounded-[3px] p-[1.5px]">
          <div className="h-full w-[60%] bg-white rounded-[1.5px]" />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, green }: { label: string; value: string; mono?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-t-secondary text-[14px] tracking-lemon font-medium">{label}</span>
      <span className={`text-[14px] tracking-lemon text-right max-w-[60%] ${
        green ? "font-medium" : mono ? "font-mono text-[13px]" : "font-medium"
      }`} style={{ color: green ? "#00f068" : "#fff" }}>
        {value}
      </span>
    </div>
  );
}

function MovementRow({
  icon, title, subtitle, amount, amountSub, positive, highlight,
}: {
  icon: React.ReactNode; title: string; subtitle: string; amount: string; amountSub: string;
  positive?: boolean; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-3.5 ${highlight ? "slide-up" : ""}`}>
      <div className="w-[44px] h-[44px] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium tracking-lemon ${highlight ? "" : "text-white"}`}
          style={highlight ? { color: "#00f068" } : {}}>
          {title}
        </p>
        <p className="text-t-tertiary text-[13px] tracking-lemon">{subtitle}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-[14px] font-medium tracking-lemon ${positive ? "" : "text-white"}`}
          style={positive ? { color: "#00f068" } : {}}>
          {amount} {!amount.includes("ARS") && !amount.includes("USD") ? "ARS" : ""}
        </p>
        {amountSub && <p className="text-t-tertiary text-[12px] tracking-lemon">{amountSub}</p>}
      </div>
    </div>
  );
}

function ArgFlag() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="22" fill="#338AF3" />
      <rect x="0" y="0" width="44" height="15" fill="#fff" rx="0" />
      <rect x="0" y="29" width="44" height="15" fill="#fff" rx="0" />
      <circle cx="22" cy="22" r="5" fill="#FFDA44" />
    </svg>
  );
}

function CryptoIcon({ color, letter }: { color: string; letter: string }) {
  return (
    <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center" style={{ background: color }}>
      <span className="text-white text-[18px] font-bold">{letter}</span>
    </div>
  );
}

function Chip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-full text-[13px] font-medium tracking-lemon whitespace-nowrap flex-shrink-0 ${
      active
        ? "border text-white"
        : "border border-[#444] text-t-secondary"
    }`} style={active ? { borderColor: "#00f068", color: "#00f068" } : {}}>
      {label}
    </button>
  );
}
