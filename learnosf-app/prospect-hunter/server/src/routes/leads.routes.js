import { Router } from 'express';
import { list, stats, getOne, update, remove } from '../controllers/leads.controller.js';
import { generateMessageHandler } from '../controllers/generate-message.controller.js';
import { regenerateMessageHandler } from '../controllers/regenerate-message.controller.js';

const router = Router();

// CRÍTICO: /stats deve ser registrado antes de /:id
router.get('/stats', stats);

router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

// Geração de mensagem via Gemini (Story 2.1)
router.post('/:id/generate-message', generateMessageHandler);
// Regeneração com histórico e customPrompt (Story 2.2)
router.post('/:id/regenerate-message', regenerateMessageHandler);

export default router;
