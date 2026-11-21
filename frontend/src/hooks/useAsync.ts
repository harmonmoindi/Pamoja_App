import { DependencyList, useCallback, useEffect, useState } from "react";
import { errorMessage } from "@/lib/errors";

/**
 * Loads data from the API and tracks loading and error state.
 *
 *   const { data, loading, error, reload } = useAsync(() => listUsers({ role }), [role]);
 *
 * The request runs again whenever something in the dependency list changes, or when you call reload().
 * While it reloads, the previous data stays in place so the screen does not flicker.
 * setData lets you update the list locally after an action (for example replacing one row).
 */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    load()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, setData, loading, error, reload };
}

/** Waits until the value stops changing, e.g. so a search box does not call the API on every keystroke. */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
