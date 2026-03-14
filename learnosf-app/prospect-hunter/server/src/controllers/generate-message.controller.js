import { getById, update } from '../services/lead.service.js';
import { generateMessage } from '../services/gemini.service.js';

export async function generateMessageHandler(req, res, next) {
  const { id } = req.params;

  const lead = await getById(id);
  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead não encontrado', code: 'NOT_FOUND' });
  }

  let message;
  try {
    message = await generateMessage(lead);
  } catch (err) {
    return res.status(502).json({
      success: false,
      error: err.message,
      code: err.code || 'GEMINI_ERROR',
    });
  }

  // Só persiste após obter resposta bem-sucedida do Gemini
  const now = new Date().toISOString();
  const updatedLead = await update(id, {
    message,
    updated_at: now,
  });

  return res.json({
    success: true,
    data: { id: updatedLead.id, message: updatedLead.message },
  });
}
