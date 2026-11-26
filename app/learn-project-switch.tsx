import { Gamepad2, House } from "lucide-react";
import type { OfferId } from "../lib/offers";

export function LearnProjectSwitch({ selected, onChange, controls }: {
  selected: OfferId;
  onChange: (id: OfferId) => void;
  controls: string;
}) {
  return (
    <div className="learn-switch" data-side={selected === "house" ? "first" : "last"} role="group" aria-label="เลือกประเภทโครงการ">
      <button type="button" aria-controls={controls} aria-pressed={selected === "house"} onClick={() => onChange("house")}>
        <House size={18} aria-hidden="true" />บ้านพัก
      </button>
      <button type="button" aria-controls={controls} aria-pressed={selected === "boxing"} onClick={() => onChange("boxing")}>
        <Gamepad2 size={18} aria-hidden="true" />ตู้ชกมวย
      </button>
    </div>
  );
}
