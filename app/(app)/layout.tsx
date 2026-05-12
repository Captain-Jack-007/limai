import dynamic from 'next/dynamic';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const FloatingAgent = dynamic(() => import('@/components/FloatingAgent'), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: '#0a0a0c', color: '#fff' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 min-h-0">{children}</main>
        </div>
        <FloatingAgent />
      </div>
    </AuthGuard>
  );
}
