// src/middlewares/metrics.ts
import { Request, Response, NextFunction } from 'express';
import { httpRequestCounter } from '../utils/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });
  next();
}
