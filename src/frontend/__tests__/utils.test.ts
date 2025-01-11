import { describe, it, expect } from 'vitest';
import { formatBytes } from '../utils';

describe('formatBytes', () => {
  it('should format bytes to B', () => {
    expect(formatBytes(500)).toBe('500.00 B');
  });

  it('should format bytes to KB', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
  });

  it('should format bytes to MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
  });

  it('should format bytes to GB', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
  });

  it('should format bytes to TB', () => {
    expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB');
  });

  it('should handle zero bytes', () => {
    expect(formatBytes(0)).toBe('0.00 B');
  });

  it('should handle negative bytes', () => {
    expect(formatBytes(-1024)).toBe('-1.00 KB');
  });
});
