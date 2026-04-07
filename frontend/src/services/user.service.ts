import axiosInstance from '../api/axiosConfig';

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  firebaseUid: string;
  roleId: string;
  role?: string;
  roleInfo?: Role;
  bio?: string;
  avatarUrl?: string;
  facultyId?: number;
  career?: string;
  specialty?: string;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },
  
  updateBio: async (bio: string): Promise<UserProfile> => {
    const response = await axiosInstance.patch('/users/bio', { bio });
    return response.data;
  },

  updateFaculty: async (facultyId: number): Promise<UserProfile> => {
    const response = await axiosInstance.patch('/users/faculty', { facultyId });
    return response.data;
  }
};
