import axiosClient from '../instances/axios';
import apiCaller from '../apiCaller';

export async function refreshToken() {
  await apiCaller.post('/auth/token/refresh');
}
