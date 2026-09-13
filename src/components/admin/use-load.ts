'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

/** One GET, aborted on unmount, with a reload. An aborted request is never reported as an error. */
export function useLoad<T>(path: string) {
  const [state, setState] = useState<{ data: T | null; error: unknown }>({ data: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<T>(path, { signal: controller.signal })
      .then((data) => setState({ data, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: null, error });
      });
    return () => controller.abort();
  }, [path, version]);

  const reload = useCallback(() => {
    setState({ data: null, error: null });
    setVersion((n) => n + 1);
  }, []);

  return { data: state.data, error: state.error, loading: state.data === null && !state.error, reload };
}
