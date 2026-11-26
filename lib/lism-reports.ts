// Aggregate amounts from the Lism machine's operating statements. Source files
// contain personal information and are not distributed with the site.
export const lismStatements = [
  { period: "เมษายน 2569", dates: "1–30 เมษายน 2569", sales: 10470, fees: [3141, 314.10, 523.50], net: 6491.40, tenth: 649.14 },
  { period: "กุมภาพันธ์ 2569", dates: "1–28 กุมภาพันธ์ 2569", sales: 9220, fees: [2766, 276.60, 461], net: 5716.40, tenth: 571.64 },
] as const;

export const lismFeeLabels = ["ค่าเช่าตู้ชกมวย (30%)", "ค่าระบบ T-DEV (3%)", "ค่าบริการ DEAL! (5%)"] as const;
