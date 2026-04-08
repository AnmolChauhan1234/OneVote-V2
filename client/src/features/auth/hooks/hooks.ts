'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import type { LoginCredentials, User } from './types/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.loginUser,
    onSuccess: () => {
      toast.success('Logged in successfully');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push(ROUTES.DASHBOARD.PROTECTED);
    },
    onError: (error) => toast.error('Login failed'),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logoutUser,
    onSuccess: () => {
      toast.success('Logged out');
      queryClient.clear();
      router.push(ROUTES.PUBLIC.LOGIN);
    },
  });
}
