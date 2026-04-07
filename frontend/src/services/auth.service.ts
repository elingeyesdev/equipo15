import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { toast } from 'sonner';
import axiosInstance from '../api/axiosConfig';
import { auth, googleProvider } from '../config/firebase';

const validateDomain = (email: string | null) => {
  if (!email) return false;
  const allowedDomains = ['@univalle.edu', '@est.univalle.edu', '@pista8.com'];
  const allowedEmails = ['elingeyesdev@gmail.com'];
  
  return allowedDomains.some(domain => email.endsWith(domain)) || allowedEmails.includes(email);
};

export const authService = {
  register: async (email: string, pass: string, name: string) => {
    if (!validateDomain(email)) {
      toast.error('Acceso restringido a la comunidad UNIVALLE');
      throw new Error('Invalid domain');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    
    // axiosInstance maneja el token
    return axiosInstance.post('/users/sync', {
      firebaseUid: userCredential.user.uid,
      email: email,
      displayName: name,
      role: 'student'
    });
  },

  login: async (email: string, pass: string) => {
    if (!validateDomain(email)) {
      toast.error('Acceso restringido a la comunidad UNIVALLE');
      throw new Error('Invalid domain');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    
    return axiosInstance.post('/users/sync', {
      firebaseUid: userCredential.user.uid,
      email: email,
      displayName: userCredential.user.displayName || 'Usuario'
    });
  },

  loginWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const email = result.user.email;

    if (!validateDomain(email)) {
      await signOut(auth);
      toast.error('Acceso restringido a la comunidad UNIVALLE');
      throw new Error('Invalid domain');
    }

    return axiosInstance.post('/users/sync', {
      firebaseUid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      role: 'student'
    });
  },

  logout: () => signOut(auth)
};
