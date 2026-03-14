import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index.js';

vi.mock('../../src/services/config.service.js', () => ({
  configStore: { filePath: '', cache: null },
  getPromptTemplate: vi.fn(),
  updatePromptTemplate: vi.fn(),
}));

import * as configService from '../../src/services/config.service.js';

const MOCK_CONFIG = {
  prompt_template: 'Olá {{nome}} do {{plataforma}}...',
  service_description: 'Serviço LearnOS',
  service_name: 'LearnOS',
  updated_at: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => vi.clearAllMocks());

describe('GET /api/config/prompt-template', () => {
  it('retorna configuração atual', async () => {
    configService.getPromptTemplate.mockResolvedValue(MOCK_CONFIG);

    const res = await request(app).get('/api/config/prompt-template');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.prompt_template).toBe(MOCK_CONFIG.prompt_template);
  });
});

describe('PUT /api/config/prompt-template', () => {
  it('atualiza template com sucesso', async () => {
    const updated = { ...MOCK_CONFIG, prompt_template: 'Novo template {{nome}}', updated_at: '2026-02-01T00:00:00.000Z' };
    configService.updatePromptTemplate.mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/config/prompt-template')
      .send({ template: 'Novo template {{nome}}' });

    expect(res.status).toBe(200);
    expect(res.body.data.prompt_template).toBe('Novo template {{nome}}');
  });

  it('retorna 400 para template sem {{nome}}', async () => {
    const err = Object.assign(new Error('Template deve conter a variável {{nome}}'), { code: 'VALIDATION_ERROR' });
    configService.updatePromptTemplate.mockRejectedValue(err);

    const res = await request(app)
      .put('/api/config/prompt-template')
      .send({ template: 'Template sem variável' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
