import { Calculator, ChevronDown, ChevronLeft, ClipboardCheck, FileText, ListChecks, PhoneCall, TicketCheck } from "lucide-react";
import { OwnershipExplorer } from "./ownership-explorer";
import { AboutVisual } from "./about-visual";
import type { OfferId } from "../lib/offers";

const afterRequest = [
  { icon: TicketCheck, title: "รับเลขคำขอ", detail: "เก็บเลขอ้างอิงไว้ เปิดดูสถานะได้ในคำขอของฉัน" },
  { icon: PhoneCall, title: "ทีมรับเรื่องตามโครงการ", detail: "ทีมตรวจสิทธิที่ว่างของตู้ชกมวย หรือเก็บความสนใจบ้านไว้เผื่อมีรอบถัดไป" },
  { icon: ClipboardCheck, title: "ตรวจสัญญาก่อนตกลง", detail: "ตรวจทรัพย์ ค่าใช้จ่าย และวิธีแบ่งรายได้ก่อนตัดสินใจ" },
];

function AfterRequest() {
  return (
    <section className="guide-next" aria-labelledby="guide-next-title">
      <div className="guide-next-heading">
        <h2 id="guide-next-title">หลังส่งคำขอ</h2>
        <a href="#/requests"><ListChecks size={18} aria-hidden="true" />ติดตามคำขอของฉัน</a>
      </div>
      <ol className="learn-flow">
        {afterRequest.map(({ icon: Icon, title, detail }) => (
          <li key={title}>
            <span className="learn-flow-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.7} /></span>
            <div><h3>{title}</h3><p>{detail}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function OwnershipQuestions() {
  return (
    <section className="guide-questions" aria-labelledby="guide-questions-title">
      <h2 id="guide-questions-title">คำถามก่อนเป็นเจ้าของ</h2>
      <details>
        <summary><Calculator size={20} aria-hidden="true" /><span>ถ้าถือ 10% จะได้เงินส่วนแบ่งเท่าไร?</span><ChevronDown size={18} aria-hidden="true" /></summary>
        <div className="guide-answer">
          <p>เดือนเมษายน 2569 ตู้ชกมวยที่ร้าน Lism เชียงใหม่ เหลือเงินหลังหักค่าใช้จ่าย 6,491.40 บาท รายงานงวดนั้นคำนวณส่วนแบ่งไว้ดังนี้</p>
          <div className="guide-equation" aria-label="6,491.40 บาท คูณ 10 เปอร์เซ็นต์ เท่ากับ 649.14 บาท">
            <span>6,491.40 บาท</span><b aria-hidden="true">×</b><span>10%</span><b aria-hidden="true">=</b><strong>649.14 บาท</strong>
          </div>
          <p>ตัวเลขนี้เป็นของตู้ร้าน Lism เฉพาะงวดเมษายน แต่ละงวดขึ้นกับยอดเล่นและต้นทุน หากไม่มีเงินเหลือให้แบ่ง ส่วนแบ่งงวดนั้นเป็นศูนย์</p>
        </div>
      </details>
      <details>
        <summary><FileText size={20} aria-hidden="true" /><span>จะรู้ได้อย่างไรว่าถือสิทธิในบ้านหรือตู้ไหน?</span><ChevronDown size={18} aria-hidden="true" /></summary>
        <div className="guide-answer">
          <p><strong>บ้านพัก</strong> ตรวจชั้นหรือหน่วยที่ระบุในสัญญา และระยะเวลาเช่าที่ดินที่บ้านตั้งอยู่</p>
          <p><strong>ตู้ชกมวย</strong> ดูหมายเลขเครื่อง จุดติดตั้ง และผู้รับผิดชอบค่าใช้พื้นที่ ค่าไฟ และค่าซ่อมในสัญญาของตู้นั้น</p>
        </div>
      </details>
      <details>
        <summary><TicketCheck size={20} aria-hidden="true" /><span>ส่งคำขอแล้วต้องจ่ายเงินเลยไหม?</span><ChevronDown size={18} aria-hidden="true" /></summary>
        <div className="guide-answer"><p>ส่งได้ฟรี สำหรับตู้ชกมวย ทีมจะตรวจสิทธิที่ว่างให้ สำหรับบ้านริมปิง รอบเดิมปิดแล้ว คุณฝากเบอร์ไว้เผื่อมีรอบถัดไปได้ ทั้งสองกรณียังไม่มีการจองหรือเรียกเก็บเงิน</p></div>
      </details>
    </section>
  );
}

export function OwnershipGuide({ page, project, onSelect }: { page: "about" | "ownership"; project: OfferId; onSelect: (value: OfferId) => void }) {
  const about = page === "about";
  return (
    <article className="guide-reader">
      <a href="#/catalog" className="guide-back"><ChevronLeft size={16} aria-hidden="true" /> โครงการ</a>
      <header className="guide-heading">
        <h1>{about ? "รู้จัก DEAL!" : "เลือกสัดส่วนการเป็นเจ้าของ"}</h1>
        <p>{about
          ? "บริษัท ดีลอินเวส จำกัด ดูแลตู้ชกมวยและบ้านพัก เลือกทรัพย์เพื่อดูหน้าที่ของทีม วิธีรับส่วนแบ่ง และเงื่อนไขในสัญญา"
          : "เลือกบ้านพักหรือตู้ชกมวย ลองคำนวณราคา แล้วดูเงื่อนไขก่อนส่งคำขอ"}</p>
      </header>
      {about ? <AboutVisual project={project} onSelect={onSelect} /> : <><OwnershipExplorer /><OwnershipQuestions /><AfterRequest /></>}
    </article>
  );
}
