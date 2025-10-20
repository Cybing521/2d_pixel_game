import pako from 'pako';

/**
 * 前端数据压缩服务
 */

// 压缩阈值：100KB
const COMPRESSION_THRESHOLD = 100 * 1024;

export interface CompressedData {
  compressed: boolean;
  data: string;
  originalSize: number;
  compressedSize: number;
}

/**
 * 压缩数据
 */
export function compressData(data: any): CompressedData {
  const jsonString = JSON.stringify(data);
  const originalSize = new Blob([jsonString]).size;

  // 小于阈值，不压缩
  if (originalSize < COMPRESSION_THRESHOLD) {
    return {
      compressed: false,
      data: jsonString,
      originalSize,
      compressedSize: originalSize,
    };
  }

  try {
    // 使用pako进行gzip压缩
    const compressed = pako.gzip(jsonString);
    
    // 转换为base64字符串
    const base64 = btoa(
      String.fromCharCode.apply(null, Array.from(compressed))
    );

    return {
      compressed: true,
      data: base64,
      originalSize,
      compressedSize: compressed.length,
    };
  } catch (error) {
    console.error('压缩失败:', error);
    // 压缩失败，返回原始数据
    return {
      compressed: false,
      data: jsonString,
      originalSize,
      compressedSize: originalSize,
    };
  }
}

/**
 * 解压数据
 */
export function decompressData(compressedData: CompressedData): any {
  if (!compressedData.compressed) {
    return JSON.parse(compressedData.data);
  }

  try {
    // 从base64解码
    const binaryString = atob(compressedData.data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 解压
    const decompressed = pako.ungzip(bytes, { to: 'string' });
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('解压失败:', error);
    throw new Error('Failed to decompress data');
  }
}

/**
 * 计算压缩率
 */
export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0;
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * 格式化文件大小
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
