# Lemon · Transferencias Pull — Fase 1 Receptor

Prototipo interactivo del flujo de autorización de débitos pull (BCRA Com. A 7514/7996).

## Quick Start

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

1. Pusheá este repo a GitHub
2. Conectá el repo en [vercel.com/new](https://vercel.com/new)
3. Vercel detecta Next.js automáticamente — click **Deploy**

No requiere variables de entorno para el prototipo.

## Estructura

```
src/
  app/                          # Next.js App Router
    layout.tsx                  # Root layout + metadata
    page.tsx                    # Demo harness con device frame
    globals.css                 # Tailwind + Lemon tokens
  components/pull-transfer/     # Feature components
    PullAuthorizationModal.tsx  # Orquestador principal
    SecurityBadge.tsx           # Badge "conexión segura"
    EntityHeader.tsx            # Banco solicitante
    AmountDisplay.tsx           # Monto prominente
    TransactionDetails.tsx      # Card con detalles
    ProjectedBalance.tsx        # Saldo actual → posterior
    SwipeToConfirm.tsx          # Gesto de fricción positiva
    BiometricOverlay.tsx        # Animación escaneo bio
    SuccessView.tsx             # Estado exitoso + confetti
    ErrorView.tsx               # Error saldo / timeout
  hooks/
    usePullTransfer.ts          # State machine principal
    useSwipeGesture.ts          # Lógica del gesto swipe
  services/
    pullTransferService.ts      # Mock API + biometría
  types/
    pullTransfer.types.ts       # Tipos, constantes, códigos
  lib/
    format.ts                   # Formateo ARS
```

## Estados de la UI

| Estado | Código | Trigger |
|--------|--------|---------|
| `idle` | — | Sin solicitudes |
| `modal_visible` | — | Push recibida |
| `loading_biometrics` | — | Swipe completado |
| `success` | 00 | Bio OK + API OK |
| `error_balance` | 20 | Saldo insuficiente |
| `timeout` | 95 | 30s sin respuesta |

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** con tokens custom de Lemon
- **Lucide React** para iconografía
- **Framer Motion** (disponible para animaciones futuras)

## Normativa

- BCRA Com. A 7514 — Transferencias pull entre cuentas propias
- BCRA Com. A 7996 — Consentimiento oAuth2 / tácito
- BCRA Com. A 8030 — Exclusiones y eliminación de aranceles
