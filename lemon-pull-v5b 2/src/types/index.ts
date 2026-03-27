export type Screen =
  | "home"
  | "lockscreen"
  | "modal"
  | "biometric"
  | "success"
  | "activity"
  | "notifications";

export interface PullRequest {
  id: string;
  bankName: string;
  bankShort: string;
  amount: number;
  concept: string;
  cbu: string;
  recipientName: string;
  destinationCvu: string;
  currentBalance: number;
  timestamp: number;
}
