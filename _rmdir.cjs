const fs = require('fs');
fs.rmSync('node_modules', { recursive: true, force: true, maxRetries: 5 });
console.log('node_modules removed');
