"use client";

import { useRef, useState } from "react";
import {
  Banknote, Building2, CalendarDays, ChevronDown, ClipboardCheck, FileCheck2,
  Gamepad2, House, KeyRound, ListChecks, MapPin, MessagesSquare, PieChart,
  UsersRound, Wallet, Wrench,
} from "lucide-react";
import type { OfferId } from "../lib/offers";
import { LearnProjectSwitch } from "./learn-project-switch";
import { AboutPayout } from "./about-payout";
import { AboutTimeline } from "./about-timeline";
import "./about-visual.css";
import "./about-guide.css";

const stories = {
  boxing: {
    name: "DEAL! Boxing",
    cover: { src: "/media/boxing-front.webp", alt: "ตู้ชกมวย DEAL! Boxing มองจากด้านหน้า", label: "ตัวตู้" },
    second: { src: "/media/boxing-chiang-mai.webp", alt: "ภาพตัวอย่างตู้ชกมวยติดตั้งในเชียงใหม่", label: "ตัวอย่างทำเล" },
    rights: "ถือทั้งตู้หรือบางส่วนตามสัญญา เงินส่วนแบ่งมาจากยอดเล่นของเครื่องที่ระบุ หลังหักค่าใช้จ่าย",
    care: "เมื่อเลือกบริการดูแล ทีมช่วยหาทำเล ประสานติดตั้งและซ่อมบำรุง เก็บยอดเล่น และสรุปบัญชีรายตู้",
    status: "เปิดรับคำขอตรวจสิทธิ",
    action: "ดูตู้และเลือกสัดส่วน",
  },
  house: {
    name: "Human Allowed Rimping",
    cover: { src: "/media/rimping-render.webp", alt: "ภาพจำลองบ้านริมแม่น้ำปิงสองชั้น", label: "ภาพจำลอง" },
    second: { src: "/media/rimping-location.webp", alt: "แผนที่ย่านวัดเกตจากเอกสารบ้านพักริมแม่น้ำปิง", label: "แผนที่โครงการ" },
    rights: "รอบเดิมให้ถือสิทธิในตัวบ้านบนที่ดินเช่า รายได้มาจากค่าที่พักของชั้นหรือหน่วยที่ระบุในสัญญา",
    care: "เมื่อบ้านเปิดให้เช่า ทีมลงประกาศ รับจอง ดูแลผู้เข้าพัก จัดการทำความสะอาด และทำรายงานของหน่วยที่ถือสิทธิ",
    status: "รอบเดิมปิดแล้ว · รับความสนใจรอบถัดไป",
    action: "ดูสถานะและฝากความสนใจ",
  },
} as const;

const questions = {
  boxing: [
    { icon: FileCheck2, q: "จะรู้ได้อย่างไรว่าส่วนแบ่งมาจากตู้ไหน?", a: "ตรวจชื่อโครงการ จุดติดตั้ง ตู้ที่สัญญาครอบคลุม และเปอร์เซ็นต์ของคุณ แล้วเทียบกับรายงานของงวดนั้น ถ้ารอบที่ทีมเสนอครอบคลุมหลายเครื่อง ให้ทีมระบุว่าใช้ยอดของเครื่องใดบ้างในการคำนวณ" },
    { icon: CalendarDays, q: "ถ้ารอบเจ้าของร่วมรวมสิทธิไม่ครบ ขอเงินคืนได้ไหม?", a: "สัญญาเจ้าของร่วมที่เคยใช้ให้ผู้ซื้อขอเลิกสัญญาได้หากรวมสิทธิไม่ครบภายใน 45 วันนับจากวันที่ชำระ โดยผู้ขายมีสิทธิหักค่าดำเนินงานและค่าใช้จ่ายที่เกิดขึ้นจริงในอัตรา 10% ของยอดที่ชำระ เมื่อรวมสิทธิครบแล้ว เงื่อนไขการออกจากโครงการเปลี่ยนไป ให้ตรวจข้อคืนเงินและการขายต่อในสัญญาของรอบที่เสนอ วันนี้ส่งคำขอตรวจสิทธิได้โดยไม่ต้องชำระเงิน" },
    { icon: UsersRound, q: "ถ้าซื้อทั้งตู้ ต้องใช้บริการดูแลของ DEAL! ไหม?", a: "ตัวอย่างสัญญาซื้อทั้งตู้มีทางเลือกให้เจ้าของดูแลเอง เมื่อเลือกทางนั้น เจ้าของรับผิดชอบการเก็บยอดและทำรายงานเอง หากใช้ทีม DEAL! ให้ตรวจขอบเขตงาน ค่าบริการ ซ่อมบำรุง และค่าใช้จ่ายเมื่อย้ายทำเลในสัญญา" },
  ],
  house: [
    { icon: KeyRound, q: "สิทธิครอบคลุมตัวบ้าน ที่ดิน หรือค่าห้องไหน?", a: "เอกสารริมปิงอธิบายสิทธิในตัวบ้านบนที่ดินเช่า รายได้ผูกกับชั้นหรือหน่วยที่กำหนด หากมีรอบใหม่ ให้ตรวจชื่อหน่วย ระยะเวลาเช่าที่ดิน วันเริ่มและวันสิ้นสุดสิทธิก่อนตกลง" },
    { icon: Wallet, q: "ถ้าห้องว่างทั้งเดือน ยังมีค่าอะไร?", a: "ค่าที่พักขึ้นกับจำนวนคืนที่มีผู้เข้าพัก ค่าใช้จ่ายประจำบางรายการ เช่น ค่าเช่าและอินเทอร์เน็ต ยังเกิดได้แม้ไม่มีการจอง ให้ตรวจวิธีเฉลี่ยค่าใช้จ่ายของชั้นที่ถือสิทธิและผู้รับผิดชอบเมื่อรายได้ไม่พอ" },
    { icon: MessagesSquare, q: "ฝากความสนใจวันนี้ จะได้สิทธิในบ้านเลยไหม?", a: "ทีมเก็บเรื่องไว้เพื่อติดต่อหากมีข่าวรอบถัดไป ยังไม่มีกำหนดเปิดรอบใหม่ คุณตรวจสถานะเรื่องที่ฝากไว้ได้ในคำขอของฉัน" },
  ],
} as const;

export function AboutVisual({ project, onSelect }: { project: OfferId; onSelect: (value: OfferId) => void }) {
  const [gallery, setGallery] = useState<{ project: OfferId; second: boolean }>({ project, second: false });
  const second = gallery.project === project && gallery.second;
  const income = useRef<HTMLDivElement>(null);
  const timeline = useRef<HTMLDivElement>(null);
  const terms = useRef<HTMLElement>(null);
  const story = stories[project];
  const house = project === "house";
  const photo = second ? story.second : story.cover;
  const topics = [
    { icon: Banknote, title: "ส่วนแบ่งและวันรับเงิน", dest: income, id: "about-money" },
    { icon: CalendarDays, title: "ไทม์ไลน์โครงการ", dest: timeline, id: "about-dates" },
    { icon: FileCheck2, title: "เงื่อนไขก่อนตกลง", dest: terms, id: "about-terms" },
  ];
  return (
    <section className="about-visual" aria-label="ข้อมูลสำหรับเจ้าของ">
      <div className="about-controls">
        <LearnProjectSwitch selected={project} onChange={value => { setGallery({ project: value, second: false }); onSelect(value); }} controls="learn-story" />
        <nav className="about-topics" aria-label="ข้ามไปหัวข้อที่สนใจ">
          {topics.map(({ icon: Icon, title, dest, id }) => <button type="button" key={id} aria-controls={id} onClick={() => {
            dest.current?.focus({ preventScroll: true });
            dest.current?.scrollIntoView({ block: "start" });
          }}><Icon size={18} aria-hidden="true" />{title}</button>)}
        </nav>
      </div>
      <article key={project} id="learn-story" className="learn-story">
        <div className="learn-company">
          <div className="learn-gallery">
            <figure className={"learn-evidence learn-evidence-" + project + (second ? " is-secondary" : "")}>
              <img src={photo.src} alt={photo.alt} />
              <figcaption>{!house && second ? "ตัวอย่างจุดติดตั้งในเชียงใหม่" : photo.label}</figcaption>
            </figure>
            <div className="learn-gallery-choices" role="group" aria-label="เลือกภาพโครงการ">
              <button type="button" aria-pressed={!second} onClick={() => setGallery({ project, second: false })}>
                {house ? <House size={16} aria-hidden="true" /> : <Gamepad2 size={16} aria-hidden="true" />}{story.cover.label}
              </button>
              <button type="button" aria-pressed={second} onClick={() => setGallery({ project, second: true })}>
                <MapPin size={16} aria-hidden="true" />{story.second.label}
              </button>
            </div>
          </div>
          <div className="learn-company-copy">
            <h2>{story.name}</h2>
            <p className="about-round"><ClipboardCheck size={15} aria-hidden="true" />{story.status}</p>
            <dl className="learn-roles">
              <div><dt><PieChart size={19} aria-hidden="true" />คุณถือสิทธิอะไร</dt><dd>{story.rights}</dd></div>
              <div><dt>{house ? <Building2 size={19} aria-hidden="true" /> : <Wrench size={19} aria-hidden="true" />}DEAL! ดูแลอะไร</dt><dd>{story.care}</dd></div>
            </dl>
          </div>
        </div>

        <div ref={income} id="about-money" tabIndex={-1} className="about-guide-section"><AboutPayout project={project} /></div>
        <div ref={timeline} id="about-dates" tabIndex={-1} className="about-guide-section"><AboutTimeline project={project} /></div>
        <section ref={terms} id="about-terms" tabIndex={-1} className="about-guide-section guide-questions" aria-labelledby="about-agreement-title">
          <h2 id="about-agreement-title">ก่อนตกลงถือสิทธิ</h2>
          {questions[project].map(({ icon: Icon, q, a }) => <details key={q}>
            <summary><Icon size={20} aria-hidden="true" /><span>{q}</span><ChevronDown size={18} aria-hidden="true" /></summary>
            <div className="guide-answer"><p>{a}</p></div>
          </details>)}
        </section>
        <div className="about-next">
          <a className="learn-cta" href={"#/offer/" + project}>{story.action}</a>
          <a className="about-follow" href="#/requests"><ListChecks size={18} aria-hidden="true" />ติดตามคำขอของฉัน</a>
        </div>
      </article>
    </section>
  );
}
