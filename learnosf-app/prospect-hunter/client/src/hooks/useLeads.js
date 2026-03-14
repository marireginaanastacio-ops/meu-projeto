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

  const updateLeadInList = useCallback((updatedLead) => {
    setLeads((prev) => prev.map((l) => l.id === updatedLead.id ? updatedLead : l));
  }, []);

  const removeLeadFromList = useCallback((id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    fetchLeads(initialParams);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { leads, loading, error, total, refetch: fetchLeads, updateLeadInList, removeLeadFromList };
}
