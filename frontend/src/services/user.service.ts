import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = 'http://localhost:3000/api';

export interface UserProfile {
  _id: string;
  displayName: string;
  email: string;
  role: string;
  firebaseUid: string;
}

const ensureToken = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Usuario no autenticado');
  }
  return token;
};

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const token = await ensureToken();
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
