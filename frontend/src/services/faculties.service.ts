import axiosInstance from '@/api/axiosConfig';
import type { ApiResponse } from '@/types/api';
import type { FacultyCatalogItem } from '@/types/models';

const unwrapApiData = <T>(payload: T | ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export const facultiesService = {
  async getActiveFaculties(): Promise<FacultyCatalogItem[]> {
    const response = await axiosInstance.get<
      FacultyCatalogItem[] | ApiResponse<FacultyCatalogItem[]>
    >('/users/faculties');
    return unwrapApiData(response.data);
  },
};

export const formatFacultyLabel = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return 'Facultad';
  if (/^facultad\b/i.test(trimmed)) return trimmed;
  return `Facultad de ${trimmed}`;
};
