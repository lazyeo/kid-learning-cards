/**
 * LabNana API 测试脚本
 * 用法: npx tsx scripts/test-labnana.ts
 */

const API_KEY = process.env.VITE_LABNANA_API_KEY || process.argv[2];

if (!API_KEY) {
  console.error('❌ 请提供 API Key:');
  console.error('   方式1: export VITE_LABNANA_API_KEY=lh_xxx && npx tsx scripts/test-labnana.ts');
  console.error('   方式2: npx tsx scripts/test-labnana.ts lh_xxx');
  process.exit(1);
}

console.log('🧪 LabNana API 测试');
console.log('==================');
console.log(`API Key: ${API_KEY.substring(0, 6)}...${API_KEY.substring(API_KEY.length - 4)}`);

async function testLabNana() {
  const endpoint = 'https://api.labnana.com/openapi/v1/images/generation';

  const requestBody = {
    provider: 'google',
    prompt: 'a cute cat, simple line art, coloring book style, black and white, thick outlines',
    imageConfig: {
      imageSize: '1K',
      aspectRatio: '1:1'
    }
  };

  console.log('\n📤 请求信息:');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Body: ${JSON.stringify(requestBody, null, 2)}`);

  try {
    console.log('\n⏳ 正在请求 LabNana API...');
    const startTime = Date.now();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const elapsed = Date.now() - startTime;
    console.log(`\n📥 响应信息:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   耗时: ${elapsed}ms`);

    const data = await response.json();

    if (!response.ok) {
      console.error('\n❌ API 错误:');
      console.error(JSON.stringify(data, null, 2));
      return;
    }

    console.log('\n✅ 请求成功!');
    console.log('   响应结构:', Object.keys(data));

    if (data.candidates && data.candidates[0]?.inlineData) {
      const inlineData = data.candidates[0].inlineData;
      console.log(`   图片类型: ${inlineData.mimeType}`);
      console.log(`   数据长度: ${inlineData.data?.length || 0} 字符`);

      // 保存图片到文件
      const fs = await import('fs');
      const base64Data = inlineData.data;
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `test-labnana-${Date.now()}.png`;
      fs.writeFileSync(filename, buffer);
      console.log(`\n📁 图片已保存: ${filename}`);
    } else {
      console.log('\n⚠️ 响应中没有找到图片数据');
      console.log('完整响应:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('\n❌ 请求失败:');
    console.error(error);
  }
}

testLabNana();
