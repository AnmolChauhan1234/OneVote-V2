import { Loader } from '@/components/ui/Loader';
import { useMe } from '@/features/auth/hooks';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';

'use client';

import { useMe } from '@/features/auth/hooks';
import { Loader } from '@/components/ui/Loader';
import { Footer } from '@/components/ui/Footer';

export default function DashboardPage() {
  const { data: user, isLoading } = useMe();

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen flex flex-col">
      <header><h1>Header (Protected)</h1></header>
      <main className="flex-1 container py-12">
        <h1>Welcome, {user?.email || 'User'}</h1>
      </main>
      <Footer />
    </div>
  );
}
