import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./shell-design.css";
import "./catalogue-design.css";
import "./guide-design.css";
import "./records-design.css";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f7",
  colorScheme: "light",
};
export const metadata: Metadata = {
  title: "DEAL! Invest | โครงการ",
  description:
    "ดูสถานะบ้านพักริมปิงและรายงานรายได้ตู้ชกมวย ลองคำนวณสัดส่วน แจ้งความสนใจบ้านรอบถัดไป หรือขอให้ DEAL! ตรวจสิทธิที่ว่างของตู้",
  icons: { icon: "/brand/icon.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/plex-thai-400.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/plex-latin-variable.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
