import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonStore } from '../utils/json-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, '../../../..', 'data/config.json');

const configStore = new JsonStore(CONFIG_PATH);

function initModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { maxOutputTokens: 256 },
  });
}

export async function buildPrompt(lead) {
  const config = await configStore.read();

  const serviceDescription =
    config.service_description ||
    config.service_name ||
    process.env.SERVICE_DESCRIPTION ||
    'Serviço de aprendizagem e desenvolvimento profissional.';

  let template = config.prompt_template;

  if (!template || template.trim() === '') {
    template =
      'Você é um consultor especialista em experiências de aprendizagem.\n\n' +
      'Escreva uma mensagem de abordagem personalizada e genuína para {{nome}} no {{plataforma}}.\n\n' +
      'Sobre o lead:\n- Nome: {{nome}}\n- Bio: {{bio}}\n- Plataforma: {{plataforma}}\n\n' +
      'Sobre o serviço:\n{{service_description}}\n\n' +
      'Regras:\n- Máximo 5 linhas\n- Tom: profissional mas caloroso\n' +
      '- Mencione algo específico do perfil do lead\n- Não seja genérico, não pareça spam\n' +
      '- Finalize com uma pergunta aberta';
  }

  return template
    .replace(/{{nome}}/g, lead.nome || 'Olá')
    .replace(/{{bio}}/g, lead.bio || 'Sem bio disponível')
    .replace(/{{plataforma}}/g, lead.plataforma || 'plataforma')
    .replace(/{{service_description}}/g, serviceDescription);
}

async function callGeminiWithTimeout(model, prompt, timeoutMs = 8000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(Object.assign(new Error('Gemini timeout'), { code: 'GEMINI_TIMEOUT' })), timeoutMs)
  );
  const callPromise = model.generateContent(prompt);
  const result = await Promise.race([callPromise, timeoutPromise]);
  return result.response.text();
}

export async function generateMessage(lead) {
  const model = initModel();
  const prompt = await buildPrompt(lead);

  try {
    return await callGeminiWithTimeout(model, prompt);
  } catch (firstErr) {
    // Retry único em falha transitória (rate limit / timeout)
    if (firstErr.code === 'GEMINI_TIMEOUT' || (firstErr.status && firstErr.status === 429)) {
      try {
        return await callGeminiWithTimeout(model, prompt, 8000);
      } catch (retryErr) {
        throw Object.assign(
          new Error(`Gemini falhou após retry: ${retryErr.message}`),
          { code: 'GEMINI_ERROR', originalError: retryErr }
        );
      }
    }
    throw Object.assign(
      new Error(`Gemini falhou: ${firstErr.message}`),
      { code: 'GEMINI_ERROR', originalError: firstErr }
    );
  }
}
