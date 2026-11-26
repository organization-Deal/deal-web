import { Calculator, ChevronDown, FileText } from "lucide-react";
import { money, terms, type Project } from "../lib/deals";
import "./project-report.css";

export function ProjectExamples({ project, units }: { project: Project; units: number }) {
  const mode = units === 10 ? "single" : "share";
  const { gross, costs } = project.report;
  const expenses = costs.reduce((sum, [, value]) => sum + value, 0);
  const net = Math.max(0, gross - expenses);
  const amount = (net * units) / 10;

  return (
    <div className="learn-report">
      <details>
        <summary>
          <span className="learn-report-icon"><Calculator size={19} aria-hidden="true" /></span>
          <span>ตัวอย่างการแบ่งรายได้</span><ChevronDown size={17} aria-hidden="true" />
        </summary>
        <div className="learn-report-body">
          <p>สมมติรายรับหนึ่งรอบของ{project.reportScope[mode]}</p>
          <div className="learn-report-bar" aria-hidden="true"><span style={{ width: (gross > 0 ? Math.min(100, net / gross * 100) : 0) + "%" }} /></div>
          <dl className="learn-report-lines">
            <div><dt>{project.source}</dt><dd>{money(gross)} บาท</dd></div>
            {costs.map(([name, value]) => (
              <div key={name}><dt>{name}</dt><dd>−{money(value)} บาท</dd></div>
            ))}
            <div className="learn-report-net"><dt>ยอดสุทธิที่นำมาแบ่ง</dt><dd>{money(net)} บาท</dd></div>
          </dl>
          <div className="learn-example-total">
            <div><strong>ส่วนแบ่งของคุณในตัวอย่าง</strong><span>{money(net)} บาท × {units * 10}%</span></div>
            <strong>{money(amount)} <small>บาท</small></strong>
          </div>
          <p className="learn-report-note">ตัวเลขเป็นข้อมูลสมมติ หากรอบใดไม่มีเงินเหลือหลังหักค่าใช้จ่าย ส่วนแบ่งในรอบนั้นจะเป็นศูนย์</p>
        </div>
      </details>
      <details>
        <summary>
          <span className="learn-report-icon"><FileText size={19} aria-hidden="true" /></span>
          <span>อ่านสัญญาตัวอย่าง</span><ChevronDown size={17} aria-hidden="true" />
        </summary>
        <div className="learn-report-body learn-contract">
          {terms(project, units).split("\n\n").map(line => <p key={line}>{line}</p>)}
        </div>
      </details>
    </div>
  );
}
