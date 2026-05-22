import { useCallback, useEffect, useState } from 'react';
import { facultiesService } from '@/services/faculties.service';
import type { FacultyCatalogItem } from '@/types/models';

export function useActiveFaculties() {
  const [faculties, setFaculties] = useState<FacultyCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await facultiesService.getActiveFaculties();
      setFaculties(list || []);
    } catch {
      setError('No se pudieron cargar las facultades.');
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { faculties, loading, error, reload };
}
