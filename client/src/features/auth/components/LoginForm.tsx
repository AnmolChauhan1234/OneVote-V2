'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

import { loginSchema } from '@/features/auth/schemas';
import { useLogin } from '@/features/auth/hooks';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';

type FormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm">
      <div className="space-y-4">
        <Input
          {...register('email')}
          label="Email Address"
          placeholder="Enter your email"
          icon={<Mail size={16} />}
          variant="light"
          error={errors.email?.message}
        />

        <div className="space-y-1">
          <Input
            type="password"
            {...register('password')}
            label="Password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            variant="light"
            error={errors.password?.message}
          />
          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-[10px] uppercase tracking-wider text-black/50 hover:text-black transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      <PrimaryButton 
        type="submit" 
        className="w-full mt-2" 
        disabled={isPending}
      >
        {isPending ? 'Signing In...' : 'Sign In'}
      </PrimaryButton>

      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-black/50">
        Don't have an account?{' '}
        <Link href="/register" className="text-black font-semibold hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
