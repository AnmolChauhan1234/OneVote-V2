'use client';

import { queryKeys } from '@/constants/queryKeys';
import { useApiQuery } from "@/hooks/useApiQuery";
import { getNotifications } from '../services/notification.service';

// USE NOTIFICATIONS LIST
export function useNotifications() {
  return useApiQuery(queryKeys.notification.all, getNotifications);
}
