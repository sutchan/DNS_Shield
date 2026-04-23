// 测试模块导入
console.log('Testing module imports...');

try {
  const parser = require('./src/utils/parser');
  console.log('✓ parser module imported successfully');
} catch (error) {
  console.error('✗ Error importing parser module:', error.message);
}

try {
  const rulesGenerator = require('./src/utils/rulesGenerator');
  console.log('✓ rulesGenerator module imported successfully');
} catch (error) {
  console.error('✗ Error importing rulesGenerator module:', error.message);
}

try {
  const fileUtils = require('./src/utils/fileUtils');
  console.log('✓ fileUtils module imported successfully');
} catch (error) {
  console.error('✗ Error importing fileUtils module:', error.message);
}

try {
  const uiUtils = require('./src/utils/uiUtils');
  console.log('✓ uiUtils module imported successfully');
} catch (error) {
  console.error('✗ Error importing uiUtils module:', error.message);
}

try {
  const i18n = require('./src/utils/i18n');
  console.log('✓ i18n module imported successfully');
} catch (error) {
  console.error('✗ Error importing i18n module:', error.message);
}

console.log('Import test completed.');