import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-orange-50 via-yellow-50 to-pink-50">
      <DashboardHeader />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
