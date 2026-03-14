import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { JsonStore } from '../../src/utils/json-store.js';

let tempFile;
let store;

beforeEach(async () => {
  tempFile = path.join(os.tmpdir(), `json-store-test-${Date.now()}.json`);
  await fs.writeFile(tempFile, JSON.stringify([]), 'utf-8');
  store = new JsonStore(tempFile);
});

afterEach(async () => {
  await fs.unlink(tempFile).catch(() => {});
});

describe('JsonStore', () => {
  it('lê arquivo e retorna array vazio', async () => {
    const data = await store.read();
    expect(data).toEqual([]);
  });

  it('usa cache na segunda leitura', async () => {
    await store.read();
    // Modifica o arquivo diretamente sem passar pelo store
    await fs.writeFile(tempFile, JSON.stringify([{ id: '1' }]), 'utf-8');
    const data = await store.read();
    // Deve retornar do cache (array vazio)
    expect(data).toEqual([]);
  });

  it('escreve dados e atualiza cache', async () => {
    const leads = [{ id: '1', nome: 'Teste' }];
    await store.write(leads);
    const data = await store.read();
    expect(data).toEqual(leads);
  });

  it('persiste dados no disco após write', async () => {
    const leads = [{ id: '2', nome: 'Persistido' }];
    await store.write(leads);
    const raw = await fs.readFile(tempFile, 'utf-8');
    expect(JSON.parse(raw)).toEqual(leads);
  });

  it('escritas sequenciais não corrompem dados', async () => {
    const writes = Array.from({ length: 5 }, (_, i) =>
      store.write([{ id: String(i) }])
    );
    await Promise.all(writes);
    const raw = await fs.readFile(tempFile, 'utf-8');
    const data = JSON.parse(raw);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
  });

  it('invalidateCache força re-leitura do disco', async () => {
    await store.read(); // popula cache
    await fs.writeFile(tempFile, JSON.stringify([{ id: 'novo' }]), 'utf-8');
    store.invalidateCache();
    const data = await store.read();
    expect(data).toEqual([{ id: 'novo' }]);
  });
});
