import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
  linkWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth';
import axiosInstance from '@/api/axiosConfig';
import { auth, googleProvider } from '@/config/firebase';
import { clearStoredImpersonationToken } from '@/utils/impersonation-session';

export const authService = {
  register: async (email: string, pass: string, name: string, phone?: string) => {
    let userCredential: Awaited<ReturnType<typeof createUserWithEmailAndPassword>>;

    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, pass);
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
    } catch (error) {
      await deleteUser(userCredential.user).catch(() => undefined);
      await signOut(auth);
      throw error;
    }
  },

  login: async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);

    try {
      return await axiosInstance.post('/users/sync', {
        firebaseUid: userCredential.user.uid,
        email,
        displayName: userCredential.user.displayName || 'Usuario',
      });
    } catch (error) {
      await signOut(auth);
      throw error;
    }
  },

  loginWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);

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
      if (error.response?.status === 403) {
        await signOut(auth);
      }
      throw error;
    }
  },

  logout: async () => {
    clearStoredImpersonationToken();
    await signOut(auth);
  },

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
