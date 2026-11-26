"use client";

import { useState } from "react";
import {
  CalendarDays, ChevronDown, CircleHelp, FileCheck2, Landmark, ReceiptText, Wallet,
} from "lucide-react";
import type { OfferId } from "../lib/offers";
import { lismFeeLabels, lismStatements } from "../lib/lism-reports";
import { DocumentLink } from "./document-link";
import "./about-payout.css";

const baht = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const format = (value: number) => baht.format(value);

function Total({ amount, title }: { amount: number; title: string }) {
  return (
    <div className="ap-total">
      <div><Wallet size={19} aria-hidden="true" /><span>{title}</span></div>
      <strong>{format(amount)} <small>บาท</small></strong>
    </div>
  );
}

function BoxingStatement() {
  const [index, setIndex] = useState(0);
  const report = lismStatements[index];
  const expenses = report.fees.reduce((sum, fee) => sum + fee, 0);
  return (
    <article className="ap-paper" aria-label="รายงานรายได้จริงของตู้">
      <header className="ap-paper-head">
        <div className="ap-scope"><ReceiptText size={17} aria-hidden="true" />รายรับ–รายจ่ายจากตู้จริง</div>
        <h3>ตู้ชกมวยร้าน Lism</h3>
        <label className="ap-month"><CalendarDays size={16} aria-hidden="true" />
          <select aria-label="เลือกเดือนของรายงาน" value={index} onChange={e => setIndex(Number(e.target.value))}>
            {lismStatements.map((item, i) => <option key={item.period} value={i}>{item.period}</option>)}
          </select><ChevronDown size={16} aria-hidden="true" />
        </label>
      </header>
      <div className="ap-ledger" aria-live="polite" aria-atomic="true">
        <dl className="ap-lines">
          <div><dt>ยอดที่ลูกค้าจ่ายค่าเล่น</dt><dd>{format(report.sales)}</dd></div>
          <div><dt>หักค่าใช้จ่ายของตู้</dt><dd>−{format(expenses)}</dd></div>
          <div className="ap-balance"><dt>เหลือให้แบ่ง</dt><dd>{format(report.net)}</dd></div>
        </dl>
        <Total title="ส่วนแบ่ง 10% ในรายงาน" amount={report.tenth} />
      </div>
      <details className="ap-details">
        <summary>หักค่าอะไรบ้าง?<ChevronDown size={16} aria-hidden="true" /></summary>
        <dl className="ap-breakdown">{lismFeeLabels.map((label, i) => (
          <div key={label}><dt>{label}</dt><dd>{format(report.fees[i])} บาท</dd></div>
        ))}</dl>
      </details>
      <p className="ap-source">ที่มา · รายงานร้าน Lism เชียงใหม่ งวด {report.dates} ตัวเลขในรายงานเป็นยอดส่วนแบ่งประจำงวด ส่วนยอดที่เข้าบัญชีต้องตรวจจากรายการโอน</p>
      <DocumentLink topic="boxing" />
    </article>
  );
}

function HouseStatement() {
  return (
    <article className="ap-paper ap-house-paper" aria-label="ตัวอย่างสมมติของบ้านพัก">
      <header className="ap-paper-head">
        <div className="ap-scope"><ReceiptText size={17} aria-hidden="true" />ตัวอย่างสมมติ</div>
        <h3>รายได้ของชั้นที่ถือสิทธิ</h3>
        <p>สมมติว่าสัญญาให้คุณ 10% ของยอดสุทธิชั้นนี้ ริมปิงยังอยู่ระหว่างออกแบบ จึงยังไม่มีรายได้จากผู้เข้าพักให้เทียบ</p>
      </header>
      <div className="ap-ledger">
        <dl className="ap-lines">
          <div><dt>ค่าที่พักของชั้นนี้</dt><dd>{format(10000)}</dd></div>
          <div><dt>หักค่าบริหาร 30% ของรายรับ</dt><dd>−{format(3000)}</dd></div>
          <div><dt>หักค่าใช้จ่ายที่จัดสรรให้ชั้นนี้ <small>(สมมติ)</small></dt><dd>−{format(2000)}</dd></div>
          <div className="ap-balance"><dt>เหลือให้แบ่ง</dt><dd>{format(5000)}</dd></div>
        </dl>
        <Total title="ส่วนแบ่ง 10% ตามตัวอย่าง" amount={500} />
      </div>
      <details className="ap-details">
        <summary>ดูที่มาของค่าใช้จ่ายบ้าน<ChevronDown size={16} aria-hidden="true" /></summary>
        <p>เอกสารริมปิงหน้า 17 ระบุค่าแม่บ้าน 250 บาทต่อครั้ง และค่าเช่าบ้านหรือที่ดิน 3,800 บาทต่อเดือน รวมทั้งค่าน้ำ ไฟ และอินเทอร์เน็ต ค่าใช้จ่ายที่นำมาหักจากชั้นของคุณขึ้นกับวิธีจัดสรรในสัญญา</p>
      </details>
      <DocumentLink topic="house" />
    </article>
  );
}

function TransferGuide({ project }: { project: OfferId }) {
  const boxing = project === "boxing";
  return (
    <aside className="ap-guide" aria-label="วันรับเงินและวิธีตรวจยอด">
      <h3>รับเงินเมื่อไร เช็กยอดอย่างไร?</h3>
      <dl className="ap-checks">
        <div><dt><CalendarDays size={20} aria-hidden="true" />รอบสรุปยอด</dt><dd>{boxing
          ? "ในตัวอย่าง ทีมเก็บยอดวันที่ 25 ถึงสิ้นเดือน แล้วตรวจยอด แบ่งส่วน และโอนช่วงวันที่ 1–10 ของเดือนถัดไป ให้ยึดกำหนดโอนในสัญญาของตู้คุณ หากล่าช้า ทีมจะแจ้งในกลุ่มเจ้าของตู้"
          : "เอกสารริมปิงยกตัวอย่างการโอนวันที่ 1–10 สำหรับรอบรายเดือน สัญญาของชั้นหรือหน่วยที่คุณถือสิทธิจะกำหนดว่าจ่ายรายเดือนหรือรายไตรมาส"}</dd></div>
        <div><dt><ReceiptText size={20} aria-hidden="true" />เปิดรายงานประจำงวด</dt><dd>{boxing
          ? "เทียบหมายเลขตู้และทำเลกับสัญญา ดูยอดเล่น ค่าใช้จ่าย และส่วนแบ่งของคุณในงวดเดียวกัน"
          : "เทียบชื่อบ้านและชั้นหรือหน่วยกับสัญญา แล้วไล่จากค่าที่พัก ค่าใช้จ่ายของหน่วย และเปอร์เซ็นต์ส่วนแบ่ง"}</dd></div>
        <div><dt><Landmark size={20} aria-hidden="true" />ตรวจเงินเข้าบัญชี</dt><dd>เมื่อทีมโอนเข้าบัญชีที่แจ้งไว้ ให้เทียบยอดในรายงานกับสลิปและรายการเงินเข้า หากยอดต่างกัน ให้แจ้งทีมพร้อมงวดและ{boxing ? "หมายเลขตู้" : "ชั้นหรือหน่วยของบ้าน"}</dd></div>
      </dl>
      <details className="ap-details ap-risk">
        <summary><span><CircleHelp size={17} aria-hidden="true" />ถ้างวดนั้นขาดทุนล่ะ?</span><ChevronDown size={16} aria-hidden="true" /></summary>
        <p>ถ้าหักค่าใช้จ่ายแล้วไม่มีเงินเหลือ งวดนั้นจะไม่มีส่วนแบ่งให้โอน ให้ตรวจสัญญาของ{boxing ? "เครื่องนั้น" : "หน่วยนั้น"}ว่าคุณต้องร่วมรับภาระค่าใช้จ่ายหรือขาดทุนอย่างไร</p>
      </details>
      <p className="ap-source">{boxing ? "รอบเวลาตัวอย่างจากเอกสารเจ้าของร่วม DEAL! Boxing โครงการ 2 และ 3 หน้า 3" : "รอบเวลาตัวอย่างจากเอกสารบ้านพักริมแม่น้ำปิง หน้า 7 และ 13"}</p>
      <DocumentLink topic="bill" />
    </aside>
  );
}

export function AboutPayout({ project }: { project: OfferId }) {
  const boxing = project === "boxing";
  return (
    <section className="about-payout" aria-labelledby="ap-title">
      <header className="ap-heading">
        <h2 id="ap-title">เงินส่วนแบ่งมาถึงคุณอย่างไร?</h2>
        <p>{boxing ? "ลองเปิดรายงานของตู้หนึ่งเครื่อง แล้วไล่ยอดจากเงินค่าเล่นถึงส่วนแบ่งของเจ้าของ" : "เริ่มจากค่าที่พักของชั้นหรือหน่วยที่ระบุในสัญญา หักค่าใช้จ่ายก่อนคิดส่วนของคุณ"}</p>
      </header>
      <div className="ap-grid">
        {boxing ? <BoxingStatement /> : <HouseStatement />}
        <TransferGuide project={project} />
      </div>
      {boxing && <p className="ap-later"><FileCheck2 size={17} aria-hidden="true" /><span>เดือนอื่นยอดเล่นต่างกัน ตู้ Lism มียอดเล่น 6,380 บาทใน ส.ค. และ 1,080 บาทใน ก.ย. 2569 สองเดือนนี้มีข้อมูลเฉพาะยอดเล่น จึงยังคำนวณส่วนแบ่งจริงไม่ได้</span></p>}
    </section>
  );
}
