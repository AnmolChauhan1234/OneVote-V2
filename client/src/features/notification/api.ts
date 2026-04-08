import apiCaller from '@/lib/apiCaller';
import type { Notification } from './types';

export const notificationApi = {
  getNotifications: () => apiCaller.get<Notification[]>('/notification/'),
};
