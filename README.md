# Lemon · Transferencias Pull — Prototipo interactivo

Prototipo funcional del flujo de autorización de débitos pull para el rol receptor, bajo normativa BCRA (Com. A 7514 / 7996).

## Setup

```bash
npm install
npm run dev
```

## Deploy en Vercel

Push a GitHub → Import en [vercel.com/new](https://vercel.com/new) → Framework: Next.js → Deploy.

## Flujo de la experiencia

El prototipo simula el ciclo completo de una transferencia pull entrante:

1. **Home de Lemon** — Réplica de la home real con balance, acciones rápidas y tab bar
2. **Lock screen iOS** — Llega una push notification de Lemon: *"Brubank quiere debitar $500.000 de tu cuenta"*
3. **Verificación biométrica** — Al entrar a la app se valida la identidad del usuario (FaceID/TouchID)
4. **Popup de autorización** — Bottom sheet sobre la home con los datos de la operación: titular, banco, CBU y monto. El usuario puede:
   - **Deslizar para confirmar** → autoriza el débito
   - **Rechazar solicitud** → cancela la operación
5. **Resultado:**
   - Si confirma → pantalla de éxito con confetti → Actividad > Movimientos (nueva línea "Retiro de ARS - Transferencia pull")
   - Si rechaza → Actividad > Notificaciones (card "Transferencia Pull rechazada")

## Flujos bifurcados

```
Push → Bio → Home + Sheet
                  ├── Swipe → Success → Actividad/Movimientos
                  └── Rechazar → Actividad/Notificaciones
```

## Design system

| Token | Valor | Uso |
|-------|-------|-----|
| Font | Satoshi | Toda la app |
| Brand green | `#00f068` | CTAs, acentos, éxito |
| Background | `#000000` | Fondo principal |
| Card | `#1a1a1a` | Surfaces, sheets |
| Elevated | `#2a2a2a` / `#333` | Bordes, chips |
| Text primary | `#FFFFFF` | Títulos, montos |
| Text secondary | `#999999` | Labels |
| Text tertiary | `#666666` | Hints |
| Error | `#E24B4A` | Rechazos |
| Letter spacing | 1.5% | Global |

## Slider de confirmación

Réplica del componente real de Lemon:
- Forma pill (fully rounded)
- Fondo crema `#f5f0e8`
- Thumb negro circular con chevron blanco
- Sin fill de color al deslizar
- Threshold: 70% del recorrido para confirmar

## Wordings

Los textos fueron revisados para cumplir con:
- **No usar "DEBIN" ni "CREDIN"** en la interfaz (requisito Com. A 7996)
- Claridad sobre quién debita y desde dónde
- Confirmación explícita de que no se movieron fondos al rechazar
- Voseo consistente con el tono de Lemon

## Códigos de respuesta (COELSA)

| Código | Estado en la UI | Descripción |
|--------|----------------|-------------|
| 00 | Success | Débito autorizado |
| 10 | Rejected | Rechazado por el usuario |
| 20 | Error_Balance | Sin saldo suficiente |
| 30 | Error_Account | Cuenta inválida |
| 95 | Timeout | Sin respuesta en tiempo |

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS con tokens de Lemon
- Zero dependencias externas de UI

## Normativa

- BCRA Com. A 7514 — Transferencias pull entre cuentas propias
- BCRA Com. A 7996 — Consentimiento tácito/explícito (oAuth2)
- BCRA Com. A 8030 — Exclusiones y eliminación de aranceles
