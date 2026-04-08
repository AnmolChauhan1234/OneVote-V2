import apiCaller from '@/lib/apiCaller';

export const biometricApi = {
  registerBiometric: (data: any) => apiCaller.post('/biometric/', data),
};
