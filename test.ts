// Test file to verify TypeScript compiler
import { CustomDnsEntry, ParsedData } from './src/types';

// Test the types
const testCustomDns: CustomDnsEntry = {
  domain: 'example.com',
  ip: '127.0.0.1'
};

const testParsedData: ParsedData = {
  domains: ['example.com'],
  whitelist: ['test.com'],
  customDns: [testCustomDns]
};

console.log('Test completed successfully');
