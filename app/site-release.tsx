const releaseNumber = 24;

export function SiteRelease() {
  return (
    <details
      className="site-release"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
      }}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }
      }}
    >
      <summary aria-label={`Ver. ${releaseNumber} ดูรายละเอียดเวอร์ชัน`}>
        <span>Ver. {releaseNumber}</span>
      </summary>
      <section className="release-note" aria-label="รายละเอียดเวอร์ชัน">
        <h2>DEAL! Invest · Ver. {releaseNumber}</h2>
        <time dateTime="2026-11-26">26 พฤศจิกายน 2569</time>
        <p>หน้าโครงการบนมือถือแสดงราคาของสิทธิ 10% พร้อมบิลรายได้ตู้ร้าน Lism ที่แตะดูได้ทันที</p>
        <p>บ้านพักที่ปิดรอบแล้วอยู่ในรายการแยกด้านล่าง</p>
      </section>
    </details>
  );
}
