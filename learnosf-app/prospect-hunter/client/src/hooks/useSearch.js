import { useState, useRef, useCallback } from 'react';

function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    platform: params.get('platform') || '',
    status: params.get('status') || '',
    search: params.get('search') || '',
  };
}

function writeFiltersToURL(filters) {
  const params = new URLSearchParams();
  if (filters.platform) params.set('platform', filters.platform);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

export function useSearch(refetch) {
  const [filters, setFiltersState] = useState(readFiltersFromURL);
  const debounceRef = useRef(null);

  const applyFilters = useCallback(
    (newFilters) => {
      writeFiltersToURL(newFilters);
      const params = {};
      if (newFilters.platform) params.platform = newFilters.platform;
      if (newFilters.status) params.status = newFilters.status;
      if (newFilters.search) params.search = newFilters.search;
      refetch(params);
    },
    [refetch]
  );

  const setFilter = useCallback(
    (key, value) => {
      setFiltersState((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'search') {
          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => applyFilters(next), 300);
        } else {
          applyFilters(next);
        }
        return next;
      });
    },
    [applyFilters]
  );

  const clearFilters = useCallback(() => {
    const empty = { platform: '', status: '', search: '' };
    setFiltersState(empty);
    clearTimeout(debounceRef.current);
    applyFilters(empty);
  }, [applyFilters]);

  const hasActiveFilters = filters.platform || filters.status || filters.search;

  return { filters, setFilter, clearFilters, hasActiveFilters };
}
