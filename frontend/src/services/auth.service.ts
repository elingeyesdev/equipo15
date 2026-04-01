import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import axios from 'axios';
import { auth, googleProvider } from '../config/firebase';

const API_URL = 'http://localhost:3000/api';

export const authService = {
  register: async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const token = await userCredential.user.getIdToken();
    
    return axios.post(`${API_URL}/users/sync`, {
      firebaseUid: userCredential.user.uid,
      email: email,
      displayName: name,
      role: 'student'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  login: async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const token = await userCredential.user.getIdToken();
    
    return axios.post(`${API_URL}/users/sync`, {
      firebaseUid: userCredential.user.uid,
      email: email,
      displayName: userCredential.user.displayName || 'Usuario'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  loginWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    
    return axios.post(`${API_URL}/users/sync`, {
      firebaseUid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      role: 'student'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  logout: () => signOut(auth)
};
