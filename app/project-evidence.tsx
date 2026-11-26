"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Expand, FileText, MapPin, ReceiptText } from "lucide-react";
import { lismStatements, lismFeeLabels } from "../lib/lism-reports";
import type { OfferId } from "../lib/offers";
import "./project-evidence.css";

const baht = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function BoxingEvidence() {
  const [selectedMonth, selectMonth] = useState(0);
  const report = lismStatements[selectedMonth];
  const expenses = report.fees.reduce((sum, fee) => sum + fee, 0);

  return (
    <section className="ev-block" aria-labelledby="boxing-evidence-title">
      <header className="ev-heading">
        <h2 id="boxing-evidence-title">เปิดรายงานจากตู้ที่ให้บริการจริง</h2>
        <p>งวดที่มีรายงานครบของร้าน Lism เชียงใหม่ เลือกเดือนเพื่อดูว่าเหลือให้แบ่งเท่าไร</p>
      </header>
      <div className="ev-boxing">
        <div className="ev-machine">
          <figure>
            <img src="/media/boxing-front.webp" alt="เครื่องเล่น DEAL! Boxing มุมด้านหน้า" loading="lazy" />
            <figcaption>ภาพรุ่นตู้ DEAL! Boxing</figcaption>
          </figure>
          <div className="ev-location"><MapPin size={17} aria-hidden="true" /><span>ทำเลในรายงาน <strong>ร้าน Lism · เชียงใหม่</strong></span></div>
        </div>
        <div className="ev-report">
          <div className="ev-report-head">
            <div><h3>รายรับและค่าใช้จ่าย</h3><p>{report.dates}</p></div>
            <label className="ev-period"><CalendarDays size={16} aria-hidden="true" /><select aria-label="เลือกงวดรายงานร้าน Lism" value={selectedMonth} onChange={e => selectMonth(Number(e.target.value))}>
              {lismStatements.map((item, index) => <option key={item.period} value={index}>{item.period}</option>)}
            </select><ChevronDown size={15} aria-hidden="true" /></label>
          </div>
          <div className="ev-money-lines" aria-live="polite" aria-atomic="true">
            <dl>
              <div><dt>ยอดเล่นทั้งงวด</dt><dd>{baht.format(report.sales)} <small>บาท</small></dd></div>
              <div><dt>หักค่าใช้จ่ายรวม</dt><dd>−{baht.format(expenses)} <small>บาท</small></dd></div>
              <div className="ev-net"><dt>ยอดสุทธิที่นำมาแบ่ง</dt><dd>{baht.format(report.net)} <small>บาท</small></dd></div>
            </dl>
            <div className="ev-payout"><span>ส่วนแบ่ง 10% ในงวดนี้</span><strong>{baht.format(report.tenth)} <small>บาท</small></strong></div>
          </div>
          <details className="ev-fees">
            <summary><ReceiptText size={17} aria-hidden="true" />ดูรายการค่าใช้จ่าย<ChevronDown size={16} aria-hidden="true" /></summary>
            <dl>{lismFeeLabels.map((label, index) => <div key={label}><dt>{label}</dt><dd>{baht.format(report.fees[index])} บาท</dd></div>)}</dl>
          </details>
        </div>
      </div>
      <div className="ev-recent">
        <div><h3>ต่อมา ตู้เดียวกันมียอดเล่นเท่าไร?</h3><p>สองงวดนี้มีเฉพาะยอดเล่น จึงยังระบุส่วนแบ่งสุทธิไม่ได้</p></div>
        <dl><div><dt>ส.ค. 2569</dt><dd>6,380 <small>บาท</small></dd></div><div><dt>ก.ย. 2569</dt><dd>1,080 <small>บาท</small></dd></div></dl>
      </div>
      <p className="ev-source"><FileText size={15} aria-hidden="true" /><span>ข้อมูลจากรายงานรายรับ–รายจ่ายร้าน Lism งวด{report.period} และรายงานเปรียบเทียบยอดขาย ส.ค.–ก.ย. 2569 ตัวเลขย้อนหลังเป็นของตู้ทำเลนี้ ส่วนแบ่งของตู้ที่คุณสนใจขึ้นกับยอดเล่นและต้นทุนของเครื่องนั้น</span></p>
    </section>
  );
}

function HouseEvidence() {
  return (
    <section className="ev-block" aria-labelledby="house-evidence-title">
      <header className="ev-heading">
        <h2 id="house-evidence-title">บ้านริมปิงอยู่ขั้นไหนแล้ว?</h2>
        <p>Human Allowed ริมแม่น้ำปิง 02 · บ้านพักสองชั้น ย่านวัดเกต อำเภอเมืองเชียงใหม่</p>
      </header>
      <div className="ev-house">
        <figure className="ev-house-photo">
          <a className="ev-map-link" href="/media/rimping-location.webp" target="_blank" rel="noopener noreferrer" aria-label="ขยายแผนที่โครงการริมแม่น้ำปิงในแท็บใหม่">
            <img src="/media/rimping-location.webp" alt="แผนที่ย่านวัดเกตและจุดรอบโครงการ Human Allowed ริมแม่น้ำปิง" loading="lazy" />
            <span><Expand size={14} aria-hidden="true" />ขยายแผนที่</span>
          </a>
          <figcaption><MapPin size={16} aria-hidden="true" />แผนที่จากเอกสารโครงการริมแม่น้ำปิง</figcaption>
        </figure>
        <div className="ev-house-facts">
          <div><h3>อยู่ระหว่างออกแบบบ้าน</h3><p>ตามสำเนาทะเบียนโครงการวันที่ 19 พ.ย. 2569 บ้านหลังนี้ยังไม่เริ่มก่อสร้าง และยังไม่มีวันเปิดรับผู้เข้าพักที่ยืนยันได้</p></div>
          <div><h3>รอบเดิมปิดเมื่อ 14 ต.ค. 2569</h3><p>ราคา 171,200 บาทในรอบนั้นเท่ากับ 10% ของราคาบ้าน สิทธิผูกกับตัวบ้านบนที่ดินเช่า ส่วนแบ่งคิดจากค่าที่พักของชั้นหรือหน่วยตามสัญญา หลังหักค่าใช้จ่าย</p></div>
          <div><h3>หากสนใจรอบถัดไป</h3><p>ยังไม่มีประกาศเปิดรอบใหม่ ก่อนตัดสินใจ ให้ตรวจชั้นหรือหน่วยที่เสนอ วันเริ่มและวันสิ้นสุดสิทธิในสัญญา ขณะนี้ฝากความสนใจไว้ได้โดยไม่มีการจองหรือชำระเงิน</p></div>
        </div>
      </div>
      <p className="ev-source"><FileText size={15} aria-hidden="true" /><span>ข้อมูลจากทะเบียนโครงการบ้าน รายการริมแม่น้ำปิง 02 และเอกสาร Human Allowed บ้านพักปล่อยเช่า ริมแม่น้ำปิง สื่อที่ตรวจสอบได้เป็นภาพจำลอง แบบโครงสร้าง และแผนที่ ขณะนี้ยังไม่มีภาพหน้างานลงวันที่สำหรับเผยแพร่</span></p>
    </section>
  );
}

export function ProjectEvidence({ id }: { id: OfferId }) {
  return id === "boxing" ? <BoxingEvidence /> : <HouseEvidence />;
}
