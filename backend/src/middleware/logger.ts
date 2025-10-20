import morgan from 'morgan';
import { config } from '../config/env.js';

/**
 * HTTP请求日志中间件
 */
export const logger = morgan(
  config.isDevelopment ? 'dev' : 'combined'
);
