import apiCaller from '@/lib/apiCaller';
import type { Organisation } from './types';

export const organisationApi = {
  getOrganisations: () => apiCaller.get<Organisation[]>('/organisation/'),
  createOrganisation: (data: any) => apiCaller.post('/organisation/', data),
};
