export const projects = [
  {
    id: "house",
    type: "บ้านพัก",
    name: "Human Allowed",
    image: "/media/house.webp",
    alt: "ภาพประกอบบ้าน Human Allowed ริมแม่น้ำปิง",
    category: "REAL ESTATE",
    unitPrice: 100000,
    asset: "บ้านพัก 1 หลัง",
    source: "ค่าเข้าพักรายวัน",
    shareScope: "สิทธิร่วมในตัวบ้านบนที่ดินเช่า",
    shareBasis: "คิดส่วนแบ่งจากยอดสุทธิของชั้นที่ระบุในสัญญา",
    location: "บ้านพักรายวัน",
  },
  {
    id: "boxing",
    type: "ตู้ชกมวย",
    name: "DEAL! Boxing",
    image: "/media/boxing.webp",
    alt: "ตู้ชกมวยอาร์เคดของ DEAL!",
    category: "ARCADE",
    unitPrice: 35000,
    asset: "ตู้ชกมวย 1 ตู้",
    source: "ค่าเล่นตู้ชกมวย",
    shareScope: "สิทธิร่วมในตู้ชกมวยหนึ่งตู้",
    shareBasis: "คิดส่วนแบ่งจากยอดสุทธิของตู้ที่ระบุในสัญญา",
    location: "เครื่องเล่นอาร์เคด",
  },
] as const;
export type Project = (typeof import("./project-data").projectDetails)[number];
export const stages = {
  draft: ["รอลงนาม", "ลูกค้า"],
  payment: ["รอแจ้งชำระ", "ลูกค้า"],
  review: ["รอตรวจยอด", "บัญชี"],
  allocation: ["รอยืนยันสิทธิ", "Operation / PX"],
  active: ["ยืนยันสิทธิทดลองแล้ว", "PX"],
  cancelled: ["ยกเลิกแล้ว", "ปิดรายการ"],
} as const;
export type Stage = keyof typeof stages;
export type Entry = { state: Stage; at: string; by: string; note: string };
export type Deal = {
  id: string;
  project: string;
  units: number;
  amount: number;
  state: Stage;
  created: string;
  updated: string;
  document: string;
  digest: string;
  signer: string | null;
  signedAt: string | null;
  paymentRef: string | null;
  history: Entry[];
};
export const money = (n: number) => n.toLocaleString("th-TH");
export const dateTime = (s: string) =>
  new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(s));
export function terms(p: Project, units: number, id?: string) {
  const mode = units === 10 ? "single" : "share";
  return [
    "สัญญาตัวอย่าง DEAL! ฉบับ 1.1 สำหรับทดลองขั้นตอนการจองและลงนาม",
    ...(id ? ["เลขที่รายการ " + id] : []),
    "โครงการ " + p.name + " • " + p.asset,
    "รูปแบบ " +
      (mode === "single" ? "เจ้าของคนเดียว" : "เจ้าของร่วม") +
      " ได้รับส่วนแบ่ง " +
      units * 10 +
      "% ของยอดสุทธิที่นำมาแบ่งในตัวอย่างนี้",
    p.ownership[mode],
    "มูลค่าทดลอง " + money(units * p.unitPrice) + " บาท",
    "รายรับมาจาก" +
      p.source +
      " ฐานที่ใช้คำนวณคือ" +
      p.reportScope[mode] +
      " ส่วนแบ่งคำนวณจากยอดหลังหักค่าใช้จ่ายตามสัญญา หากรอบใดไม่มียอดสุทธิให้แบ่ง ส่วนแบ่งรอบนั้นเท่ากับศูนย์",
    p.risks,
    "การทดลองนี้ใช้ข้อมูลสมมติ การยืนยันชื่อเป็นการทดสอบหน้าลงนาม ไม่มีการรับชำระเงินจริงหรือจัดสรรกรรมสิทธิ์จริง",
  ].join("\n\n");
}
