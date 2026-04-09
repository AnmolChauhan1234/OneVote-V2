import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";

export const biometricService = {
  enroll: async (data: any) => {
    const res = await axiosClient.post(API_URLS.BIOMETRIC.ENROLL, data);
    return res.data;
  },
  verify: async (data: any) => {
    const res = await axiosClient.post(API_URLS.BIOMETRIC.VERIFY, data);
    return res.data;
  },
  livenessCheck: async (data: any) => {
    const res = await axiosClient.post(API_URLS.BIOMETRIC.LIVENESS_CHECK, data);
    return res.data;
  },
};
