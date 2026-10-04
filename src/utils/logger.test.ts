// src/utils/logger.test.ts v3.10.1
import { describe, it, expect } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  it('provides error, warn, info, and debug methods without throwing', () => {
    expect(() => {
      logger.info('test message');
      logger.warn('test warning');
      logger.error('test error');
      logger.debug('test debug');
    }).not.toThrow();
  });
});
