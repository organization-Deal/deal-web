import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { projectDetails as projects } from "../../../lib/project-data";
import { canManageTeam } from "../../../lib/team-access";
import { stages, terms, type Stage, type Entry } from "../../../lib/deals";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
type Row = {
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
  signed_at: string | null;
  payment_ref: string | null;
  history: string;
};
const cols =
  "id, project, units, amount, state, created, updated, document, digest, signer, signed_at, payment_ref, history";
async function list(owner: string) {
  const result = await env
    .DB!.prepare(
      "SELECT " +
        cols +
        " FROM applications WHERE owner=? ORDER BY created DESC",
    )
    .bind(owner)
    .all<Row>();
  return result.results.map(({ signed_at, payment_ref, history, ...r }) => ({
    ...r,
    signedAt: signed_at,
    paymentRef: payment_ref,
    history: JSON.parse(history),
  }));
}
export async function GET() {
  const user = await getChatGPTUser();
  if (!user)
    return json({ error: "เข้าสู่ระบบเพื่อบันทึกและดูรายการทดลอง" }, 401);
  return json({
    items: await list(user.userId),
    canManage: canManageTeam(user.email),
  });
}
const idFormat =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowed: Record<string, [Stage, Stage, string]> = {
  sign: ["draft", "payment", "ลูกค้า"],
  submit: ["payment", "review", "ลูกค้า"],
  verify: ["review", "allocation", "บัญชี (จำลอง)"],
  return: ["review", "payment", "บัญชี (จำลอง)"],
  activate: ["allocation", "active", "Operation (จำลอง)"],
  cancel: ["draft", "cancelled", "ลูกค้า"],
};
export async function POST(req: Request) {
  if (
    req.headers.get("origin") &&
    req.headers.get("origin") !== new URL(req.url).origin
  )
    return json({ error: "คำขอข้ามเว็บไซต์" }, 403);
  const user = await getChatGPTUser();
  if (!user) return json({ error: "เข้าสู่ระบบเพื่อบันทึกรายการทดลอง" }, 401);
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, 400);
  const b = payload as Record<string, unknown>;
  if (
    typeof b.action !== "string" ||
    typeof b.id !== "string" ||
    !idFormat.test(b.id)
  )
    return json({ error: "เลขที่รายการไม่ถูกต้อง" }, 400);
  if (
    ["verify", "return", "activate"].includes(b.action) &&
    !canManageTeam(user.email)
  )
    return json({ error: "ขั้นตอนนี้สำหรับทีม DEAL!" }, 403);
  const db = env.DB!,
    owner = user.userId,
    now = new Date().toISOString();
  if (b.action === "create") {
    const p = projects.find((p) => p.id === b.project),
      n = b.units;
    if (!p || typeof n !== "number" || !Number.isInteger(n) || n < 1 || n > 10)
      return json({ error: "กรุณาตรวจสอบโครงการและเลือกสัดส่วน 10% ถึง 100% โดยเพิ่มทีละ 10%" }, 400);
    const old = await db
      .prepare("SELECT project, units FROM applications WHERE id=? AND owner=?")
      .bind(b.id, owner)
      .first<{ project: string; units: number }>();
    if (old) {
      if (old.project !== p.id || old.units !== n)
        return json({ error: "เลขอ้างอิงถูกใช้แล้ว" }, 409);
      return json({ items: await list(owner) });
    }
    const doc = terms(p, n, b.id);
    const bytes = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(doc),
    );
    const digest = Array.from(new Uint8Array(bytes), (x) =>
      x.toString(16).padStart(2, "0"),
    ).join("");
    const history: Entry[] = [
      {
        state: "draft",
        at: now,
        by: "ลูกค้า",
        note: "สร้างรายการและเก็บเอกสารฉบับที่จะแสดงให้ลงนาม",
      },
    ];
    const result = await db
      .prepare(
        "INSERT OR IGNORE INTO applications(id,owner,project,units,amount,state,created,updated,document,digest,history) SELECT ?,?,?,?,?,'draft',?,?,?,?,? WHERE ? <= 10-(SELECT COALESCE(SUM(units),0) FROM applications WHERE owner=? AND project=? AND state!='cancelled')",
      )
      .bind(
        b.id,
        owner,
        p.id,
        n,
        n * p.unitPrice,
        now,
        now,
        doc,
        digest,
        JSON.stringify(history),
        n,
        owner,
        p.id,
      )
      .run();
    if (!result.meta.changes) {
      const duplicate = await db
        .prepare(
          "SELECT id FROM applications WHERE id=? AND owner=? AND project=? AND units=?",
        )
        .bind(b.id, owner, p.id, n)
        .first();
      if (!duplicate)
        return json(
          { error: "สัดส่วนที่จองได้เปลี่ยนแล้ว กรุณาโหลดรายการใหม่" },
          409,
        );
    }
  } else {
    const flow = Object.hasOwn(allowed, b.action) ? allowed[b.action] : null;
    if (!flow) return json({ error: "ขั้นตอนไม่ถูกต้อง" }, 400);
    const [from, to, actor] = flow;
    const row = await db
      .prepare("SELECT " + cols + " FROM applications WHERE id=? AND owner=?")
      .bind(b.id, owner)
      .first<Row>();
    if (!row) return json({ error: "ไม่พบรายการ" }, 404);
    if (row.state !== from)
      return json({ error: "สถานะเปลี่ยนแล้ว กรุณาโหลดรายการใหม่" }, 409);
    const input = typeof b.value === "string" ? b.value.trim() : "";
    if (
      ["sign", "submit", "return"].includes(b.action) &&
      (input.length < 2 || input.length > 120)
    )
      return json({ error: "กรุณากรอกข้อมูล 2–120 ตัวอักษร" }, 400);
    if (b.action === "sign" && (b.accepted !== true || b.digest !== row.digest))
      return json({ error: "กรุณาอ่านและยอมรับเอกสารฉบับที่แสดง" }, 400);
    const note = (
      {
        sign: "ยืนยันอ่านและลงนามตัวอย่าง",
        submit: "แจ้งรหัสชำระจำลอง " + input,
        return: "ขอแก้ไข " + input,
        verify: "ยืนยันยอดทดลองตรงกับรายการ",
        activate: "ยืนยันการจัดสรรสิทธิทดลอง",
        cancel: "ยกเลิกรายการทดลองและคืนสิทธิที่จองไว้ " + row.units * 10 + "%",
      } as Record<string, string>
    )[b.action];
    const history = JSON.parse(row.history) as Entry[];
    history.push({ state: to, at: now, by: actor, note });
    const result = await db
      .prepare(
        "UPDATE applications SET state=?,updated=?,signer=?,signed_at=?,payment_ref=?,history=? WHERE id=? AND owner=? AND state=? AND history=?",
      )
      .bind(
        to,
        now,
        b.action === "sign" ? input : row.signer,
        b.action === "sign" ? now : row.signed_at,
        b.action === "submit" ? input : row.payment_ref,
        JSON.stringify(history),
        b.id,
        owner,
        from,
        row.history,
      )
      .run();
    if (!result.meta.changes)
      return json({ error: "รายการนี้มีการอัปเดตแล้ว กรุณาโหลดใหม่" }, 409);
  }
  return json({ items: await list(owner) });
}
