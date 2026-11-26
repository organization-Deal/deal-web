"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  ArrowUpRight, BookOpen, Calculator, CalendarClock, ClipboardList, Columns2, FilePenLine, Gamepad2, House,
  Images, LayoutGrid, List, Play, Search, UsersRound, X,
} from "lucide-react";
import { money } from "../lib/deals";
import { offers, type OfferId } from "../lib/offers";
import { DocumentLink } from "./document-link";

type Filter = "all" | OfferId;
const productIds: readonly OfferId[] = ["boxing", "house"];
const catalogue = {
  house: {
    type: "บ้านพัก", category: "บ้านพักให้เช่า", location: "ริมแม่น้ำปิง · เชียงใหม่",
    summary: "บ้านบนที่ดินเช่า รายได้มาจากค่าที่พักหลังหักค่าใช้จ่าย ทะเบียน 19 พ.ย. 2569 ระบุว่ายังอยู่ขั้นออกแบบ",
    shortSummary: "บ้านบนที่ดินเช่า แบ่งรายได้จากค่าที่พักหลังหักค่าใช้จ่าย",
    status: "รอบเดิมปิด 14 ต.ค. 2569", detailLabel: "ดูสถานะบ้าน",
    rights: "สิทธิในตัวบ้านบนที่ดินเช่า ตามส่วนที่ระบุในสัญญา",
    income: "ค่าที่พักของชั้นหรือหน่วยที่ระบุในสัญญา หลังหักค่าใช้จ่าย",
    icon: House,
    photos: [
      { src: "/media/rimping-render.webp", caption: "ภาพจำลอง", alt: "ภาพจำลองบ้านพักสองชั้นพร้อมบันไดภายนอกของโครงการ Human Allowed Rimping" },
      { src: "/media/rimping-plan-1.jpeg", caption: "แบบโครงสร้าง", alt: "ภาพแบบโครงสร้างสามมิติของบ้านพัก Human Allowed Rimping" },
    ],
  },
  boxing: {
    type: "ตู้ชกมวย", category: "ตู้ชกมวยอาร์เคด", location: "เครื่องเล่นอาร์เคด",
    summary: "ถือสิทธิในตู้ตามสัญญา ดูยอดเล่น ค่าใช้จ่าย และส่วนแบ่งจากรายงานจริงของตู้ร้าน Lism เชียงใหม่",
    shortSummary: "รับส่วนแบ่งจากค่าเล่นของตู้ หลังหักค่าใช้จ่าย",
    status: "เปิดรับคำขอตรวจสิทธิ", detailLabel: "ดูโครงการ",
    rights: "สิทธิในตู้ชกมวยที่ระบุในสัญญา",
    income: "ค่าเล่นของตู้ที่ระบุในสัญญา หลังหักค่าใช้จ่าย",
    icon: Gamepad2,
    photos: [
      { src: "/media/boxing-front.webp", caption: "ด้านหน้าตู้", alt: "ตู้ชกมวย DEAL! Boxing มองจากด้านหน้า" },
      { src: "/media/boxing-chiang-mai.webp", caption: "ตัวอย่างจุดติดตั้ง", alt: "ตัวอย่างตู้ชกมวยที่ติดตั้งในเชียงใหม่" },
    ],
  },
} as const;

const filters = [
  { id: "all", label: "ทั้งหมด", icon: LayoutGrid },
  { id: "house", label: "บ้านพัก", icon: House },
  { id: "boxing", label: "ตู้ชกมวย", icon: Gamepad2 },
] as const;

const journey = [
  { icon: BookOpen, title: "รู้จักทรัพย์", detail: "ดูภาพ อ่านเงื่อนไข แล้วตรวจว่ารายได้มาจากไหนและหักค่าอะไรบ้าง" },
  { icon: Calculator, title: "ลองเลือกสัดส่วน", detail: "ดูราคาตามสัดส่วนที่สนใจ สำหรับบ้านพักจะใช้ราคาของรอบเดิม" },
  { icon: FilePenLine, title: "เลือกให้ทีมติดต่อกลับ", detail: "ตู้ชกมวยขอให้ทีมตรวจสิทธิได้ ส่วนบ้านพักฝากความสนใจไว้เผื่อมีรอบถัดไป" },
] as const;

function IntroductionVideo() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  return (
    <>
      <button className="store-film" type="button" aria-haspopup="dialog" onClick={() => {
        setShowVideo(true);
        dialog.current?.showModal();
      }}>
        <span className="store-film-play" aria-hidden="true"><Play size={14} fill="currentColor" /></span>
        <span>รู้จัก DEAL! ใน 53 วินาที</span>
      </button>
      <dialog className="store-film-dialog" ref={dialog} aria-labelledby="store-film-title"
        onClose={() => setShowVideo(false)}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close();
        }}>
        <div className="store-film-bar">
          <h2 id="store-film-title">รู้จัก DEAL! ใน 53 วินาที</h2>
          <button type="button" aria-label="ปิดวิดีโอ" onClick={() => dialog.current?.close()}><X size={20} /></button>
        </div>
        {showVideo && <video aria-label="วิดีโอแนะนำการเป็นเจ้าของธุรกิจกับ DEAL!" autoPlay controls playsInline preload="none" src="/media/deal-introduction.mp4" />}
      </dialog>
    </>
  );
}

function OfferLink({ id }: { id: OfferId }) {
  const label = catalogue[id].detailLabel;
  return <a className="store-primary" href={"#/offer/" + id} aria-label={label + " " + offers[id].name}>{label}<ArrowUpRight className="mobile-cta-arrow" size={16} aria-hidden="true" /></a>;
}

function ProductCard({ id }: { id: OfferId }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const product = catalogue[id];
  const offer = offers[id];
  const photo = product.photos[photoIndex];
  const nextPhoto = (photoIndex + 1) % product.photos.length;
  const Icon = product.icon;
  const StatusIcon = id === "house" ? CalendarClock : ClipboardList;

  return (
    <article className={"store-card store-" + id} aria-labelledby={"store-title-" + id}>
      <div className="store-product-intro">
        <span className="store-type"><Icon size={17} aria-hidden="true" />{product.category}{id === "house" && <span className="store-location">· เชียงใหม่</span>}</span>
        <h2 id={"store-title-" + id}><a href={"#/offer/" + id}>{offer.name}</a></h2>
        <p className="store-product-summary"><span className="desktop-copy">{product.summary}</span><span className="mobile-copy">{product.shortSummary}</span></p>
        <span className="store-card-status"><StatusIcon size={15} aria-hidden="true" />{product.status}</span>
      </div>
      <div className="store-picture" data-photo={photoIndex}>
        <a className="store-photo-link" href={"#/offer/" + id} aria-label={"ดูรายละเอียด " + offer.name}>
          <img className="store-product-photo" src={photo.src} alt={photo.alt} fetchPriority={id === "boxing" ? "high" : "auto"} />
        </a>
        <span className="store-photo-caption">{photo.caption}</span>
        <button className="store-gallery-button" type="button" aria-label={"ดูรูปถัดไป " + product.photos[nextPhoto].caption + " " + offer.name}
          title={product.photos[nextPhoto].caption} onClick={() => setPhotoIndex(nextPhoto)}>
          <Images size={16} aria-hidden="true" /><span>{photoIndex + 1}/{product.photos.length}</span>
        </button>
      </div>
      <div className="store-product-action">
        <div className="store-price"><span>{id === "house" ? "ราคา 10% ของรอบเดิม" : "ราคาสำหรับ 10% ของตู้"}</span><strong>{money(offer.unitPrice)} <small>บาท</small></strong></div>
        <OfferLink id={id} />
      </div>
    </article>
  );
}

function Comparison({ ids }: { ids: OfferId[] }) {
  const rows: ReadonlyArray<readonly [string, (id: OfferId) => string]> = [
    ["สถานะ", id => catalogue[id].status],
    ["ราคาสำหรับ 10%", id => money(offers[id].unitPrice) + (id === "house" ? " บาท (รอบเดิม)" : " บาท")],
    ["ราคาสำหรับ 100%", id => money(offers[id].fullPrice) + (id === "house" ? " บาท ทั้งหลัง (รอบเดิม)" : " บาท ทั้งตู้")],
    ["สิทธิตามโครงการ", id => catalogue[id].rights],
    ["ที่มาของส่วนแบ่ง", id => catalogue[id].income],
    ["ข้อมูลที่เปิดดูได้", id => id === "house" ? "แผนที่ แบบบ้าน และสถานะตามทะเบียน 19 พ.ย. 2569" : "รายรับ ค่าใช้จ่าย และส่วนแบ่งของตู้ร้าน Lism เชียงใหม่"],
  ];
  return (
    <div className="store-comparison">
      <table aria-label="เปรียบเทียบราคา สิทธิ และที่มาของส่วนแบ่ง" style={{ "--products": ids.length } as CSSProperties}>
        <thead><tr><td aria-hidden="true" />{ids.map(id => <th key={id} scope="col">{offers[id].name}</th>)}</tr></thead>
        <tbody>
          {rows.map(([title, value]) => (
            <tr key={title}><th scope="row">{title}</th>{ids.map(id => <td key={id}>{value(id)}</td>)}</tr>
          ))}
          <tr><th scope="row">รายละเอียด</th>{ids.map(id => <td key={id}><OfferLink id={id} /></td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}

export function Catalog() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [compare, setCompare] = useState(false);
  const searchButton = useRef<HTMLButtonElement>(null);
  const searchTerm = query.trim().toLocaleLowerCase("th");
  const visible = productIds.filter(id => {
    const product = catalogue[id];
    const searchable = [offers[id].name, product.type, product.category, product.location, product.summary, product.rights].join(" ");
    return (filter === "all" || filter === id) && searchable.toLocaleLowerCase("th").includes(searchTerm);
  });

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    searchButton.current?.focus();
  }

  return (
    <div className="deal-store">
      <section aria-labelledby="catalog-title">
        <header className="store-opening">
          <div className="store-heading"><h1 id="catalog-title"><span className="desktop-copy">เลือกโครงการของคุณ</span><span className="mobile-copy">โครงการ</span></h1>
            <p><span className="desktop-copy">ดูว่าแต่ละโครงการให้ถือสิทธิในอะไร รายได้มาจากไหน และตอนนี้ทำอะไรได้บ้าง</span><span className="mobile-copy">ดูรายได้จริง แล้วลองเลือกสัดส่วนของคุณ</span></p></div>
          <div className="store-intro-actions">
            <IntroductionVideo />
            <DocumentLink topic={filter === "all" ? "bill" : filter} label={filter === "all" ? "บิลและสัญญา" : undefined} />
          </div>
        </header>
        <div className="store-toolbar">
          <div className="store-categories" role="group" aria-label="ประเภทโครงการ" style={{ "--selected": filters.findIndex(option => option.id === filter) } as CSSProperties}>
            {filters.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}><Icon size={16} aria-hidden="true" />{label}</button>
            ))}
          </div>
          <div className="store-controls">
            <button className="store-search-toggle" type="button" ref={searchButton} aria-label="ค้นหาโครงการ" aria-expanded={searchOpen} aria-controls="project-search" onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}><Search size={17} aria-hidden="true" /></button>
            <button className="store-compare-toggle" type="button" aria-label={compare ? "แสดงแบบการ์ด" : "เปรียบเทียบโครงการ"} aria-pressed={compare}
              onClick={() => setCompare(!compare)}>
              {compare ? <List size={17} aria-hidden="true" /> : <Columns2 size={17} aria-hidden="true" />}<span>{compare ? "ดูการ์ด" : "เปรียบเทียบ"}</span>
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="store-searchbox" id="project-search">
            <Search size={18} aria-hidden="true" />
            <input autoFocus type="search" value={query} aria-label="ค้นหาจากชื่อ ประเภท หรือทำเล" placeholder="ค้นหาจากชื่อ ประเภท หรือทำเล"
              onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") closeSearch(); }} />
            <button type="button" aria-label="ปิดการค้นหา" onClick={closeSearch}><X size={18} /></button>
          </div>
        )}
        <p className="sr-only" role="status">พบ {visible.length} โครงการ</p>
        {visible.length === 0 ? (
          <div className="store-empty"><Search size={24} aria-hidden="true" /><h2>ไม่พบโครงการที่ค้นหา</h2>
            <p>ลองค้นด้วยชื่อโครงการหรือประเภททรัพย์</p>
            <button type="button" onClick={() => {setQuery("");setFilter("all");}}>แสดงทุกโครงการ</button></div>
        ) : compare ? <Comparison ids={visible} /> : <div className="store-shelf">{visible.map(id => <ProductCard id={id} key={id} />)}</div>}
      </section>
      <section className="store-journey" aria-labelledby="journey-title">
        <header className="store-journey-header"><div><h2 id="journey-title">ส่งคำขออย่างไร</h2><p>ทุกขั้นตอนบนเว็บนี้ยังไม่มีการจองหรือชำระเงิน</p></div>
          <a className="store-tracking" href="#/requests"><ClipboardList size={17} aria-hidden="true" />ติดตามคำขอของฉัน</a></header>
        <ol>
          {journey.map(({ icon: Icon, title, detail }) => (
            <li key={title}><span className="store-step-symbol" aria-hidden="true"><Icon size={22} /></span><div><h3>{title}</h3><p>{detail}</p></div></li>
          ))}
        </ol>
        <nav className="store-guide-links" aria-label="อ่านเพิ่มเติมก่อนเลือกโครงการ">
          <a href="#/ownership"><BookOpen size={17} aria-hidden="true" />วิธีเป็นเจ้าของ</a>
          <a href="#/about"><UsersRound size={17} aria-hidden="true" />ทีม DEAL! ดูแลอะไรบ้าง</a>
        </nav>
      </section>
    </div>
  );
}
