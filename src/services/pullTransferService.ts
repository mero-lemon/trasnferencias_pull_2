import {
  PullTransferRequest,
  PullTransferResponse,
  BiometricResult,
} from "@/types/pullTransfer.types";

// Simulated delay
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Mock: incoming pull transfer request
export function getMockPullRequest(): PullTransferRequest {
  return {
    id: "pull_" + Math.random().toString(36).slice(2, 10),
    entity: {
      name: "Banco Galicia",
      shortName: "BG",
      cbuMasked: "****4521",
      brandColor: "#1a3a5c",
    },
    amount: 45000,
    concept: "Fondeo cuenta propia",
    destinationCvu: "****8823",
    holderVerified: true,
    currentBalance: 232340.5,
    expiresAt: Date.now() + 30_000,
    createdAt: Date.now(),
  };
}

// Mock: authorize the pull transfer
export async function authorizePullTransfer(
  requestId: string,
  bioToken: string
): Promise<PullTransferResponse> {
  await delay(800 + Math.random() * 600);

  // 85% success, 10% error_balance, 5% timeout for demo
  const roll = Math.random();
  if (roll < 0.85) {
    return { code: "00", message: "Débito autorizado exitosamente", newBalance: 187340.5, transactionId: "txn_" + Date.now() };
  } else if (roll < 0.95) {
    return { code: "20", message: "Saldo insuficiente en cuenta origen" };
  } else {
    return { code: "95", message: "La solicitud expiró" };
  }
}

// Mock: biometric authentication
export async function authenticateBiometric(): Promise<BiometricResult> {
  await delay(1200 + Math.random() * 800);

  // 95% success for demo
  if (Math.random() < 0.95) {
    return { success: true, method: "face_id", token: "bio_" + Date.now() };
  }
  return { success: false, method: "face_id", error: "Verificación fallida" };
}
