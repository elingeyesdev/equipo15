import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = 'http://localhost:3000/api';

export interface Role {
  _id: string;
  name: string;
  description: string;
}

export interface UserProfile {
  _id: string;
  displayName: string;
  email: string;
  firebaseUid: string;
  roleId: Role;
  bio?: string;
  avatarUrl?: string;
  facultyId?: number;
  career?: string;
  specialty?: string;
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
  },
  updateBio: async (bio: string): Promise<UserProfile> => {
    const token = await ensureToken();
    const response = await axios.patch(`${API_URL}/users/profile`, { bio }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
