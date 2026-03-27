# Lemon · Transferencias Pull — Prototipo v2

Flujo completo: Home → iOS Lock Screen + Push → Modal de autorización → Biometría → Success → Actividad → Notificaciones

## Setup

```bash
npm install
npm run dev
```

## Deploy en Vercel

Push a GitHub → Import en vercel.com/new → Deploy.

## Flujo

1. **Home**: Botón "Simular solicitud pull"
2. **Lock screen**: iOS bloqueado, llega push de Brubank por $500.000
3. **Modal**: Información pre-cargada con swipe para confirmar (estilo real de Lemon)
4. **Biometría**: Animación de escaneo facial
5. **Success**: Confirmación con confetti y nuevo saldo
6. **Actividad > Movimientos**: Lista con la transferencia nueva destacada en verde
7. **Actividad > Notificaciones**: Registro de un intento fallido (código 20)

## Design System

- Font: Satoshi (Bold, Medium, Regular)
- Brand green: #00f068
- Background: #000000
- Card: #1a1a1a
- Letter spacing: 1.5%
