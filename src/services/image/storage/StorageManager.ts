/**
 * 存储管理器
 * 封装存储适配器，处理 URL 和 Base64 图片的存储
 */

import type { StorageAdapter, StorageResult } from '../types';
import { NoOpStorageAdapter } from './NoOpStorageAdapter';

export class StorageManager {
  private adapter: StorageAdapter;

  constructor(adapter?: StorageAdapter) {
    this.adapter = adapter ?? new NoOpStorageAdapter();
  }

  /**
   * 存储图片（自动检测 URL 或 Base64）
   */
  async store(imageData: string, filename: string): Promise<StorageResult> {
    if (this.isBase64(imageData)) {
      return this.storeFromBase64(imageData, filename);
    }
    return this.storeFromUrl(imageData, filename);
  }

  /**
   * 从 URL 下载并存储图片
   */
  async storeFromUrl(imageUrl: string, filename: string): Promise<StorageResult> {
    try {
      return await this.adapter.storeFromUrl(imageUrl, filename);
    } catch (error) {
      console.error('[StorageManager] storeFromUrl error:', error);
      // 存储失败时返回原始 URL
      return {
        publicUrl: imageUrl,
        storagePath: ''
      };
    }
  }

  /**
   * 存储 Base64 图片
   */
  async storeFromBase64(base64Data: string, filename: string): Promise<StorageResult> {
    try {
      return await this.adapter.storeFromBase64(base64Data, filename);
    } catch (error) {
      console.error('[StorageManager] storeFromBase64 error:', error);
      // 存储失败时返回原始 data URI
      return {
        publicUrl: base64Data,
        storagePath: ''
      };
    }
  }

  /**
   * 删除存储的图片
   */
  async delete(path: string): Promise<void> {
    if (!path) return;
    try {
      await this.adapter.delete(path);
    } catch (error) {
      console.error('[StorageManager] delete error:', error);
    }
  }

  /**
   * 获取公开 URL
   */
  getPublicUrl(path: string): string {
    return this.adapter.getPublicUrl(path);
  }

  /**
   * 检查是否为 Base64 数据
   */
  private isBase64(data: string): boolean {
    return data.startsWith('data:image');
  }

  /**
   * 检查存储是否启用（非 NoOp）
   */
  isEnabled(): boolean {
    return !(this.adapter instanceof NoOpStorageAdapter);
  }

  /**
   * 生成安全的文件名
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // 移除重音符号
      .replace(/[^\x00-\x7F]/g, '')      // 移除非 ASCII 字符
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')       // 只保留字母、数字、连字符
      .replace(/-+/g, '-')               // 合并多个连字符
      .replace(/^-|-$/g, '')             // 移除首尾连字符
      .slice(0, 50)                      // 限制长度
      || 'image';                        // 默认名
  }
}
