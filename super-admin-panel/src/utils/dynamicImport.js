import dynamic from "next/dynamic";

/**
 * Lazy-load a component with a minimal spinner fallback.
 * Use for heavy components (charts, calendars, editors) that aren't needed on initial paint.
 *
 * @param {() => Promise} importFunc  - Dynamic import function
 * @param {object}        options     - next/dynamic options override
 */
export const dynamicImport = (importFunc, options = {}) =>
  dynamic(importFunc, {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    ssr: false, // charts/calendars are client-only
    ...options,
  });

/**
 * Alias kept for backward compatibility.
 */
export const lazyLoadComponent = dynamicImport;


