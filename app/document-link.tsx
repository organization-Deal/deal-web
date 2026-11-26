import { ChevronRight, FileText, ReceiptText } from "lucide-react";
import type { OfferId } from "../lib/offers";
import "./document-link.css";

const labels = {
  boxing: "เปิดเอกสารตู้ชกมวย",
  house: "ดูตัวอย่างสัญญาบ้านพัก",
  bill: "ดูบิลตัวอย่างธุรกิจน้ำหอม",
};

export function DocumentLink({ topic, label }: { topic: OfferId | "bill"; label?: string }) {
  const Icon = topic === "bill" ? ReceiptText : FileText;
  return (
    <a className="project-document-link" href={"#/documents/" + topic}>
      <Icon size={18} aria-hidden="true" />
      <span>{label ?? labels[topic]}</span>
      <ChevronRight size={15} aria-hidden="true" />
    </a>
  );
}
