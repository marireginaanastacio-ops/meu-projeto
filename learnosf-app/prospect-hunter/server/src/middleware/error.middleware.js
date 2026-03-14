// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, req, res, next) {
  console.error(`[Error] ${err.message}`, err.code || '');

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Erro interno do servidor',
    code: err.code || 'INTERNAL_ERROR',
  });
}
