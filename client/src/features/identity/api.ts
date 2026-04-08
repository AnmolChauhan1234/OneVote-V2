import apiCaller from '@/lib/apiCaller';

export const identityApi = {
  getIdentity: () => apiCaller.get('/identity/'),
};
