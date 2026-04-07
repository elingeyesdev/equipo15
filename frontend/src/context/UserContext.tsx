import { createContext, useContext } from 'react';
import type { UserProfile } from '../types/models';

interface UserContextType {
  profile: UserProfile | null;
  refetchProfile: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  profile: null,
  refetchProfile: async () => {},
});

export const useUser = () => useContext(UserContext);
