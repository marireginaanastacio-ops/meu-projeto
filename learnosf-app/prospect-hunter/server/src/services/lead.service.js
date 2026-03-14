import path from 'path';
import { fileURLToPath } from 'url';
import { JsonStore } from '../utils/json-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../../../..', 'data/leads.json');

const VALID_STATUSES = ['Novo', 'Contatado', 'Respondeu', 'Convertido', 'Descartado'];

export const leadsStore = new JsonStore(DATA_PATH);

export async function getAll({ platform, status, search, limit = 50, offset = 0 } = {}) {
  let leads = await leadsStore.read();

  if (platform) {
    leads = leads.filter(l => l.plataforma === platform);
  }

  if (status) {
    leads = leads.filter(l => l.status === status);
  }

  if (search) {
    const term = search.toLowerCase();
    leads = leads.filter(
      l =>
        (l.nome && l.nome.toLowerCase().includes(term)) ||
        (l.bio && l.bio.toLowerCase().includes(term))
    );
  }

  const total = leads.length;
  const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const off = Math.max(parseInt(offset, 10) || 0, 0);
  const data = leads.slice(off, off + lim);

  return { data, total, limit: lim, offset: off };
}

export async function getStats() {
  const leads = await leadsStore.read();
  const total = leads.length;

  const byStatus = { Novo: 0, Contatado: 0, Respondeu: 0, Convertido: 0, Descartado: 0 };
  const byPlatform = { instagram: 0, linkedin: 0 };

  for (const lead of leads) {
    if (byStatus[lead.status] !== undefined) byStatus[lead.status]++;
    if (byPlatform[lead.plataforma] !== undefined) byPlatform[lead.plataforma]++;
  }

  const conversionRate = total > 0 ? parseFloat(((byStatus.Convertido / total) * 100).toFixed(1)) : 0;

  return { total, byStatus, byPlatform, conversionRate };
}

export async function getById(id) {
  const leads = await leadsStore.read();
  return leads.find(l => l.id === id) || null;
}

export async function update(id, fields) {
  const { status, notes, message, updated_at } = fields;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    const err = new Error(`Status inválido: "${status}". Valores permitidos: ${VALID_STATUSES.join(', ')}`);
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const leads = await leadsStore.read();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const updated = {
    ...leads[idx],
    ...(status !== undefined && { status }),
    ...(notes !== undefined && { notes }),
    ...(message !== undefined && { message }),
    updated_at: updated_at || now,
  };

  leads[idx] = updated;
  await leadsStore.write(leads);
  return updated;
}

export async function remove(id) {
  const leads = await leadsStore.read();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;

  const [deleted] = leads.splice(idx, 1);
  await leadsStore.write(leads);
  return deleted.id;
}
