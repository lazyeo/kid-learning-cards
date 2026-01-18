/**
 * Config 模块公共导出
 */

export {
  createImageService,
  createBrowserImageService
} from './factory';

// Node.js 特定函数需要单独从 factory.node.ts 导入
// 避免在浏览器环境编译 process.env
