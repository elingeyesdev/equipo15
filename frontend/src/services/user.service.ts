import axiosInstance from '../api/axiosConfig';
import type { UserProfile } from '../types/models';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const userService = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/users/profile');
    return response.data;
  },
  
  updateProfile: async (data: { bio?: string; nickname?: string; phone?: string; studentCode?: string }): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.patch<ApiResponse<UserProfile>>('/users/profile', data);
    return response.data;
  },

  updateFaculty: async (facultyId: number): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.patch<ApiResponse<UserProfile>>('/users/faculty', { facultyId });
    return response.data;
  }
};
