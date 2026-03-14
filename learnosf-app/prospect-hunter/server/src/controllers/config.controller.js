import { getPromptTemplate, updatePromptTemplate } from '../services/config.service.js';

export async function getTemplate(req, res, next) {
  try {
    const config = await getPromptTemplate();
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
}

export async function putTemplate(req, res, next) {
  try {
    const { template, service_description, service_name } = req.body;
    const updated = await updatePromptTemplate({ template, service_description, service_name });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, error: err.message, code: err.code });
    }
    next(err);
  }
}
