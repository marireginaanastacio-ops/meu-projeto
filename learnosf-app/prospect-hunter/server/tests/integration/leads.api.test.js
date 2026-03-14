import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index.js';

// Mock do lead service para isolar os testes de integração
vi.mock('../../src/services/lead.service.js', () => ({
  leadsStore: { filePath: '', cache: null },
  getAll: vi.fn(),
  getStats: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

import * as leadService from '../../src/services/lead.service.js';

const MOCK_LEAD = {
  id: 'uuid-1',
  nome: 'Maria Silva',
  plataforma: 'instagram',
  bio: 'Coach de carreira',
  status: 'Novo',
  message: null,
  notes: null,
  url: 'https://instagram.com/maria',
  updated_at: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => vi.clearAllMocks());

describe('GET /api/leads', () => {
  it('retorna lista de leads', async () => {
    leadService.getAll.mockResolvedValue({ data: [MOCK_LEAD], total: 1, limit: 50, offset: 0 });

    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  it('passa filtros como parâmetros ao service', async () => {
    leadService.getAll.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

    await request(app).get('/api/leads?platform=instagram&status=Novo&search=maria&limit=10&offset=5');
    expect(leadService.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'instagram', status: 'Novo', search: 'maria' })
    );
  });
});

describe('GET /api/leads/stats', () => {
  it('retorna estatísticas', async () => {
    leadService.getStats.mockResolvedValue({
      total: 10, byStatus: { Novo: 5, Contatado: 3, Respondeu: 1, Convertido: 1, Descartado: 0 },
      byPlatform: { instagram: 7, linkedin: 3 }, conversionRate: 10,
    });

    const res = await request(app).get('/api/leads/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(10);
    expect(res.body.data.conversionRate).toBe(10);
  });
});

describe('GET /api/leads/:id', () => {
  it('retorna lead existente', async () => {
    leadService.getById.mockResolvedValue(MOCK_LEAD);

    const res = await request(app).get('/api/leads/uuid-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('uuid-1');
  });

  it('retorna 404 para ID inexistente', async () => {
    leadService.getById.mockResolvedValue(null);

    const res = await request(app).get('/api/leads/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('PATCH /api/leads/:id', () => {
  it('atualiza lead com sucesso', async () => {
    leadService.update.mockResolvedValue({ ...MOCK_LEAD, status: 'Contatado' });

    const res = await request(app)
      .patch('/api/leads/uuid-1')
      .send({ status: 'Contatado' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Contatado');
  });

  it('retorna 400 para body vazio', async () => {
    const res = await request(app).patch('/api/leads/uuid-1').send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 400 para status inválido', async () => {
    const err = Object.assign(new Error('Status inválido: "XYZ"'), { code: 'VALIDATION_ERROR' });
    leadService.update.mockRejectedValue(err);

    const res = await request(app).patch('/api/leads/uuid-1').send({ status: 'XYZ' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 404 para ID inexistente', async () => {
    leadService.update.mockResolvedValue(null);

    const res = await request(app).patch('/api/leads/nao-existe').send({ notes: 'teste' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/leads/:id', () => {
  it('deleta lead com sucesso', async () => {
    leadService.remove.mockResolvedValue('uuid-1');

    const res = await request(app).delete('/api/leads/uuid-1');
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe('uuid-1');
  });

  it('retorna 404 para ID inexistente', async () => {
    leadService.remove.mockResolvedValue(null);

    const res = await request(app).delete('/api/leads/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
