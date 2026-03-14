const BASE_URL = '/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

export const getLeads = (params) => {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return apiFetch(`/leads${qs}`);
};

export const getLead = (id) => apiFetch(`/leads/${id}`);

export const updateLead = (id, data) =>
  apiFetch(`/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteLead = (id) =>
  apiFetch(`/leads/${id}`, { method: 'DELETE' });

export const generateMessage = (id) =>
  apiFetch(`/leads/${id}/generate-message`, { method: 'POST' });

export const regenerateMessage = (id, customPrompt) =>
  apiFetch(`/leads/${id}/regenerate-message`, {
    method: 'POST',
    body: JSON.stringify(customPrompt ? { customPrompt } : {}),
  });

export const searchProspects = (params) =>
  apiFetch('/prospects/search', {
    method: 'POST',
    body: JSON.stringify(params),
  });

export const getStats = () => apiFetch('/leads/stats');

export const getConfig = () => apiFetch('/config/prompt-template');

export const updateConfig = (data) =>
  apiFetch('/config/prompt-template', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
