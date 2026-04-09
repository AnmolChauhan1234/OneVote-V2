import axiosClient from "@/lib/instances/axios";
import type { Notification } from '../types/types';

export const notificationService = {
  getNotifications: async () => { const res = await axiosClient.get<Notification[]>('/notification/'); return res.data; },
};
