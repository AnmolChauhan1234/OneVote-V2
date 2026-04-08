import apiCaller from '@/lib/apiCaller';
import type { Election } from './types';

export const electionApi = {
  getElections: () => apiCaller.get<Election[]>('/election/'),
};
