import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "照相馆系统",
  description: "照相馆预约、订单、门店和统计后台"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
