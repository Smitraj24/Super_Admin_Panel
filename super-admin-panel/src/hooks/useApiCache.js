"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cachedFetch } from "@/lib/cache";

/**
 * SWR-like hook: returns cached data immediately, revalidates in background.
 *
 * @param {string|null} key       - Cache key; pass null to skip fetching
 * @param {() => Promise} fetcher - Async function that returns data
 * @param {object} options
 *   @param {number}  options.ttl           - Cache TTL in ms (default 30s)
 *   @param {number}  options.refreshInterval - Auto-refresh interval in ms (0 = off)
 *   @param {boolean} options.revalidateOnFocus - Refetch when window regains focus
 */
export function useApiCache(key, fetcher, options = {}) {
  const { ttl = 30_000, refreshInterval = 0, revalidateOnFocus = false } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!key);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (!key || !fetcher) return;
    try {
      const result = await cachedFetch(key, fetcher, ttl);
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) setError(err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [key, fetcher, ttl]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval || !key) return;
    const t = setInterval(load, refreshInterval);
    return () => clearInterval(t);
  }, [load, refreshInterval, key]);

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus || !key) return;
    const handler = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [load, revalidateOnFocus, key]);

  return { data, error, loading, refresh: load };
}
