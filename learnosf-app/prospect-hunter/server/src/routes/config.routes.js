import { Router } from 'express';
import { getTemplate, putTemplate } from '../controllers/config.controller.js';

const router = Router();

router.get('/prompt-template', getTemplate);
router.put('/prompt-template', putTemplate);

export default router;
