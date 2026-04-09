import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";
import type { Notification } from '../types/types';

// GET NOTIFICATIONS
export async function getNotifications(): Promise<Notification[]> {
  const res = await axiosClient.get<Notification[]>(
    API_URLS.NOTIFICATION.GET_NOTIFICATIONS
  );
  return res.data;
}
