import type { CSSProperties } from "react";
import "./share-slider.css";

export function ShareSlider({ value, onChange }: { value: number; onChange: (value: string) => void }) {
  return (
    <div className="share-slider">
      <input type="range" min={10} max={100} step={0.01} value={value}
        aria-label="เลื่อนเพื่อปรับสัดส่วน" aria-valuetext={value + " เปอร์เซ็นต์"}
        style={{ "--range-fill": ((value - 10) / 90 * 100) + "%" } as CSSProperties}
        onChange={event => onChange(event.currentTarget.value)} />
      <div aria-hidden="true"><span>10%</span><span>100%</span></div>
    </div>
  );
}
