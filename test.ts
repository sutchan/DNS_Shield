// Test file to verify TypeScript compiler
import { CustomDnsEntry, ParsedData, FormatType } from './src/types';

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

// Test FormatType
const testFormat: FormatType = 'hosts';

console.log('Test completed successfully');
