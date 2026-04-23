// Test file for parser.ts
const { parseDomainLine } = require('./src/utils/parser');

// Test parseDomainLine function
const testLine = 'example.com';
const result = parseDomainLine(testLine);
console.log('Test result:', result);