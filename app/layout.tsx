import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '力迈 AI · 税务风险检测',
  description: 'AI 驱动的中小企业税务风险检测与合规系统。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">{children}</body>
    </html>
  );
}
