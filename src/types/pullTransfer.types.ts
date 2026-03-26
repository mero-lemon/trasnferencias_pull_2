export type PullTransferState =
  | "idle"
  | "modal_visible"
  | "loading_biometrics"
  | "success"
  | "error_balance"
  | "timeout";

export type ResponseCode = "00" | "20" | "95";

export interface RequestingEntity {
  name: string;
  shortName: string; // 2-letter abbreviation for avatar
  cbuMasked: string; // e.g. "****4521"
  logoUrl?: string;
  brandColor?: string; // gradient color for avatar fallback
}

export interface PullTransferRequest {
  id: string;
  entity: RequestingEntity;
  amount: number;
  concept: string;
  destinationCvu: string;
  holderVerified: boolean;
  currentBalance: number;
  expiresAt: number; // unix timestamp
  createdAt: number;
}

export interface PullTransferResponse {
  code: ResponseCode;
  message: string;
  newBalance?: number;
  transactionId?: string;
}

export interface BiometricResult {
  success: boolean;
  method: "face_id" | "touch_id" | "pin_fallback";
  token?: string;
  error?: string;
}

export const RESPONSE_CODES: Record<ResponseCode, { state: PullTransferState; label: string }> = {
  "00": { state: "success", label: "Débito autorizado" },
  "20": { state: "error_balance", label: "Saldo insuficiente" },
  "95": { state: "timeout", label: "Solicitud expirada" },
};

export const TIMEOUT_SECONDS = 30;
export const SWIPE_THRESHOLD = 0.75; // 75% of track width
export const MAX_DAILY_PULLS = 5;
