import AuthGuard from '@/components/AuthGuard';
import EnterpriseSidebar from '@/components/EnterpriseSidebar';
import TopBar from '@/components/TopBar';

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <EnterpriseSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-6 bg-slate-50/60">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
