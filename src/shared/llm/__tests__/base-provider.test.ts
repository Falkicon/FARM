/**
 * @fileoverview Tests for the BaseProvider class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BaseProvider } from '../core/base-provider';
import { ConfigurationError } from '../core/errors';
import { ProviderConfig } from '../types/providers';
import * as envModule from '../core/env';

// Create a mock provider for testing
interface TestProviderConfig extends ProviderConfig {
  provider: 'test';
  apiKey: string;
  model?: string;
}

class TestProvider extends BaseProvider<TestProviderConfig> {
  constructor(config: TestProviderConfig) {
    super(config);
  }
}

describe('BaseProvider', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  // Mock the isTestEnvironment function
  const isTestEnvironmentMock = vi.fn();

  beforeEach(() => {
    // Reset mocks and environment before each test
    vi.resetModules();
    vi.resetAllMocks();
    process.env = { ...originalEnv };

    // Mock the isTestEnvironment function
    vi.spyOn(envModule, 'isTestEnvironment').mockImplementation(isTestEnvironmentMock);
    isTestEnvironmentMock.mockReturnValue(false);
  });

  afterEach(() => {
    // Restore environment variables after each test
    process.env = { ...originalEnv };
  });

  describe('constructor', () => {
    it('should throw if config is null or undefined', () => {
      expect(() => new TestProvider(null as any)).toThrow(ConfigurationError);
      expect(() => new TestProvider(undefined as any)).toThrow(ConfigurationError);
    });

    it('should validate and normalize the configuration', () => {
      const provider = new TestProvider({
        provider: 'test',
        apiKey: 'test-key',
      });

      const config = provider.getConfig();
      expect(config.provider).toBe('test');
      expect(config.apiKey).toBe('test-key');
      expect(config.temperature).toBe(0.7); // Default value
      expect(config.maxTokens).toBe(1000); // Default value
    });

    it('should check if running in a test environment', () => {
      isTestEnvironmentMock.mockReturnValue(true);

      const provider = new TestProvider({
        provider: 'test',
        apiKey: 'test-key',
      });

      expect(provider.isTestEnvironment()).toBe(true);
    });
  });

  describe('getProviderName', () => {
    it('should return the provider name', () => {
      const provider = new TestProvider({
        provider: 'test',
        apiKey: 'test-key',
      });

      expect(provider.getProviderName()).toBe('test');
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the configuration', () => {
      const provider = new TestProvider({
        provider: 'test',
        apiKey: 'test-key',
        model: 'test-model',
      });

      const config = provider.getConfig();
      expect(config).toEqual({
        provider: 'test',
        apiKey: 'test-key',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        stream: false,
      });

      // Ensure it's a copy, not the original
      config.apiKey = 'modified-key';
      expect(provider.getConfig().apiKey).toBe('test-key');
    });
  });

  describe('isTestEnvironment', () => {
    it('should return true if in a test environment', () => {
      isTestEnvironmentMock.mockReturnValue(true);

      const provider = new TestProvider({
        provider: 'test',
        apiKey: 'test-key',
      });

      expect(provider.isTestEnvironment()).toBe(true);
    });

    it('should return false if not in a test environment', () => {
      isTestEnvironmentMock.mockReturnValue(false);

      const provider = new TestProvider({
        provider: 'test',
        apiKey: 'test-key',
      });

      expect(provider.isTestEnvironment()).toBe(false);
    });
  });
});
