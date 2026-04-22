import { validationResult } from 'express-validator';

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }
  return next();
};

export const errorHandler = (err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('[error]', err.message);
  const status = err.status || 500;
  const message = status >= 500 ? 'Error interno del servidor' : err.message;
  res.status(status).json({ error: message });
};

export const notFound = (_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
};
