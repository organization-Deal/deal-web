import {
  BedDouble, CalendarCheck2, ClipboardCheck, Coins, FilePenLine,
  Hammer, Truck, UsersRound, type LucideIcon,
} from "lucide-react";
import type { OfferId } from "../lib/offers";
import "./about-timeline.css";

type Stage = { icon: LucideIcon; when: string; title: string; detail: string };

const timelines: Record<OfferId, { title: string; stages: Stage[]; source: string }> = {
  boxing: {
    title: "ตู้ชกมวยเริ่มทำเงินเมื่อไร?",
    stages: [
      { icon: ClipboardCheck, when: "ตอนนี้ · เปิดรับคำขอ", title: "ทีมตรวจสิทธิที่ว่าง", detail: "ส่งคำขอแล้วทีมจะแจ้งโครงการ ทำเล ตู้ และสัดส่วนที่เสนอให้คุณตรวจ ก่อนตัดสินใจทำสัญญา" },
      { icon: UsersRound, when: "รอบเดิม · ภายใน 45 วันจากวันลงนาม", title: "รวมสิทธิให้ครบทั้งตู้", detail: "กรอบเวลานี้มาจากตัวอย่างสัญญาเจ้าของร่วมที่เคยใช้ ส่วนการถือทั้งตู้ใช้เงื่อนไขอีกแบบ" },
      { icon: Truck, when: "รอบเดิม · ภายใน 60 วันหลังรวมสิทธิครบ", title: "ติดตั้งตู้ให้พร้อมเปิดเล่น", detail: "สัญญาเดียวกันให้ทีมผลิต ส่งมอบ และติดตั้งตู้ โดยเริ่มนับเวลาเมื่อมีผู้ถือสิทธิครบทั้งตู้" },
      { icon: Coins, when: "เมื่อมีคนจ่ายค่าเล่น", title: "เริ่มมีรายรับจากตู้", detail: "รอปิดงวดและหักค่าใช้จ่ายของตู้นั้นก่อน เจ้าของเริ่มรับส่วนแบ่งได้ในงวดแรกที่มียอดสุทธิเหลือ" },
    ],
    source: "อ้างอิงเอกสาร DEAL! Boxing Project 2 และตัวอย่างสัญญาเจ้าของร่วม ข้อ 6.2–6.3 กรอบเวลา 45 และ 60 วันเป็นของรอบเดิม โปรดตรวจเวลาของรอบที่สนใจในสัญญา",
  },
  house: {
    title: "จากแบบบ้านริมปิงถึงรายได้จากห้องพัก",
    stages: [
      { icon: FilePenLine, when: "สถานะในทะเบียน · 19 พ.ย. 2569", title: "อยู่ระหว่างออกแบบบ้าน", detail: "ริมแม่น้ำปิง 02 ปิดรอบเดิมเมื่อ 14 ต.ค. 2569 วันที่บันทึกยังไม่เริ่มก่อสร้าง และยังไม่มีประกาศรอบใหม่" },
      { icon: Hammer, when: "ระหว่างเตรียมงานและก่อสร้าง", title: "สร้างและเตรียมห้องพัก", detail: "ทีมติดตามสถานะใบอนุญาต งานก่อสร้าง และการติดตั้งอุปกรณ์ของบ้านหลังนี้" },
      { icon: BedDouble, when: "เมื่อเปิดจองและมีผู้เข้าพัก", title: "เริ่มมีรายได้จากค่าที่พัก", detail: "รายรับเกิดเมื่อมีผู้เข้าพักและจ่ายค่าห้อง บ้านหลังนี้ยังไม่มีวันเปิดรับแขกที่ยืนยันแล้ว" },
      { icon: CalendarCheck2, when: "เมื่อปิดงวดที่มียอดสุทธิเหลือ", title: "คำนวณส่วนแบ่งเจ้าของ", detail: "ใช้รายรับของชั้นหรือหน่วยตามสัญญา หักค่าใช้จ่ายก่อนแบ่ง ปัจจุบันยังระบุวันรับส่วนแบ่งครั้งแรกไม่ได้" },
    ],
    source: "อ้างอิงทะเบียนโครงการบ้าน รายการ Human Allowed ริมแม่น้ำปิง 02 ณ 19 พ.ย. 2569",
  },
};

export function AboutTimeline({ project }: { project: OfferId }) {
  const timeline = timelines[project];
  const headingId = "about-timeline-" + project;
  return (
    <section className="about-timeline" aria-labelledby={headingId}>
      <h2 id={headingId}>{timeline.title}</h2>
      <ol className="about-timeline-stages">
        {timeline.stages.map(({ icon: Icon, when, title, detail }, index) => (
          <li key={title} aria-current={index === 0 ? "step" : undefined}>
            <span className="about-timeline-marker" aria-hidden="true"><Icon size={21} /></span>
            <div>
              <p className="about-timeline-when">{when}</p>
              <h3>{title}</h3>
              <p className="about-timeline-detail">{detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="about-timeline-source">{timeline.source}</p>
    </section>
  );
}
