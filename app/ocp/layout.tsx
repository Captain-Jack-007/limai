import AuthGuard from '@/components/AuthGuard';
import OCPSidebar from '@/components/OCPSidebar';
import OCPTopBar from '@/components/OCPTopBar';
import OCPActivityFeed from '@/components/OCPActivityFeed';

export default function OCPLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#05060d] text-slate-100">
        <OCPSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <OCPTopBar />
          <main className="flex-1 min-h-0">{children}</main>
        </div>
        <OCPActivityFeed />
      </div>
    </AuthGuard>
  );
}
