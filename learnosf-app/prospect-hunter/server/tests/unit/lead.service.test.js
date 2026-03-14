import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

let tempFile;

// Mock do DATA_PATH antes de importar o service
vi.mock('../../src/utils/json-store.js', async () => {
  const actual = await vi.importActual('../../src/utils/json-store.js');
  return actual;
});

const SAMPLE_LEADS = [
  {
    id: 'id-1', nome: 'Maria Silva', plataforma: 'instagram', bio: 'Coach de carreira',
    status: 'Novo', message: null, notes: null, url: 'https://instagram.com/maria',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'id-2', nome: 'João Santos', plataforma: 'linkedin', bio: 'Professor universitário',
    status: 'Contatado', message: 'Olá João', notes: 'Respondeu rapidamente', url: 'https://linkedin.com/in/joao',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'id-3', nome: 'Ana Lima', plataforma: 'instagram', bio: 'Facilitadora',
    status: 'Convertido', message: null, notes: null, url: 'https://instagram.com/ana',
    updated_at: '2026-01-03T00:00:00.000Z',
  },
];

// Setup: cria arquivo temporário e sobrescreve o path do service
beforeEach(async () => {
  tempFile = path.join(os.tmpdir(), `leads-test-${Date.now()}.json`);
  await fs.writeFile(tempFile, JSON.stringify(SAMPLE_LEADS, null, 2));
});

afterEach(async () => {
  await fs.unlink(tempFile).catch(() => {});
  vi.resetModules();
});

async function getService() {
  // Reimporta com override do DATA_PATH via módulo factory
  const { JsonStore } = await import('../../src/utils/json-store.js');
  const store = new JsonStore(tempFile);

  // Importa e re-injeta store
  const service = await import('../../src/services/lead.service.js');
  // Injeta nosso store temporário
  service.leadsStore.filePath = tempFile;
  service.leadsStore.cache = null;
  return service;
}

describe('lead.service — getAll', () => {
  it('retorna todos os leads sem filtros', async () => {
    const svc = await getService();
    const result = await svc.getAll();
    expect(result.total).toBe(3);
    expect(result.data).toHaveLength(3);
  });

  it('filtra por plataforma', async () => {
    const svc = await getService();
    const result = await svc.getAll({ platform: 'instagram' });
    expect(result.data.every(l => l.plataforma === 'instagram')).toBe(true);
    expect(result.total).toBe(2);
  });

  it('filtra por status', async () => {
    const svc = await getService();
    const result = await svc.getAll({ status: 'Contatado' });
    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe('id-2');
  });

  it('filtra por busca textual no nome', async () => {
    const svc = await getService();
    const result = await svc.getAll({ search: 'maria' });
    expect(result.total).toBe(1);
    expect(result.data[0].nome).toBe('Maria Silva');
  });

  it('aplica paginação corretamente', async () => {
    const svc = await getService();
    const result = await svc.getAll({ limit: 2, offset: 1 });
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('id-2');
    expect(result.limit).toBe(2);
    expect(result.offset).toBe(1);
  });
});

describe('lead.service — getStats', () => {
  it('retorna contagens corretas', async () => {
    const svc = await getService();
    const stats = await svc.getStats();
    expect(stats.total).toBe(3);
    expect(stats.byStatus.Novo).toBe(1);
    expect(stats.byStatus.Contatado).toBe(1);
    expect(stats.byStatus.Convertido).toBe(1);
    expect(stats.byPlatform.instagram).toBe(2);
    expect(stats.byPlatform.linkedin).toBe(1);
    expect(stats.conversionRate).toBe(33.3);
  });
});

describe('lead.service — getById', () => {
  it('retorna lead existente', async () => {
    const svc = await getService();
    const lead = await svc.getById('id-1');
    expect(lead.nome).toBe('Maria Silva');
  });

  it('retorna null para ID inexistente', async () => {
    const svc = await getService();
    const lead = await svc.getById('nao-existe');
    expect(lead).toBeNull();
  });
});

describe('lead.service — update', () => {
  it('atualiza status corretamente', async () => {
    const svc = await getService();
    const updated = await svc.update('id-1', { status: 'Contatado' });
    expect(updated.status).toBe('Contatado');
    expect(updated.updated_at).not.toBe('2026-01-01T00:00:00.000Z');
  });

  it('rejeita status inválido', async () => {
    const svc = await getService();
    await expect(svc.update('id-1', { status: 'Invalido' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('retorna null para ID inexistente', async () => {
    const svc = await getService();
    const result = await svc.update('nao-existe', { notes: 'test' });
    expect(result).toBeNull();
  });
});

describe('lead.service — remove', () => {
  it('remove lead existente', async () => {
    const svc = await getService();
    const deletedId = await svc.remove('id-2');
    expect(deletedId).toBe('id-2');
    const lead = await svc.getById('id-2');
    expect(lead).toBeNull();
  });

  it('retorna null para ID inexistente', async () => {
    const svc = await getService();
    const result = await svc.remove('nao-existe');
    expect(result).toBeNull();
  });
});
