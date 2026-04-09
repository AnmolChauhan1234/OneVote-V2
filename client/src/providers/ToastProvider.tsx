'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return <Toaster position="top-center" richColors visibleToasts={3} duration={3000} closeButton />;
}
