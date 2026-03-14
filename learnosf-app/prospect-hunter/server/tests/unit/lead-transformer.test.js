import { describe, it, expect } from 'vitest';
import { transformApifyResult } from '../../src/utils/lead-transformer.js';
import instagramFixtures from '../fixtures/instagram-profiles.json' assert { type: 'json' };
import linkedinFixtures from '../fixtures/linkedin-profiles.json' assert { type: 'json' };

describe('transformApifyResult — Instagram', () => {
  it('transforma perfis do Instagram para o schema padrão', () => {
    const leads = transformApifyResult(instagramFixtures, 'instagram', ['coach']);
    expect(leads).toHaveLength(2);

    const lead = leads[0];
    expect(lead).toMatchObject({
      nome: 'Maria Silva',
      username: 'coach_maria',
      plataforma: 'instagram',
      bio: 'Coach de carreira | Ajudo profissionais a encontrarem seu propósito',
      url: 'https://instagram.com/coach_maria',
      seguidores: 12500,
      localizacao: 'São Paulo',
      keywords_busca: ['coach'],
      status: 'Novo',
      message: null,
      message_history: [],
      notes: null,
    });

    expect(lead.id).toBeTruthy();
    expect(lead.data_captura).toBeTruthy();
    expect(lead.updated_at).toBeTruthy();
  });

  it('trata campos opcionais ausentes', () => {
    const leads = transformApifyResult(instagramFixtures, 'instagram');
    const lead = leads[1];
    expect(lead.foto_url).toBeNull();
    expect(lead.localizacao).toBeNull();
  });
});

describe('transformApifyResult — LinkedIn', () => {
  it('transforma perfis do LinkedIn para o schema padrão', () => {
    const leads = transformApifyResult(linkedinFixtures, 'linkedin', ['treinador']);
    expect(leads).toHaveLength(2);

    const lead = leads[0];
    expect(lead).toMatchObject({
      nome: 'Ana Oliveira',
      plataforma: 'linkedin',
      url: 'https://linkedin.com/in/ana-oliveira',
      seguidores: 856,
      localizacao: 'Rio de Janeiro, Brasil',
      status: 'Novo',
    });
  });

  it('concatena firstName e lastName corretamente', () => {
    const leads = transformApifyResult(linkedinFixtures, 'linkedin');
    expect(leads[1].nome).toBe('Carlos Mendes');
  });
});

describe('transformApifyResult — edge cases', () => {
  it('retorna array vazio para input inválido', () => {
    expect(transformApifyResult(null, 'instagram')).toEqual([]);
    expect(transformApifyResult([], 'linkedin')).toEqual([]);
  });

  it('ignora itens inválidos no array', () => {
    const mixed = [null, instagramFixtures[0], undefined, 'string'];
    const leads = transformApifyResult(mixed, 'instagram');
    expect(leads).toHaveLength(1);
  });

  it('cada lead tem id único', () => {
    const leads = transformApifyResult(instagramFixtures, 'instagram');
    const ids = leads.map(l => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
