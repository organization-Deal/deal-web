"use client";

import { useState, type CSSProperties } from "react";
import { PencilLine } from "lucide-react";
import { money } from "../lib/deals";
import { boxingShareLabel, offerAmount, offers, validOfferShare, type OfferId } from "../lib/offers";
import { LearnProjectSwitch } from "./learn-project-switch";
import { ShareSlider } from "./share-slider";
import "./ownership-explorer.css";

const assets = {
  house: {
    label: "บ้านพัก", whole: "ทั้งหลัง", photo: "/media/rimping-render.webp",
    alt: "ภาพจำลองบ้านพักสองชั้น Human Allowed Rimping", caption: "ภาพจำลองโครงการ",
    rights: "ถือสิทธิในตัวบ้านบนที่ดินเช่า ตามชั้นหรือหน่วยที่ระบุในสัญญา",
  },
  boxing: {
    label: "ตู้ชกมวย", whole: "ทั้งตู้", photo: "/media/boxing-front.webp",
    alt: "ตัวเครื่อง DEAL! Boxing และเป้าชกมวย", caption: "ตัวเครื่อง DEAL! Boxing",
    rights: "ถือสิทธิในตู้ชกมวยตามสัดส่วน ดูหมายเลขเครื่องและจุดติดตั้งได้ในสัญญา",
  },
} as const;

const presets = [10, 20, 50, 100];

export function OwnershipExplorer() {
  const [id, setId] = useState<OfferId>("house");
  const [drafts, setDrafts] = useState<Record<OfferId, string>>({ house: "10", boxing: "10" });
  const asset = assets[id];
  const closedRound = id === "house";
  const action = closedRound ? "ดูสถานะบ้านและรอบถัดไป" : "ดูตู้และรายงานจริง";
  const draft = drafts[id];
  const normalized = draft.trim().replace(",", ".");
  const parsed = Number(normalized);
  const share = /^\d{1,3}(\.\d{1,2})?$/.test(normalized) && validOfferShare(id, parsed) ? parsed : null;
  const amount = share === null ? null : offerAmount(id, share);
  const index = presets.indexOf(share ?? -1);

  function updateShare(value: string) {
    setDrafts(current => ({ ...current, [id]: value }));
  }

  return (
    <section className="share-explorer" aria-label="คำนวณราคาตามสัดส่วน">
      <LearnProjectSwitch selected={id} controls="guide-calculator" onChange={setId} />
      <div className="share-explorer-body" id="guide-calculator">
        <article className="share-asset">
          <figure className={"share-photo share-photo-" + id}>
            <img src={asset.photo} alt={asset.alt} />
            <figcaption>{asset.caption}</figcaption>
          </figure>
          <div className="share-asset-text">
            <h2>{offers[id].name}</h2>
            <p>{asset.rights}</p>
            {closedRound && <p>ริมปิงรอบเดิมปิดเมื่อ 14 ต.ค. 2569 ยังไม่มีประกาศเปิดรอบใหม่</p>}
          </div>
        </article>

        <div className="share-controls">
          <h2>{closedRound ? "ลองคำนวณจากราคารอบเดิม" : "เลือกสัดส่วนของตู้"}</h2>
          <p className="share-full">ราคา{asset.whole}{closedRound ? "ในรอบเดิม" : ""} <strong>{money(offers[id].fullPrice)} บาท</strong></p>
          {closedRound && (
            <div className="share-presets" role="group" aria-label="เลือกสัดส่วนด่วน" data-custom={index === -1}
              style={{ "--selection": Math.max(index, 0) } as CSSProperties}>
              {presets.map(value => <button key={value} type="button" aria-pressed={value === share}
                onClick={() => updateShare(String(value))}>{value === 100 ? asset.whole : value + "%"}</button>)}
            </div>
          )}

          <div className="share-entry">
            <label htmlFor="share-explorer-input">กำหนดสัดส่วนเอง
              <small id="share-explorer-help">10–100% · ทศนิยมได้ 2 ตำแหน่ง</small>
            </label>
            <span className="share-input-unit">
              <input id="share-explorer-input" inputMode="decimal" value={draft} maxLength={7}
                onChange={event => updateShare(event.target.value)} aria-invalid={share === null}
                aria-describedby={share === null ? "share-explorer-help share-error" : "share-explorer-help"} />
              <span aria-hidden="true">%</span><PencilLine size={15} aria-hidden="true" />
            </span>
          </div>
          {share === null && <p id="share-error" className="share-error">ใส่ตัวเลขตั้งแต่ 10 ถึง 100 เช่น 12.75</p>}
          <ShareSlider value={share ?? 10} onChange={updateShare} />
          <div className="share-price-row">
            <div className="share-quote" aria-live="polite" aria-atomic="true">
              <span>{closedRound ? "ราคาอ้างอิงรอบเดิม" : "ราคาสำหรับ"}{share !== null && (closedRound ? " · " + share + "%" : " " + boxingShareLabel(share))}</span>
              <strong>{amount === null ? "—" : money(amount)} <small>บาท</small></strong>
            </div>
            <svg className="share-donut" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="25" fill="none" stroke="#e4e4e8" strokeWidth="7" />
              <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="7" pathLength="100"
                strokeDasharray={(share ?? 0) + " 100"} transform="rotate(-90 32 32)" />
            </svg>
          </div>
          {share === null
            ? <button className="learn-cta" type="button" disabled>{action}</button>
            : <a className="learn-cta" href={"#/offer/" + id + "?share=" + share}>{action}</a>}
        </div>
      </div>
    </section>
  );
}
