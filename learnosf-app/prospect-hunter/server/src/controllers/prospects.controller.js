import { searchProspects } from '../services/apify.service.js';

export async function search(req, res) {
  const { platform, keywords, limit } = req.body;

  if (!platform || !['instagram', 'linkedin'].includes(platform)) {
    return res.status(400).json({
      success: false,
      error: 'platform deve ser "instagram" ou "linkedin"',
      code: 'VALIDATION_ERROR',
    });
  }

  if (!keywords || typeof keywords !== 'string' || keywords.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'keywords é obrigatório',
      code: 'VALIDATION_ERROR',
    });
  }

  const limitNum = limit ? Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200) : 50;

  try {
    const result = await searchProspects({ platform, keywords: keywords.trim(), limit: limitNum });
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(502).json({
      success: false,
      error: err.message,
      code: err.code || 'APIFY_ERROR',
    });
  }
}
