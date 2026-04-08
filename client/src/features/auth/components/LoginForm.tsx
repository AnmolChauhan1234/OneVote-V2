'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas';
import { useLogin } from '../hooks';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/button'; // shadcn placeholder
import { Input } from '@/components/ui/input'; // shadcn placeholder

type FormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <div>
        <Input {...register('email')} placeholder="Email" />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Input type="password" {...register('password')} placeholder="Password" />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader /> : 'Login'}
      </Button>
    </form>
  );
}
