"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock3, Copy, FileCheck2, Inbox, LockKeyhole, Phone, RefreshCw, Pencil, UserRound, ClipboardCheck, FileText, Headphones, CircleAlert, LoaderCircle, ListFilter } from "lucide-react";
import { boxingShareLabel, offerAmount, offers } from "../lib/offers";
import { normalizedRequestPhone, requestStatusLabels, type InvestmentRequest } from "../lib/investment-requests";
import "./investment-requests.css";

type Product = InvestmentRequest["project"];
type RequestStatus = InvestmentRequest["status"];
type Action = "review" | "complete" | "cancel";

const currency = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
const endpoint = "/api/investment-requests";

function amount(value: number) {
  return "฿" + currency.format(value);
}

function signIn(hash: string) {
  return "/signin-with-chatgpt?return_to=" + encodeURIComponent("/" + hash);
}

class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function callApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const data = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok || !data) {
    throw new RequestError(data?.error || "เชื่อมต่อไม่สำเร็จ ลองอีกครั้งได้", response.status);
  }
  return data as T;
}

function postRequest(body: object) {
  return callApi<{ item: InvestmentRequest }>(endpoint, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

function ProjectThumb({ id }: { id: Product }) {
  return (
    <div className={"request-thumb request-thumb-" + id}>
      <img alt={id === "house" ? "ภาพจำลองโครงการบ้านพักริมปิง" : "ตู้ชกมวย DEAL! Boxing"}
        src={id === "house" ? "/media/rimping-render.webp" : "/media/boxing-front.webp"} />
    </div>
  );
}

const interestStatusLabels: Record<RequestStatus, string> = {
  submitted: "รับแจ้งความสนใจแล้ว",
  reviewing: "ทีมรับเรื่องแล้ว",
  contacted: "ทีมติดต่อแล้ว",
  cancelled: "ยกเลิกแล้ว",
};

function RequestBadge({ status, nextRound }: { status: RequestStatus; nextRound: boolean }) {
  const Icon = { submitted: CircleCheck, reviewing: Clock3, contacted: Phone, cancelled: CircleX }[status];
  return <span className={"request-badge request-badge-" + status}><Icon size={15} aria-hidden="true" />{nextRound ? interestStatusLabels[status] : requestStatusLabels[status]}</span>;
}

export function InvestmentCheckout(props: {
  id: Product; share: number; signedIn: boolean; authReady: boolean;
}) {
  return <CheckoutForm key={props.id + "/" + props.share + "/" + props.signedIn} {...props} />;
}

function CheckoutForm({ id, share, signedIn, authReady }: {
  id: Product; share: number; signedIn: boolean; authReady: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [fieldError, setFieldError] = useState<"name" | "phone" | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(false);
  const [conflict, setConflict] = useState(false);
  const nameField = useRef<HTMLInputElement>(null);
  const phoneField = useRef<HTMLInputElement>(null);
  const operationId = useRef("");
  const sending = useRef(false);
  const project = offers[id];
  const offerHash = "#/offer/" + id + "?share=" + share;
  const ownHash = "#/apply/" + id + "?share=" + share;
  const house = id === "house";
  const draftKey = (house ? "deal-next-round-v1:" : "deal-pending-request-v1:") + id + ":" + share;
  const ownership = share === 100 ? house ? "ถือสิทธิทั้งหลัง" : "ถือสิทธิทั้งตู้" : "ถือสิทธิร่วม";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || !signedIn || !accepted) return;
    setError("");
    if (name.trim().length < 2 || name.trim().length > 100) {
      setFieldError("name"); nameField.current?.focus(); return;
    }
    const cleanPhone = normalizedRequestPhone(phone);
    if (!cleanPhone) { setFieldError("phone"); phoneField.current?.focus(); return; }
    setFieldError(null);
    sending.current = true;
    setBusy(true);
    try {
      if (conflict) {
        operationId.current = crypto.randomUUID();
        try { sessionStorage.setItem(draftKey, operationId.current); } catch {}
        setConflict(false);
      }
      if (!operationId.current) {
        try { operationId.current = sessionStorage.getItem(draftKey) || ""; } catch {}
        if (!operationId.current) operationId.current = crypto.randomUUID();
        try { sessionStorage.setItem(draftKey, operationId.current); } catch {}
      }
      const result = await postRequest({
        id: operationId.current, project: id, share, intent: house ? "next_round_interest" : "availability_check",
        name: name.trim(), phone: cleanPhone, accepted: true,
      });
      if (result.item.id !== operationId.current) throw new Error("ตรวจสอบเลขคำขอไม่สำเร็จ กรุณาดูที่คำขอของฉัน");
      try { sessionStorage.removeItem(draftKey); } catch {}
      window.location.hash = "/requests/" + result.item.id;
    } catch (reason) {
      if (reason instanceof RequestError && reason.status === 401) setExpired(true);
      if (reason instanceof RequestError && reason.status === 409) {
        setConflict(true);
        setError("มีเลขคำขอนี้อยู่แล้ว ตรวจคำขอเดิมได้ หรือส่งข้อมูลที่กรอกเป็นคำขอใหม่");
      } else {
        setError(reason instanceof Error ? reason.message : "ส่งคำขอไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return (
    <article className="requests-page request-checkout">
      <a className="request-back" href={offerHash}><ChevronLeft size={17} aria-hidden="true" /> กลับไปดูข้อมูลโครงการ</a>
      <header className="requests-title">
        <h1>{house ? "ฝากความสนใจในบ้านพัก" : "ทบทวนคำขอตรวจสิทธิ"}</h1>
        <p>{house ? "รอบเดิมปิดเมื่อ 14 ต.ค. 2569 รอบถัดไปยังไม่ประกาศ ฝากเบอร์ไว้ให้ทีมติดต่อหากมีข่าวเปิดรอบใหม่" : "ฝากเบอร์ให้ทีม DEAL! ตรวจว่าสัดส่วนที่สนใจยังว่างหรือไม่ ขั้นตอนนี้ยังไม่ต้องชำระเงิน"}</p>
      </header>
      <div className="request-checkout-grid">
        <section className="request-box request-order" aria-labelledby="request-summary">
          <div className="request-summary-head">
            <ProjectThumb id={id} />
            <div><p>{house ? "โครงการบ้านพัก" : "โครงการตู้ชกมวย"}</p><h2 id="request-summary">{project.name}</h2></div>
          </div>
          <div className="request-order-total"><span>{house ? "ราคาอ้างอิงรอบเดิมสำหรับ " + currency.format(share) + "%" : "ราคาสำหรับ " + boxingShareLabel(share)}</span><strong>{currency.format(offerAmount(id, share))}<small>บาท</small></strong></div>
          <div className="request-share-meter" aria-hidden="true"><i style={{ width: share + "%" }} /></div>
          <dl className="request-facts">
            <div><dt>รูปแบบที่สนใจ</dt><dd>{ownership}</dd></div>
            <div><dt>{house ? "เรื่องที่สนใจ" : "สิ่งที่ขอให้ทีมยืนยัน"}</dt><dd>{house ? "ข่าวการเปิดรอบถัดไป" : "หมายเลขตู้และจุดติดตั้งตามสัญญา"}</dd></div>
            <div><dt>{house ? "ราคาทั้งหลังในรอบเดิม" : "ราคาทั้งตู้"}</dt><dd>{amount(project.fullPrice)}</dd></div>
          </dl>
          <a href={offerHash} className="request-edit-share"><Pencil size={16} aria-hidden="true" />แก้ไขสัดส่วน</a>
        </section>
        <section className="request-box request-form-panel" aria-labelledby="request-contact">
          <div className="request-form-heading"><span className="request-heading-icon"><UserRound size={24} aria-hidden="true" /></span><h2 id="request-contact">ข้อมูลติดต่อกลับ</h2></div>
          {!authReady ? <p className="request-loading" role="status"><LoaderCircle size={18} aria-hidden="true" />กำลังตรวจสอบบัญชี…</p> : !signedIn || expired ? (
            <div className="request-signin">
              <p>{expired ? "เซสชันหมดอายุ เข้าสู่ระบบอีกครั้งเพื่อส่งคำขอ" : house ? "ใช้บัญชีเพื่อฝากชื่อและเบอร์โทรสำหรับข่าวรอบถัดไป และกลับมาดูเรื่องที่ฝากไว้" : "เข้าสู่ระบบเพื่อฝากชื่อและเบอร์โทร แล้วใช้บัญชีเดียวกันติดตามผลการตรวจสิทธิ"}</p>
              <a className="request-primary" href={signIn(ownHash)} target="_top"><LockKeyhole size={17} aria-hidden="true" />{house ? "เข้าสู่ระบบเพื่อแจ้งความสนใจ" : "เข้าสู่ระบบเพื่อขอตรวจสิทธิ"}</a>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="request-field-group">
                <label className="request-field" htmlFor="request-contact-name"><span>ชื่อผู้ติดต่อ</span>
                  <input id="request-contact-name" ref={nameField} placeholder="ชื่อที่ให้ทีมเรียก" autoComplete="name" required maxLength={100} value={name}
                    aria-invalid={fieldError === "name"} aria-describedby={fieldError === "name" ? "request-name-error" : undefined}
                    onChange={e => { setName(e.target.value); setFieldError(null); }} />
                </label>
                {fieldError === "name" && <p id="request-name-error" className="request-error" role="alert">กรอกชื่อผู้ติดต่อ 2–100 ตัวอักษร</p>}
                <label className="request-field" htmlFor="request-contact-phone"><span>เบอร์โทร</span>
                  <input id="request-contact-phone" ref={phoneField} placeholder="เบอร์ที่สะดวกรับสาย" type="tel" inputMode="tel" autoComplete="tel" required maxLength={40}
                    value={phone} aria-invalid={fieldError === "phone"}
                    aria-describedby={fieldError === "phone" ? "request-phone-error" : undefined}
                    onChange={e => { setPhone(e.target.value); setFieldError(null); }} />
                </label>
                {fieldError === "phone" && <p id="request-phone-error" className="request-error" role="alert">กรอกเบอร์โทร 8–15 หลัก เพิ่มรหัสประเทศได้ เช่น +66</p>}
              </div>
              <label className="request-consent">
                <input type="checkbox" required checked={accepted} onChange={e => setAccepted(e.target.checked)} />
                <span>{house ? "ยินยอมให้ทีม DEAL! ใช้ชื่อและเบอร์โทรเพื่อติดต่อเกี่ยวกับรอบถัดไปของโครงการบ้านพักนี้" : "ยินยอมให้ทีม DEAL! ใช้ชื่อและเบอร์โทรเพื่อติดต่อกลับเกี่ยวกับคำขอตรวจสิทธิของตู้ชกมวย"}</span>
              </label>
              {error && <div className="request-error" role="alert">{error} <a href="#/requests">ดูคำขอของฉัน</a></div>}
              <button type="submit" className="request-primary" disabled={busy}>
                {busy && <LoaderCircle size={18} className="request-spin" aria-hidden="true" />}
                {busy ? "กำลังส่ง…" : house ? "แจ้งความสนใจรอบถัดไป" : conflict ? "ส่งเป็นคำขอใหม่" : "ให้ทีมตรวจสิทธิที่ว่าง"}
              </button>
            </form>
          )}
          <div className="request-footnote"><FileCheck2 size={19} aria-hidden="true" />
            <p>{house ? "หลังส่ง คุณจะได้เลขอ้างอิงไว้ติดตาม การฝากความสนใจไม่มีการจองสิทธิหรือชำระเงิน ราคาและเงื่อนไขของรอบใหม่ยังไม่ประกาศ" : "หลังส่ง คุณจะได้รับเลขคำขอ ทีมจะโทรแจ้งผลและเงื่อนไขเพื่อให้คุณตัดสินใจก่อนทำสัญญา"}</p>
          </div>
        </section>
      </div>
    </article>
  );
}

const nextSteps: Record<RequestStatus, string> = {
  submitted: "ทีมได้รับโครงการ สัดส่วน และเบอร์ติดต่อของคุณแล้ว ระหว่างรอตรวจสิทธิ คุณยกเลิกคำขอได้",
  reviewing: "ทีมกำลังตรวจสอบสิทธิที่เปิดรับและเงื่อนไขของโครงการ แล้วจะติดต่อกลับตามเบอร์ที่ให้ไว้",
  contacted: "ทีมบันทึกว่าติดต่อคุณแล้ว กรุณาตรวจรายละเอียดโครงการและสัญญาที่ได้รับก่อนตัดสินใจ",
  cancelled: "คำขอนี้ปิดแล้ว คุณกลับไปเลือกโครงการและส่งคำขอใหม่ได้",
};

const interestNextSteps: Record<RequestStatus, string> = {
  submitted: "ทีมได้รับเบอร์ติดต่อสำหรับข่าวบ้านพักแล้ว หากมีการเปิดรอบถัดไป ทีมจะติดต่อกลับตามเบอร์ที่ฝากไว้ ระหว่างนี้คุณยกเลิกการแจ้งความสนใจได้",
  reviewing: "ทีมรับเรื่องความสนใจของคุณไว้แล้ว รอบถัดไปยังไม่ประกาศ",
  contacted: "ทีมบันทึกว่าติดต่อคุณเรื่องโครงการบ้านพักแล้ว การแจ้งความสนใจยังไม่มีการจองสิทธิ",
  cancelled: "คุณยกเลิกการแจ้งความสนใจรายการนี้แล้ว",
};

const teamInterestNextSteps: Record<RequestStatus, string> = {
  submitted: "ลูกค้าฝากเบอร์เพื่อรับข่าวรอบถัดไป บันทึกรับเรื่องเพื่อดูแลการติดต่อ",
  reviewing: "หากมีข้อมูลรอบถัดไป ให้ติดต่อเบอร์ที่ลูกค้าฝากไว้ แล้วบันทึกผลการติดต่อ",
  contacted: "ทีมบันทึกการติดต่อเรื่องความสนใจรอบถัดไปแล้ว",
  cancelled: "ลูกค้ายกเลิกการแจ้งความสนใจรายการนี้แล้ว",
};

const teamNextSteps: Record<RequestStatus, string> = {
  submitted: "ตรวจสอบเงื่อนไขและสัดส่วนที่ลูกค้าขอ แล้วเริ่มตรวจคำขอ",
  reviewing: "โทรหาลูกค้าตามเบอร์ในคำขอ แล้วบันทึกว่าติดต่อแล้ว",
  contacted: "ทีมบันทึกการติดต่อลูกค้าแล้ว",
  cancelled: "ลูกค้ายกเลิกคำขอนี้แล้ว",
};

const trackingSteps = [
  { status: "submitted", title: "ส่งคำขอ", interestTitle: "แจ้งความสนใจ", icon: FileText },
  { status: "reviewing", title: "ตรวจสอบสิทธิ", interestTitle: "ทีมรับเรื่อง", icon: ClipboardCheck },
  { status: "contacted", title: "ติดต่อกลับ", interestTitle: "ติดต่อกลับ", icon: Headphones },
] as const;

function RequestProgress({ status, nextRound }: { status: RequestStatus; nextRound: boolean }) {
  if (status === "cancelled") return null;
  const current = trackingSteps.findIndex(step => step.status === status);
  return <ol className="request-progress" aria-label="ขั้นตอนคำขอ">
    {trackingSteps.map(({ status: value, title, interestTitle, icon: Icon }, index) => <li key={value} data-state={index < current ? "done" : index === current ? "current" : "waiting"} aria-current={index === current ? "step" : undefined}>
      <span className="request-progress-icon">{index < current ? <Check size={17} aria-hidden="true" /> : <Icon size={17} aria-hidden="true" />}</span>
      <span>{nextRound ? interestTitle : title}</span>
    </li>)}
  </ol>;
}

export function RequestList({ team = false, selectedId }: { team?: boolean; selectedId?: string }) {
  return <RequestScreen key={team ? "team" : "owner"} team={team} selectedId={selectedId} />;
}

function RequestScreen({ team, selectedId }: { team: boolean; selectedId?: string }) {
  const [items, setItems] = useState<InvestmentRequest[] | null>(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [filter, setFilter] = useState("all");
  const [working, setWorking] = useState(false);
  const [cancelId, setCancelId] = useState("");
  const pending = useRef(false);
  const listHash = team ? "#/team-requests" : "#/requests";
  const selected = selectedId ? items?.find(item => item.id === selectedId) : undefined;

  const nextRound = selected?.intent === "next_round_interest";
  const guidance = team ? (nextRound ? teamInterestNextSteps : teamNextSteps) : (nextRound ? interestNextSteps : nextSteps);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setSignedOut(false); setBlocked(false);
    void callApi<{ items: InvestmentRequest[] }>(endpoint + (team ? "?team=1" : ""), { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setItems(result.items); })
      .catch(reason => {
        if (controller.signal.aborted) return;
        if (reason instanceof RequestError && (reason.status === 401 || reason.status === 403)) {
          setItems(null); setSignedOut(reason.status === 401); setBlocked(reason.status === 403);
        }
        setError(reason instanceof Error ? reason.message : "โหลดคำขอไม่สำเร็จ");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [team, version]);

  async function act(action: Action, id: string) {
    if (pending.current || loading) return;
    pending.current = true; setWorking(true); setError("");
    try {
      const { item } = await postRequest({ action, id });
      setItems(old => old?.map(row => row.id === item.id ? item : row) || [item]);
      setCancelId("");
    } catch (reason) {
      if (reason instanceof RequestError && (reason.status === 401 || reason.status === 403)) {
        setItems(null); setSignedOut(reason.status === 401); setBlocked(reason.status === 403);
      }
      setError(reason instanceof Error ? reason.message : "บันทึกสถานะไม่สำเร็จ");
    } finally { pending.current = false; setWorking(false); }
  }
  const refresh = () => setVersion(value => value + 1);
  const currentHash = listHash + (selectedId ? "/" + selectedId : "");
  const rows = items?.filter(item => filter === "all" || item.status === filter) || [];

  return (
    <article className="requests-page">
      <a className="request-back" href={selectedId ? listHash : "#/catalog"}><ChevronLeft size={20} aria-hidden="true" /> {selectedId ? "กลับไปดูคำขอทั้งหมด" : "กลับไปเลือกโครงการ"}</a>
      <header className="requests-title request-title-row">
        <div><h1>{selectedId ? (nextRound ? "ความสนใจรอบถัดไป" : "รายละเอียดคำขอ") : team ? "คำขอจากลูกค้า" : "คำขอของฉัน"}</h1>
          {!selectedId && <p>{team ? "ดูคำขอตรวจสิทธิและการแจ้งความสนใจรอบถัดไป พร้อมบันทึกการติดต่อกลับ" : "ติดตามคำขอตรวจสิทธิและความสนใจรอบถัดไปที่ฝากไว้กับทีม"}</p>}
        </div>
        {!signedOut && !blocked && <button className="request-secondary" type="button" onClick={refresh} disabled={loading || working}>
          <RefreshCw size={16} /> {loading ? "กำลังโหลด" : "โหลดสถานะใหม่"}
        </button>}
      </header>
      {(signedOut || blocked) ? <section className="request-empty request-access">
        <span className="request-state-icon"><LockKeyhole aria-hidden="true" /></span>
        <h2>{signedOut ? "เข้าสู่ระบบเพื่อดูคำขอ" : "หน้านี้สำหรับทีมดูแลคำขอ"}</h2>
        <p>{signedOut ? (team ? "ใช้บัญชีทีม DEAL! เพื่อตรวจคำขอและบันทึกการติดต่อกลับ" : "ใช้บัญชีที่ส่งคำขอ เพื่อดูสถานะและรายละเอียดของคุณ") : "บัญชีนี้ดูรายการที่คุณส่งด้วยตัวเองได้"}</p>
        {signedOut ? <a className="request-primary" href={signIn(currentHash)} target="_top">เข้าสู่ระบบ</a> : <a className="request-secondary" href="#/requests">ดูคำขอของฉัน</a>}
      </section> : error && <div className="request-alert" role="alert"><CircleAlert size={19} aria-hidden="true" /><span>{error}</span>
        <button type="button" disabled={loading || working} onClick={refresh}>ลองโหลดอีกครั้ง</button>
      </div>}
      {loading && !items && !signedOut && !blocked && <p className="request-empty request-loading" role="status"><LoaderCircle size={20} aria-hidden="true" />กำลังโหลดคำขอ…</p>}
      {items && selectedId && (selected ? (
        <div className="request-receipt-grid">
          <section className="request-box request-receipt" aria-labelledby="request-receipt-name">
            <div className="request-summary-head">
              <ProjectThumb id={selected.project} />
              <div><p>{nextRound ? "แจ้งความสนใจรอบถัดไป" : "คำขอตรวจสิทธิ"}</p><h2 id="request-receipt-name">{offers[selected.project].name}</h2></div>
            </div>
            <div className="request-order-total"><span>{selected.project === "boxing" ? "ราคาสำหรับ " + boxingShareLabel(selected.share) : (nextRound ? "ราคาอ้างอิงรอบเดิมสำหรับ " : "ราคาสำหรับสัดส่วน ") + currency.format(selected.share) + "%"}</span><strong>{currency.format(selected.amount)}<small>บาท</small></strong></div>
            <div className="request-share-meter" aria-hidden="true"><i style={{ width: selected.share + "%" }} /></div>
            <h3 className="request-small-heading">{nextRound ? "ข้อมูลติดต่อเรื่องรอบถัดไป" : "รายละเอียดการติดต่อ"}</h3>
            <dl className="request-facts request-receipt-facts">
              <div><dt>ชื่อผู้ติดต่อ</dt><dd>{selected.name}</dd></div>
              <div><dt>เบอร์โทร</dt><dd>{team ? <a href={"tel:" + selected.phone}>{selected.phone}</a> : selected.phone}</dd></div>
              <div><dt>{nextRound ? "แจ้งความสนใจเมื่อ" : "ส่งคำขอเมื่อ"}</dt><dd>{date.format(new Date(selected.created))}</dd></div>
            </dl>
            <details className="request-reference-group"><summary>เลขอ้างอิง <ChevronRight size={16} aria-hidden="true" /></summary><ReferenceCopy key={selected.id} value={selected.id} /></details>
          </section>
          <section className="request-box request-tracking" aria-labelledby="request-status-title">
            <header className="request-tracking-heading"><h2 id="request-status-title">{nextRound ? "สถานะการแจ้งความสนใจ" : "สถานะคำขอ"}</h2><RequestBadge status={selected.status} nextRound={nextRound} /></header>
            <RequestProgress status={selected.status} nextRound={nextRound} />
            <div className="request-next-step" role="status">
              <strong>{selected.status === "cancelled" ? "ปิดรายการแล้ว" : selected.status === "contacted" && team ? "ติดต่อเรียบร้อย" : "ขั้นตอนถัดไป"}</strong>
              <p>{guidance[selected.status]}</p>
            </div>
            <p className="request-updated"><Clock3 size={14} aria-hidden="true" />อัปเดต {date.format(new Date(selected.updated))}</p>
            <div className="request-receipt-actions">
              {team && selected.status === "submitted" && <button className="request-primary" disabled={working || loading} onClick={() => act("review", selected.id)}>{nextRound ? "รับเรื่องความสนใจ" : "เริ่มตรวจคำขอ"}</button>}
              {team && selected.status === "reviewing" && <button className="request-primary" disabled={working || loading} onClick={() => act("complete", selected.id)}>บันทึกว่าติดต่อลูกค้าแล้ว</button>}
              {!team && selected.status === "submitted" && (cancelId === selected.id ? <div className="request-confirm">
                <p>{nextRound ? "ยกเลิกการแจ้งความสนใจรอบถัดไปของ " : "ยกเลิกคำขอตรวจสิทธิของ "}{offers[selected.project].name} สัดส่วน {currency.format(selected.share)}% หรือไม่?</p>
                <button className="request-danger" onClick={() => act("cancel", selected.id)} disabled={working || loading}>{working ? "กำลังยกเลิก…" : "ยืนยันการยกเลิก"}</button>
                <button className="request-secondary" onClick={() => setCancelId("")} disabled={working}>เก็บรายการไว้</button>
              </div> : <button className="request-quiet" onClick={() => setCancelId(selected.id)}>{nextRound ? "ยกเลิกการแจ้งความสนใจ" : "ยกเลิกคำขอนี้"}</button>)}
              {!team && selected.status === "cancelled" && <a className="request-secondary" href="#/catalog">กลับไปเลือกโครงการ</a>}
              {working && <span role="status">กำลังบันทึกสถานะ…</span>}
            </div>
          </section>
        </div>
      ) : <div className="request-empty"><span className="request-state-icon"><Inbox aria-hidden="true" /></span><h2>ไม่พบคำขอในรายการนี้</h2><a className="request-secondary" href={listHash}>ดูคำขอทั้งหมด</a></div>)}
      {items && !selectedId && <>
        {items.length > 0 && <div className="request-list-toolbar">
          <h2>รายการคำขอ <span>{rows.length}</span></h2>
          {team && <label className="request-filter"><ListFilter size={17} aria-hidden="true" />
            <select value={filter} aria-label="แสดงคำขอตามสถานะ" onChange={e => setFilter(e.target.value)}><option value="all">ทุกสถานะ</option>
              <option value="submitted">รับรายการแล้ว</option><option value="reviewing">ทีมกำลังดูแล</option>
              <option value="contacted">ทีมติดต่อแล้ว</option><option value="cancelled">ยกเลิกแล้ว</option>
            </select>
          </label>}
        </div>}
        {rows.length ? <ul className="request-list">
          {rows.map(item => <li key={item.id}>
            <a href={listHash + "/" + item.id} className="request-list-row">
              <ProjectThumb id={item.project} />
              <div className="request-list-name"><h2>{offers[item.project].name}</h2>
                <span>{item.intent === "next_round_interest" ? "แจ้งความสนใจรอบถัดไป" : "คำขอตรวจสิทธิ"}</span>
                <span>{team ? item.name + " · " : ""}{date.format(new Date(item.created))}</span></div>
              <div className="request-list-value"><strong>{amount(item.amount)}</strong><span>{item.project === "boxing" ? boxingShareLabel(item.share) : (item.intent === "next_round_interest" ? "อ้างอิงรอบเดิม " : "สัดส่วน ") + currency.format(item.share) + "%"}</span></div>
              <RequestBadge status={item.status} nextRound={item.intent === "next_round_interest"} /><ChevronRight size={17} aria-hidden="true" />
            </a>
          </li>)}
        </ul> : <div className="request-empty"><span className="request-state-icon"><Inbox size={28} aria-hidden="true" /></span><h2>{filter !== "all" ? "ไม่มีคำขอที่ตรงกับสถานะนี้" : team ? "ยังไม่มีคำขอจากลูกค้า" : "คุณยังไม่มีคำขอ"}</h2>
          {filter !== "all" ? <button className="request-secondary" onClick={() => setFilter("all")}>ดูทุกสถานะ</button>
            : team ? <p>คำขอใหม่จะแสดงที่นี่เมื่อลูกค้าส่งข้อมูล</p> : <><p>ลองเลือกบ้านพักหรือตู้ชกมวย แล้วคำนวณสัดส่วนที่สนใจได้เลย</p><a className="request-primary" href="#/catalog">เลือกโครงการ</a></>}
        </div>}
        {!team && <a className="request-archive" href="#/portfolio">ดูรายการทดลองเดิม<ChevronRight size={15} aria-hidden="true" /></a>}
      </>}
    </article>
  );
}

function ReferenceCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div className="request-reference"><span>{value}</span>
    <button type="button" className="request-copy" onClick={async () => {
      try { await navigator.clipboard.writeText(value); setCopied(true); setFailed(false); }
      catch { setFailed(true); }
    }}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "คัดลอกแล้ว" : "คัดลอก"}</button>
    {failed && <small role="status">เลือกเลขอ้างอิงด้านบนเพื่อคัดลอกได้</small>}
  </div>;
}
