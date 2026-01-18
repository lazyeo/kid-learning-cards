/**
 * NoOp 存储适配器
 * 用于禁用存储场景或测试环境
 * 直接返回原始 URL，不进行持久化
 */

import type { StorageAdapter, StorageResult } from '../types';

export class NoOpStorageAdapter implements StorageAdapter {
  async storeFromUrl(imageUrl: string, _filename: string): Promise<StorageResult> {
    // 直接返回原始 URL
    return {
      publicUrl: imageUrl,
      storagePath: ''
    };
  }

  async storeFromBase64(base64Data: string, _filename: string): Promise<StorageResult> {
    // 直接返回 data URI
    return {
      publicUrl: base64Data,
      storagePath: ''
    };
  }

  async delete(_path: string): Promise<void> {
    // 无操作
  }

  getPublicUrl(path: string): string {
    return path;
  }
}
