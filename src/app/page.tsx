"use client";

import { useState, useEffect, useCallback } from "react";
import { fmtARS, fmtParts } from "@/lib/format";

type Screen = "home" | "lockscreen" | "biometric" | "modal" | "success" | "activity_mov" | "activity_notif";

interface Pull {
  bankName: string;
  amount: number;
  concept: string;
  cbu: string;
  recipientName: string;
  currentBalance: number;
}

const PULL: Pull = {
  bankName: "Brubank",
  amount: 500000,
  concept: "Fondeo cuenta propia",
  cbu: "1430001713001150420010",
  recipientName: "Jeronimo Campero",
  currentBalance: 265215.22,
};

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [showNotif, setShowNotif] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [outcome, setOutcome] = useState<"confirmed" | "rejected" | null>(null);

  const startFlow = useCallback(() => {
    setScreen("lockscreen");
    setShowNotif(false);
    setShowSheet(false);
    setOutcome(null);
    setTimeout(() => setShowNotif(true), 1500);
  }, []);

  const tapNotif = useCallback(() => {
    setShowNotif(false);
    setScreen("biometric");
    // After bio → show home with popup
    setTimeout(() => {
      setScreen("modal");
      setTimeout(() => setShowSheet(true), 400);
    }, 2200);
  }, []);

  const handleConfirm = useCallback(() => {
    setOutcome("confirmed");
    setShowSheet(false);
    setScreen("success");
    setTimeout(() => setScreen("activity_mov"), 2800);
  }, []);

  const handleReject = useCallback(() => {
    setOutcome("rejected");
    setShowSheet(false);
    setScreen("activity_notif");
  }, []);

  const restart = useCallback(() => {
    setScreen("home");
    setShowNotif(false);
    setShowSheet(false);
    setOutcome(null);
  }, []);

  const isIdle = screen === "home" && !outcome;
  const showRestart = screen === "activity_mov" || screen === "activity_notif";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 p-4 gap-5">
      {/* External CTA — OUTSIDE device */}
      {isIdle && (
        <button onClick={startFlow}
          className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-medium text-[15px] tracking-lemon active:scale-[0.97] transition-transform"
          style={{ background: "#00f068", color: "#000" }}>
          <BellIcon color="black" /> Simular solicitud pull
        </button>
      )}

      {/* Device frame */}
      <div className="w-[393px] h-[852px] bg-black rounded-[55px] border-[3px] border-[#333] overflow-hidden relative shadow-2xl shadow-black/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-b-[20px] z-[70]" />

        {(screen === "home" || screen === "modal") && <HomeContent pull={PULL} />}
        {screen === "modal" && <SheetOverlay show={showSheet} pull={PULL} onConfirm={handleConfirm} onReject={handleReject} />}
        {screen === "lockscreen" && <LockScreen showNotif={showNotif} onTapNotif={tapNotif} pull={PULL} />}
        {screen === "biometric" && <BiometricScreen />}
        {screen === "success" && <SuccessScreen pull={PULL} />}
        {screen === "activity_mov" && <ActivityMovScreen pull={PULL} onNotif={() => setScreen("activity_notif")} outcome={outcome} />}
        {screen === "activity_notif" && <ActivityNotifScreen pull={PULL} onMov={() => setScreen("activity_mov")} outcome={outcome} />}

        <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/20 rounded-full z-[60]" />
      </div>

      {/* External restart — OUTSIDE device */}
      {showRestart && (
        <button onClick={restart}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-[#444] text-[#999] text-[14px] font-medium tracking-lemon active:scale-[0.97] transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          Reiniciar experiencia
        </button>
      )}
    </div>
  );
}

/* ================================================================
   HOME CONTENT — always rendered as background for modal overlay
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
   SHEET OVERLAY — popup over darkened home
   ================================================================ */
function SheetOverlay({ show, pull, onConfirm, onReject }: {
  show: boolean; pull: Pull; onConfirm: () => void; onReject: () => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const amtParts = fmtParts(pull.amount);

  const handleDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSwiping(true);
    setStartX(e.clientX);
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
      {/* Darkened backdrop */}
      <div className="absolute inset-0 z-40 transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.7)", opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none" }}
        onClick={onReject} />

      {/* Bottom sheet */}
      <div className="absolute left-0 right-0 bottom-0 z-50 transition-transform duration-500"
        style={{
          transform: show ? "translateY(0)" : "translateY(100%)",
          transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
        }}>
        <div className="bg-[#1a1a1a] rounded-t-[28px] px-5 pb-10 pt-3">
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-[#444]" />
          </div>

          <p className="text-white text-[17px] text-center font-medium tracking-lemon mb-1">Confirmar transferencia pull</p>
          <p className="text-t-secondary text-[14px] text-center tracking-lemon mb-4">Vas a enviar</p>

          {/* Amount with round flag */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <clipPath id="flagClip"><circle cx="18" cy="18" r="18"/></clipPath>
                <g clipPath="url(#flagClip)">
                  <rect width="36" height="36" fill="#338AF3"/>
                  <rect y="0" width="36" height="12" fill="#fff"/>
                  <rect y="24" width="36" height="12" fill="#fff"/>
                  <circle cx="18" cy="18" r="4.5" fill="#FFDA44"/>
                </g>
              </svg>
            </div>
            <span className="text-white text-[32px] font-bold tracking-tight">{amtParts.int}</span>
            <span className="text-t-secondary text-[18px] font-medium">ARS</span>
          </div>

          <div className="h-px bg-[#333] mb-4" />

          {/* Details */}
          <div className="space-y-3.5 mb-4">
            <DetailRow label="Nombre" value={pull.recipientName} />
            <DetailRow label="Banco" value={pull.bankName} />
            <DetailRow label="CBU" value={pull.cbu} mono />
          </div>

          <p className="text-t-tertiary text-[13px] text-center tracking-lemon mb-5">
            Las transferencias en ARS no tienen costo.
          </p>

          {/* Swipe — NO green fill, more rounded */}
          <div className="h-[58px] rounded-[20px] relative overflow-hidden select-none touch-none" style={{ background: "#f5f0e8" }}>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: Math.max(0, 1 - swipeX / 0.3) }}>
              <span className="text-[#555] text-[15px] font-medium tracking-lemon ml-8">Desliza para confirmar</span>
            </div>

            {/* Thumb — black circle, no green fill behind it */}
            <div className="absolute top-[7px] w-[44px] h-[44px] bg-black rounded-full flex items-center justify-center pointer-events-none z-10"
              style={{
                left: `calc(${7 + swipeX * 83}% )`,
                transition: swiping ? "none" : "left 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}>
              {swipeX > 0.7
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              }
            </div>

            {/* Touch target */}
            <div className="absolute top-0 h-full w-20 z-20 touch-none cursor-grab active:cursor-grabbing"
              style={{
                left: `calc(${7 + swipeX * 83}% - 16px)`,
                transition: swiping ? "none" : "left 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}
              onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp} />
          </div>

          {/* Reject link */}
          <button onClick={onReject} className="w-full pt-5">
            <span className="text-[#E24B4A] text-[14px] font-medium tracking-lemon">Rechazar solicitud</span>
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
                <p className="text-white font-medium text-[15px] leading-tight tracking-lemon">🔒 Solicitud de débito pendiente</p>
                <p className="text-white/60 text-[14px] leading-snug mt-1 tracking-lemon">
                  {pull.bankName} solicita ${fmtARS(pull.amount)} desde tu cuenta. Tenés 30s para autorizar.
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
      <p className="text-t-secondary text-[14px] text-center px-10 mb-6 tracking-lemon">${fmtARS(pull.amount)} ARS se acreditarán en tu cuenta Lemon</p>
      <div className="bg-[#1a1a1a] rounded-2xl px-6 py-4 text-center slide-up" style={{ animationDelay: "0.15s" }}>
        <p className="text-t-tertiary text-[11px] uppercase tracking-widest mb-1">Tu nuevo saldo</p>
        <p className="text-[24px] font-bold" style={{ color: "#00f068" }}>${fmtARS(newBal)} ARS</p>
      </div>
    </div>
  );
}

/* ================================================================
   ACTIVITY — MOVIMIENTOS
   ================================================================ */
function ActivityMovScreen({ pull, onNotif, outcome }: { pull: Pull; onNotif: () => void; outcome: "confirmed" | "rejected" | null }) {
  const today = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  return (
    <div className="h-full bg-black flex flex-col">
      <StatusBar /><ActivityNav />
      <Seg active="mov" onNotif={onNotif} onMov={() => {}} />
      <div className="flex-1 overflow-y-auto px-4">
        <p className="text-t-secondary text-[14px] font-medium mb-3 tracking-lemon">Hoy</p>
        {outcome === "confirmed" && <MovRow icon={<RoundFlag />} title="Retiro de ARS - Transferencia pull" sub={today} amount={`+ ${fmtARS(pull.amount)}`} suffix=" ARS" positive highlight />}
        <MovRow icon={<RoundFlag />} title="Retiro de ARS" sub={today} amount="- 13.000,00" suffix=" ARS" />
        <MovRow icon={<RoundFlag />} title="Rendimientos" sub={today} amount="+ 172,80 ARS" sub2="20.48%" positive />
        <MovRow icon={<CIcon c="#2775ca" l="$" />} title="Ganancias diarias" sub={today} amount="+ 0,03 USDC" sub2="≈ 35,72 ARS" positive />
        <MovRow icon={<CIcon c="#26a17b" l="₮" />} title="Ganancias diarias" sub={today} amount="+ 0,10 USDT" sub2="≈ 141,73 ARS" positive />
        <p className="text-t-secondary text-[14px] font-medium mb-3 mt-5 tracking-lemon">Anteriores</p>
        <MovRow icon={<RoundFlag />} title="Rendimientos" sub="25 de marzo" amount="+ 482,83 ARS" sub2="20.12%" positive />
        <MovRow icon={<CIcon c="#2775ca" l="$" />} title="Ganancias diarias" sub="25 de marzo" amount="+ 0,03 USDC" sub2="≈ 35,72 ARS" positive />
      </div>
    </div>
  );
}

/* ================================================================
   ACTIVITY — NOTIFICACIONES
   ================================================================ */
function ActivityNotifScreen({ pull, onMov, outcome }: { pull: Pull; onMov: () => void; outcome: "confirmed" | "rejected" | null }) {
  return (
    <div className="h-full bg-black flex flex-col">
      <StatusBar /><ActivityNav />
      <Seg active="notif" onNotif={() => {}} onMov={onMov} />

      {/* Chips — fixed overflow */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
        <Chip label="Todos" active />
        <Chip label="Amigos" />
        <Chip label="Mercado" />
        <Chip label="Mi cuenta" />
        <Chip label="Beneficios" />
      </div>

      <div className="flex-1 px-4">
        {outcome === "rejected" && (
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] slide-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E24B4A]/15 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium text-[14px] tracking-lemon">Transferencia Pull rechazada</span>
                  <span className="text-t-tertiary text-[12px]">ahora</span>
                </div>
                <p className="text-t-secondary text-[13px] leading-snug tracking-lemon">
                  Rechazaste la solicitud de débito de <span className="text-white">{pull.bankName}</span> por <span className="text-white">${fmtARS(pull.amount)} ARS</span>. No se debitó nada de tu cuenta.
                </p>
              </div>
            </div>
          </div>
        )}

        {outcome === "confirmed" && (
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] slide-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,240,104,0.12)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f068" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l3 3 5-6"/></svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium text-[14px] tracking-lemon">Transferencia Pull exitosa</span>
                  <span className="text-t-tertiary text-[12px]">ahora</span>
                </div>
                <p className="text-t-secondary text-[13px] leading-snug tracking-lemon">
                  Recibiste <span style={{ color: "#00f068" }}>${fmtARS(pull.amount)} ARS</span> desde <span className="text-white">{pull.bankName}</span> en tu cuenta Lemon.
                </p>
              </div>
            </div>
          </div>
        )}

        {!outcome && (
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

function C40({ children }: { children: React.ReactNode }) {
  return <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">{children}</div>;
}

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

function CIcon({ c, l }: { c: string; l: string }) {
  return <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center" style={{ background: c }}><span className="text-white text-[18px] font-bold">{l}</span></div>;
}

function BellIcon({ color = "currentColor" }: { color?: string }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function GearIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function ArrowDown() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>; }
function ArrowUp() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>; }
function RefreshSvg() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>; }
function SignalBars({ opacity = 1 }: { opacity?: number }) { return <div className="flex items-end gap-[2px]" style={{ opacity }}><div className="w-[3px] h-[4px] bg-white rounded-[1px]"/><div className="w-[3px] h-[6px] bg-white rounded-[1px]"/><div className="w-[3px] h-[8px] bg-white rounded-[1px]"/><div className="w-[3px] h-[10px] bg-white rounded-[1px]"/></div>; }
function WifiIcon({ opacity = 1 }: { opacity?: number }) { return <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity={opacity}><path d="M1 4C2.7 2.2 4.7 1 7 1s4.3 1.2 6 3"/><path d="M3.5 7C4.4 6 5.6 5.3 7 5.3s2.6.7 3.5 1.7"/><circle cx="7" cy="9.5" r="1" fill="white" stroke="none"/></svg>; }
function BatteryIcon() { return <div className="w-[24px] h-[12px] border border-white/50 rounded-[3px] p-[1.5px]"><div className="h-full w-[60%] bg-white rounded-[1.5px]"/></div>; }
