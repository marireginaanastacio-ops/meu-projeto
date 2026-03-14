// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, req, res, next) {
  console.error(`[Error] ${err.message}`, err.code || '', err.stack || '');

  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: isProd && !err.code ? 'Erro interno do servidor' : (err.message || 'Erro interno do servidor'),
    code: err.code || 'INTERNAL_ERROR',
  });
}
