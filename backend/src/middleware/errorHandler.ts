import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../models/types.js';

/**
 * 全局错误处理中间件
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const response: ApiResponse = {
    success: false,
    error: err.message || 'Internal server error',
  };

  res.status(500).json(response);
}

/**
 * 404处理中间件
 */
export function notFoundHandler(req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    error: 'Route not found',
  };

  res.status(404).json(response);
}
