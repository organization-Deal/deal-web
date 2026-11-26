const releaseNumber = 22;

export function SiteRelease() {
  return (
    <details className="site-release">
      <summary aria-label={`Ver. ${releaseNumber} ดูรายละเอียดเวอร์ชัน`}>
        <span>Ver. {releaseNumber}</span>
      </summary>
      <section className="release-note" aria-label="รายละเอียดเวอร์ชัน">
        <h2>DEAL! Invest · Ver. {releaseNumber}</h2>
        <time dateTime="2026-11-26">26 พฤศจิกายน 2569</time>
        <p>รุ่นนี้เพิ่มเลขเวอร์ชันที่หัวเว็บทุกหน้า</p>
        <p><strong>การปรับมือถือในรุ่น 21</strong> แยกภาพรวม รายงานจริง และเงื่อนไขออกเป็นสามแท็บ พร้อมปุ่มเลือกสัดส่วนที่ขอบล่างของหน้าโครงการ</p>
      </section>
    </details>
  );
}
