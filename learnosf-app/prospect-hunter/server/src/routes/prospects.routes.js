import { Router } from 'express';
import { search } from '../controllers/prospects.controller.js';

const router = Router();

router.post('/search', search);

export default router;
