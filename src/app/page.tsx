"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fmtARS, fmtParts } from "@/lib/format";

type Screen = "home" | "lockscreen" | "biometric" | "modal" | "success" | "expired" | "insufficient" | "activity_mov" | "activity_notif";
type SimMode = "normal" | "expired" | "insufficient" | "double";

interface Pull {
  bankName: string;
  amount: number;
  concept: string;
  cbu: string;
  recipientName: string;
  currentBalance: number;
}

const PULL_1: Pull = {
  bankName: "Brubank",
  amount: 500000,
  concept: "Fondeo cuenta propia",
  cbu: "1430001713001150420010",
  recipientName: "Jeronimo Campero",
  currentBalance: 265215.22,
};

const PULL_2: Pull = {
  bankName: "Banco Galicia",
  amount: 120000,
  concept: "Fondeo cuenta propia",
  cbu: "0070999020000008210374",
  recipientName: "Jeronimo Campero",
  currentBalance: 765215.22, // after first pull credited
};

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [showNotif, setShowNotif] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [mode, setMode] = useState<SimMode>("normal");
  const [activePull, setActivePull] = useState<Pull>(PULL_1);
  const [outcomes, setOutcomes] = useState<Array<{ pull: Pull; result: "confirmed" | "rejected" | "insufficient" }>>([]);
  const [queuedPull, setQueuedPull] = useState<Pull | null>(null);

  const restart = useCallback(() => {
    setScreen("home");
    setShowNotif(false);
    setShowSheet(false);
    setMode("normal");
    setActivePull(PULL_1);
    setOutcomes([]);
    setQueuedPull(null);
  }, []);

  const startFlow = useCallback((m: SimMode) => {
    setMode(m);
    setScreen("lockscreen");
    setShowNotif(false);
    setShowSheet(false);
    setOutcomes([]);
    setQueuedPull(null);
    setActivePull(PULL_1);
    if (m === "double") setQueuedPull(PULL_2);
    setTimeout(() => setShowNotif(true), 1500);
  }, []);

  const tapNotif = useCallback(() => {
    setShowNotif(false);
    setScreen("biometric");
    setTimeout(() => {
      if (mode === "expired") {
        setScreen("expired");
      } else {
        setScreen("modal");
        setTimeout(() => setShowSheet(true), 400);
      }
    }, 2200);
  }, [mode]);

  const handleConfirm = useCallback(() => {
    setShowSheet(false);

    if (mode === "insufficient") {
      // Simulate: swipe OK, bio OK, but COELSA returns code 20
      setTimeout(() => {
        setOutcomes(prev => [...prev, { pull: activePull, result: "insufficient" }]);
        setScreen("insufficient");
      }, 800);
      return;
    }

    // Normal confirm
    setOutcomes(prev => [...prev, { pull: activePull, result: "confirmed" }]);
    setScreen("success");

    setTimeout(() => {
      if (queuedPull) {
        // Show next pull in queue
        setActivePull(queuedPull);
        setQueuedPull(null);
        setScreen("modal");
        setTimeout(() => setShowSheet(true), 400);
      } else {
        setScreen("activity_mov");
      }
    }, 2500);
  }, [mode, activePull, queuedPull]);

  const handleReject = useCallback(() => {
    setShowSheet(false);
    setOutcomes(prev => [...prev, { pull: activePull, result: "rejected" }]);

    if (queuedPull) {
      // Show next pull
      setActivePull(queuedPull);
      setQueuedPull(null);
      setTimeout(() => {
        setScreen("modal");
        setTimeout(() => setShowSheet(true), 400);
      }, 300);
    } else {
      setScreen("activity_notif");
    }
  }, [activePull, queuedPull]);

  const handleInsufficientDismiss = useCallback(() => {
    if (queuedPull) {
      setActivePull(queuedPull);
      setQueuedPull(null);
      setScreen("modal");
      setTimeout(() => setShowSheet(true), 400);
    } else {
      setScreen("activity_notif");
    }
  }, [queuedPull]);

  const isIdle = screen === "home" && outcomes.length === 0;
  const showRestart = screen === "activity_mov" || screen === "activity_notif" || screen === "expired";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 p-4 gap-5">
      {isIdle && (
        <div className="flex flex-wrap justify-center gap-3 max-w-[500px]">
          <SimBtn label="Simular solicitud pull" green onClick={() => startFlow("normal")} />
          <SimBtn label="Simular expirada" onClick={() => startFlow("expired")} />
          <SimBtn label="Simular saldo insuficiente" onClick={() => startFlow("insufficient")} />
          <SimBtn label="Simular 2 solicitudes" onClick={() => startFlow("double")} />
        </div>
      )}

      <div className="w-[393px] h-[852px] bg-black rounded-[55px] border-[3px] border-[#333] overflow-hidden relative shadow-2xl shadow-black/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-b-[20px] z-[70]" />

        {(screen === "home" || screen === "modal" || screen === "expired" || screen === "insufficient") && <HomeContent pull={PULL_1} />}
        {screen === "modal" && <SheetOverlay show={showSheet} pull={activePull} onConfirm={handleConfirm} onReject={handleReject} />}
        {screen === "expired" && <ExpiredSheet pull={activePull} show={true} onBack={restart} />}
        {screen === "insufficient" && <InsufficientSheet pull={activePull} show={true} onBack={handleInsufficientDismiss} />}
        {screen === "lockscreen" && <LockScreen showNotif={showNotif} onTapNotif={tapNotif} pull={PULL_1} />}
        {screen === "biometric" && <BiometricScreen />}
        {screen === "success" && <SuccessScreen pull={activePull} />}
        {screen === "activity_mov" && <ActivityMovScreen outcomes={outcomes} onNotif={() => setScreen("activity_notif")} />}
        {screen === "activity_notif" && <ActivityNotifScreen outcomes={outcomes} onMov={() => setScreen("activity_mov")} />}

        <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/20 rounded-full z-[60]" />
      </div>

      {showRestart && (
        <button onClick={restart}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-[#444] text-[#999] text-[14px] font-medium tracking-lemon active:scale-[0.97] transition-transform">
          <RestartIcon /> Reiniciar experiencia
        </button>
      )}
    </div>
  );
}

function SimBtn({ label, green, onClick }: { label: string; green?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-[14px] tracking-lemon active:scale-[0.97] transition-transform ${
        green ? "" : "border border-[#444] text-[#999]"
      }`}
      style={green ? { background: "#00f068", color: "#000" } : {}}>
      {green && <BellIcon color="black" />}
      {label}
    </button>
  );
}

/* ================================================================
   HOME
   ================================================================ */
function HomeContent({ pull }: { pull: Pull }) {
  return (
    <div className="h-full bg-black flex flex-col">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center border-2 border-[#333]">
            <span className="text-white text-[14px] font-bold">JC</span>
          </div>
          <div className="bg-[#1a1a1a] rounded-full px-3.5 py-1.5 border border-[#333]">
            <span className="text-white text-[14px] font-medium tracking-lemon">$jeronimo</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <C40><SearchIcon /></C40>
          <div className="relative"><C40><BellIcon color="#999" /></C40><div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E24B4A]" /></div>
        </div>
      </div>
      <div className="px-5 mb-5">
        <p className="text-t-secondary text-[13px] tracking-lemon mb-1">Total billetera</p>
        <div className="flex items-baseline gap-2">
          <span className="text-white text-[42px] font-bold tracking-tight leading-none">
            {fmtParts(pull.currentBalance / 1476).int}<span className="text-t-secondary text-[24px]">,{fmtParts(pull.currentBalance / 1476).dec}</span>
          </span>
          <span className="text-t-secondary text-[18px] font-medium">USDT</span>
        </div>
        <p className="text-t-tertiary text-[14px] tracking-lemon mt-0.5">{fmtARS(pull.currentBalance)} ARS</p>
      </div>
      <div className="flex gap-4 px-5 mb-6">
        <ActionBtn icon={<ArrowDown />} label="DEPOSITAR" active />
        <ActionBtn icon={<RefreshSvg />} label="CAMBIAR" />
        <ActionBtn icon={<ArrowUp />} label="ENVIAR" />
      </div>
      <div className="mx-5 bg-[#1a1a1a] rounded-2xl p-4 mb-6 border border-[#222]">
        <p className="text-white text-[15px] font-medium tracking-lemon mb-1">Transferencias Pull 🔄</p>
        <p className="text-t-secondary text-[13px] leading-relaxed tracking-lemon">Ahora podés autorizar débitos desde tus cuentas en otros bancos directamente en Lemon.</p>
      </div>
      <div className="px-5 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-t-secondary text-[14px] tracking-lemon">Pesos</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-white text-[26px] font-bold tracking-tight">{fmtParts(pull.currentBalance / 1476).int}</span>
          <span className="text-[16px] font-medium" style={{ color: "#00f068" }}>USDT</span>
          <div className="ml-auto px-2.5 py-1 rounded-full" style={{ background: "rgba(0,240,104,0.15)" }}>
            <span className="text-[12px] font-medium" style={{ color: "#00f068" }}>19.97%</span>
          </div>
        </div>
        <p className="text-t-tertiary text-[13px] tracking-lemon">{fmtARS(pull.currentBalance)} ARS</p>
      </div>
      <div className="flex-1" />
      <TabBar />
    </div>
  );
}

/* ================================================================
   CONFIRMATION SHEET
   ================================================================ */
function SheetOverlay({ show, pull, onConfirm, onReject }: {
  show: boolean; pull: Pull; onConfirm: () => void; onReject: () => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const amtParts = fmtParts(pull.amount);

  // Reset swipe when pull changes (queue scenario)
  useEffect(() => { setSwipeX(0); setSwiping(false); }, [pull]);

  const handleDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSwiping(true); setStartX(e.clientX);
  };
  const handleMove = (e: React.PointerEvent) => {
    if (!swiping) return;
    setSwipeX(Math.max(0, Math.min(1, (e.clientX - startX) / 260)));
  };
  const handleUp = () => {
    setSwiping(false);
    if (swipeX > 0.7) { setSwipeX(1); setTimeout(onConfirm, 250); }
    else setSwipeX(0);
  };

  return (
    <>
      <div className="absolute inset-0 z-40 transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.7)", opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none" }}
        onClick={onReject} />
      <div className="absolute left-0 right-0 bottom-0 z-50 transition-transform duration-500"
        style={{ transform: show ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="bg-[#1a1a1a] rounded-t-[28px] px-5 pb-10 pt-3">
          <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-[#444]" /></div>
          <p className="text-white text-[17px] text-center font-medium tracking-lemon mb-1">Autorizar débito</p>
          <p className="text-t-secondary text-[14px] text-center tracking-lemon mb-4">Vas a enviar</p>
          <div className="flex items-baseline justify-center gap-3 mb-5">
            <div className="self-center"><RoundFlag size={36} /></div>
            <span className="text-white text-[32px] font-bold tracking-tight leading-none">{amtParts.int}</span>
            <span className="text-t-secondary text-[20px] font-medium leading-none">ARS</span>
          </div>
          <div className="h-px bg-[#333] mb-4" />
          <div className="space-y-3.5 mb-4">
            <DetailRow label="Nombre" value={pull.recipientName} />
            <DetailRow label="Banco" value={pull.bankName} />
            <DetailRow label="CBU" value={pull.cbu} mono />
          </div>
          <p className="text-t-tertiary text-[13px] text-center tracking-lemon mb-5">Las transferencias en ARS no tienen costo.</p>

          {/* Slider */}
          <div className="relative h-[58px] rounded-full overflow-hidden select-none touch-none border border-[#d5d0c8]/30" style={{ background: "#f5f0e8" }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: Math.max(0, 1 - swipeX / 0.3) }}>
              <span className="text-[#555] text-[15px] font-medium tracking-lemon pl-8">Desliza para confirmar</span>
            </div>
            <div className="absolute top-[4px] w-[50px] h-[50px] rounded-full bg-black flex items-center justify-center pointer-events-none z-10"
              style={{ left: swipeX === 0 ? "4px" : `calc(${swipeX * 85}% + 4px)`, transition: swiping ? "none" : "left 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
              {swipeX > 0.7
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>}
            </div>
            <div className="absolute top-0 h-full w-24 z-20 touch-none cursor-grab active:cursor-grabbing"
              style={{ left: swipeX === 0 ? "0px" : `calc(${swipeX * 85}% - 16px)`, transition: swiping ? "none" : "left 0.3s cubic-bezier(0.16,1,0.3,1)" }}
              onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp} />
          </div>
          <button onClick={onReject} className="w-full pt-5">
            <span className="text-[#E24B4A] text-[14px] font-medium tracking-lemon">Rechazar solicitud</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   EXPIRED SHEET
   ================================================================ */
function ExpiredSheet({ pull, show, onBack }: { pull: Pull; show: boolean; onBack: () => void }) {
  return (
    <>
      <div className="absolute inset-0 z-40 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.7)", opacity: show ? 1 : 0 }} />
      <div className="absolute left-0 right-0 bottom-0 z-50 transition-transform duration-500"
        style={{ transform: show ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="bg-[#1a1a1a] rounded-t-[28px] px-5 pb-10 pt-3">
          <div className="flex justify-center mb-5"><div className="w-10 h-1 rounded-full bg-[#444]" /></div>
          <div className="flex justify-center mb-4">
            <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center" style={{ background: "rgba(239,159,39,0.12)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
          </div>
          <p className="text-white text-[18px] font-bold tracking-lemon mb-2 text-center">Esta solicitud expiró</p>
          <p className="text-t-secondary text-[14px] text-center leading-relaxed tracking-lemon mb-1.5">
            La solicitud de débito de <span className="text-white font-medium">{pull.bankName}</span> por <span className="text-white font-medium">${fmtARS(pull.amount)} ARS</span> ya no está disponible.
          </p>
          <p className="text-t-tertiary text-[13px] text-center tracking-lemon mb-6">No se debitó nada de tu cuenta.</p>
          <button onClick={onBack} className="w-full py-3.5 rounded-2xl font-medium text-[15px] tracking-lemon active:scale-[0.97] transition-transform text-black" style={{ background: "#00f068" }}>
            Volver al inicio
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   INSUFFICIENT FUNDS SHEET (code 20)
   ================================================================ */
function InsufficientSheet({ pull, show, onBack }: { pull: Pull; show: boolean; onBack: () => void }) {
  return (
    <>
      <div className="absolute inset-0 z-40 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.7)", opacity: show ? 1 : 0 }} />
      <div className="absolute left-0 right-0 bottom-0 z-50 transition-transform duration-500"
        style={{ transform: show ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="bg-[#1a1a1a] rounded-t-[28px] px-5 pb-10 pt-3">
          <div className="flex justify-center mb-5"><div className="w-10 h-1 rounded-full bg-[#444]" /></div>
          <div className="flex justify-center mb-4">
            <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center" style={{ background: "rgba(226,75,74,0.12)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            </div>
          </div>
          <p className="text-white text-[18px] font-bold tracking-lemon mb-2 text-center">Saldo insuficiente</p>
          <p className="text-t-secondary text-[14px] text-center leading-relaxed tracking-lemon mb-1.5">
            Tu cuenta en <span className="text-white font-medium">{pull.bankName}</span> no tiene fondos suficientes para cubrir el débito de <span className="text-white font-medium">${fmtARS(pull.amount)} ARS</span>.
          </p>
          <p className="text-t-tertiary text-[13px] text-center tracking-lemon mb-6">No se debitó nada de tu cuenta.</p>
          <button onClick={onBack} className="w-full py-3.5 rounded-2xl font-medium text-[15px] tracking-lemon active:scale-[0.97] transition-transform text-black" style={{ background: "#00f068" }}>
            Entendido
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   LOCK SCREEN
   ================================================================ */
function LockScreen({ showNotif, onTapNotif, pull }: { showNotif: boolean; onTapNotif: () => void; pull: Pull }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }));
      setDate(d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }));
    };
    tick(); const i = setInterval(tick, 1000); return () => clearInterval(i);
  }, []);

  return (
    <div className="h-full relative flex flex-col items-center" style={{ background: "linear-gradient(170deg, #1a1a2e 0%, #111122 30%, #0d0d1a 60%, #000 100%)" }}>
      <div className="w-full flex justify-between items-center px-8 pt-[52px] text-white/70 text-[13px] font-medium">
        <span>Personal</span>
        <div className="flex items-center gap-1.5"><SignalBars opacity={0.7} /><WifiIcon opacity={0.7} /><BatteryIcon /></div>
      </div>
      <p className="text-white/60 text-[17px] mt-5 tracking-wider font-medium">{date}</p>
      <p className="text-white text-[82px] font-bold tracking-tight leading-none mt-0">{time}</p>
      {showNotif && (
        <div className="absolute top-[230px] left-4 right-4 notif-enter cursor-pointer" onClick={onTapNotif}>
          <div className="rounded-[22px] p-[14px] border border-white/[0.08]"
            style={{ background: "rgba(30,30,30,0.75)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
            <div className="flex items-start gap-3">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-black flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                <span className="font-bold text-[18px]" style={{ color: "#00f068" }}>L</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-white/90 font-medium text-[14px] tracking-lemon">LEMON</span>
                  <span className="text-white/35 text-[12px]">ahora</span>
                </div>
                <p className="text-white font-medium text-[15px] leading-tight tracking-lemon">
                  {pull.bankName} quiere debitar ${fmtARS(pull.amount)} de tu cuenta
                </p>
                <p className="text-white/60 text-[14px] leading-snug mt-1 tracking-lemon">
                  Ingresá para autorizar o rechazar esta solicitud.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-10 left-0 right-0 flex justify-between px-12">
        <div className="w-[50px] h-[50px] rounded-full bg-white/[0.06] flex items-center justify-center">
          <svg width="20" height="22" viewBox="0 0 20 22" fill="white" opacity="0.4"><path d="M10 1L2 6v10l8 5 8-5V6l-8-5z"/></svg>
        </div>
        <div className="w-[50px] h-[50px] rounded-full bg-white/[0.06] flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
      </div>
      {showNotif && <p className="absolute bottom-[88px] text-white/25 text-[12px] tracking-lemon">Tocá la notificación</p>}
    </div>
  );
}

/* ================================================================
   BIOMETRIC
   ================================================================ */
function BiometricScreen() {
  return (
    <div className="h-full bg-black flex flex-col items-center justify-center fade-in">
      <div className="relative w-[120px] h-[120px] mb-8">
        {[0, 0.3, 0.6].map((d, i) => (
          <div key={i} className="absolute rounded-full border-2" style={{ inset: `${i * 12}px`, borderColor: `rgba(0,240,104,${0.3 + i * 0.2})`, animation: `pulse-ring 2s ease-in-out infinite ${d}s` }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00f068" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
            <circle cx="12" cy="11" r="3" /><path d="M12 14c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z" />
          </svg>
        </div>
      </div>
      <p className="text-white text-[17px] font-medium tracking-lemon">Verificando tu identidad</p>
      <p className="text-t-secondary text-[14px] mt-1.5 tracking-lemon">Mirá a la cámara para continuar</p>
    </div>
  );
}

/* ================================================================
   SUCCESS
   ================================================================ */
function SuccessScreen({ pull }: { pull: Pull }) {
  const newBal = pull.currentBalance + pull.amount;
  return (
    <div className="h-full bg-black flex flex-col items-center justify-center fade-in relative overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="absolute rounded-sm" style={{
          width: 5 + Math.random() * 7, height: 3 + Math.random() * 4,
          background: ["#00f068", "#00ca57", "#3ff48d", "#FBBF24", "#60A5FA"][i % 5],
          left: `${10 + Math.random() * 80}%`, top: "45%",
          animation: `confetti-burst ${0.8 + Math.random() * 0.6}s cubic-bezier(0.25,0.46,0.45,0.94) ${Math.random() * 0.3}s forwards`,
        }} />
      ))}
      <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-6 check-pop" style={{ background: "#00f068" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M9 16.5l5 5L23 11" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <p className="text-white text-[22px] font-bold tracking-lemon mb-2">Débito autorizado</p>
      <p className="text-t-secondary text-[14px] text-center px-8 mb-6 tracking-lemon">Se debitaron ${fmtARS(pull.amount)} de tu cuenta en {pull.bankName}</p>
      <div className="bg-[#1a1a1a] rounded-2xl px-6 py-4 text-center slide-up" style={{ animationDelay: "0.15s" }}>
        <p className="text-t-tertiary text-[11px] uppercase tracking-widest mb-1">Tu nuevo saldo en Lemon</p>
        <p className="text-[24px] font-bold" style={{ color: "#00f068" }}>${fmtARS(newBal)} ARS</p>
      </div>
    </div>
  );
}

/* ================================================================
   ACTIVITY — MOVIMIENTOS (reads from outcomes array)
   ================================================================ */
function ActivityMovScreen({ outcomes, onNotif }: { outcomes: Array<{ pull: Pull; result: string }>; onNotif: () => void }) {
  const today = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  const confirmed = outcomes.filter(o => o.result === "confirmed");

  return (
    <div className="h-full bg-black flex flex-col">
      <StatusBar /><ActivityNav />
      <Seg active="mov" onNotif={onNotif} onMov={() => {}} />
      <div className="flex-1 overflow-y-auto px-4">
        <p className="text-t-secondary text-[14px] font-medium mb-3 tracking-lemon">Hoy</p>

        {confirmed.map((o, i) => (
          <MovRow key={`c-${i}`} icon={<RoundFlag />}
            title={`Débito autorizado — ${o.pull.bankName}`}
            sub={today} amount={`+ ${fmtARS(o.pull.amount)}`} suffix=" ARS" positive highlight />
        ))}

        <MovRow icon={<RoundFlag />} title="Retiro de ARS" sub={today} amount="- 13.000,00" suffix=" ARS" />
        <MovRow icon={<RoundFlag />} title="Rendimientos" sub={today} amount="+ 172,80 ARS" sub2="20.48%" positive />
        <MovRow icon={<CIcon c="#2775ca" l="$" />} title="Ganancias diarias" sub={today} amount="+ 0,03 USDC" sub2="≈ 35,72 ARS" positive />
        <MovRow icon={<CIcon c="#26a17b" l="₮" />} title="Ganancias diarias" sub={today} amount="+ 0,10 USDT" sub2="≈ 141,73 ARS" positive />
        <p className="text-t-secondary text-[14px] font-medium mb-3 mt-5 tracking-lemon">Anteriores</p>
        <MovRow icon={<RoundFlag />} title="Rendimientos" sub="25 de marzo" amount="+ 482,83 ARS" sub2="20.12%" positive />
      </div>
    </div>
  );
}

/* ================================================================
   ACTIVITY — NOTIFICACIONES (reads from outcomes array)
   ================================================================ */
function ActivityNotifScreen({ outcomes, onMov }: { outcomes: Array<{ pull: Pull; result: string }>; onMov: () => void }) {
  const rejected = outcomes.filter(o => o.result === "rejected");
  const insufficient = outcomes.filter(o => o.result === "insufficient");
  const hasNotifs = rejected.length > 0 || insufficient.length > 0;

  return (
    <div className="h-full bg-black flex flex-col">
      <StatusBar /><ActivityNav />
      <Seg active="notif" onNotif={() => {}} onMov={onMov} />
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        <Chip label="Todos" active />
        <Chip label="Amigos" />
        <Chip label="Mercado" />
        <Chip label="Mi cuenta" />
        <Chip label="Beneficios" />
      </div>

      <div className="flex-1 px-4 space-y-3">
        {rejected.map((o, i) => (
          <NotifCard key={`r-${i}`} type="rejected" pull={o.pull} />
        ))}
        {insufficient.map((o, i) => (
          <NotifCard key={`i-${i}`} type="insufficient" pull={o.pull} />
        ))}
        {!hasNotifs && (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4"><BellIcon color="#666" /></div>
            <p className="text-white font-medium text-[16px] tracking-lemon mb-1">No hay notificaciones todavía</p>
            <p className="text-t-secondary text-[13px] text-center px-8 tracking-lemon">Acá vas a poder encontrar información acerca de tus monedas favoritas, amigos y promociones.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotifCard({ type, pull }: { type: "rejected" | "insufficient"; pull: Pull }) {
  const isRejected = type === "rejected";
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: isRejected ? "rgba(226,75,74,0.12)" : "rgba(226,75,74,0.12)" }}>
          {isRejected
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          }
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white font-medium text-[14px] tracking-lemon">
              {isRejected ? "Transferencia Pull rechazada" : "Saldo insuficiente"}
            </span>
            <span className="text-t-tertiary text-[12px]">ahora</span>
          </div>
          <p className="text-t-secondary text-[13px] leading-snug tracking-lemon">
            {isRejected
              ? <>Rechazaste la solicitud de débito de <span className="text-white">{pull.bankName}</span> por <span className="text-white">${fmtARS(pull.amount)} ARS</span>. No se debitó nada de tu cuenta.</>
              : <>Tu cuenta en <span className="text-white">{pull.bankName}</span> no tiene fondos suficientes para el débito de <span className="text-white">${fmtARS(pull.amount)} ARS</span>. No se realizó la operación.</>
            }
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SHARED
   ================================================================ */
function StatusBar() {
  const [t, setT] = useState("");
  useEffect(() => { const f = () => setT(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })); f(); const i = setInterval(f, 1000); return () => clearInterval(i); }, []);
  return <div className="flex justify-between items-center px-6 text-white text-[13px] font-medium" style={{ paddingTop: 52, paddingBottom: 4 }}><span>{t}</span><div className="flex items-center gap-1.5"><SignalBars /><WifiIcon /><BatteryIcon /></div></div>;
}
function ActivityNav() {
  return <div className="flex items-center justify-between px-4 py-2"><BackBtn /><span className="text-white font-medium text-[17px] tracking-lemon">Actividad</span><C40><GearIcon /></C40></div>;
}
function Seg({ active, onNotif, onMov }: { active: "notif" | "mov"; onNotif: () => void; onMov: () => void }) {
  return (
    <div className="mx-4 mt-2 mb-4 flex bg-[#1a1a1a] rounded-xl p-[3px]">
      <button onClick={onNotif} className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-medium tracking-lemon ${active === "notif" ? "bg-[#333] text-white" : "text-t-secondary"}`}>Notificaciones</button>
      <button onClick={onMov} className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-medium tracking-lemon ${active === "mov" ? "bg-[#333] text-white" : "text-t-secondary"}`}>Movimientos</button>
    </div>
  );
}
function BackBtn({ onClick }: { onClick?: () => void }) {
  return <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center cursor-pointer active:scale-95 transition-transform" onClick={onClick}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></div>;
}
function C40({ children }: { children: React.ReactNode }) { return <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">{children}</div>; }
function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return <div className="flex justify-between items-center"><span className="text-white text-[15px] font-medium tracking-lemon">{label}</span><span className={`text-[14px] tracking-lemon text-right max-w-[60%] text-t-secondary ${mono ? "font-mono text-[13px]" : "font-medium"}`}>{value}</span></div>;
}
function MovRow({ icon, title, sub, amount, suffix, sub2, positive, highlight }: {
  icon: React.ReactNode; title: string; sub: string; amount: string; suffix?: string; sub2?: string; positive?: boolean; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-3.5 ${highlight ? "slide-up" : ""}`}>
      <div className="w-[44px] h-[44px] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0"><p className="text-[15px] font-medium tracking-lemon" style={{ color: highlight ? "#00f068" : "#fff" }}>{title}</p><p className="text-t-tertiary text-[13px] tracking-lemon">{sub}</p></div>
      <div className="text-right flex-shrink-0"><p className="text-[14px] font-medium tracking-lemon" style={{ color: positive ? "#00f068" : "#fff" }}>{amount}{suffix || ""}</p>{sub2 && <p className="text-t-tertiary text-[12px] tracking-lemon">{sub2}</p>}</div>
    </div>
  );
}
function Chip({ label, active }: { label: string; active?: boolean }) {
  return <button className={`px-4 py-2 rounded-full text-[13px] font-medium tracking-lemon whitespace-nowrap flex-shrink-0 border ${active ? "" : "border-[#444] text-t-secondary"}`} style={active ? { borderColor: "#00f068", color: "#00f068" } : {}}>{label}</button>;
}
function TabBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-[#1a1a1a] px-2 pb-7 pt-2 flex justify-around z-30">
      <TI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>} label="Inicio" active />
      <TI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} label="Crypto" />
      <div className="flex flex-col items-center"><div className="w-[52px] h-[52px] rounded-full flex items-center justify-center -mt-5 border-2 border-[#1a1a1a]" style={{ background: "#00f068" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4v4H7zM13 7h4v4h-4zM7 13h4v4H7z"/></svg></div></div>
      <TI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>} label="Mini-Apps" />
      <TI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>} label="Tarjeta" />
    </div>
  );
}
function TI({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return <div className="flex flex-col items-center gap-0.5 min-w-[48px]">{icon}{label && <span className={`text-[10px] tracking-lemon ${active ? "text-white" : "text-[#666]"}`}>{label}</span>}</div>;
}
function ActionBtn({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return <div className="flex flex-col items-center gap-1.5"><div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center ${active ? "" : "bg-[#333]"}`} style={active ? { background: "#00f068" } : {}}>{icon}</div><span className="text-[11px] font-medium tracking-wider text-t-secondary">{label}</span></div>;
}
function RoundFlag({ size = 44 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 44 44"><clipPath id="rf"><circle cx="22" cy="22" r="22"/></clipPath><g clipPath="url(#rf)"><rect width="44" height="44" fill="#338AF3"/><rect y="0" width="44" height="15" fill="#fff"/><rect y="29" width="44" height="15" fill="#fff"/><circle cx="22" cy="22" r="5" fill="#FFDA44"/></g></svg>;
}
function CIcon({ c, l }: { c: string; l: string }) { return <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center" style={{ background: c }}><span className="text-white text-[18px] font-bold">{l}</span></div>; }
function BellIcon({ color = "currentColor" }: { color?: string }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function GearIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function RestartIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>; }
function ArrowDown() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>; }
function ArrowUp() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>; }
function RefreshSvg() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>; }
function SignalBars({ opacity = 1 }: { opacity?: number }) { return <div className="flex items-end gap-[2px]" style={{ opacity }}><div className="w-[3px] h-[4px] bg-white rounded-[1px]"/><div className="w-[3px] h-[6px] bg-white rounded-[1px]"/><div className="w-[3px] h-[8px] bg-white rounded-[1px]"/><div className="w-[3px] h-[10px] bg-white rounded-[1px]"/></div>; }
function WifiIcon({ opacity = 1 }: { opacity?: number }) { return <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity={opacity}><path d="M1 4C2.7 2.2 4.7 1 7 1s4.3 1.2 6 3"/><path d="M3.5 7C4.4 6 5.6 5.3 7 5.3s2.6.7 3.5 1.7"/><circle cx="7" cy="9.5" r="1" fill="white" stroke="none"/></svg>; }
function BatteryIcon() { return <div className="w-[24px] h-[12px] border border-white/50 rounded-[3px] p-[1.5px]"><div className="h-full w-[60%] bg-white rounded-[1.5px]"/></div>; }
