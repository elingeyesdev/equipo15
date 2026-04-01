import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = 'http://localhost:3000/api';

export const ideaService = {
  getAllIdeas: async () => {
    const token = await auth.currentUser?.getIdToken();
    const response = await axios.get(`${API_URL}/ideas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
