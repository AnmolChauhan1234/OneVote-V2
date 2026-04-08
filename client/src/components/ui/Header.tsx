'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export function Header() {
  return (
    <header className="border-b bg-background/75 backdrop-blur">
      <div className="container flex h-14 items-center px-4">
        <Link href={ROUTES.DASHBOARD.PROTECTED} className="font-bold">
          OneVote
        </Link>
      </div>
    </header>
  );
}
