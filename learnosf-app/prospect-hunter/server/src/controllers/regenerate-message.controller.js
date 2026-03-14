import { getById, update } from '../services/lead.service.js';
import { generateMessage } from '../services/gemini.service.js';
import { getPromptTemplate } from '../services/config.service.js';

const MAX_HISTORY = 10;

export async function regenerateMessageHandler(req, res, next) {
  const { id } = req.params;
  const { customPrompt } = req.body || {};

  const lead = await getById(id);
  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead não encontrado', code: 'NOT_FOUND' });
  }

  // Salva a mensagem anterior no histórico antes de gerar nova
  let messageHistory = Array.isArray(lead.message_history) ? [...lead.message_history] : [];
  if (lead.message) {
    const config = await getPromptTemplate();
    messageHistory.push({
      content: lead.message,
      generated_at: lead.updated_at || new Date().toISOString(),
      prompt_used: customPrompt || config.prompt_template || 'template padrão',
    });
    // Limita a 10 entradas (remove as mais antigas)
    if (messageHistory.length > MAX_HISTORY) {
      messageHistory = messageHistory.slice(-MAX_HISTORY);
    }
  }

  let message;
  try {
    if (customPrompt) {
      // Usa customPrompt diretamente (bypass do template padrão)
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { maxOutputTokens: 256 },
      });
      const timeoutMs = 8000;
      const result = await Promise.race([
        model.generateContent(customPrompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(Object.assign(new Error('Gemini timeout'), { code: 'GEMINI_TIMEOUT' })), timeoutMs)
        ),
      ]);
      message = result.response.text();
    } else {
      message = await generateMessage(lead);
    }
  } catch (err) {
    return res.status(502).json({
      success: false,
      error: err.message,
      code: err.code || 'GEMINI_ERROR',
    });
  }

  // Só persiste após obter resposta bem-sucedida
  const now = new Date().toISOString();
  const updatedLead = await update(id, {
    message,
    message_history: messageHistory,
    updated_at: now,
  });

  return res.json({
    success: true,
    data: { id: updatedLead.id, message: updatedLead.message },
  });
}
