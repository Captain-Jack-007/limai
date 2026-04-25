import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';

export const metadata: Metadata = {
  title: 'Sci-Bridge Agent · 科研商业化智能体',
  description:
    'GenAI workspace for scientific commercialization — evaluation, investor matching and pitch deck generation. 面向科研成果转化的 GenAI 工作台。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
