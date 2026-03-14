import * as leadService from '../services/lead.service.js';

export async function list(req, res, next) {
  try {
    const { platform, status, search, limit, offset } = req.query;
    const result = await leadService.getAll({ platform, status, search, limit, offset });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await leadService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const lead = await leadService.getById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado', code: 'NOT_FOUND' });
    }
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { status, notes } = req.body;

    if (status === undefined && notes === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Ao menos um campo deve ser informado: status ou notes',
        code: 'VALIDATION_ERROR',
      });
    }

    const updated = await leadService.update(req.params.id, { status, notes });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado', code: 'NOT_FOUND' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, error: err.message, code: err.code });
    }
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const deletedId = await leadService.remove(req.params.id);
    if (!deletedId) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado', code: 'NOT_FOUND' });
    }
    res.json({ success: true, data: { deleted: deletedId } });
  } catch (err) {
    next(err);
  }
}
