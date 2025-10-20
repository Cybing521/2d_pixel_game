import zlib from 'zlib';
import { promisify } from 'util';
import { config } from '../config/env.js';
import type { CompressedData } from '../models/types.js';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * 压缩数据服务
 */
export class CompressionService {
  private threshold: number;

  constructor(threshold: number = config.compressionThreshold) {
    this.threshold = threshold;
  }

  /**
   * 压缩数据（如果超过阈值）
   */
  async compress(data: string): Promise<CompressedData> {
    const originalSize = Buffer.byteLength(data, 'utf8');
    
    // 小于阈值，不压缩
    if (originalSize < this.threshold) {
      return {
        compressed: false,
        data,
        originalSize,
        compressedSize: originalSize,
      };
    }

    try {
      // 使用gzip压缩
      const compressed = await gzip(data, { level: 6 }); // 压缩级别6（平衡速度和压缩率）
      const compressedSize = compressed.length;
      const base64Data = compressed.toString('base64');

      return {
        compressed: true,
        data: base64Data,
        originalSize,
        compressedSize,
      };
    } catch (error) {
      console.error('压缩失败:', error);
      // 压缩失败，返回原始数据
      return {
        compressed: false,
        data,
        originalSize,
        compressedSize: originalSize,
      };
    }
  }

  /**
   * 解压数据
   */
  async decompress(compressedData: CompressedData): Promise<string> {
    if (!compressedData.compressed) {
      return compressedData.data;
    }

    try {
      const buffer = Buffer.from(compressedData.data, 'base64');
      const decompressed = await gunzip(buffer);
      return decompressed.toString('utf8');
    } catch (error) {
      console.error('解压失败:', error);
      throw new Error('Failed to decompress data');
    }
  }

  /**
   * 计算压缩率
   */
  calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize) * 100;
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

export const compressionService = new CompressionService();
