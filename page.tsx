"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  House,
  LayoutGrid,
  BriefcaseBusiness,
  BookOpen,
  UserRound,
  LogOut,
  Activity,
  ChevronLeft,
  Search,
  FileText,
  Timer,
  Building2,
  RefreshCw,
  Layers,
  Wallet,
  ClipboardList,
  Printer,
  ChevronDown,
  Minus,
  Plus,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import {
  projects,
  stages,
  money,
  dateTime,
  type Project,
  type Deal,
  type Stage,
} from "../lib/deals";

import { Catalog } from "./catalog";
import { SiteRelease } from "./site-release";
import { Offer } from "./offer";
import { InvestmentCheckout, RequestList } from "./investment-requests";
import { isOfferId, offers, validOfferShare, type OfferId } from "../lib/offers";
import { ProjectExamples } from "./project-report";
import { OwnershipGuide } from "./ownership-guide";
import { DocumentGuide } from "./document-guide";

type Route = { page: string; id?: string; share?: number };
type Mutation = {
  action: string;
  id: string;
  project?: string;
  units?: number;
  value?: string;
  accepted?: boolean;
  digest?: string;
};
const stageList = Object.keys(stages) as Stage[];
const legacyPages = ["project", "portfolio", "monitor", "record", "ops"];
const publicPages = ["catalog", "documents", "offer", "apply", "about", "ownership", "requests", "team-requests"];

function readRoute(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path, query] = raw.split("?");
  const [page, id] = path.split("/");
  const shareText = new URLSearchParams(query).get("share");
  const share = shareText === null ? undefined :
    /^\d{1,3}(?:\.\d{1,2})?$/.test(shareText) ? Number(shareText) : NaN;
  return {
    page: [...publicPages, ...legacyPages].includes(page) ? page : "catalog",
    id,
    share,
  };
}

function reviewOffer(id: OfferId, share: number) {
  const selection = id + "?share=" + share;
  window.history.replaceState(window.history.state, "", "#/offer/" + selection);
  window.location.hash = "/apply/" + selection;
}
function go(page: string, id?: string) {
  window.location.hash = "/" + page + (id ? "/" + id : "");
}
function Brand() {
  return (
    <span className="brand">
      <img src="/brand/deal-red.png" alt="DEAL!" width={2048} height={479} />
      <span>Invest</span>
    </span>
  );
}
function Status({ value }: { value: Stage }) {
  return <span className={"status status-" + value}>{stages[value][0]}</span>;
}
function available(project: string, items: Deal[]) {
  return Math.max(
    0,
    10 -
      items
        .filter((x) => x.project === project && x.state !== "cancelled")
        .reduce((s, i) => s + i.units, 0),
  );
}
function Empty({
  title,
  detail,
  action,
  onClick,
}: {
  title: string;
  detail: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty">
      <Layers size={30} />
      <h3>{title}</h3>
      <p>{detail}</p>
      {action && (
        <button className="secondary" onClick={onClick}>
          {action}
        </button>
      )}
    </div>
  );
}
function Back({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <button className="back" onClick={() => go(to)}>
      <ChevronLeft size={16} />
      {children}
    </button>
  );
}
function Detail({
  p,
  items,
  mutate,
  busy,
  ready,
  needsAuth,
}: {
  p: Project;
  items: Deal[];
  mutate: (m: Mutation) => Promise<boolean>;
  busy: boolean;
  ready: boolean;
  needsAuth: boolean;
}) {
  const left = available(p.id, items);
  const [units, setUnits] = useState(1);
  const [mode, setMode] = useState<"share" | "single">("share");
  const [alternatePhoto, setAlternatePhoto] = useState(false);
  const id = useRef("");
  const house = p.id === "house";
  const single = mode === "single";
  const maxUnits = Math.max(0, Math.min(9, left));
  const count = single ? 10 : Math.min(units, Math.max(1, maxUnits));
  const selectedPercent = count * 10;
  const fullLabel = house ? "ทั้งหลัง" : "ทั้งตู้";
  const scope = house
    ? single ? "ตัวบ้านทั้งหลังบนที่ดินเช่า" : "สิทธิร่วมในตัวบ้านบนที่ดินเช่า"
    : single ? "ตู้ชกมวยหนึ่งตู้เต็มจำนวน" : "สิทธิร่วมในตู้ชกมวยหนึ่งตู้";
  const incomeBasis = house
    ? single ? "ค่าที่พักทั้งหลัง" : "ค่าที่พักชั้นล่าง"
    : "ค่าเล่นของตู้ที่ระบุในสัญญา";
  const photos = house
    ? [
        [p.image, p.alt, "ภายนอก"],
        ["/media/house-interior.webp", "ภาพประกอบห้องนั่งเล่นของ Human Allowed", "ภายใน"],
      ]
    : [
        ["/media/boxing-front.webp", p.alt, "ตัวตู้"],
        ["/media/boxing-location.webp", "ภาพตัวอย่างตู้ Boxer & Kicker ที่จุดติดตั้ง", "จุดติดตั้ง"],
      ];
  const [photo, alt] = photos[Number(alternatePhoto)];
  const canCreate = ready && count <= left && !busy;
  function changeUnits(n: number) {
    setUnits(n);
    id.current = "";
  }
  async function reserve(e: FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    if (!id.current) id.current = crypto.randomUUID();
    const requestId = id.current;
    if (
      await mutate({
        id: requestId,
        action: "create",
        project: p.id,
        units: count,
      })
    )
      go("record", requestId);
  }
  return (
    <article className="deal-detail">
      <a className="detail-backlink" href="#/catalog">
        <ChevronLeft size={16} aria-hidden="true" /> กลับไปเลือกโครงการ
      </a>
      <p className="demo-scope-note">พื้นที่ทดลองเดิม · ราคาและสัญญาจำลอง <a href={"#/offer/" + p.id}>ดูข้อมูลโครงการและสถานะรอบ</a></p>
      <header className="detail-masthead">
        <div>
          <h1>{p.name}</h1>
          <p>{house ? "บ้านพักรายวัน · ริมแม่น้ำปิง เชียงใหม่" : "เครื่องเล่นอาร์เคด · ตู้ชกมวย"}</p>
        </div>
        <div className="detail-unit-price">
          <span>ราคาตัวอย่างสำหรับสัดส่วน 10%</span>
          <strong>฿{money(p.unitPrice)}</strong>
        </div>
      </header>
      <div className="detail-layout">
        <figure className="detail-gallery">
          <div className={"detail-photo " + (!house && !alternatePhoto ? "machine" : "")}>
            <img src={photo} alt={alt} fetchPriority="high" />
          </div>
          <figcaption>
            <span>{!house && alternatePhoto ? "ตัวอย่างจุดติดตั้ง รุ่น Boxer & Kicker" : "ภาพประกอบโครงการ"}</span>
            <div className="detail-photo-options" role="group" aria-label="เลือกภาพประกอบ">
              {photos.map(([, , label], index) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={Number(alternatePhoto) === index}
                  onClick={() => setAlternatePhoto(index === 1)}
                >
                  {label}
                </button>
              ))}
            </div>
          </figcaption>
        </figure>
        <form className="detail-form" onSubmit={reserve}>
          <h2>คำนวณราคาตามสิทธิที่เลือก</h2>
          <fieldset disabled={busy}>
            <legend>รูปแบบการถือสิทธิ</legend>
            <div className="detail-modes">
              {([
                ["share", "ถือร่วม", "เลือกสัดส่วน"],
                ["single", "ถือ" + fullLabel, "100%"],
              ] as const).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => {
                    setMode(value);
                    changeUnits(value === "single" ? 10 : 1);
                  }}
                >
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </button>
              ))}
            </div>
            <div className="detail-units">
              <div>
                <strong>สัดส่วนที่เลือก</strong>
                <small>{single ? "ถือ" + fullLabel : "ตัวอย่างนี้เลือกได้ทีละ 10%"}</small>
              </div>
              {single ? (
                <output className="detail-unit-count" aria-label="สัดส่วนที่เลือก">100%</output>
              ) : (
                <div className="detail-stepper" role="group" aria-label="เลือกสัดส่วน">
                  <button type="button" aria-label="ลดสัดส่วนลง 10 จุดเปอร์เซ็นต์" disabled={count <= 1} onClick={() => changeUnits(count - 1)}><Minus size={17} aria-hidden="true" /></button>
                  <output aria-label="สัดส่วนที่เลือก" aria-live="polite">{selectedPercent}%</output>
                  <button type="button" aria-label="เพิ่มสัดส่วนขึ้น 10 จุดเปอร์เซ็นต์" disabled={count >= maxUnits} onClick={() => changeUnits(count + 1)}><Plus size={17} aria-hidden="true" /></button>
                </div>
              )}
            </div>
          </fieldset>
          <dl className="detail-scope" aria-live="polite">
            <div><dt>สิทธิของคุณ</dt><dd>{scope}</dd></div>
            <div><dt>ส่วนแบ่งตัวอย่าง</dt><dd>{selectedPercent}% ของ{incomeBasis}หลังหักค่าใช้จ่าย</dd></div>
          </dl>
          <div className="detail-total">
            <div>
              <span>ราคารวมตัวอย่าง</span>
              <strong aria-live="polite">฿{money(p.unitPrice * count)}</strong>
            </div>
            <small>ราคา{fullLabel} ฿{money(p.unitPrice * 10)} × {selectedPercent}%</small>
          </div>
          <ProjectExamples project={p} units={count} />
          {ready && count > left && (
            <p className="detail-availability" role="status">
              {left === 0
                ? "บัญชีนี้จองทดลองครบ 100% แล้ว ดูรายการที่เคยจองได้ในรายการของฉัน"
                : "บัญชีนี้จองทดลองเพิ่มได้อีก " + left * 10 + "% เลือกถือร่วมเพื่อปรับสัดส่วน"}
            </p>
          )}
          {needsAuth ? (
            <a
              className="detail-reserve"
              href={"/signin-with-chatgpt?return_to=" + encodeURIComponent("/#/project/" + p.id)}
              target="_top"
            >
              เข้าสู่ระบบเพื่อจองทดลอง
            </a>
          ) : (
            <button className="detail-reserve" type="submit" disabled={!canCreate}>
              {busy ? "กำลังสร้างรายการ…" : !ready ? "กำลังตรวจสัดส่วนที่จองได้…" : "จองทดลองและเปิดสัญญา"}
            </button>
          )}
          <p className="detail-footnote">ใช้ข้อมูลสมมติ ไม่มีการเรียกเก็บเงิน</p>
        </form>
        <section className="detail-facts" aria-labelledby="detail-facts-title">
          <h2 id="detail-facts-title">เงื่อนไขของโครงการ</h2>
          <div className="detail-fact-list">
            {[
              ["ถือสิทธิอะไร", p.ownership[mode]],
              ["แบ่งรายรับอย่างไร", p.income],
              ["ทีม DEAL! ดูแลอะไรบ้าง", p.operations],
              ["อะไรทำให้รายรับเปลี่ยน", p.risks],
              ["ทีมตรวจอะไรหลังยืนยันสิทธิ", p.milestone],
            ].map(([title, body]) => (
              <details key={title}>
                <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
                <p>{body}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
function heading(title: string, blurb: string) {
  return (
    <div className="page-heading">
      <h1>{title}</h1>
      <p>{blurb}</p>
    </div>
  );
}
function Metrics({
  entries,
}: {
  entries: { label: string; value: string; icon: typeof House }[];
}) {
  return (
    <div
      className={"metrics" + (entries.length === 3 ? " portfolio-metrics" : "")}
    >
      {entries.map(({ label, value, icon: Icon }) => (
        <div key={label}>
          <Icon size={20} />
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
function ListPage({
  ops,
  items,
  reload,
  loading,
}: {
  ops: boolean;
  items: Deal[];
  reload: () => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState(""),
    [state, setState] = useState("all"),
    [project, setProject] = useState("all"),
    [late, setLate] = useState(false),
    [filtersOpen, setFiltersOpen] = useState(false);
  const total = items
    .filter((i) => i.state === "active")
    .reduce((s, i) => s + i.amount, 0);
  const localDay = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = localDay.format(new Date());
  const verified = items.flatMap((item) => {
    const event = item.history.find((entry) => entry.state === "allocation");
    return event
      ? [{ day: localDay.format(new Date(event.at)), amount: item.amount }]
      : [];
  });
  const dayAmount = verified
    .filter((entry) => entry.day === today)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const monthAmount = verified
    .filter((entry) => entry.day.slice(0, 7) === today.slice(0, 7))
    .reduce((sum, entry) => sum + entry.amount, 0);
  const isLate = (i: Deal) =>
    !["cancelled", "active"].includes(i.state) &&
    Date.now() - new Date(i.updated).getTime() > 86400000;
  const customerAction: Record<Stage, string> = {
    draft: "อ่านและลงนามสัญญา",
    payment: "แจ้งรหัสชำระทดลอง",
    review: "ติดตามการตรวจยอด",
    allocation: "ติดตามการยืนยันสิทธิ",
    active: "เปิดสัญญาของฉัน",
    cancelled: "ดูรายการที่ยกเลิก",
  };
  const rows = items.filter(
    (i) =>
      (state === "all" || i.state === state) &&
      (project === "all" || i.project === project) &&
      (!ops || !late || isLate(i)) &&
      (
        i.id +
        " " +
        (i.signer || "") +
        " " +
        projects.find((p) => p.id === i.project)?.name
      )
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const activeFilterCount = Number(state !== "all") + Number(project !== "all") + Number(ops && late);
  function clearFilters() {
    setState("all");
    setProject("all");
    setLate(false);
  }
  return (
    <div className="records-list">
      {heading(
        ops ? "งานทดลองของทีม" : "การจองทดลองของฉัน",
        ops
          ? "ตรวจรายการที่รอบัญชียืนยันยอดและทีมโครงการจัดสรรสิทธิ"
          : "ดูสถานะ อ่านสัญญาตัวอย่าง และเปิดขั้นตอนถัดไปของแต่ละรายการ",
      )}
      {items.length > 0 && <Metrics
        entries={
          ops
            ? [
                {
                  label: "รายการทั้งหมด",
                  value: String(items.length),
                  icon: ClipboardList,
                },
                {
                  label: "รอตรวจยอด",
                  value: String(
                    items.filter((i) => i.state === "review").length,
                  ),
                  icon: Wallet,
                },
                {
                  label: "รอยืนยันสิทธิ",
                  value: String(
                    items.filter((i) => i.state === "allocation").length,
                  ),
                  icon: Layers,
                },
                {
                  label: "ค้างเกิน 24 ชม.",
                  value: String(items.filter(isLate).length),
                  icon: Timer,
                },
              ]
            : [
                {
                  label: "มูลค่าที่ได้ยืนยันสิทธิแล้ว (ทดลอง)",
                  value: "฿" + money(total),
                  icon: Wallet,
                },
                {
                  label: "โครงการที่ยืนยันแล้ว",
                  value: String(
                    new Set(
                      items
                        .filter((i) => i.state === "active")
                        .map((i) => i.project),
                    ).size,
                  ),
                  icon: Building2,
                },
                {
                  label: "รายการที่ยังดำเนินการอยู่",
                  value: String(
                    items.filter(
                      (i) => i.state !== "active" && i.state !== "cancelled",
                    ).length,
                  ),
                  icon: Timer,
                },
              ]
        }
      />}
      {ops && items.length > 0 && (
        <div className="verified-totals">
          <span>
            <Wallet size={18} /> ยอดที่บัญชียืนยันแล้ว (ทดลอง)
          </span>
          <span>
            วันนี้ <b>฿{money(dayAmount)}</b>
          </span>
          <span>
            เดือนนี้ <b>฿{money(monthAmount)}</b>
          </span>
        </div>
      )}
      <div className="panel ledger">
        <div className="ledger-heading">
          <h2>{ops ? "คิวงาน" : "รายการจอง"}{items.length > 0 && <span className="record-count" role="status">{rows.length} รายการ</span>}</h2>
          <button className="secondary" disabled={loading} onClick={reload}>
            <RefreshCw size={16} />
            {loading ? "กำลังอัปเดต…" : "อัปเดตรายการ"}
          </button>
        </div>
        {items.length > 0 && <div className="record-filters">
          <label className="search">
            <Search size={17} />
            <input
              placeholder={
                ops
                  ? "ชื่อผู้ลงนามหรือเลขรายการ"
                  : "ชื่อโครงการหรือเลขรายการ"
              }
              aria-label="ค้นหารายการ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button
            className="record-filter-toggle"
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="record-filter-fields"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Layers size={16} aria-hidden="true" />
            ตัวกรอง{activeFilterCount > 0 ? " (" + activeFilterCount + ")" : ""}
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          <div id="record-filter-fields" className="record-filter-fields" hidden={!filtersOpen}>
            <label>
              สถานะรายการ
              <select aria-label="สถานะ" value={state} onChange={(e) => setState(e.target.value)}>
                <option value="all">ทุกสถานะ</option>
                {stageList.map((k) => <option key={k} value={k}>{stages[k][0]}</option>)}
              </select>
            </label>
            <label>
              โครงการ
              <select aria-label="โครงการ" value={project} onChange={(e) => setProject(e.target.value)}>
                <option value="all">ทุกโครงการ</option>
                {projects.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </label>
            {ops && (
              <label className="check">
                <input type="checkbox" checked={late} onChange={(e) => setLate(e.target.checked)} />
                ค้างเกิน 24 ชม.
              </label>
            )}
            {activeFilterCount > 0 && (
              <button type="button" className="text-btn" onClick={clearFilters}>ล้างตัวกรอง</button>
            )}
          </div>
        </div>}
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>โครงการ / เลขรายการ</th>
                  <th>มูลค่าทดลอง</th>
                  <th>สถานะ</th>
                  <th>{ops ? "ผู้รับผิดชอบ" : "อัปเดตล่าสุด"}</th>
                  <th><span className="sr-only">ขั้นตอนถัดไป</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => {
                  const asset = projects.find((p) => p.id === i.project);
                  return (
                    <tr key={i.id}>
                      <td>
                        <div className="record-asset">
                          {asset && <img src={asset.image} alt="" loading="lazy" />}
                          <div>
                            <strong>{asset?.name || i.project}</strong>
                            <small>
                              เลขที่ {i.id.slice(0, 8).toUpperCase()}
                              {i.signer ? " · " + i.signer : ""}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="ledger-amount">฿{money(i.amount)}</td>
                      <td>
                        <Status value={i.state} />
                      </td>
                      <td>
                        <span className="mobile-cell-title">{ops ? "ผู้รับผิดชอบ" : "อัปเดต"}</span>
                        {ops ? stages[i.state][1] : dateTime(i.updated)}
                        {ops &&
                          i.state !== "active" &&
                          i.state !== "cancelled" && (
                            <small className={isLate(i) ? "warn" : undefined}>
                              รอ{" "}
                              {Math.max(
                                0,
                                Math.floor(
                                  (Date.now() - Date.parse(i.updated)) / 3600000,
                                ),
                              )}{" "}
                              ชม.
                            </small>
                          )}
                      </td>
                      <td>
                        <a
                          className="row-link"
                          href={`#/${ops ? "ops" : "record"}/${i.id}`}
                        >
                          {ops
                            ? i.state === "review"
                              ? "ตรวจยอดชำระ"
                              : i.state === "allocation"
                                ? "ตรวจและยืนยันสิทธิ"
                                : "ดูรายการ"
                            : customerAction[i.state]}
                          <span className="sr-only"> · {asset?.name} · {i.id.slice(0, 8)}</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={
              loading
                ? "กำลังโหลดรายการ…"
                : items.length
                  ? "ไม่พบรายการตามตัวกรอง"
                  : ops ? "ยังไม่มีรายการให้ทีมติดตาม" : "ยังไม่มีการจอง"
            }
            detail={
              loading ? "กำลังอัปเดตข้อมูลล่าสุด" : items.length
                ? "ลองค้นหาด้วยเลขรายการ หรือกลับไปดูทุกรายการ"
                : ops ? "เมื่อมีการสร้างรายการทดลองในบัญชีนี้ จะเห็นสถานะและผู้รับผิดชอบที่นี่"
                  : "สัญญาจากการจองทดลองจะแสดงที่นี่ คุณติดตามคำขอที่ส่งให้ทีมได้ในหน้าคำขอของฉัน"
            }
            action={loading ? undefined : items.length ? "แสดงทุกรายการ" : ops ? "ดูโครงการ" : "ดูคำขอของฉัน"}
            onClick={() => {
              if (items.length) {
                clearFilters();
                setSearch("");
              } else go(ops ? "catalog" : "requests");
            }}
          />
        )}
      </div>
    </div>
  );
}
function RecordPage({
  row: i,
  ops,
  mutate,
  busy,
  canManage,
}: {
  canManage: boolean;
  row: Deal;
  ops: boolean;
  mutate: (m: Mutation) => Promise<boolean>;
  busy: boolean;
}) {
  const [value, setValue] = useState(""),
    [accepted, setAccepted] = useState(false),
    [returning, setReturning] = useState(false),
    [cancel, setCancel] = useState(false);
  const p = projects.find((p) => p.id === i.project)!;
  const selectedPercent = i.units * 10;
  const action = ops
    ? i.state === "review"
      ? returning
        ? "return"
        : "verify"
      : i.state === "allocation"
        ? "activate"
        : null
    : i.state === "draft"
      ? "sign"
      : i.state === "payment"
        ? "submit"
        : null;
  async function apply(e: FormEvent) {
    e.preventDefault();
    if (!action) return;
    const ok = await mutate({
      id: i.id,
      action,
      value,
      accepted,
      digest: i.digest,
    });
    if (ok) {
      setValue("");
      setAccepted(false);
      setReturning(false);
      setCancel(false);
    }
  }
  const formLabel =
    action === "sign"
      ? "ชื่อผู้ลงนามสมมติ"
      : action === "submit"
        ? "รหัสอ้างอิงที่ใช้ทดสอบ"
        : "เหตุผลที่ส่งกลับ";
  return (
    <article className="booking-record">
      <Back to={ops ? "monitor" : "portfolio"}>
        {ops ? "กลับไปงานของทีม" : "กลับไปรายการของฉัน"}
      </Back>
      <div className="record-header">
        <img className="record-cover" src={p.image} alt="" />
        <div className="record-title">
          <div className="overline">การจองทดลอง · {i.id.slice(0, 8).toUpperCase()}</div>
          <h1>{p.name}</h1>
          <p>
            {i.units === 10 ? "เจ้าของคนเดียว" : "เจ้าของร่วม"} · สัดส่วน {selectedPercent}%
          </p>
        </div>
        <div className="record-value"><span>มูลค่าทดลอง</span><strong>฿{money(i.amount)}</strong><Status value={i.state} /></div>
      </div>
      {i.state !== "cancelled" && (
        <ol className="record-progress" aria-label="ความคืบหน้ารายการ">
          {(
            ["draft", "payment", "review", "allocation", "active"] as const
          ).map((stage, index, order) => {
            const current = order.findIndex((value) => value === i.state);
            return (
              <li
                key={stage}
                aria-current={current === index ? "step" : undefined}
                className={index < current ? "done" : ""}
              >
                <i />
                {
                  [
                    "ลงนาม",
                    "แจ้งชำระ",
                    "ตรวจยอด",
                    "จัดสรรสิทธิ",
                    "เสร็จสิ้น",
                  ][index]
                }
              </li>
            );
          })}
        </ol>
      )}
      <div className="record-grid">
        <aside className="record-action panel" aria-labelledby="record-action-title">
            <h2 id="record-action-title">{{
              draft: ops ? "รอลูกค้าลงนาม" : "ลงนามในสัญญาตัวอย่าง",
              payment: ops ? "รอลูกค้าแจ้งรหัสชำระ" : "แจ้งรหัสชำระทดลอง",
              review: ops ? "ตรวจยอดชำระทดลอง" : "รอบัญชีตรวจยอด",
              allocation: ops ? "ยืนยันการจัดสรรสิทธิ" : "รอทีมยืนยันสิทธิ",
              active: "ยืนยันสิทธิทดลองแล้ว",
              cancelled: "ยกเลิกการจองแล้ว",
            }[i.state]}</h2>
            {action === "sign" && (
              <button type="button" className="read-contract" onClick={() => document.getElementById("print-document")?.focus()}>
                <FileText size={17} /> อ่านสัญญาก่อนลงนาม
              </button>
            )}
            {ops && action === "verify" && <p>ตรวจรหัสอ้างอิงและมูลค่ารายการก่อนส่งให้ทีมจัดสรรสิทธิ</p>}
            {action === "activate" && <p>บัญชียืนยันยอดแล้ว ตรวจสัดส่วนที่จองก่อนยืนยันสิทธิในรายการนี้</p>}
            {i.state === "payment" && i.history.at(-1)?.note.startsWith("ขอแก้ไข ") && (
              <p className="record-reason"><b>บัญชีขอให้แก้ไข</b> {i.history.at(-1)?.note.slice("ขอแก้ไข ".length)}</p>
            )}
            {i.paymentRef && (
              <p className="ref">รหัสชำระที่ส่ง <b>{i.paymentRef}</b></p>
            )}
            {action ? (
              <form onSubmit={apply}>
                {["sign", "submit", "return"].includes(action) && (
                  <label>
                    {formLabel}
                    <input
                      key={action}
                      id="record-action-name"
                      value={value}
                      minLength={2}
                      maxLength={120}
                      required
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={
                        action === "sign"
                          ? "เช่น ลูกค้าทดสอบ"
                          : action === "submit"
                            ? "เช่น TEST-0001"
                            : "ระบุสิ่งที่ต้องแก้ไข"
                      }
                    />
                  </label>
                )}
                {action === "sign" && (
                  <label className="check">
                    <input
                      required
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    ฉันได้อ่านเอกสารและยืนยันลงนามในสัญญาตัวอย่างฉบับนี้
                  </label>
                )}
                {action === "submit" && (
                  <p className="fine">ใช้รหัสสมมติในการทดสอบ งดโอนเงินจริง</p>
                )}
                <button className="primary wide" disabled={busy}>
                  {busy
                    ? "กำลังบันทึก…"
                    : {
                        sign: "ลงนามสัญญาตัวอย่าง",
                        submit: "ส่งรหัสให้บัญชีตรวจ",
                        verify: "ยืนยันยอดและส่งให้ทีมจัดสรรสิทธิ",
                        return: "ส่งกลับให้แก้ไข",
                        activate: "ยืนยันสิทธิทดลอง",
                      }[action]}
                </button>
                {ops && i.state === "review" && (
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => {
                      setReturning(!returning);
                      setValue("");
                    }}
                  >
                    {returning ? "กลับไปยืนยันยอด" : "ขอให้ลูกค้าแก้ไข"}
                  </button>
                )}
              </form>
            ) : (
              <p className="fine">
                {{
                  draft: "ลูกค้าต้องอ่านและลงนามสัญญาตัวอย่างก่อนแจ้งรหัสชำระ",
                  payment: "เมื่อได้รับรหัสชำระทดลอง ทีมบัญชีจะตรวจยอดได้",
                  review: "ส่งรหัสชำระให้บัญชีแล้ว เมื่อยืนยันยอด ทีมโครงการจะตรวจสิทธิต่อ",
                  allocation: "บัญชียืนยันยอดแล้ว ทีมโครงการจะตรวจสัดส่วนที่จองและยืนยันสิทธิ",
                  active: "เปิดสัญญาหรือพิมพ์สำเนาจากรายการนี้ได้",
                  cancelled: "ยกเลิกสิทธิที่จองทดลองไว้แล้ว คุณเลือกโครงการเพื่อสร้างรายการใหม่ได้",
                }[i.state]}
              </p>
            )}
            {!ops &&
              i.state === "draft" &&
              (cancel ? (
                <div className="confirm">
                  <p>ยกเลิกการจองทดลองสัดส่วน {selectedPercent}% ของ {p.name}?</p>
                  <button
                    disabled={busy}
                    className="secondary"
                    onClick={() => mutate({ action: "cancel", id: i.id })}
                  >
                    ยืนยันยกเลิก
                  </button>
                  <button className="text-btn" onClick={() => setCancel(false)}>
                    เก็บการจองไว้
                  </button>
                </div>
              ) : (
                <button className="text-btn" onClick={() => setCancel(true)}>
                  ยกเลิกการจองทดลอง
                </button>
              ))}
            {canManage &&
              ((!ops && ["review", "allocation"].includes(i.state)) ||
                (ops && ["draft", "payment"].includes(i.state))) && (
                <button
                  className="secondary wide"
                  onClick={() => go(ops ? "record" : "ops", i.id)}
                >
                  {ops ? "เปิดขั้นตอนของลูกค้า" : "เปิดขั้นตอนของทีม DEAL!"}
                </button>
              )}
        </aside>
        <section className="panel paper" id="print-document" aria-labelledby="contract-heading" tabIndex={-1}>
          <div className="ledger-heading">
            <h2 id="contract-heading">
              <FileText size={21} /> สัญญาตัวอย่าง
            </h2>
            <button
              className="secondary print-btn"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              พิมพ์สัญญา
            </button>
          </div>
          <div className="contract">
            {i.document.split("\n\n").map((v, j) => (
              <p key={j}>{v}</p>
            ))}
          </div>
          <div className="signature">
            <span>ผู้ลงนามทดลอง</span>
            <b>{i.signer || "รอลงนาม"}</b>
            {i.signedAt && <small>{dateTime(i.signedAt)} น. (กรุงเทพฯ)</small>}
          </div>
          <details className="document-digest">
            <summary>รหัสตรวจสอบเอกสาร</summary>
            <small className="hash">SHA-256 · {i.digest}</small>
          </details>
          {action === "sign" && (
            <button type="button" className="secondary document-return" onClick={() => document.getElementById("record-action-name")?.focus()}>
              กลับไปลงนาม
            </button>
          )}
        </section>
          <section className="panel timeline" aria-labelledby="booking-history">
            <h3 id="booking-history"><Timer size={19} aria-hidden="true" /> ประวัติรายการ</h3>
            {[...i.history].reverse().map((e, j) => (
              <div key={e.at + j}>
                <i />
                <section>
                  <b>{stages[e.state][0]}</b>
                  <p>{e.note}</p>
                  <small>
                    {e.by} · {dateTime(e.at)}
                  </small>
                </section>
              </div>
            ))}
          </section>
      </div>
    </article>
  );
}
export default function HomePage() {
  const [route, setRoute] = useState<Route>({ page: "catalog" }),
    [items, setItems] = useState<Deal[]>([]),
    [loading, setLoading] = useState(true),
    [ready, setReady] = useState(false),
    [canManage, setCanManage] = useState(false),
    [canReview, setCanReview] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [needsAuth, setNeedsAuth] = useState(true),
    [authReady, setAuthReady] = useState(false),
    [projectDetail, setProjectDetail] = useState<Project | null>(null),
    [detailError, setDetailError] = useState("");
  const revision = useRef(0),
    pending = useRef(false);
  const siteHeader = useRef<HTMLElement>(null);
  const mainContent = useRef<HTMLElement>(null);
  const [offerDraft, setOfferDraft] = useState<{ route: Route; share: number } | null>(null);

  useEffect(() => {
    function closeMenus(event: PointerEvent | FocusEvent | KeyboardEvent) {
      for (const menu of siteHeader.current?.querySelectorAll<HTMLDetailsElement>("details[open]") ?? []) {
        if (event instanceof KeyboardEvent) {
          if (event.key !== "Escape") continue;
          menu.open = false;
          menu.querySelector("summary")?.focus();
        } else if (event.target instanceof Node && !menu.contains(event.target)) {
          menu.open = false;
        }
      }
    }
    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("focusin", closeMenus);
    document.addEventListener("keydown", closeMenus);
    return () => {
      document.removeEventListener("pointerdown", closeMenus);
      document.removeEventListener("focusin", closeMenus);
      document.removeEventListener("keydown", closeMenus);
    };
  }, []);
  async function refresh() {
    const rev = ++revision.current;
    setLoading(true);
    try {
      const sessionResponse = await fetch("/api/session", {
        cache: "no-store",
      });
      if (!sessionResponse.ok)
        throw new Error("ตรวจสอบการเข้าสู่ระบบไม่สำเร็จ");
      const session = (await sessionResponse.json()) as {
        signedIn: boolean;
        canManage: boolean;
        canReview: boolean;
      };
      if (rev !== revision.current) return;
      setNeedsAuth(!session.signedIn);
      setCanManage(session.signedIn && session.canManage);
      setCanReview(session.signedIn && session.canReview);
      setAuthReady(true);
      if (!session.signedIn) {
        setItems([]);
        setProjectDetail(null);
        setReady(false);
        setError("");
        return;
      }
      if (!legacyPages.includes(readRoute().page)) {
        setError("");
        return;
      }
      const r = await fetch("/api/desk", { cache: "no-store" });
      const d = (await r.json()) as {
        items: Deal[];
        canManage?: boolean;
        error?: string;
      };
      if (rev !== revision.current) return;
      setNeedsAuth(r.status === 401);
      if (r.ok) setCanManage(d.canManage === true);
      if (r.status === 401) { setCanManage(false); setCanReview(false); }
      if (!r.ok) {
        if (r.status === 401) {
          setItems([]);
          setProjectDetail(null);
        }
        throw new Error(d.error || "โหลดสถานะรายการไม่สำเร็จ");
      }
      setItems(d.items);
      setReady(true);
      setError("");
    } catch (e) {
      if (rev === revision.current) {
        setReady(false);
        setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
      }
    } finally {
      if (rev === revision.current) {
        setLoading(false);
      }
    }
  }
  async function mutate(m: Mutation) {
    if (pending.current) return false;
    pending.current = true;
    ++revision.current;
    setBusy(true);
    setLoading(false);
    setError("");
    try {
      const r = await fetch("/api/desk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(m),
        }),
        d = (await r.json()) as { items: Deal[]; error?: string };
      if (!r.ok) {
        if (r.status === 401) {
          setNeedsAuth(true);
          setCanManage(false);
          setCanReview(false);
          setItems([]);
          setProjectDetail(null);
          setReady(false);
        }
        if (r.status === 409) await refresh();
        throw new Error(d.error || "บันทึกไม่สำเร็จ");
      }
      setItems(d.items);
      setReady(true);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    let previousPage = "";
    function navigate() {
      const next = readRoute();
      setRoute(next);
      if (previousPage !== "about" || next.page !== "about") window.scrollTo(0, 0);
      previousPage = next.page;
    }
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  const { page, id } = route;
  const legacy = legacyPages.includes(page);
  useEffect(() => { void refresh(); }, [legacy]);
  const selectedShare = route.share ?? 10;
  useEffect(() => {
    const titles: Record<string, string> = {
      catalog: "เลือกโครงการ", documents: "บิลและสัญญา", about: "รู้จัก DEAL!", ownership: "วิธีเป็นเจ้าของ",
      requests: id ? "รายละเอียดคำขอของฉัน" : "คำขอของฉัน",
      "team-requests": id ? "รายละเอียดคำขอลูกค้า" : "คำขอลูกค้า",
      portfolio: "รายการทดลองเดิม", monitor: "งานทดลองของทีม",
    };
    const title = (page === "offer" || page === "apply") && isOfferId(id)
      ? (page === "apply" ? (id === "house" ? "แจ้งความสนใจรอบถัดไป · " : "ขอตรวจสิทธิที่ว่าง · ") : "") + offers[id].name
      : titles[page] ?? "รายละเอียดรายการ";
    document.title = title + " | DEAL! Invest";
  }, [page, id]);
  const card = projects.find((project) => project.id === id);
  const p = projectDetail?.id === id ? projectDetail : null;
  const row = items.find((item) => item.id === id);
  const signedIn = authReady && !needsAuth;
  const workspace =
    signedIn && ["requests", "team-requests", "portfolio", "record", "monitor", "ops"].includes(page);
  const active = ["project", "catalog", "offer", "apply", "documents"].includes(page)
    ? "catalog"
    : page === "record"
      ? "portfolio"
      : page === "ops"
        ? "monitor"
        : page;
  // Keep dragging smooth on browsers that rate-limit history updates.
  useEffect(() => {
    if (route.page !== "offer" || offerDraft?.route !== route) return;
    const currentHash = window.location.hash;
    const nextHash = "#/offer/" + route.id + "?share=" + offerDraft.share;
    if (currentHash === nextHash) return;
    const timer = window.setTimeout(() => {
      if (window.location.hash === currentHash) {
        window.history.replaceState(window.history.state, "", nextHash);
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [offerDraft, route]);

  const returnShare = page === "offer" && offerDraft?.route === route ? offerDraft.share : route.share;
  const returnTo = "/#/" + page + (id ? "/" + encodeURIComponent(id) : "") +
    ((page === "offer" || page === "apply") && returnShare !== undefined && isOfferId(id) &&
      validOfferShare(id, returnShare) ? "?share=" + returnShare : "");
  const signInHref =
    "/signin-with-chatgpt?return_to=" + encodeURIComponent(returnTo);

  useEffect(() => {
    setProjectDetail(null);
    setDetailError("");
    if (!signedIn || page !== "project" || !id) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(
          "/api/project?id=" + encodeURIComponent(id),
          { cache: "no-store", signal: controller.signal },
        );
        const data = (await response.json()) as {
          project?: Project;
          error?: string;
        };
        if (controller.signal.aborted) return;
        if (response.status === 401) {
          setNeedsAuth(true);
          setCanManage(false);
          setCanReview(false);
          setItems([]);
          setReady(false);
          return;
        }
        if (!response.ok || !data.project)
          throw new Error(data.error || "โหลดรายละเอียดไม่สำเร็จ");
        setProjectDetail(data.project);
      } catch (error) {
        if (!controller.signal.aborted)
          setDetailError(
            error instanceof Error ? error.message : "โหลดรายละเอียดไม่สำเร็จ",
          );
      }
    })();
    return () => controller.abort();
  }, [signedIn, page, id]);

  const publicNavigation: Array<readonly [string, string, LucideIcon]> = [
    ["catalog", "โครงการ", LayoutGrid],
    ["ownership", "วิธีเป็นเจ้าของ", BookOpen],
    ["about", "รู้จัก DEAL!", Building2],
    ["requests", "คำขอของฉัน", ClipboardList],
  ];
  const tabIndex = publicNavigation.findIndex(([path]) => path === active);
  const showMobileTabs = publicNavigation.some(([path]) => path === page);
  const accountNavigation: Array<readonly [string, string, LucideIcon]> = [
    ["requests", "คำขอของฉัน", BriefcaseBusiness],
    ...(canReview ? [["team-requests", "คำขอลูกค้า", Activity] as const] : []),
  ];

  function navigationLinks(entries: typeof publicNavigation) {
    return entries.map(([path, label, Icon]) => (
      <a key={path} href={"#/" + path} aria-current={active === path ? "page" : undefined}>
        <Icon size={18} aria-hidden="true" />
        <span>{label}</span>
      </a>
    ));
  }
  const accountLinks = (
    <>
      {navigationLinks(accountNavigation)}
      {legacy && <a href="#/portfolio">รายการทดลองเดิม</a>}
      {legacy && canManage && <a href="#/monitor">งานทดลองของทีม</a>}
      <a className="invest-signout" href="/signout-with-chatgpt?return_to=/" target="_top">
        <LogOut size={18} aria-hidden="true" />
        ออกจากระบบ
      </a>
    </>
  );
  return (
    <div
      className="app-layout invest-shell"
      data-detail={page === "project" && !!card}
      data-workspace={workspace}
      data-page={page}
      data-mobile-tabs={showMobileTabs}
    >
      <a
        className="invest-skip"
        href="#invest-content"
        onClick={(event) => {
          event.preventDefault();
          mainContent.current?.focus();
        }}
      >
        ข้ามไปเนื้อหา
      </a>
      <header
        className="invest-header"
        ref={siteHeader}
        onClick={(event) => {
          if (!(event.target instanceof Element)) return;
          const link = event.target.closest("a");
          const disclosure = link?.closest("details");
          if (!disclosure) return;
          disclosure.open = false;
          if (link?.hash) mainContent.current?.focus({ preventScroll: true });
        }}
      >
        <div className="invest-masthead">
          <div className="invest-identity">
            <a aria-label="DEAL! Invest หน้าหลัก" className="invest-brand" href="#/catalog">
              <Brand />
            </a>
            <SiteRelease />
          </div>
          <nav className="invest-nav" aria-label="เมนูหลัก" data-tab={tabIndex}>
            {navigationLinks(publicNavigation)}
          </nav>
          <div className="invest-actions">
            {!signedIn ? (
              <a className="invest-login" href={signInHref} target="_top">
                <UserRound size={16} aria-hidden="true" />
                เข้าสู่ระบบ
              </a>
            ) : (
                <details className="invest-disclosure invest-account">
                  <summary data-active={workspace}>
                    <UserRound size={16} aria-hidden="true" />
                    บัญชีของฉัน
                    <ChevronDown size={14} aria-hidden="true" />
                  </summary>
                  <nav className="invest-popover" aria-label="บัญชีของฉัน">
                    {accountLinks}
                  </nav>
                </details>
            )}
          </div>
        </div>
      </header>
      <div className="workspace-main">
        <main className="shell" id="invest-content" ref={mainContent} tabIndex={-1}>
          {error && (legacy || !authReady) && (
            <div className="notice" role="alert">
              <span>{error}</span>
              <button onClick={refresh}>โหลดใหม่</button>
            </div>
          )}
          {page === "catalog" ? (
            <Catalog />
          ) : page === "documents" ? (
            <DocumentGuide id={id} />
          ) : page === "offer" && isOfferId(id) ? (
            <Offer key={id} id={id} initialShare={selectedShare}
              onShareChange={share => setOfferDraft({ route, share })}
              onContinue={share => reviewOffer(id, share)} />
          ) : page === "apply" && isOfferId(id) && validOfferShare(id, selectedShare) ? (
            <InvestmentCheckout key={id + ":" + selectedShare} id={id} share={selectedShare} signedIn={signedIn} authReady={authReady} />
          ) : page === "apply" || page === "offer" ? (
            <Empty title="ตรวจสอบโครงการและสัดส่วนอีกครั้ง" detail="เลือกโครงการและระบุสัดส่วนที่ต้องการก่อนส่งคำขอ"
              action={isOfferId(id) ? "กลับไปเลือกสัดส่วน" : "ดูโครงการ"} onClick={() => isOfferId(id) ? go("offer", id) : go("catalog")} />
          ) : page === "about" || page === "ownership" ? (
            <OwnershipGuide page={page} project={isOfferId(id) ? id : "boxing"} onSelect={value => go("about", value)} />
          ) : !authReady ? (
            <div className="empty" role="status">
              <h3>{error ? "ยังตรวจสอบบัญชีไม่ได้" : "กำลังตรวจสอบการเข้าสู่ระบบ…"}</h3>
            </div>
          ) : needsAuth ? (
            <div className="signin-panel">
              <span className="signin-symbol" aria-hidden="true">
                {page === "requests" || page === "team-requests" ? <ClipboardList /> : <UserRound />}
              </span>
              <h1>
                {page === "requests" ? "เข้าสู่ระบบเพื่อติดตามคำขอ"
                  : page === "team-requests" ? "เข้าสู่ระบบเพื่อดูคำขอลูกค้า"
                  : page === "project" ? "เข้าสู่ระบบเพื่อดูรายละเอียด"
                  : "เข้าสู่ระบบเพื่อดูรายการของคุณ"}
              </h1>
              <p>
                {page === "project" && card ? card.name + " · " : ""}
                {page === "requests" ? "ใช้บัญชีเดียวกับที่ส่งคำขอ เพื่อดูเลขอ้างอิงและสถานะล่าสุด"
                  : page === "team-requests" ? "ใช้บัญชีทีม DEAL! ที่ได้รับสิทธิดูแลคำขอของลูกค้า"
                  : "ดูข้อมูลโครงการและจัดการรายการในบัญชีของคุณ"}
              </p>
              <a className="primary" href={signInHref} target="_top">
                <LogIn size={18} aria-hidden="true" /> เข้าสู่ระบบด้วย ChatGPT
              </a>
              <a className="text-btn" href="#/catalog">
                กลับไปดูโครงการ
              </a>
            </div>
          ) : page === "requests" || (page === "team-requests" && canReview) ? (
            <RequestList key={page} selectedId={id} team={page === "team-requests"} />
          ) : page === "team-requests" ? (
            <Empty title="หน้านี้สำหรับทีมดูแลคำขอ" detail="ดูสถานะคำขอที่คุณส่งได้ในบัญชีของคุณ" action="ดูคำขอของฉัน" onClick={() => go("requests")} />
          ) : page === "project" && card ? (
            p ? (
              <Detail
                key={p.id}
                p={p}
                items={items}
                mutate={mutate}
                busy={busy}
                ready={ready}
                needsAuth={false}
              />
            ) : (
              <div className="empty" role={detailError ? "alert" : "status"}>
                <h3>{detailError || "กำลังโหลดรายละเอียด…"}</h3>
                {detailError && (
                  <a className="text-btn" href="#/catalog">
                    กลับไปดูโครงการ
                  </a>
                )}
              </div>
            )
          ) : ["monitor", "ops"].includes(page) && !canManage ? (
            <Empty
              title="หน้านี้สำหรับทีม DEAL!"
              detail="ตรวจสถานะและเปิดสัญญาของคุณได้ในรายการของฉัน"
              action="ดูรายการของฉัน"
              onClick={() => go("portfolio")}
            />
          ) : !ready && (loading || error) ? (
            <div className="empty" role="status">
              <h3>{loading ? "กำลังโหลดรายการ…" : "ยังโหลดรายการไม่ได้"}</h3>
            </div>
          ) : ["portfolio", "monitor"].includes(page) ? (
            <ListPage
              key={page}
              items={items}
              ops={page === "monitor"}
              loading={loading}
              reload={refresh}
            />
          ) : ["record", "ops"].includes(page) && row ? (
            <RecordPage
              key={page + row.id + row.state}
              row={row}
              canManage={canManage}
              ops={page === "ops"}
              mutate={mutate}
              busy={busy}
            />
          ) : (
            <Empty
              title={loading ? "กำลังโหลด…" : "ไม่พบรายการนี้"}
              detail={
                loading
                  ? "กำลังดึงข้อมูลรายการทดลอง"
                  : "กลับไปยังหน้าโครงการเพื่อตรวจสอบรายการ"
              }
              action="โครงการ"
              onClick={() => go("catalog")}
            />
          )}
        </main>
        <footer className="invest-footer">
          <div className="invest-footer-company"><small lang="en">บริษัท ดีลอินเวส จำกัด</small>
            {legacy && <small>พื้นที่รายการทดลองเดิม · ราคาและเงื่อนไขจำลอง</small>}
          </div>
          <nav aria-label="เมนูท้ายหน้า">
            <a href="#/catalog">เลือกโครงการ</a><a href="#/ownership">วิธีเป็นเจ้าของ</a><a href="#/about">รู้จัก DEAL!</a><a href="#/requests">ติดตามคำขอ</a>
          </nav>
        </footer>
      </div>
      {showMobileTabs && (
        <nav aria-label="แถบนำทางหลัก" className="invest-tabbar" data-tab={tabIndex}>
          {navigationLinks(publicNavigation)}
        </nav>
      )}
    </div>
  );
}
