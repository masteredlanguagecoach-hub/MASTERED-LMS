// ============================================================
// hooks/useApi.ts — Generic API data fetching hook
// Mastered Skill Academy LMS
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '../types';

interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  apiFn: () => Promise<ApiResponse<T>>,
  deps: unknown[] = []
): ApiHookState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn();
      if (mountedRef.current) {
        if (res.success) {
          setData(res.data as T);
        } else {
          setError(res.error || 'An error occurred');
        }
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : 'Network error');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useAsyncAction<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    fn: () => Promise<ApiResponse<T>>,
    onSuccess?: (data: T | null) => void,
    onError?: (error: string) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      if (res.success) {
        onSuccess?.(res.data);
        return { success: true, data: res.data };
      } else {
        const errMsg = res.error || 'Operation failed';
        setError(errMsg);
        onError?.(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Network error';
      setError(errMsg);
      onError?.(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
}
