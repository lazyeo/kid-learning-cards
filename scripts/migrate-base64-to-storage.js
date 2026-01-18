// 迁移脚本：将现有的 Base64 缓存迁移到 Supabase Storage
// 使用方法：node scripts/migrate-base64-to-storage.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 SUPABASE_URL 或 SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 上传 Base64 图片到 Storage
 */
async function uploadBase64ToStorage(base64Data, filename) {
  try {
    // 解析 Base64 数据
    let mimeType = 'image/png';
    let base64Clean = base64Data;

    const dataUriMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUriMatch) {
      mimeType = dataUriMatch[1];
      base64Clean = dataUriMatch[2];
    }

    // 转换为 Buffer
    const buffer = Buffer.from(base64Clean, 'base64');

    // 生成唯一路径
    const timestamp = Date.now();
    const safeName = filename.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50) || 'image';
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    const path = `migrated-${timestamp}-${safeName}.${extension}`;

    // 上传到 Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('coloring-images')
      .upload(path, buffer, {
        contentType: mimeType,
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      console.error(`   ❌ 上传失败:`, uploadError.message);
      return null;
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('coloring-images')
      .getPublicUrl(path);

    return { publicUrl: urlData.publicUrl, storagePath: path };

  } catch (error) {
    console.error(`   ❌ 错误:`, error.message);
    return null;
  }
}

/**
 * 迁移主函数
 */
async function migrate() {
  console.log('\n🚀 开始迁移 Base64 缓存到 Storage...\n');

  try {
    // 1. 查询所有 Base64 记录
    const { data: records, error: queryError } = await supabase
      .from('image_cache')
      .select('*')
      .is('storage_path', null)
      .like('image_url', 'data:image%');

    if (queryError) {
      throw queryError;
    }

    if (!records || records.length === 0) {
      console.log('✅ 没有需要迁移的记录！\n');
      return;
    }

    console.log(`📋 找到 ${records.length} 条需要迁移的记录\n`);

    let successCount = 0;
    let failCount = 0;

    // 2. 逐个迁移
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`[${i + 1}/${records.length}] 迁移: ${record.theme}-${record.subject} (ID: ${record.id})`);

      const filename = `${record.theme}-${record.subject}`;
      const uploadResult = await uploadBase64ToStorage(record.image_url, filename);

      if (uploadResult) {
        // 更新数据库记录
        const { error: updateError } = await supabase
          .from('image_cache')
          .update({
            image_url: uploadResult.publicUrl,
            storage_path: uploadResult.storagePath
          })
          .eq('id', record.id);

        if (updateError) {
          console.error(`   ❌ 数据库更新失败:`, updateError.message);
          failCount++;
        } else {
          console.log(`   ✅ 迁移成功 → ${uploadResult.storagePath}`);
          successCount++;
        }
      } else {
        failCount++;
      }

      // 每 5 个记录休息一下，避免 API 限流
      if ((i + 1) % 5 === 0) {
        console.log(`   ⏸️  休息 1 秒...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 3. 总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 迁移完成！');
    console.log(`   ✅ 成功: ${successCount} 条`);
    console.log(`   ❌ 失败: ${failCount} 条`);
    console.log(`   📁 总计: ${records.length} 条`);
    console.log('='.repeat(60) + '\n');

    // 4. 查询迁移后的统计
    const { data: stats } = await supabase
      .from('image_cache')
      .select('storage_path');

    if (stats) {
      const withStorage = stats.filter(r => r.storage_path !== null).length;
      const withBase64 = stats.filter(r => r.storage_path === null).length;

      console.log('📈 当前统计:');
      console.log(`   Storage: ${withStorage} 条`);
      console.log(`   Base64: ${withBase64} 条`);
      console.log(`   总计: ${stats.length} 条\n`);
    }

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    process.exit(1);
  }
}

// 运行迁移
migrate();
