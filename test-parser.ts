// Test file for parser.ts
import { parseDomainLine } from './src/utils/parser';

// Test parseDomainLine function
const testLine = 'example.com';
const result = parseDomainLine(testLine);
console.log('Test result:', result);