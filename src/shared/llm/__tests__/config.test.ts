/**
 * @fileoverview Tests for configuration utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateConfig,
  validateOpenAIConfig,
  validateAzureOpenAIConfig,
  validateAnthropicConfig,
  validateGoogleConfig,
  mergeOptions,
  CONFIG_DEFAULTS,
  DEFAULT_MODELS,
} from '../core/config';
import { ConfigurationError } from '../core/errors';
import type { OpenAIConfig, AzureOpenAIConfig, AnthropicConfig, GoogleConfig } from '../types/providers';

describe('Configuration Utilities', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear environment variables before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;
  });

  afterEach(() => {
    // Restore environment variables after each test
    process.env = { ...originalEnv };
  });

  describe('mergeOptions', () => {
    it('should merge default options with user options', () => {
      const defaultOptions = { a: 1, b: 2, c: 3 };
      const userOptions = { b: 4, d: 5 };
      const result = mergeOptions(defaultOptions, userOptions);

      expect(result).toEqual({ a: 1, b: 4, c: 3, d: 5 });
    });

    it('should return a copy of default options if no user options provided', () => {
      const defaultOptions = { a: 1, b: 2 };
      const result = mergeOptions(defaultOptions);

      expect(result).toEqual(defaultOptions);
      expect(result).not.toBe(defaultOptions); // Should be a new object
    });
  });

  describe('validateConfig', () => {
    it('should throw if config is null or undefined', () => {
      expect(() => validateConfig(null as any)).toThrow(ConfigurationError);
      expect(() => validateConfig(undefined as any)).toThrow(ConfigurationError);
    });

    it('should throw if provider is missing', () => {
      expect(() => validateConfig({} as any)).toThrow(ConfigurationError);
    });

    it('should throw if provider is invalid', () => {
      expect(() => validateConfig({ provider: 'invalid' } as any)).toThrow(ConfigurationError);
    });

    it('should throw if temperature is out of range', () => {
      expect(() => validateConfig({ provider: 'openai', temperature: -0.1 } as OpenAIConfig)).toThrow(
        ConfigurationError,
      );
      expect(() => validateConfig({ provider: 'openai', temperature: 1.1 } as OpenAIConfig)).toThrow(
        ConfigurationError,
      );
    });

    it('should throw if maxTokens is out of range', () => {
      expect(() => validateConfig({ provider: 'openai', maxTokens: 0 } as OpenAIConfig)).toThrow(ConfigurationError);
      expect(() => validateConfig({ provider: 'openai', maxTokens: 100001 } as OpenAIConfig)).toThrow(
        ConfigurationError,
      );
    });

    it('should apply default values', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const config = validateConfig({ provider: 'openai' } as OpenAIConfig);

      expect(config.temperature).toBe(CONFIG_DEFAULTS.temperature);
      expect(config.maxTokens).toBe(CONFIG_DEFAULTS.maxTokens);
      expect(config.stream).toBe(CONFIG_DEFAULTS.stream);
    });
  });

  describe('validateOpenAIConfig', () => {
    it('should throw if apiKey is missing and not in environment', () => {
      expect(() => validateOpenAIConfig({ provider: 'openai' } as OpenAIConfig)).toThrow(ConfigurationError);
    });

    it('should get apiKey from environment if not provided', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const config = validateOpenAIConfig({ provider: 'openai' } as OpenAIConfig);

      expect(config.apiKey).toBe('test-key');
    });

    it('should set default model if not provided', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const config = validateOpenAIConfig({ provider: 'openai' } as OpenAIConfig);

      expect(config.model).toBe(DEFAULT_MODELS.openai);
    });

    it('should set default embedding model if not provided', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const config = validateOpenAIConfig({ provider: 'openai' } as OpenAIConfig);

      expect(config.embeddingModel).toBe(DEFAULT_MODELS.openaiEmbedding);
    });

    it('should keep user-provided values', () => {
      const config = validateOpenAIConfig({
        provider: 'openai',
        apiKey: 'user-key',
        model: 'user-model',
        embeddingModel: 'user-embedding-model',
      } as OpenAIConfig);

      expect(config.apiKey).toBe('user-key');
      expect(config.model).toBe('user-model');
      expect(config.embeddingModel).toBe('user-embedding-model');
    });
  });

  describe('validateAzureOpenAIConfig', () => {
    it('should throw if required properties are missing', () => {
      expect(() => validateAzureOpenAIConfig({ provider: 'azure' } as AzureOpenAIConfig)).toThrow(ConfigurationError);
      expect(() =>
        validateAzureOpenAIConfig({
          provider: 'azure',
          endpoint: 'endpoint',
        } as AzureOpenAIConfig),
      ).toThrow(ConfigurationError);
      expect(() =>
        validateAzureOpenAIConfig({
          provider: 'azure',
          deploymentName: 'deployment',
        } as AzureOpenAIConfig),
      ).toThrow(ConfigurationError);
    });

    it('should throw if apiKey is missing and not in environment', () => {
      expect(() =>
        validateAzureOpenAIConfig({
          provider: 'azure',
          endpoint: 'endpoint',
          deploymentName: 'deployment',
        } as AzureOpenAIConfig),
      ).toThrow(ConfigurationError);
    });

    it('should get apiKey from environment if not provided', () => {
      process.env.AZURE_OPENAI_API_KEY = 'test-key';
      const config = validateAzureOpenAIConfig({
        provider: 'azure',
        endpoint: 'endpoint',
        deploymentName: 'deployment',
      } as AzureOpenAIConfig);

      expect(config.apiKey).toBe('test-key');
    });

    it('should set default values if not provided', () => {
      process.env.AZURE_OPENAI_API_KEY = 'test-key';
      const config = validateAzureOpenAIConfig({
        provider: 'azure',
        endpoint: 'endpoint',
        deploymentName: 'deployment',
      } as AzureOpenAIConfig);

      expect(config.model).toBe(DEFAULT_MODELS.azure);
      expect(config.embeddingModel).toBe(DEFAULT_MODELS.azureEmbedding);
      expect(config.apiVersion).toBe('2023-05-15');
    });
  });

  describe('validateAnthropicConfig', () => {
    it('should throw if apiKey is missing and not in environment', () => {
      expect(() => validateAnthropicConfig({ provider: 'anthropic' } as AnthropicConfig)).toThrow(ConfigurationError);
    });

    it('should get apiKey from environment if not provided', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const config = validateAnthropicConfig({ provider: 'anthropic' } as AnthropicConfig);

      expect(config.apiKey).toBe('test-key');
    });

    it('should set default values if not provided', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const config = validateAnthropicConfig({ provider: 'anthropic' } as AnthropicConfig);

      expect(config.model).toBe(DEFAULT_MODELS.anthropic);
      expect(config.apiVersion).toBe('2023-06-01');
    });
  });

  describe('validateGoogleConfig', () => {
    it('should throw if neither apiKey nor serviceAccount is provided', () => {
      expect(() => validateGoogleConfig({ provider: 'google' } as GoogleConfig)).toThrow(ConfigurationError);
    });

    it('should get apiKey from environment if not provided', () => {
      process.env.GOOGLE_API_KEY = 'test-key';
      const config = validateGoogleConfig({ provider: 'google' } as GoogleConfig);

      expect(config.apiKey).toBe('test-key');
    });

    it('should throw if serviceAccount is incomplete', () => {
      expect(() =>
        validateGoogleConfig({
          provider: 'google',
          serviceAccount: { clientEmail: 'email' } as any,
        } as GoogleConfig),
      ).toThrow(ConfigurationError);
    });

    it('should accept a valid serviceAccount', () => {
      const config = validateGoogleConfig({
        provider: 'google',
        serviceAccount: {
          clientEmail: 'email',
          privateKey: 'key',
          projectId: 'project',
        },
      } as GoogleConfig);

      expect(config.serviceAccount).toBeDefined();
    });

    it('should set default model if not provided', () => {
      process.env.GOOGLE_API_KEY = 'test-key';
      const config = validateGoogleConfig({ provider: 'google' } as GoogleConfig);

      expect(config.model).toBe(DEFAULT_MODELS.google);
    });
  });
});
