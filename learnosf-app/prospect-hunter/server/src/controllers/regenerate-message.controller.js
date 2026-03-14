import { getById, update } from '../services/lead.service.js';
import { generateMessage, generateCustomMessage } from '../services/gemini.service.js';
import { getPromptTemplate } from '../services/config.service.js';

const MAX_HISTORY = 10;

export async function regenerateMessageHandler(req, res, next) {
  const { id } = req.params;
  const { customPrompt } = req.body || {};

  let lead;
  try {
    lead = await getById(id);
  } catch (err) {
    return next(err);
  }

  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead não encontrado', code: 'NOT_FOUND' });
  }

  // Salva a mensagem anterior no histórico antes de gerar nova
  let messageHistory = Array.isArray(lead.message_history) ? [...lead.message_history] : [];
  if (lead.message) {
    let config;
    try {
      config = await getPromptTemplate();
    } catch (err) {
      return next(err);
    }
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
      message = await generateCustomMessage(customPrompt);
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
  try {
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
  } catch (err) {
    return next(err);
  }
}
