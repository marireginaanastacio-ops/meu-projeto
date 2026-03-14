import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index.js';

vi.mock('../../src/services/apify.service.js', () => ({
  searchProspects: vi.fn(),
}));

import { searchProspects } from '../../src/services/apify.service.js';

describe('POST /api/prospects/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna resultado de busca bem-sucedida', async () => {
    searchProspects.mockResolvedValue({ added: 10, duplicates: 2, total: 45 });

    const res = await request(app)
      .post('/api/prospects/search')
      .send({ platform: 'instagram', keywords: 'coach', limit: 50 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { added: 10, duplicates: 2, total: 45 },
    });
    expect(searchProspects).toHaveBeenCalledWith({
      platform: 'instagram',
      keywords: 'coach',
      limit: 50,
    });
  });

  it('retorna 400 para platform inválida', async () => {
    const res = await request(app)
      .post('/api/prospects/search')
      .send({ platform: 'twitter', keywords: 'coach' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(searchProspects).not.toHaveBeenCalled();
  });

  it('retorna 400 quando keywords está vazio', async () => {
    const res = await request(app)
      .post('/api/prospects/search')
      .send({ platform: 'linkedin', keywords: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 502 quando Apify falha sem corromper JSON', async () => {
    const err = Object.assign(new Error('Apify Actor falhou: timeout'), { code: 'APIFY_ERROR' });
    searchProspects.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/prospects/search')
      .send({ platform: 'linkedin', keywords: 'facilitador' });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({
      success: false,
      error: 'Apify Actor falhou: timeout',
      code: 'APIFY_ERROR',
    });
  });

  it('usa limit padrão 50 quando não informado', async () => {
    searchProspects.mockResolvedValue({ added: 5, duplicates: 0, total: 5 });

    await request(app)
      .post('/api/prospects/search')
      .send({ platform: 'instagram', keywords: 'professor' });

    expect(searchProspects).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 50 })
    );
  });

  it('aplica limit máximo de 200', async () => {
    searchProspects.mockResolvedValue({ added: 3, duplicates: 0, total: 3 });

    await request(app)
      .post('/api/prospects/search')
      .send({ platform: 'instagram', keywords: 'mentor', limit: 999 });

    expect(searchProspects).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 200 })
    );
  });
});
