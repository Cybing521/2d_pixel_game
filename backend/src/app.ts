import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { initDatabase } from './config/database.js';
import { logger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import saveRoutes from './routes/saveRoutes.js';
import syncRoutes from './routes/syncRoutes.js';

// 初始化数据库
initDatabase();

// 创建Express应用
const app = express();

// ========== 中间件 ==========

// 安全头部
app.use(helmet());

// CORS配置
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// JSON解析 (增加限制到50MB，支持大存档)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// HTTP请求日志
app.use(logger);

// 限流
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ========== 路由 ==========

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: Date.now(),
    env: config.nodeEnv,
  });
});

// API路由
app.use('/api/saves', saveRoutes);
app.use('/api/sync', syncRoutes);

// ========== 错误处理 ==========

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ========== 启动服务器 ==========

const PORT = config.port;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`🎮 Forgotten Realm Backend Server`);
  console.log('🚀 ========================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 CORS Origin: ${config.corsOrigin}`);
  console.log(`💾 Database: ${config.dbPath}`);
  console.log('🚀 ========================================');
  console.log('');
  console.log('📝 Available Endpoints:');
  console.log('  GET  /health                                   - Health check');
  console.log('  GET  /api/saves/:username                      - Get save slots');
  console.log('  POST /api/saves/:username/:slot                - Save game');
  console.log('  GET  /api/saves/:username/:slot/load           - Load game');
  console.log('  DEL  /api/saves/:username/:slot                - Delete save');
  console.log('  POST /api/sync/:username/:slot/upload          - Upload to cloud');
  console.log('  GET  /api/sync/:username/:slot/download        - Download from cloud');
  console.log('  GET  /api/sync/:username/:slot/history         - Get sync history');
  console.log('');
});

export default app;
