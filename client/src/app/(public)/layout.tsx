import { redirect } from 'next/navigation';
import { getMeServer } from '@/lib/auth.server';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMeServer();
  if (user) {
    redirect('/dashboard');
  }
  return <>{children}</>;
}
