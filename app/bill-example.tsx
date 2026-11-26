"use client";

import { useId, useState } from "react";
import { CalendarDays, Check, Info, MapPin, ReceiptText, Wallet } from "lucide-react";
import "./bill-example.css";

// Store statement amounts in satang so displayed shares round once, to a satang.
const income = 35_000;
const rent = 8_750;
const gateway = 189;
const expense = rent + gateway;
const profit = income - expense;
const ownerShares = [10, 20] as const;
const formatBaht = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const baht = (satang: number) => formatBaht.format(satang / 100);
const portion = (percent: number) => baht(Math.round(profit * percent / 100));

export function BillExample() {
  const [selected, setSelected] = useState<(typeof ownerShares)[number]>(10);
  const id = useId();
  const title = id + "-title";
  const calculation = id + "-calculation";
  return (
    <section className="bill-example" aria-labelledby={title}>
      <div className="bill-layout">
        <article className="bill-sheet">
          <header className="bill-banner">
            <div><h2 id={title}>บิลสรุปส่วนแบ่งกำไร</h2><p>DEAL TEAM · งวดสิงหาคม 2569</p></div>
            <span className="bill-seal" aria-hidden="true">DEAL!</span>
          </header>
          <div className="bill-project">
            <h3>ตู้น้ำหอมอัตโนมัติ</h3>
            <p><MapPin size={15} aria-hidden="true" />KK Bar โคราช (ญ)</p>
            <p><CalendarDays size={15} aria-hidden="true" />1–31 สิงหาคม 2569</p>
          </div>
          <table className="bill-lines">
            <caption className="bill-sr">รายรับและรายจ่ายของตู้น้ำหอม หน่วยเป็นบาท</caption>
            <thead className="bill-sr"><tr><th scope="col">รายการ</th><th scope="col">จำนวนเงิน (บาท)</th></tr></thead>
            <tbody>
              <tr className="bill-subhead"><th scope="rowgroup" colSpan={2}><span>รายการรายรับ</span><small>บาท</small></th></tr>
              <tr><th scope="row">โอนออนไลน์</th><td>{baht(income)}</td></tr>
              <tr className="bill-subtotal"><th scope="row">รวมรายรับ</th><td>{baht(income)}</td></tr>
            </tbody>
            <tbody>
              <tr className="bill-subhead"><th scope="rowgroup" colSpan={2}><span>รายการรายจ่าย</span><small>บาท</small></th></tr>
              <tr><th scope="row">ค่าเช่า (25%)</th><td>{baht(rent)}</td></tr>
              <tr><th scope="row">ค่าระบบรับชำระเงิน (0.54%)</th><td>{baht(gateway)}</td></tr>
              <tr><th scope="row">ค่าบริการ DEAL!</th><td>ฟรี</td></tr>
              <tr className="bill-subtotal"><th scope="row">รวมรายจ่าย</th><td>{baht(expense)}</td></tr>
            </tbody>
          </table>
          <div className="bill-profit">
            <span><Wallet size={18} aria-hidden="true" />กำไรที่นำมาแบ่ง</span>
            <strong>{baht(profit)} <small>บาท</small></strong>
          </div>
        </article>

        <aside className="bill-reading" aria-label="วิธีอ่านส่วนแบ่งในบิล">
          <div className="bill-reading-head"><ReceiptText size={22} aria-hidden="true" /><h3>ยอดส่วนแบ่งในบิล</h3></div>
          <p>บิลนี้หักค่าใช้จ่าย {baht(expense)} บาทจากรายรับ {baht(income)} บาทก่อน แล้วจึงแบ่งกำไร {baht(profit)} บาทตามสัดส่วนของแต่ละคน</p>
          <fieldset className="bill-options">
            <legend>เลือกดูตัวอย่างผู้ถือสิทธิ <small>(ปกปิดชื่อ)</small></legend>
            {ownerShares.map(share => (
              <label className="bill-option" key={share}>
                <input type="radio" name={id + "-share"} checked={selected === share} value={share}
                  onChange={() => setSelected(share)} aria-controls={calculation} aria-label={"สัดส่วน " + share + "% ยอดส่วนแบ่ง " + portion(share) + " บาท"} />
                <span className="bill-option-mark" aria-hidden="true"><Check size={12} strokeWidth={3} /></span>
                <span>สัดส่วน <strong>{share}%</strong></span>
                <span className="bill-option-amount">{portion(share)} <small>บาท</small></span>
              </label>
            ))}
          </fieldset>
          <div id={calculation} className="bill-calculation" aria-live="polite" aria-atomic="true">
            <p>วิธีคิดส่วนแบ่ง {selected}%</p>
            <strong>{baht(profit)} × {selected}% <span>= {portion(selected)} บาท</span></strong>
          </div>
          <div className="bill-interpret">
            <Info size={18} aria-hidden="true" />
            <p>วันที่บนบิลคือช่วงที่ตู้มีรายรับ ตรวจวันโอนตามสัญญา แล้วเทียบส่วนแบ่งกับสลิปและรายการเงินเข้าบัญชีเพื่อยืนยันว่าได้รับเงินแล้ว</p>
          </div>
          <p className="bill-origin">บิลตู้น้ำหอมนี้นำมาแสดงวิธีอ่านเอกสาร โครงการบนเว็บมีบ้านพักและตู้ชกมวย แต่ละโครงการมีค่าใช้จ่ายตามสัญญาของตัวเอง</p>
        </aside>
      </div>
    </section>
  );
}
