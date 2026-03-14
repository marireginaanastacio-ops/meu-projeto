import { useState, useEffect, useCallback } from 'react';
import { getLeads } from '../services/api';

export function useLeads(initialParams = {}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchLeads = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLeads(params);
      setLeads(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(initialParams);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { leads, loading, error, total, refetch: fetchLeads };
}
