import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn(),
    }),
  })),
}));

// Mock do configStore — retorna template padrão
vi.mock('../../src/utils/json-store.js', () => ({
  JsonStore: vi.fn().mockImplementation(() => ({
    read: vi.fn().mockResolvedValue({
      prompt_template: 'Olá {{nome}} do {{plataforma}}: {{bio}} — {{service_description}}',
      service_description: 'Serviço de teste',
      service_name: '',
    }),
  })),
}));

import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt, generateMessage } from '../../src/services/gemini.service.js';

const SAMPLE_LEAD = {
  id: 'uuid-1',
  nome: 'Maria Silva',
  plataforma: 'instagram',
  bio: 'Coach de carreira',
};

describe('buildPrompt', () => {
  it('substitui todas as variáveis do template', async () => {
    const prompt = await buildPrompt(SAMPLE_LEAD);
    expect(prompt).toContain('Maria Silva');
    expect(prompt).toContain('instagram');
    expect(prompt).toContain('Coach de carreira');
    expect(prompt).toContain('Serviço de teste');
    expect(prompt).not.toContain('{{nome}}');
    expect(prompt).not.toContain('{{plataforma}}');
    expect(prompt).not.toContain('{{bio}}');
  });
});

describe('generateMessage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna mensagem gerada pelo Gemini', async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      response: { text: () => 'Olá Maria, vi que você é coach...' },
    });

    const mockGetModel = vi.fn().mockReturnValue({ generateContent: mockGenerate });
    GoogleGenerativeAI.mockImplementation(() => ({ getGenerativeModel: mockGetModel }));

    const message = await generateMessage(SAMPLE_LEAD);
    expect(message).toBe('Olá Maria, vi que você é coach...');
    expect(mockGenerate).toHaveBeenCalledOnce();
  });

  it('lança GEMINI_ERROR em caso de falha', async () => {
    const mockGenerate = vi.fn().mockRejectedValue(new Error('API key inválida'));
    const mockGetModel = vi.fn().mockReturnValue({ generateContent: mockGenerate });
    GoogleGenerativeAI.mockImplementation(() => ({ getGenerativeModel: mockGetModel }));

    await expect(generateMessage(SAMPLE_LEAD)).rejects.toMatchObject({
      code: 'GEMINI_ERROR',
    });
  });

  it('faz retry em timeout e retorna mensagem na segunda tentativa', async () => {
    const timeoutErr = Object.assign(new Error('Gemini timeout'), { code: 'GEMINI_TIMEOUT' });
    const mockGenerate = vi.fn()
      .mockRejectedValueOnce(timeoutErr)
      .mockResolvedValueOnce({ response: { text: () => 'Mensagem no retry' } });

    const mockGetModel = vi.fn().mockReturnValue({ generateContent: mockGenerate });
    GoogleGenerativeAI.mockImplementation(() => ({ getGenerativeModel: mockGetModel }));

    const message = await generateMessage(SAMPLE_LEAD);
    expect(message).toBe('Mensagem no retry');
    expect(mockGenerate).toHaveBeenCalledTimes(2);
  });
});
