import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/admin.service';
import type { GlobalAnalytics } from '@/types/models';

interface UseGlobalAnalyticsReturn {
  data: GlobalAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGlobalAnalytics(): UseGlobalAnalyticsReturn {
  const [data, setData] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    adminService
      .getGlobalAnalytics()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Error al cargar analiticas');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
