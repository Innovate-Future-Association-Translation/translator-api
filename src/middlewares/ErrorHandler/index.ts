import { Request, Response, NextFunction } from 'express';

export interface ErrorWithStatus extends Error {
  status?: number;
  details?: string[];
}

const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || [];
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    details,
  });
};

export default errorHandler;
