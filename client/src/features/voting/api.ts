import apiCaller from '@/lib/apiCaller';

export const votingApi = {
  submitVote: (data: any) => apiCaller.post('/voting/', data),
};
