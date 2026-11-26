export const requestStatusLabels = {
  submitted: "ส่งคำขอแล้ว",
  reviewing: "ทีมกำลังตรวจคำขอ",
  contacted: "ทีมติดต่อแล้ว",
  cancelled: "ยกเลิกแล้ว",
} as const;

export type RequestStatus = keyof typeof requestStatusLabels;
export type RequestIntent = "availability_check" | "next_round_interest";
export type InvestmentRequest = {
  id: string;
  project: "house" | "boxing";
  intent: RequestIntent;
  share: number;
  amount: number;
  name: string;
  phone: string;
  status: RequestStatus;
  created: string;
  updated: string;
};

export function normalizedRequestPhone(input: string): string | null {
  if (input.length > 64) return null;
  const phone = input.trim().replace(/[\s().-]/g, "");
  return /^\+?\d{8,15}$/.test(phone) ? phone : null;
}
