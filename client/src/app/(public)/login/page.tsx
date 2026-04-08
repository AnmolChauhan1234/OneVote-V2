'use client';

import { LoginForm } from '@/features/auth/components/LoginForm'; // To be created

export default function LoginPage() {
  return (
    <div className="container flex min-h-screen w-full flex-col items-center justify-center py-12">
      <LoginForm />
    </div>
  );
}
