import path from 'path';
import { fileURLToPath } from 'url';
import { JsonStore } from '../utils/json-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, '../../../..', 'data/config.json');

export const configStore = new JsonStore(CONFIG_PATH);

export async function getPromptTemplate() {
  return configStore.read();
}

export async function updatePromptTemplate({ template, service_description, service_name }) {
  if (template !== undefined) {
    if (typeof template !== 'string' || template.trim() === '') {
      const err = new Error('Template não pode ser vazio');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    if (!template.includes('{{nome}}')) {
      const err = new Error('Template deve conter a variável {{nome}}');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
  }

  const current = await configStore.read();
  const updated = {
    ...current,
    ...(template !== undefined && { prompt_template: template }),
    ...(service_description !== undefined && { service_description }),
    ...(service_name !== undefined && { service_name }),
    updated_at: new Date().toISOString(),
  };

  await configStore.write(updated);
  return updated;
}
