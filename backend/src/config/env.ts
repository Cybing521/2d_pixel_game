import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  dbPath: process.env.DB_PATH || './database/sqlite/game.db',
  
  // CORS配置
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // 压缩配置
  compressionThreshold: parseInt(process.env.COMPRESSION_THRESHOLD || '102400', 10), // 100KB
  
  // 限流配置
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // 会话配置
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key',
  
  // 开发模式
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// 验证必需的环境变量
if (config.isProduction && config.sessionSecret === 'dev-secret-key') {
  console.warn('⚠️  WARNING: Using default session secret in production!');
}

console.log(`📝 Config loaded (${config.nodeEnv} mode)`);
