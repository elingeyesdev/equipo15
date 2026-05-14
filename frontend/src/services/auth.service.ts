import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  linkWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosConfig';
import { auth, googleProvider } from '@/config/firebase';

const validateDomain = (email: string | null) => {
  if (!email) return false;
  const allowedDomains = ['@univalle.edu', '@est.univalle.edu', '@pista8.com'];
  const allowedEmails = ['elingeyesdev@gmail.com'];

  return (
    allowedDomains.some((domain) => email.endsWith(domain)) ||
    allowedEmails.includes(email)
  );
};

export const authService = {
  register: async (email: string, pass: string, name: string, phone?: string) => {
    if (!validateDomain(email)) {
      toast.error('Acceso restringido a la comunidad UNIVALLE');
      throw new Error('Invalid domain');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });

    const token = await userCredential.user.getIdToken();
    const uid = userCredential.user.uid;

    await signOut(auth);

    await axiosInstance.post(
      '/users/sync',
      {
        firebaseUid: uid,
        email,
        displayName: name,
        role: 'student',
        phone,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  login: async (email: string, pass: string) => {
    if (!validateDomain(email)) {
      toast.error('Acceso restringido a la comunidad UNIVALLE');
      throw new Error('Invalid domain');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, pass);

    return axiosInstance.post('/users/sync', {
      firebaseUid: userCredential.user.uid,
      email,
      displayName: userCredential.user.displayName || 'Usuario',
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

    try {
      return await axiosInstance.post('/users/sync', {
        firebaseUid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        preventCreation: true,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        await signOut(auth);
        const customError = new Error('USER_NOT_FOUND');
        (customError as any).code = 'auth/user-not-found-in-db';
        throw customError;
      }
      throw error;
    }
  },

  logout: () => signOut(auth),

  sendPasswordReset: async (email: string) => {
    const actionCodeSettings = {
      url:
        import.meta.env.VITE_RESET_PASSWORD_URL ||
        `${window.location.origin}/reset-password`,
      handleCodeInApp: true,
    };
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  },

  verifyResetCode: async (code: string) => {
    return verifyPasswordResetCode(auth, code);
  },

  confirmReset: async (code: string, newPass: string) => {
    return confirmPasswordReset(auth, code, newPass);
  },

  linkGoogleAccount: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('No identity found');
    return linkWithPopup(user, googleProvider);
  },

  changePassword: async (oldPass: string, newPass: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No identity found');

    const credential = EmailAuthProvider.credential(user.email, oldPass);
    await reauthenticateWithCredential(user, credential);
    return updatePassword(user, newPass);
  },
};
