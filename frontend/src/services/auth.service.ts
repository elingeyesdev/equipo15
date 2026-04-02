import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import axios from 'axios';
import { auth, googleProvider } from '../config/firebase';

const API_URL = 'http://localhost:3000/api';

const validateDomain = (email: string | null) => {
  if (!email) return false;
  const allowedDomains = ['@univalle.edu', '@est.univalle.edu', '@pista8.com'];
  const allowedEmails = ['elingeyesdev@gmail.com'];
  
  return allowedDomains.some(domain => email.endsWith(domain)) || allowedEmails.includes(email);
};

export const authService = {
  register: async (email: string, pass: string, name: string) => {
    if (!validateDomain(email)) {
      alert('Acceso restringido a la comunidad UNIVALLE');
      throw new Error('Invalid domain');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
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
    if (!validateDomain(email)) {
      alert('Acceso restringido a la comunidad UNIVALLE');
      throw new Error('Invalid domain');
    }
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
    const email = result.user.email;

    if (!validateDomain(email)) {
      await signOut(auth);
      alert('Acceso restringido a la comunidad UNIVALLE');
      throw new Error('Invalid domain');
    }

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
