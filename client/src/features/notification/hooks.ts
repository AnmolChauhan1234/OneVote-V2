'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationApi } from './api';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
  });
}
