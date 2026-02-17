/**
 * Supabase 存储适配器
 * 支持将图片转换为 WebP 格式以减小文件体积
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { StorageAdapter, StorageResult } from '../types';

// 动态导入 sharp（仅在 Node.js 环境可用）
let sharp: typeof import('sharp') | null = null;

// 尝试加载 sharp（Node.js 环境）
// 使用变量间接引用模块名，防止 esbuild 静态分析并尝试 bundle sharp 的原生依赖
// （Cloudflare Pages Functions 的 esbuild 无法处理 sharp 的 child_process/fs 依赖）
const SHARP_MODULE = 'sharp';
async function getSharp(): Promise<typeof import('sharp') | null> {
  if (sharp !== null) return sharp;

  // 检测是否在 Node.js 环境
  if (typeof window !== 'undefined') {
    return null; // 浏览器环境不支持 sharp
  }

  try {
    sharp = (await import(/* webpackIgnore: true */ SHARP_MODULE)).default;
    return sharp;
  } catch {
    console.warn('[SupabaseStorageAdapter] sharp not available, skipping WebP conversion');
    return null;
  }
}

export class SupabaseStorageAdapter implements StorageAdapter {
  private supabase: SupabaseClient;
  private bucketName = 'coloring-images';
  private convertToWebP = true; // 是否转换为 WebP
  private webpQuality = 80; // WebP 质量 (0-100)

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async storeFromUrl(imageUrl: string, filename: string): Promise<StorageResult> {
    // 下载图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    let imageData = new Uint8Array(arrayBuffer);
    let contentType = response.headers.get('content-type') || 'image/png';
    let extension = this.getExtensionFromMimeType(contentType);

    // 尝试转换为 WebP
    if (this.convertToWebP) {
      const converted = await this.tryConvertToWebP(imageData);
      if (converted) {
        imageData = new Uint8Array(converted);
        contentType = 'image/webp';
        extension = 'webp';
      }
    }

    // 生成唯一路径
    const timestamp = Date.now();
    const safeName = this.sanitizeFilename(filename);
    const path = `${timestamp}-${safeName}.${extension}`;

    // 上传到 Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, imageData, {
        contentType,
        cacheControl: '31536000', // 1 年缓存
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // 获取公开 URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return {
      publicUrl: urlData.publicUrl,
      storagePath: path
    };
  }

  async storeFromBase64(base64Data: string, filename: string): Promise<StorageResult> {
    // 解析 Base64 数据
    let base64Clean = base64Data;

    // 处理 data URI 格式
    const dataUriMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUriMatch) {
      base64Clean = dataUriMatch[2];
    }

    // 解码 Base64 为 Uint8Array
    const binaryString = atob(base64Clean);
    let imageData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageData[i] = binaryString.charCodeAt(i);
    }

    let contentType = 'image/webp';
    let extension = 'webp';

    // 尝试转换为 WebP
    if (this.convertToWebP) {
      const converted = await this.tryConvertToWebP(imageData);
      if (converted) {
        imageData = new Uint8Array(converted);
      } else {
        // 转换失败，使用原格式
        contentType = dataUriMatch ? dataUriMatch[1] : 'image/png';
        extension = this.getExtensionFromMimeType(contentType);
      }
    }

    const timestamp = Date.now();
    const safeName = this.sanitizeFilename(filename);
    const path = `${timestamp}-${safeName}.${extension}`;

    // 上传
    const { error: uploadError } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, imageData, {
        contentType,
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // 获取公开 URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return {
      publicUrl: urlData.publicUrl,
      storagePath: path
    };
  }

  /**
   * 尝试将图片转换为 WebP 格式
   * @returns 转换后的 Uint8Array，如果失败返回 null
   */
  private async tryConvertToWebP(imageData: Uint8Array): Promise<Uint8Array | null> {
    try {
      const sharpInstance = await getSharp();
      if (!sharpInstance) {
        return null;
      }

      const webpBuffer = await sharpInstance(Buffer.from(imageData))
        .webp({ quality: this.webpQuality })
        .toBuffer();

      console.log(`[SupabaseStorageAdapter] Converted to WebP: ${imageData.length} -> ${webpBuffer.length} bytes (${Math.round((1 - webpBuffer.length / imageData.length) * 100)}% smaller)`);

      return new Uint8Array(webpBuffer);
    } catch (error) {
      console.warn('[SupabaseStorageAdapter] WebP conversion failed:', error);
      return null;
    }
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      throw error;
    }
  }

  getPublicUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return map[mimeType] || 'png';
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x00-\x7F]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)
      || 'image';
  }
}
