import { BookOpen, ChevronDown, ChevronLeft, FileText, Gamepad2, House, Image as ImageIcon, ReceiptText } from "lucide-react";
import type { OfferId } from "../lib/offers";
import { BillExample } from "./bill-example";
import "./document-guide.css";

type Topic = OfferId | "bill";

const topics = [
  { id: "bill", title: "บิลส่วนแบ่งกำไร", icon: ReceiptText },
  { id: "boxing", title: "สัญญาตู้ชกมวย", icon: Gamepad2 },
  { id: "house", title: "สัญญาบ้านพัก", icon: House },
] as const;

type Clause = { label: string; source: string; rule: string; comparison: string };
type Reader = {
  title: string; description: string; sample: string; caption: string; image: string; alt: string; quote: string; checkTitle: string;
  clauses: readonly Clause[];
};

const readers: Record<OfferId, Reader> = {
  boxing: {
    title: "ค่าอะไรหักจากยอดเล่นตู้?",
    description: "ใช้รายงานร้าน Lism เชียงใหม่ งวดเมษายน 2569 อ่านเทียบกับตัวอย่างสัญญาเจ้าของร่วมของอีกโครงการหนึ่ง อัตราที่ใช้กับตู้แต่ละเครื่องให้ดูจากสัญญาของเครื่องนั้น",
    sample: "สัญญาซื้อขายตู้แบบเจ้าของร่วม · ตัวอย่างเดือน พ.ค. 2569",
    image: "/documents/boxing-contract-excerpt.png",
    caption: "ภาคผนวก 1 บริการจาก DEAL! ข้อ 3.2 · หน้า 9 จาก 17",
    quote: "เพื่อจัดทำรายงานสรุปผลการดำเนินงานของตู้แต่ละเครื่อง",
    alt: "ข้อ 3.2 ระบุว่าทีมรวบรวมข้อมูลรายรับและค่าใช้จ่ายตั้งแต่วันที่ 25 ถึงสิ้นเดือน เพื่อทำรายงานรายตู้",
    checkTitle: "ดูบิลของร้าน Lism และคำนวณสัดส่วน",
    clauses: [
      { label: "ค่าบริการคิดจากยอดไหน", source: "สัญญาซื้อขาย ข้อ 1.2.1 · หน้า 2", rule: "สัญญาตัวอย่างกำหนดค่าบริการ 5% ของรายได้รวมรายเดือน", comparison: "บิล Lism แสดงยอดเล่น 10,470 บาท และค่าบริการ DEAL! 523.50 บาท คิดเป็น 5% ของยอดเล่น ส่วนค่าเช่าตู้ 3,141 บาท และค่าระบบ T-DEV 314.10 บาท เป็นรายการเฉพาะของบิลงวดนี้" },
      { label: "คำนวณส่วนแบ่งจากยอดไหน", source: "ภาคผนวก 1 บริการจาก DEAL! ข้อ 3.1 · หน้า 9", rule: "ภาคผนวกของสัญญารอบนั้นระบุการแบ่งกำไรและขาดทุนตามสัดส่วนของผู้ถือสิทธิ", comparison: "ในบิล Lism หักค่าใช้จ่ายรวม 3,978.60 บาทแล้ว เหลือสุทธิ 6,491.40 บาท ส่วนแบ่ง 10% ในรายงานจึงเป็น 649.14 บาท" },
      { label: "ปิดยอดแล้วเงินเข้าวันไหน", source: "ภาคผนวก 1 ข้อ 3.2–3.4 · หน้า 9", rule: "ตัวอย่างนี้ให้รวบรวมยอดช่วงวันที่ 25 ถึงสิ้นเดือน แล้วตรวจรายรับ ค่าใช้จ่าย ทำรายงาน และดำเนินการโอนช่วงวันที่ 1–10 ของเดือนถัดไป มีข้อกำหนดให้แจ้งกลุ่มเจ้าของหากล่าช้า", comparison: "เดือนบนบิลบอกว่าค่าเล่นเกิดขึ้นเมื่อไร หากต้องการยืนยันว่าได้รับเงินแล้ว ให้เทียบยอดส่วนแบ่ง เลขตู้ และงวดกับรายการเงินเข้าและสลิป" },
    ],
  },
  house: {
    title: "ค่าเช่าห้องกลายเป็นส่วนแบ่งอย่างไร?",
    description: "เอกสารนี้ใช้กับบ้านนิ่มซี่เส็ง 02 จ.เชียงใหม่ ลงวันที่ 1 ส.ค. 2569 เจ้าของดูได้ว่าค่าบริหารคิดจากยอดไหน และมีสิทธิขอดูใบเสร็จอะไร ส่วนเงื่อนไขของริมปิง 02 แสดงแยกไว้ด้านล่าง",
    sample: "สัญญาบริหารจัดการสินทรัพย์ · บ้านนิ่มซี่เส็ง 02",
    image: "/documents/house-contract-excerpt.png",
    caption: "บ้านนิ่มซี่เส็ง 02 · 1 ส.ค. 2569 · สัญญาบริหารจัดการสินทรัพย์ ข้อ 4.2 หน้า 12 จาก 23",
    quote: "รายได้คงเหลือของเจ้าของร่วม = รายได้รวม – ค่าบริหารจัดการ (30%) – ค่าใช้จ่ายดำเนินงาน",
    alt: "ข้อ 4.2 เรื่องการคำนวณเงินคงเหลือจากสัญญาบริหารบ้านพักรอบเดิม",
    checkTitle: "ดูสถานะและเงื่อนไขที่ยืนยันได้ของบ้านริมปิง",
    clauses: [
      { label: "ค่าบริหารกับค่าใช้จ่ายแยกกันอย่างไร", source: "สัญญาบริหารจัดการสินทรัพย์ ข้อ 1 และ 4.1–4.3", rule: "สัญญาตัวอย่างนับค่าเช่า ค่าบริการ และรายได้อื่นเป็นรายได้รวม แล้วหักค่าบริหาร 30% ของรายได้รวมนั้น และหักค่าใช้จ่ายดำเนินงานเพื่อหาเงินคงเหลือ", comparison: "ในรายงานบ้าน ให้เริ่มจากชื่อบ้านและหน่วยที่มีสิทธิ แล้วดูค่าที่พัก ค่าบริหาร และค่าใช้จ่ายของหน่วยแยกทีละบรรทัด ก่อนคูณเปอร์เซ็นต์ที่ถือ" },
      { label: "เจ้าของได้รับเงินและหลักฐานอะไร", source: "สัญญาบริหารจัดการสินทรัพย์ ข้อ 6.1–6.3 · หน้า 13–14", rule: "สัญญานิ่มซี่เส็ง 02 ระบุให้โอนในเดือนถัดไป โดยใช้ข้อความว่า “ภายในวันที่ 5 ไม่เกินวันที่ 8” ทีมส่งรายงานพร้อมการโอน และเจ้าของขอตรวจใบเสร็จค่าใช้จ่ายได้", comparison: "เทียบยอดสุทธิและสัดส่วนในรายงานกับเงินเข้าบัญชี หากมีรายการค่าใช้จ่ายที่สงสัย ให้ระบุงวดและชื่อรายการที่ต้องการใบเสร็จ" },
      { label: "บ้านริมปิงจะใช้เงื่อนไขไหน", source: "ทะเบียนโครงการริมแม่น้ำปิง 02 ณ 19 พ.ย. 2569 และเอกสารโครงการ หน้า 7, 11, 13, 17", rule: "เอกสารริมปิงอธิบายรายได้ตามชั้นหรือหน่วย และยกทั้งรอบรายเดือนและรายไตรมาส ยังไม่มีสัญญาผู้ถือสิทธิที่ยืนยันรายละเอียดของริมปิง 02 ให้ตรวจในหน้านี้", comparison: "ริมปิงอยู่ขั้นออกแบบตามทะเบียนและรอบเดิมปิดแล้ว หากมีรอบใหม่ ให้เทียบชั้นที่ถือ ระยะเวลาสิทธิ วิธีเฉลี่ยต้นทุน และกำหนดโอนกับสัญญาของหน่วยที่ทีมเสนอ" },
    ],
  },
};

function OriginalExtract({ image, alt, caption, label }: { image: string; alt: string; caption: string; label: string }) {
  return (
    <details className="doc-scan">
      <summary><ImageIcon size={18} aria-hidden="true" /><span>{label}</span><ChevronDown size={17} aria-hidden="true" /></summary>
      <figure>
        <a href={image} target="_blank" rel="noopener noreferrer" aria-label={"เปิดภาพขนาดเต็มในแท็บใหม่ · " + caption}>
          <img src={image} alt={alt} />
        </a>
        <figcaption>{caption} · <a href={image} target="_blank" rel="noopener noreferrer">เปิดภาพขนาดเต็ม</a></figcaption>
      </figure>
    </details>
  );
}

function ContractReader({ project }: { project: OfferId }) {
  const reader = readers[project];
  return <section className="doc-reader" aria-labelledby="contract-title">
    <header>
      <p className="doc-source-label"><FileText size={16} aria-hidden="true" />{reader.sample}</p>
      <h2 id="contract-title">{reader.title}</h2>
      <p>{reader.description}</p>
    </header>
    <blockquote className="doc-quote"><p>“{reader.quote}”</p><cite>{reader.caption}</cite></blockquote>
    <OriginalExtract image={reader.image} alt={reader.alt} caption={reader.caption} label="ดูข้อความจากหน้าสัญญาจริง" />
    <div className="doc-clause-list">{reader.clauses.map(({ label, source, rule, comparison }) => (
      <section className="doc-clause" key={label}>
        <h3>{label}</h3>
        <div className="doc-columns">
          <div><h4><FileText size={16} aria-hidden="true" />{source}</h4><p>{rule}</p></div>
          <div><h4><ReceiptText size={16} aria-hidden="true" />{project === "boxing" ? "อ่านคู่กับบิล Lism" : "จุดที่เจ้าของควรเทียบ"}</h4><p>{comparison}</p></div>
        </div>
      </section>
    ))}</div>
    <a className="doc-offer" href={"#/offer/" + project}><BookOpen size={17} aria-hidden="true" />{reader.checkTitle}</a>
  </section>;
}

export function DocumentGuide({ id }: { id?: string }) {
  const topic: Topic = id === "boxing" || id === "house" ? id : "bill";
  return <article className="doc-guide">
    <a className="guide-back" href="#/catalog"><ChevronLeft size={16} aria-hidden="true" />กลับไปเลือกโครงการ</a>
    <header className="doc-opening">
      <h1>บิลและสัญญา</h1>
      <p>เปิดบิลดูว่าเงินเหลือแบ่งเท่าไร หรือเลือกสัญญาของธุรกิจที่สนใจ เพื่อดูว่าเงินแต่ละบรรทัดคิดจากอะไร</p>
    </header>
    <nav className="doc-tabs" aria-label="เลือกเอกสารประกอบ">
      {topics.map(({ id, title, icon: Icon }) => <a key={id} href={"#/documents/" + id}
        aria-current={topic === id ? "page" : undefined}><Icon size={17} aria-hidden="true" />{title}</a>)}
    </nav>
    {topic === "bill" ? <div className="doc-bill">
      <BillExample />
      <OriginalExtract image="/documents/perfume-statement-aug-2569.png" alt="บิลส่วนแบ่งกำไรตู้น้ำหอม งวดสิงหาคม 2569 แสดงรายรับ 350.00 บาท รายจ่าย 89.39 บาท และกำไรสุทธิ 260.61 บาท" caption="บิลตู้น้ำหอม KK Bar โคราช (ญ) รายรับถึงกำไรสุทธิ · สำเนางวด 1–31 ส.ค. 2569" label="ดูภาพบิลที่ใช้อ้างอิง" />
      <p className="doc-bill-note">รายงานยอดขายรายตู้ยืนยันยอดเดือนสิงหาคม 350 บาท ส่วนค่าเช่า 25% และค่าระบบ 0.54% มาจากบิลฉบับนี้ ยังไม่มีสัญญาที่จับคู่กับเครื่องนี้ให้ตรวจ</p>
    </div> : <ContractReader project={topic} />}
  </article>;
}
