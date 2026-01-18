import { type ImageGeneratorProvider, type ImageGenOptions } from '../types';

/**
 * ModelScope Provider 配置
 */
export interface ModelScopeConfig {
  apiKey: string;       // ModelScope Token
  baseUrl?: string;     // API 基础地址，默认: https://api-inference.modelscope.cn
  model?: string;       // 模型ID，默认: Tongyi-MAI/Z-Image-Turbo
  timeout?: number;     // 请求超时时间(ms)，默认: 120000 (2分钟)
  pollInterval?: number; // 轮询间隔(ms)，默认: 5000
  maxRetries?: number;   // 最大重试次数，默认: 24 (总计2分钟)
}

/**
 * 任务状态常量
 * 注意：API 实际返回 PROCESSING 而不是 RUNNING
 */
const TaskStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  PROCESSING: 'PROCESSING',  // API 实际返回的处理中状态
  SUCCEED: 'SUCCEED',
  FAILED: 'FAILED',
  TIMEOUT: 'TIMEOUT'
} as const;

type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];

/**
 * 任务响应接口
 */
interface TaskResponse {
  task_id: string;
  task_status: TaskStatusType;
  output_images?: string[];
  message?: string;
  error?: string;
}

/**
 * ModelScope Provider
 * 支持魔搭社区的图像生成 API
 *
 * @see https://www.modelscope.cn/docs/intro/api
 */
export class ModelScopeProvider implements ImageGeneratorProvider {
  private config: Required<ModelScopeConfig>;

  constructor(config: ModelScopeConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api-inference.modelscope.cn',
      model: config.model || 'Qwen/Qwen-Image-2512',
      timeout: config.timeout || 120000,
      pollInterval: config.pollInterval || 5000,
      maxRetries: config.maxRetries || 24
    };
  }

  getName(): string {
    return 'ModelScope (魔搭社区)';
  }

  getId(): string {
    return 'modelscope';
  }

  async generateImage(prompt: string, options: ImageGenOptions): Promise<string> {
    try {
      // 步骤1: 提交异步任务
      console.log('[ModelScope] Submitting task...');
      const taskId = await this.submitTask(prompt, options);
      console.log(`[ModelScope] Task submitted, ID: ${taskId}`);

      // 步骤2: 轮询任务状态，直到完成或超时
      console.log('[ModelScope] Polling for result...');
      const imageUrl = await this.pollTaskStatus(taskId);
      console.log('[ModelScope] Task completed successfully');

      return imageUrl;
    } catch (error: unknown) {
      console.error('ModelScope image generation failed:', error);
      throw error;
    }
  }

  /**
   * 提交异步生成任务
   */
  private async submitTask(prompt: string, options: ImageGenOptions): Promise<string> {
    const endpoint = `${this.config.baseUrl}/v1/images/generations`;

    console.log(`[ModelScope] Submitting to: ${endpoint}`);
    console.log(`[ModelScope] Model: ${this.config.model}`);
    console.log(`[ModelScope] Prompt: ${prompt.substring(0, 100)}...`);

    const requestBody = {
      model: this.config.model,
      prompt: prompt,
      // 可选参数
      ...(options.width && options.height && {
        size: `${options.width}x${options.height}`
      })
    };

    console.log(`[ModelScope] Request body:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'X-ModelScope-Async-Mode': 'true' // 启用异步模式
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`[ModelScope] Submit response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ModelScope] Submit error response:`, errorData);
      throw new Error(
        `ModelScope API Error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`[ModelScope] Submit response data:`, JSON.stringify(data, null, 2));

    if (!data.task_id) {
      throw new Error('No task_id received from ModelScope');
    }

    return data.task_id;
  }

  /**
   * 轮询任务状态直到完成
   */
  private async pollTaskStatus(taskId: string): Promise<string> {
    const endpoint = `${this.config.baseUrl}/v1/tasks/${taskId}`;
    let retries = 0;

    console.log(`[ModelScope] Poll config: interval=${this.config.pollInterval}ms, maxRetries=${this.config.maxRetries}`);

    while (retries < this.config.maxRetries) {
      // 等待指定间隔
      if (retries > 0) {
        console.log(`[ModelScope] Waiting ${this.config.pollInterval}ms before next poll...`);
        await this.sleep(this.config.pollInterval);
      }

      try {
        console.log(`[ModelScope] Poll attempt ${retries + 1}/${this.config.maxRetries}, endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'X-ModelScope-Task-Type': 'image_generation'
          }
        });

        console.log(`[ModelScope] Poll response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`[ModelScope] Poll error response:`, errorData);
          throw new Error(
            `ModelScope Task Query Error: ${errorData.error?.message || response.statusText}`
          );
        }

        const data: TaskResponse = await response.json();
        console.log(`[ModelScope] Task status: ${data.task_status}`, data.message ? `(${data.message})` : '');

        switch (data.task_status) {
          case TaskStatus.SUCCEED:
            // 任务成功，返回图片URL
            if (!data.output_images || data.output_images.length === 0) {
              throw new Error('No output images in successful task');
            }
            console.log(`[ModelScope] Task succeeded, downloading image...`);
            // 下载图片并转换为 Data URL（避免跨域问题）
            return await this.downloadImageAsDataUrl(data.output_images[0]);

          case TaskStatus.FAILED:
            throw new Error(
              `ModelScope task failed: ${data.message || data.error || 'Unknown error'}`
            );

          case TaskStatus.TIMEOUT:
            throw new Error('ModelScope task timeout');

          case TaskStatus.PENDING:
          case TaskStatus.RUNNING:
          case TaskStatus.PROCESSING:
            // 继续等待
            retries++;
            break;

          default:
            throw new Error(`Unknown task status: ${data.task_status}`);
        }
      } catch (error) {
        console.error(`[ModelScope] Poll attempt ${retries + 1} error:`, error);
        // 如果是网络错误，继续重试
        if (retries >= this.config.maxRetries - 1) {
          throw error;
        }
        retries++;
      }
    }

    throw new Error(`ModelScope task timeout after ${this.config.maxRetries} retries`);
  }

  /**
   * 下载图片并转换为 Data URL
   * 原因：ModelScope 返回的图片 URL 可能有跨域限制或临时过期
   * 支持浏览器和 Node.js 环境
   */
  private async downloadImageAsDataUrl(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      // 检测运行环境
      const isNode = typeof window === 'undefined';

      if (isNode) {
        // Node.js 环境：使用 ArrayBuffer + Uint8Array
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/png';
        // 转换为 base64（兼容浏览器和 Node.js）
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        // Node.js 18+ 支持全局 btoa
        const base64 = btoa(binary);
        return `data:${contentType};base64,${base64}`;
      } else {
        // 浏览器环境：使用 FileReader
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert image to data URL'));
            }
          };
          reader.onerror = () => reject(new Error('FileReader error'));
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      console.warn('Failed to download image as data URL, returning original URL:', error);
      // 降级：返回原始 URL
      return imageUrl;
    }
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  supportsFeatures(): string[] {
    return [
      'async_generation',
      'chinese_prompt',
      'free_tier', // ModelScope 提供免费额度
      'line_art',
      'custom_models'
    ];
  }
}
