/**
 * In-memory API cache with TTL and request deduplication.
 * Eliminates redundant network calls across components.
 */

const store = new Map(); // key → { data, expiresAt }
const inflight = new Map(); // key → Promise (dedup in-flight requests)

/**
 * @param {string} key   - Cache key (usually the URL + params)
 * @param {() => Promise} fetcher - Function that returns a Promise
 * @param {number} ttl   - Time-to-live in milliseconds (default 30s)
 */
export async function cachedFetch(key, fetcher, ttl = 30_000) {
  const now = Date.now();

  // Return cached value if still fresh
  const cached = store.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // Deduplicate in-flight requests for the same key
  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, expiresAt: now + ttl });
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

/** Invalidate a specific cache entry (e.g. after a mutation) */
export function invalidateCache(key) {
  store.delete(key);
}

/** Invalidate all entries whose key starts with a prefix */
export function invalidateCachePrefix(prefix) {
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}

/** Clear the entire cache */
export function clearCache() {
  store.clear();
}
