"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import {
  BookOpen, ChartNoAxesColumn, FileText, BedDouble, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Coins, Expand, Gamepad2, House, MapPin,
  Pencil, ReceiptText, Wallet, X,
} from "lucide-react";
import { money } from "../lib/deals";
import { boxingShareLabel, offers, offerAmount, validOfferShare, type OfferId } from "../lib/offers";
import { ProjectEvidence } from "./project-evidence";
import { ShareSlider } from "./share-slider";
import { DocumentLink } from "./document-link";
import "./offer.css";

type OfferProps = {
  id: OfferId;
  initialShare: number;
  onShareChange: (share: number) => void;
  onContinue: (share: number) => void;
};
type ProductPhoto = { src: string; label: string; caption: string; fit?: "contain"; backdrop?: string };

const photos: Record<OfferId, ProductPhoto[]> = {
  house: [
    { src: "/media/rimping-render.webp", label: "ภาพจำลอง", caption: "ภาพจำลองบ้านพัก 2 ชั้น โครงการ Human Allowed ริมแม่น้ำปิง" },
    { src: "/media/rimping-plan-1.jpeg", label: "โครงสร้าง", caption: "แบบโครงสร้างบ้าน มุมเฉียงด้านหน้า", fit: "contain", backdrop: "#e4e4e4" },
    { src: "/media/rimping-location.webp", label: "แผนที่", caption: "แผนที่แสดงสถานที่ใกล้โครงการและระยะทางโดยประมาณ", fit: "contain", backdrop: "#f5f5f5" },
  ],
  boxing: [
    { src: "/media/boxing-front.webp", label: "ตัวตู้", caption: "ตู้ชกมวย DEAL! Boxing มุมด้านหน้า", fit: "contain", backdrop: "#fff" },
    { src: "/media/boxing-chiang-mai.webp", label: "ตัวอย่างทำเล", caption: "ภาพตัวอย่างตู้ชกมวยที่ติดตั้งในเชียงใหม่ รุ่นและทำเลที่เสนอจะระบุในสัญญา", fit: "contain", backdrop: "#fff" },
  ],
};

const terms = {
  house: [
    ["สัญญาครอบคลุมอะไร", "เจ้าของถือสิทธิในตัวบ้านบนที่ดินเช่า ส่วนโฉนดเป็นของเจ้าของที่ดิน สัญญาจะระบุชั้นหรือหน่วยที่ถือสิทธิ ฐานรายได้ที่ใช้แบ่ง ระยะเวลาเช่า และเงื่อนไขการส่งมอบ"],
    ["ค่าใช้จ่ายที่ต้องดู", "ค่าบริหารคิด 30% ของรายได้รวม ยังมีค่าเช่า ค่าน้ำ ค่าไฟ อินเทอร์เน็ต และค่าทำความสะอาดตามการใช้งาน ก่อนตกลง ให้ตรวจว่าแต่ละรายการคิดต่อหลัง ต่อชั้น หรือต่อโครงการ และส่วนใดเป็นภาระของคุณ"],
    ["รายได้เปลี่ยนได้อย่างไร", "จำนวนคืนที่มีผู้เข้าพัก ราคาห้อง และค่าใช้จ่ายจริงกำหนดยอดสุทธิของแต่ละรอบ หากรายได้ต่ำกว่าค่าใช้จ่าย โครงการอาจขาดทุนได้ รอบจ่ายและสัดส่วนที่ได้รับให้ดูจากสัญญาของหน่วยที่เลือก"],
  ],
  boxing: [
    ["สัญญาครอบคลุมอะไร", "ระบุตู้ที่ถือสิทธิ หมายเลขเครื่อง ทำเลติดตั้ง และสัดส่วนของคุณ ตรวจเงื่อนไขส่งมอบ การย้ายตู้ และการขายต่อของเครื่องนั้นก่อนตกลง"],
    ["ค่าพื้นที่และการดูแลตู้", "ตรวจอัตราค่าใช้พื้นที่ ค่าไฟ ค่าบริการ และผู้รับผิดชอบค่าอะไหล่ในเอกสารของทำเลนั้น หากเลือกบริการดูแลของ DEAL! ให้ตรวจขอบเขตงานจัดหาทำเล ติดตั้ง ซ่อม และสรุปยอดในสัญญา"],
    ["รายได้เปลี่ยนได้อย่างไร", "รายได้มาจากจำนวนครั้งที่ลูกค้าจ่ายเงินเล่นตู้แต่ละเครื่อง ทำเล ช่วงเวลาที่เปิดให้บริการ และวันที่เครื่องหยุดซ่อมมีผลต่อยอดเล่น ถ้าค่าใช้จ่ายสูงกว่ายอดเล่น โครงการอาจขาดทุนได้"],
  ],
} as const;

function parsePercent(value: string, id: OfferId) {
  const text = value.trim().replace(/[๐-๙]/g, digit => String(digit.charCodeAt(0) - 0x0e50)).replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(text)) return null;
  const share = Number(text);
  return validOfferShare(id, share) ? share : null;
}

const presetShares = [10, 20, 50, 100];
const compactQuery = "(max-width: 850px)";

function subscribeToLayout(notify: () => void) {
  const query = window.matchMedia(compactQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

function readCompactLayout() {
  return window.matchMedia(compactQuery).matches;
}

function desktopServerLayout() {
  return false;
}

function Gallery({ id, name }: { id: OfferId; name: string }) {
  const [selected, setSelected] = useState(0);
  const gallery = photos[id];
  const photo = gallery[selected];
  const dialog = useRef<HTMLDialogElement>(null);
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);

  return (
    <section className="offer-gallery" aria-label={"รูปโครงการ " + name}>
      <figure>
        <div className={"offer-frame offer-frame-" + id} style={{ backgroundColor: photo.backdrop }}>
          <img key={photo.src} src={photo.src} alt={photo.caption} style={{ objectFit: photo.fit ?? "cover" }} fetchPriority="high"
            onTouchStart={event => {
              const touch = event.touches[0];
              touchOrigin.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
            }}
            onTouchCancel={() => { touchOrigin.current = null; }}
            onTouchEnd={event => {
              const start = touchOrigin.current;
              touchOrigin.current = null;
              if (!start || event.touches.length) return;
              const dx = event.changedTouches[0].clientX - start.x;
              const dy = event.changedTouches[0].clientY - start.y;
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                setSelected(index => Math.max(0, Math.min(gallery.length - 1, index + (dx < 0 ? 1 : -1))));
              }
            }} />
          <button type="button" className="offer-enlarge" aria-label={"ขยายภาพ " + photo.label} onClick={() => dialog.current?.showModal()}>
            <Expand size={19} aria-hidden="true" />
          </button>
        </div>
        <figcaption>
          <div className="offer-photo-tabs" role="group" aria-label="เลือกรูปโครงการ">
            {gallery.map((item, index) => (
              <button key={item.src} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>
                <img src={item.src} alt="" width="36" height="36"
                  style={{ objectFit: item.fit ?? "cover", backgroundColor: item.backdrop }} />
                {item.label}
              </button>
            ))}
          </div>
          <span>{photo.caption}</span>
        </figcaption>
      </figure>
      <dialog className="offer-viewer" ref={dialog} aria-label={"ภาพขยาย " + photo.label}
        onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div>
          <header><strong>{photo.label}</strong><button type="button" aria-label="ปิดภาพขยาย" onClick={() => dialog.current?.close()}><X size={19} /></button></header>
          <img src={photo.src} alt={photo.caption} style={{ backgroundColor: photo.backdrop }} />
          <footer>
            <p>{photo.caption}</p>
            <div>
              <button type="button" aria-label="ภาพก่อนหน้า" disabled={selected === 0} onClick={() => setSelected(selected - 1)}><ChevronLeft size={19} /></button>
              <button type="button" aria-label="ภาพถัดไป" disabled={selected === gallery.length - 1} onClick={() => setSelected(selected + 1)}><ChevronRight size={19} /></button>
            </div>
          </footer>
        </div>
      </dialog>
    </section>
  );
}

function OfferView({ id, initialShare, onShareChange, onContinue }: OfferProps) {
  const house = id === "house";
  const product = offers[id];
  const start = parsePercent(String(initialShare), id) ?? 10;
  const [input, setInput] = useState(String(start));
  const share = parsePercent(input, id);
  const isCompact = useSyncExternalStore(subscribeToLayout, readCompactLayout, desktopServerLayout);
  const sheet = useRef<HTMLDialogElement>(null);
  const evidence = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<"overview" | "evidence" | "terms">("overview");
  const sections = useRef<HTMLElement>(null);
  const sheetGesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const lastValidInput = useRef(String(start));
  const pctInput = useRef<HTMLInputElement>(null);
  const fullAsset = house ? "ทั้งหลัง" : "ทั้งตู้";
  const subtitle = house ? "บ้านพักรายวัน 2 ชั้น · ริมแม่น้ำปิง เชียงใหม่" : "ตู้ชกมวยอาร์เคด · รายได้จากค่าเล่นรายครั้ง";
  const presetIndex = presetShares.indexOf(share ?? -1);
  const quote = share === null ? null : offerAmount(id, share);
  const amount = quote === null ? "—" : quote.toLocaleString("th-TH", {
    minimumFractionDigits: Number.isInteger(quote) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  function viewEvidence() {
    if (isCompact) {
      setSection("evidence");
      sections.current?.querySelector<HTMLButtonElement>('[aria-controls="offer-evidence"]')?.focus({ preventScroll: true });
      sections.current?.scrollIntoView({ block: "start" });
    } else {
      evidence.current?.focus({ preventScroll: true });
      evidence.current?.scrollIntoView({ block: "start" });
    }
  }

  function updateInput(value: string) {
    setInput(value);
    const parsed = parsePercent(value, id);
    if (parsed !== null) {
      lastValidInput.current = value;
      onShareChange(parsed);
    }
  }
  function review(event: FormEvent) {
    event.preventDefault();
    if (share === null) { pctInput.current?.focus(); return; }
    sheet.current?.close();
    onContinue(share);
  }

  function startSheetGesture(event: PointerEvent<HTMLElement>) {
    sheetGesture.current = null;
    const panel = sheet.current;
    if (!panel?.open || panel.scrollTop > 1 || !event.isPrimary || event.button !== 0 ||
        (event.target instanceof Element && event.target.closest("button"))) return;
    sheetGesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function finishSheetGesture(event: PointerEvent<HTMLElement>) {
    const origin = sheetGesture.current;
    sheetGesture.current = null;
    if (!origin || origin.id !== event.pointerId) return;
    const down = event.clientY - origin.y;
    const sideways = Math.abs(event.clientX - origin.x);
    if (down >= 56 && down > sideways * 1.5) sheet.current?.close();
  }

  const calculator = (
    <div className="offer-calc-content">
      <header className="offer-calc-head"
        onPointerDown={isCompact ? startSheetGesture : undefined}
        onPointerUp={isCompact ? finishSheetGesture : undefined}
        onPointerCancel={() => { sheetGesture.current = null; }}
        onLostPointerCapture={() => { sheetGesture.current = null; }}>
        <div>
          <h2 id="offer-calculator">{house ? "ลองคำนวณจากรอบเดิม" : "เลือกสัดส่วนของตู้"}</h2>
          <p>{house ? "ราคาอ้างอิงรอบเดิมทั้งหลัง" : "ราคา" + fullAsset} <strong>{money(product.fullPrice)} บาท</strong>{house && " รวมภาษี"}</p>
        </div>
        {isCompact && <button className="offer-sheet-close" type="button" aria-label="ปิดตัวเลือกสัดส่วน" onClick={() => sheet.current?.close()}><X size={20} aria-hidden="true" /></button>}
      </header>
      <form className="offer-form" onSubmit={review} noValidate>
        {house && <div className="offer-share-presets" role="group" aria-label="เลือกสัดส่วนด่วน" data-custom={presetIndex < 0}
          style={{ "--selected-index": Math.max(0, presetIndex) } as CSSProperties}>
          <span className="offer-preset-thumb" aria-hidden="true" />
          {presetShares.map(pct => (
            <button type="button" key={pct} aria-pressed={share === pct} onClick={() => updateInput(String(pct))}>
              {pct === 100 ? fullAsset : pct + "%"}
            </button>
          ))}
        </div>}
        <div className="offer-input-row">
          <div className="offer-input-label">
            <label htmlFor="requested-share">{house ? "กำหนดสัดส่วนเอง" : "สัดส่วนที่สนใจ"}</label>
            <p id="share-help">{house ? "10–100% · ทศนิยมได้ 2 ตำแหน่ง" : "ลากแถบหรือพิมพ์เอง เช่น 12.5%"}</p>
          </div>
          <div className="offer-pct-input">
            <input id="requested-share" ref={pctInput} type="text" inputMode="decimal" enterKeyHint="done"
              aria-label="กำหนดสัดส่วนเองเป็นเปอร์เซ็นต์" aria-invalid={share === null}
              aria-describedby={share === null ? "share-help share-error" : "share-help"} maxLength={7} value={input}
              onFocus={event => event.currentTarget.select()}
              onBlur={() => { if (share !== null && input !== String(share)) setInput(String(share)); }}
              onChange={event => updateInput(event.target.value)} />
            <span aria-hidden="true">%</span><Pencil size={14} aria-hidden="true" />
          </div>
        </div>
        {share === null && <p id="share-error" className="offer-invalid">กรอกสัดส่วน 10 ถึง 100% เช่น 12.75%</p>}
        {!house && <ShareSlider value={share ?? start} onChange={updateInput} />}
        <div className="offer-quote">
          <div className="offer-quote-amount" aria-live="polite" aria-atomic="true">
            <span>{house ? "ราคาอ้างอิงรอบเดิม" : "ราคาสำหรับ"}{share !== null && (house ? " · " + share + "%" : " " + boxingShareLabel(share))}</span>
            <p><strong>{amount}</strong><small>บาท</small></p>
          </div>
          <div className="offer-share-illustration" aria-hidden="true">
            <svg viewBox="0 0 56 56" className="offer-share-ring" fill="none">
              <circle cx="28" cy="28" r="24" />
              <circle cx="28" cy="28" r="24" pathLength="100" transform="rotate(-90 28 28)"
                strokeDasharray={(share ?? 0) + " 100"} opacity={share === null ? 0 : 1} />
            </svg>
            {house ? <House size={21} /> : <Gamepad2 size={21} />}
          </div>
        </div>
        <button className="offer-continue" type="submit" disabled={share === null}>
          {house ? "ทบทวนความสนใจรอบถัดไป" : "ทบทวนก่อนขอตรวจสิทธิ"}
        </button>
        <p className="offer-next">{house
          ? "รอบถัดไปยังไม่ยืนยันราคาและสิทธิ ฝากความสนใจได้โดยไม่มีการจองหรือชำระเงิน"
          : "หน้าถัดไปจะแสดงยอดและข้อมูลติดต่อก่อนส่งให้ทีมตรวจสิทธิ ขั้นตอนนี้ยังไม่ต้องชำระเงิน"}</p>
      </form>
    </div>
  );

  return (
    <article className="offer-page" data-product={id} data-section={section}>
      <a className="offer-back" href="#/catalog"><ChevronLeft size={19} aria-hidden="true" /> ทุกโครงการ</a>
      <header className="offer-title">
        <div className="offer-title-meta">
          <p className="offer-kind">{house ? <House size={16} aria-hidden="true" /> : <Gamepad2 size={17} aria-hidden="true" />}{house ? "บ้านพักให้เช่า" : "เครื่องเล่นอาร์เคด"}</p>
          {house && <p className="offer-round-status">รอบเดิมปิดแล้ว <span>14 ต.ค. 2569</span></p>}
        </div>
        <h1>{product.name}</h1>
        <p className="offer-subtitle">{house && <MapPin size={15} aria-hidden="true" />}{subtitle}</p>
      </header>
      <nav className="offer-sections" ref={sections} aria-label="ข้อมูลโครงการ">
        <button type="button" aria-controls="offer-overview" aria-pressed={section === "overview"} onClick={() => setSection("overview")}><BookOpen size={17} />ภาพรวม</button>
        <button type="button" aria-controls="offer-evidence" aria-pressed={section === "evidence"} onClick={() => setSection("evidence")}><ChartNoAxesColumn size={17} />{house ? "สถานะบ้าน" : "รายงานจริง"}</button>
        <button type="button" aria-controls="offer-terms" aria-pressed={section === "terms"} onClick={() => setSection("terms")}><FileText size={17} />เงื่อนไข</button>
      </nav>
      <div className="offer-introduction" id="offer-overview">
        <Gallery id={id} name={product.name} />
        <section className="offer-rights-summary" aria-labelledby="offer-basics">
          <h2 id="offer-basics">{house ? "สัดส่วน 10% ในรอบเดิม" : "สัดส่วน 10% ได้สิทธิอะไร"}</h2>
          <p className="offer-starting-price">{money(product.unitPrice)} <small>บาท</small></p>
          {house && <p className="offer-reference-caption">ราคาอ้างอิงรอบเดิม · ยังไม่ยืนยันการเปิดรอบถัดไป</p>}
          <dl>
            <div>
              <dt>{house ? <House aria-hidden="true" /> : <Gamepad2 aria-hidden="true" />} ถือสิทธิในอะไร</dt>
              <dd>{house ? "ตัวบ้านพักบนที่ดินเช่า สัญญาระบุชั้นหรือหน่วยที่ถือสิทธิ โฉนดยังเป็นของเจ้าของที่ดิน" : "ตู้ชกมวยเครื่องที่ระบุในสัญญา พร้อมเลขเครื่องและจุดติดตั้ง"}</dd>
            </div>
            <div>
              <dt>{house ? <BedDouble aria-hidden="true" /> : <Coins aria-hidden="true" />} รายได้มาจากไหน</dt>
              <dd>{house ? "ค่าที่พักของชั้นหรือหน่วยในสัญญา" : "ค่าเล่นที่ลูกค้าจ่ายให้ตู้นั้น"} หลังหักค่าใช้จ่ายจึงแบ่งตามสัดส่วน</dd>
            </div>
          </dl>
          <p className="offer-risk-mobile">หากรายรับหลังหักค่าใช้จ่ายเหลือศูนย์ งวดนั้นจะไม่มีส่วนแบ่ง</p>
          <button className="offer-evidence-jump" type="button" onClick={viewEvidence} aria-controls="offer-evidence">
            {house ? "ดูสถานะและข้อมูลบ้าน" : "ดูข้อมูลตู้และรายได้"}
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        </section>
      </div>
      <div ref={evidence} id="offer-evidence" className="offer-evidence-block" tabIndex={-1}>
        <ProjectEvidence id={id} />
      </div>
      <div className="offer-columns">
        <section id="offer-terms" className="offer-conditions" aria-labelledby="offer-income">
          <h2 id="offer-income">รายได้แบ่งอย่างไร</h2>
          <ol className="offer-income-flow" aria-label="รายได้มาถึงเจ้าของอย่างไร">
            <li>
              <span className="offer-flow-icon" aria-hidden="true">{house ? <BedDouble /> : <Coins />}</span>
              <div>
                <h3>{house ? "ผู้เข้าพักจ่ายค่าห้อง" : "ผู้เล่นจ่ายค่าเล่น"}</h3>
                <p>{house ? "นับค่าที่พักของชั้นหรือหน่วยที่ระบุในสัญญา" : "นับยอดเล่นที่เกิดขึ้นจริงจากตู้นี้"}</p>
              </div>
            </li>
            <li>
              <span className="offer-flow-icon" aria-hidden="true"><ReceiptText /></span>
              <div>
                <h3>หักค่าใช้จ่าย</h3>
                <p>{house ? "ค่าบริหาร 30% ของรายได้รวม และค่าใช้จ่ายของบ้าน" : "ค่าพื้นที่ ค่าไฟ ค่าดูแลและค่าซ่อมตามข้อตกลง"}</p>
              </div>
            </li>
            <li>
              <span className="offer-flow-icon" aria-hidden="true"><Wallet /></span>
              <div><h3>แบ่งตามสัดส่วน</h3><p>นำยอดสุทธิที่เหลือมาแบ่งตามสิทธิในสัญญา</p></div>
            </li>
          </ol>
          <a className="offer-owner-guide" href={"#/about/" + id}><CalendarDays size={18} aria-hidden="true" />ดูไทม์ไลน์และรอบรับเงิน{house ? "ของบ้านพัก" : "ของตู้ชกมวย"}</a>
          <h2 className="offer-terms-heading">เงื่อนไขโครงการ</h2>
          <div className="offer-term-list">
            {terms[id].map(([heading, body]) => <details key={heading}><summary>{heading}<ChevronRight size={17} aria-hidden="true" /></summary><p>{body}</p></details>)}
            {id === "house" && share !== null && <details><summary>ตัวอย่างสมมติเมื่อเหลือเงินให้แบ่ง<ChevronRight size={17} aria-hidden="true" /></summary>
              <p>สมมติว่าหน่วยที่คุณถือสิทธิมีเงินเหลือให้แบ่ง 10,000 บาท หลังหักค่าใช้จ่ายแล้ว
                {" "}ถ้าสัญญาให้ส่วนแบ่ง {share}% คุณจะได้รับ {money(10000 * share / 100)} บาทในรอบสมมตินี้ ยอดจริงขึ้นกับผลประกอบการของหน่วยนั้น</p>
            </details>}
          </div>
          <DocumentLink topic={id} />
        </section>
        {isCompact ? (
          <dialog ref={sheet} className="offer-sheet" aria-labelledby="offer-calculator"
            onClick={event => { if (event.target === event.currentTarget) sheet.current?.close(); }}
            onClose={() => { if (share === null) setInput(lastValidInput.current); }}>
            {calculator}
          </dialog>
        ) : (
          <section className="offer-calculation" aria-labelledby="offer-calculator">{calculator}</section>
        )}
      </div>
      {isCompact && <div className="offer-bottom">
        <div className="offer-bottom-inner">
          <div className="offer-bottom-price"><span>{house ? "อ้างอิงรอบเดิม" : ""}{share !== null && (house ? " " + share + "%" : boxingShareLabel(share))}</span><strong>{amount} <small>บาท</small></strong></div>
          <button type="button" aria-haspopup="dialog" onClick={() => sheet.current?.showModal()}>{house ? "ลองคำนวณ" : "เลือกสัดส่วน"}<ChevronRight size={17} aria-hidden="true" /></button>
        </div>
      </div>}
    </article>
  );
}

export function Offer(props: OfferProps) {
  return <OfferView key={props.id + "-" + props.initialShare} {...props} />;
}
