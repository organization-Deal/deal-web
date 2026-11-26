import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { canReviewRequests } from "../../../lib/team-access";
import { isOfferId, offerAmount, validOfferShare } from "../../../lib/offers";
import { normalizedRequestPhone, type InvestmentRequest, type RequestStatus } from "../../../lib/investment-requests";

export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const error = (message: string, status: number) => json({ error: message }, status);
const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const readyDatabases = new WeakSet<D1Database>();
// Read purpose from the consent the customer actually gave, including pre-closure requests.
const nextRoundConsent = "next-round-contact-v1";
const fields = `id, project, share_bps / 100.0 AS share, amount_satang / 100.0 AS amount, name, phone, status, created, updated,
  CASE WHEN consent_version = '${nextRoundConsent}' THEN 'next_round_interest' ELSE 'availability_check' END AS intent`;

async function requestDatabase(): Promise<D1Database> {
  const db = env.DB;
  if (!db) throw new Error("Missing D1 binding");
  if (!readyDatabases.has(db)) {
    // Existing Sites may launch new code before applying optional migration files.
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS investment_requests (
        id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, project TEXT NOT NULL,
        share_bps INTEGER NOT NULL, amount_satang INTEGER NOT NULL,
        name TEXT NOT NULL, phone TEXT NOT NULL,
        consent_version TEXT NOT NULL, status TEXT NOT NULL,
        created TEXT NOT NULL, updated TEXT NOT NULL
      )`),
      db.prepare("CREATE INDEX IF NOT EXISTS investment_requests_owner_created ON investment_requests(owner, created)"),
    ]);
    readyDatabases.add(db);
  }
  return db;
}

export async function GET(req: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return error("กรุณาเข้าสู่ระบบเพื่อดูคำขอ", 401);
    const team = new URL(req.url).searchParams.get("team") === "1";
    if (team && !canReviewRequests(user.email)) return error("เฉพาะทีมผู้ดูแลคำขอ", 403);
    const db = await requestDatabase();
    const order = " ORDER BY created DESC, id DESC";
    const query = team
      ? db.prepare("SELECT " + fields + " FROM investment_requests" + order)
      : db.prepare("SELECT " + fields + " FROM investment_requests WHERE owner = ?" + order).bind(user.userId);
    const result = await query.all<InvestmentRequest>();
    return json({ items: result.results });
  } catch {
    return error("ยังโหลดคำขอไม่ได้ กรุณาลองอีกครั้ง", 503);
  }
}

async function createRequest(owner: string, id: string, body: Record<string, unknown>) {
  const { project, share } = body;
  if (!isOfferId(project) || !validOfferShare(project, share)) {
    return error("กรุณาตรวจสอบโครงการและสัดส่วนที่เลือก", 400);
  }
  const intent = body.intent === undefined ? "availability_check" : body.intent;
  if (intent !== "availability_check" && !(intent === "next_round_interest" && project === "house")) {
    return error("ประเภทคำขอไม่ตรงกับโครงการ กรุณาเปิดหน้าโครงการอีกครั้ง", 400);
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? normalizedRequestPhone(body.phone) : null;
  if (name.length < 2 || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) {
    return error("กรุณากรอกชื่อสำหรับติดต่อ 2–100 ตัวอักษร", 400);
  }
  if (!phone) return error("กรุณากรอกเบอร์โทรศัพท์ 8–15 หลัก", 400);
  if (body.accepted !== true) return error("กรุณายืนยันให้ทีม DEAL! ติดต่อเรื่องคำขอนี้", 400);

  const db = await requestDatabase();
  const now = new Date().toISOString();
  const shareBps = Math.round(share * 100);
  const amountSatang = Math.round(offerAmount(project, share) * 100);
  const roundClosed = project === "house" && intent === "availability_check";
  // Old tabs may retry an already stored request. Let that lookup succeed without accepting a fresh one.
  const result = await db.batch<InvestmentRequest>([
    db.prepare(`INSERT INTO investment_requests
      (id, owner, project, share_bps, amount_satang, name, phone, consent_version, status, created, updated)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ? WHERE ? = 1
      ON CONFLICT(id) DO NOTHING`)
      .bind(id, owner, project, shareBps, amountSatang, name, phone, intent === "next_round_interest" ? nextRoundConsent : "contact-v1", now, now, roundClosed ? 0 : 1),
    db.prepare("SELECT " + fields + " FROM investment_requests WHERE id = ? AND owner = ?").bind(id, owner),
  ]);
  const item = result[1].results[0];
  if (roundClosed && !item) return error("รอบขายเดิมของบ้านริมปิงปิดแล้ว กรุณาโหลดหน้าโครงการใหม่เพื่อแจ้งความสนใจรอบถัดไป", 409);
  if (!item || item.project !== project || item.intent !== intent || Math.round(item.share * 100) !== shareBps || item.name !== name || item.phone !== phone) {
    return error("ส่งคำขอนี้ไม่ได้ กรุณาเริ่มคำขอใหม่", 409);
  }
  return json({ item }, result[0].meta.changes ? 201 : 200);
}

const changes = {
  cancel: { from: "submitted", to: "cancelled" },
  review: { from: "submitted", to: "reviewing" },
  complete: { from: "reviewing", to: "contacted" },
} as const satisfies Record<string, { from: RequestStatus; to: RequestStatus }>;

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return error("กรุณาส่งคำขอจากหน้าเว็บไซต์", 403);
  try {
    const user = await getChatGPTUser();
    if (!user) return error("กรุณาเข้าสู่ระบบเพื่อส่งหรือจัดการคำขอ", 401);
    if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return error("รูปแบบคำขอไม่ถูกต้อง", 415);
    }
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return error("อ่านข้อมูลคำขอไม่ได้", 400);
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return error("รูปแบบคำขอไม่ถูกต้อง", 400);
    const body = payload as Record<string, unknown>;
    if (typeof body.id !== "string" || !uuidV4.test(body.id)) return error("เลขอ้างอิงคำขอไม่ถูกต้อง", 400);
    const id = body.id.toLowerCase();
    const action = body.action;
    if (action === undefined || action === "create") return await createRequest(user.userId, id, body);
    if (action !== "cancel" && action !== "review" && action !== "complete") return error("การดำเนินการไม่ถูกต้อง", 400);

    const ownRequest = action === "cancel";
    if (!ownRequest && !canReviewRequests(user.email)) return error("เฉพาะทีมผู้ดูแลคำขอ", 403);
    const db = await requestDatabase();
    const { from, to } = changes[action];
    const scope = ownRequest ? "id = ? AND owner = ?" : "id = ?";
    const keys = ownRequest ? [id, user.userId] : [id];
    const result = await db.batch<InvestmentRequest>([
      db.prepare("UPDATE investment_requests SET status = ?, updated = ? WHERE " + scope + " AND status = ?")
        .bind(to, new Date().toISOString(), ...keys, from),
      db.prepare("SELECT " + fields + " FROM investment_requests WHERE " + scope).bind(...keys),
    ]);
    const item = result[1].results[0];
    if (!item) return error("ไม่พบคำขอนี้", 404);
    if (item.status !== to) return error("สถานะคำขอเปลี่ยนแล้ว กรุณาโหลดรายการอีกครั้ง", 409);
    return json({ item });
  } catch {
    return error("ยังบันทึกคำขอไม่ได้ กรุณาลองอีกครั้ง", 503);
  }
}
