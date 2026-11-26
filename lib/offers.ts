export const offers = {
  house: {
    name: "Human Allowed Rimping",
    fullPrice: 1_712_000,
    unitPrice: 171_200,
  },
  boxing: {
    name: "DEAL! Boxing",
    fullPrice: 350_000,
    unitPrice: 35_000,
  },
} as const;

export type OfferId = keyof typeof offers;

export function boxingShareLabel(share: number) {
  return share === 100 ? "100% (ทั้งตู้)" : share + "% ของตู้";
}

export function isOfferId(value: unknown): value is OfferId {
  return value === "house" || value === "boxing";
}

export function validOfferShare(id: OfferId, share: unknown): share is number {
  if (!isOfferId(id) || typeof share !== "number" || !Number.isFinite(share) || share < 10 || share > 100) return false;
  return share === Math.round(share * 100) / 100;
}

export function offerAmount(id: OfferId, share: number) {
  if (!validOfferShare(id, share)) throw new RangeError("สัดส่วนไม่อยู่ในช่วงที่โครงการกำหนด");
  const hundredthsOfPercent = Math.round(share * 100);
  const satang = Math.round(offers[id].fullPrice * hundredthsOfPercent / 100);
  return satang / 100;
}
