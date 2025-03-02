import { Request, Response, NextFunction } from "express";

export interface ErrorWithStatus extends Error {
  status?: number;
}

const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(` ${req.method} ${req.url} - ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
  });
};

export default errorHandler;