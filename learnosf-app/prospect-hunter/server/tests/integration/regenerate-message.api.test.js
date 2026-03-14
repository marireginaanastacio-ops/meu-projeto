import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index.js';

vi.mock('../../src/services/lead.service.js', () => ({
  leadsStore: { filePath: '', cache: null },
  getAll: vi.fn(),
  getStats: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../../src/services/gemini.service.js', () => ({
  generateMessage: vi.fn(),
  buildPrompt: vi.fn(),
}));

vi.mock('../../src/services/config.service.js', () => ({
  configStore: { filePath: '', cache: null },
  getPromptTemplate: vi.fn(),
  updatePromptTemplate: vi.fn(),
}));

import * as leadService from '../../src/services/lead.service.js';
import * as geminiService from '../../src/services/gemini.service.js';
import * as configService from '../../src/services/config.service.js';

const MOCK_LEAD = {
  id: 'uuid-1', nome: 'Maria Silva', plataforma: 'instagram',
  bio: 'Coach', status: 'Novo', message: 'Mensagem anterior',
  message_history: [], updated_at: '2026-01-01T00:00:00.000Z',
};

const MOCK_CONFIG = { prompt_template: 'Template {{nome}}', service_description: 'LearnOS', service_name: '' };

beforeEach(() => vi.clearAllMocks());

describe('POST /api/leads/:id/regenerate-message', () => {
  it('salva mensagem anterior no histórico antes de regenerar', async () => {
    leadService.getById.mockResolvedValue(MOCK_LEAD);
    configService.getPromptTemplate.mockResolvedValue(MOCK_CONFIG);
    geminiService.generateMessage.mockResolvedValue('Nova mensagem gerada');
    leadService.update.mockResolvedValue({ ...MOCK_LEAD, message: 'Nova mensagem gerada' });

    const res = await request(app).post('/api/leads/uuid-1/regenerate-message').send({});

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Nova mensagem gerada');

    // Verifica que update foi chamado com message_history contendo a mensagem anterior
    const updateCall = leadService.update.mock.calls[0][1];
    expect(updateCall.message_history).toHaveLength(1);
    expect(updateCall.message_history[0].content).toBe('Mensagem anterior');
  });

  it('retorna 404 para lead inexistente', async () => {
    leadService.getById.mockResolvedValue(null);

    const res = await request(app).post('/api/leads/nao-existe/regenerate-message').send({});
    expect(res.status).toBe(404);
  });

  it('retorna 502 quando Gemini falha sem corromper dados', async () => {
    leadService.getById.mockResolvedValue(MOCK_LEAD);
    configService.getPromptTemplate.mockResolvedValue(MOCK_CONFIG);
    const err = Object.assign(new Error('Gemini falhou'), { code: 'GEMINI_ERROR' });
    geminiService.generateMessage.mockRejectedValue(err);

    const res = await request(app).post('/api/leads/uuid-1/regenerate-message').send({});
    expect(res.status).toBe(502);
    expect(leadService.update).not.toHaveBeenCalled();
  });

  it('limita message_history a 10 entradas', async () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      content: `Mensagem ${i}`, generated_at: '2026-01-01T00:00:00.000Z', prompt_used: 'template',
    }));
    const leadWithFullHistory = { ...MOCK_LEAD, message: 'Mensagem atual', message_history: history };

    leadService.getById.mockResolvedValue(leadWithFullHistory);
    configService.getPromptTemplate.mockResolvedValue(MOCK_CONFIG);
    geminiService.generateMessage.mockResolvedValue('Nova mensagem');
    leadService.update.mockResolvedValue({ ...leadWithFullHistory, message: 'Nova mensagem' });

    await request(app).post('/api/leads/uuid-1/regenerate-message').send({});

    const updateCall = leadService.update.mock.calls[0][1];
    // 10 antigas + 1 nova = 11 → limitado a 10 (remove a mais antiga)
    expect(updateCall.message_history.length).toBeLessThanOrEqual(10);
  });
});
