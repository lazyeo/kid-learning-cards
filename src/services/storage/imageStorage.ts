import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 图片存储服务
 * 使用 Supabase Storage 持久化存储 AI 生成的图片
 */
export class ImageStorageService {
  private supabase: SupabaseClient;
  private bucketName = 'coloring-images';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * 从 URL 下载图片并上传到 Supabase Storage
   * @param imageUrl 原始图片 URL
   * @param filename 文件名（不含扩展名）
   * @returns 存储后的公开访问 URL
   */
  async storeFromUrl(imageUrl: string, filename: string): Promise<string> {
    try {
      // 下载图片
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || 'image/png';
      const extension = this.getExtensionFromMimeType(contentType);

      // 生成唯一路径
      const timestamp = Date.now();
      const safeName = this.sanitizeFilename(filename);
      const path = `${timestamp}-${safeName}.${extension}`;

      // 上传到 Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(path, blob, {
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

      return urlData.publicUrl;
    } catch (error) {
      console.error('Image storage error:', error);
      throw error;
    }
  }

  /**
   * 存储 Base64 编码的图片
   * @param base64Data Base64 图片数据（可带或不带 data URI 前缀）
   * @param filename 文件名（不含扩展名）
   * @returns 存储后的公开访问 URL
   */
  async storeFromBase64(base64Data: string, filename: string): Promise<string> {
    try {
      // 解析 Base64 数据
      let mimeType = 'image/png';
      let base64Clean = base64Data;

      // 处理 data URI 格式
      const dataUriMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (dataUriMatch) {
        mimeType = dataUriMatch[1];
        base64Clean = dataUriMatch[2];
      }

      // 解码 Base64
      const binaryString = atob(base64Clean);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const extension = this.getExtensionFromMimeType(mimeType);
      const timestamp = Date.now();
      const safeName = this.sanitizeFilename(filename);
      const path = `${timestamp}-${safeName}.${extension}`;

      // 上传
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(path, bytes, {
          contentType: mimeType,
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

      return urlData.publicUrl;
    } catch (error) {
      console.error('Image storage from base64 error:', error);
      throw error;
    }
  }

  /**
   * 删除存储的图片
   * @param path 存储路径
   */
  async delete(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      console.error('Image delete error:', error);
      throw error;
    }
  }

  /**
   * 获取图片的公开 URL
   * @param path 存储路径
   */
  getPublicUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * 从 MIME 类型获取文件扩展名
   */
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

  /**
   * 清理文件名，移除不安全字符（只保留 ASCII 字符）
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // 移除重音符号
      .replace(/[^\x00-\x7F]/g, '')      // 移除非 ASCII 字符（包括中文）
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')       // 只保留字母、数字、连字符
      .replace(/-+/g, '-')               // 合并多个连字符
      .replace(/^-|-$/g, '')             // 移除首尾连字符
      .slice(0, 50)                      // 限制长度
      || 'image';                        // 如果结果为空，使用默认名
  }
}
