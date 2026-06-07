const fs = require('fs');
const path = require('path');

// 语言文件目录
const localesDir = path.join(__dirname, 'src', 'locales');

// 读取所有语言文件
const files = fs.readdirSync(localesDir).filter(file => file.endsWith('.json'));

// 读取英文文件作为基准
const enFile = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// 递归获取所有键
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

// 获取英文文件的所有键
const enKeys = getAllKeys(enData).sort();
console.log(`英文文件包含 ${enKeys.length} 个键`);

// 检查其他语言文件
files.forEach(file => {
  if (file === 'en.json') return;
  
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const keys = getAllKeys(data).sort();
  
  console.log(`\n检查 ${file}:`);
  console.log(`包含 ${keys.length} 个键`);
  
  // 检查缺少的键
  const missingKeys = enKeys.filter(key => !keys.includes(key));
  if (missingKeys.length > 0) {
    console.log(`❌ 缺少以下键:`);
    missingKeys.forEach(key => console.log(`  - ${key}`));
  } else {
    console.log(`✅ 所有键都存在`);
  }
  
  // 检查多余的键
  const extraKeys = keys.filter(key => !enKeys.includes(key));
  if (extraKeys.length > 0) {
    console.log(`⚠️  存在多余的键:`);
    extraKeys.forEach(key => console.log(`  - ${key}`));
  }
});

console.log(`\n检查完成！`);