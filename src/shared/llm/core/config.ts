/**
 * @fileoverview Configuration utilities for standardizing provider configuration handling
 * @since 1.0.0
 */

import { ConfigurationError } from './errors';
import {
  isNonEmptyString,
  isNumberInRange,
  hasRequiredProperties,
  isOpenAIConfig,
  isAzureOpenAIConfig,
  isAnthropicConfig,
  isGoogleConfig,
  isTestConfig,
} from './guards';
import { getEnvVar } from './env';

import type {
  ProviderConfig,
  OpenAIConfig,
  AzureOpenAIConfig,
  AnthropicConfig,
  GoogleConfig,
} from '../types/providers';

// For testing purposes
interface TestProviderConfig extends ProviderConfig {
  provider: 'test';
  apiKey: string;
  model?: string;
}

/**
 * Default configuration values for all providers
 */
export const CONFIG_DEFAULTS = {
  temperature: 0.7,
  maxTokens: 1000,
  stream: false,
};

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS = {
  openai: 'gpt-4',
  azure: 'gpt-4',
  anthropic: 'claude-3-opus-20240229',
  google: 'gemini-pro',
  openaiEmbedding: 'text-embedding-3-small',
  azureEmbedding: 'text-embedding-ada-002',
};

/**
 * Validates and normalizes a provider configuration
 *
 * @param config - The provider configuration to validate
 * @returns The validated and normalized configuration
 * @throws {ConfigurationError} If the configuration is invalid
 *
 * @example
 * ```typescript
 * const validatedConfig = validateConfig({
 *   provider: 'openai',
 *   apiKey: process.env.OPENAI_API_KEY
 * });
 * ```
 *
 * @since 1.0.0
 */
export function validateConfig<T extends ProviderConfig>(config: T): T {
  if (!config) {
    throw new ConfigurationError('Configuration is required');
  }

  if (!isNonEmptyString(config.provider)) {
    throw new ConfigurationError('Provider identifier is required');
  }

  // Apply default values
  const normalizedConfig = {
    ...CONFIG_DEFAULTS,
    ...config,
  };

  // Validate temperature if provided
  if (normalizedConfig.temperature !== undefined && !isNumberInRange(normalizedConfig.temperature, 0, 1)) {
    throw new ConfigurationError('Temperature must be between 0 and 1');
  }

  // Validate maxTokens if provided
  if (normalizedConfig.maxTokens !== undefined && !isNumberInRange(normalizedConfig.maxTokens, 1, 100000)) {
    throw new ConfigurationError('Max tokens must be between 1 and 100000');
  }

  // Provider-specific validation
  switch (normalizedConfig.provider) {
    case 'openai':
      return validateOpenAIConfig(normalizedConfig as unknown as OpenAIConfig) as unknown as T;
    case 'azure':
      return validateAzureOpenAIConfig(normalizedConfig as unknown as AzureOpenAIConfig) as unknown as T;
    case 'anthropic':
      return validateAnthropicConfig(normalizedConfig as unknown as AnthropicConfig) as unknown as T;
    case 'google':
      return validateGoogleConfig(normalizedConfig as unknown as GoogleConfig) as unknown as T;
    case 'test':
      return validateTestConfig(normalizedConfig as unknown as TestProviderConfig) as unknown as T;
    default:
      throw new ConfigurationError(`Unsupported provider: ${normalizedConfig.provider}`);
  }
}

/**
 * Validates and normalizes an OpenAI configuration
 *
 * @param config - The OpenAI configuration to validate
 * @returns The validated and normalized configuration
 * @throws {ConfigurationError} If the configuration is invalid
 *
 * @example
 * ```typescript
 * const validatedConfig = validateOpenAIConfig({
 *   provider: 'openai',
 *   apiKey: process.env.OPENAI_API_KEY
 * });
 * ```
 *
 * @since 1.0.0
 */
export function validateOpenAIConfig(config: OpenAIConfig): OpenAIConfig {
  if (!isOpenAIConfig(config)) {
    throw new ConfigurationError('Invalid OpenAI configuration');
  }

  // Get API key from environment if not provided
  if (!isNonEmptyString(config.apiKey)) {
    config.apiKey = getEnvVar('OPENAI_API_KEY');

    if (!isNonEmptyString(config.apiKey)) {
      throw new ConfigurationError('OpenAI API key is required');
    }
  }

  // Set default model if not provided
  if (!isNonEmptyString(config.model)) {
    config.model = DEFAULT_MODELS.openai;
  }

  // Set default embedding model if not provided
  if (!isNonEmptyString(config.embeddingModel)) {
    config.embeddingModel = DEFAULT_MODELS.openaiEmbedding;
  }

  return config;
}

/**
 * Validates and normalizes an Azure OpenAI configuration
 *
 * @param config - The Azure OpenAI configuration to validate
 * @returns The validated and normalized configuration
 * @throws {ConfigurationError} If the configuration is invalid
 *
 * @example
 * ```typescript
 * const validatedConfig = validateAzureOpenAIConfig({
 *   provider: 'azure',
 *   apiKey: process.env.AZURE_OPENAI_API_KEY,
 *   endpoint: process.env.AZURE_OPENAI_ENDPOINT,
 *   deploymentName: 'gpt-4'
 * });
 * ```
 *
 * @since 1.0.0
 */
export function validateAzureOpenAIConfig(config: AzureOpenAIConfig): AzureOpenAIConfig {
  if (!isAzureOpenAIConfig(config)) {
    throw new ConfigurationError('Invalid Azure OpenAI configuration');
  }

  // Check required properties
  if (!hasRequiredProperties(config, ['endpoint', 'deploymentName'])) {
    throw new ConfigurationError('Azure OpenAI endpoint and deploymentName are required');
  }

  // Get API key from environment if not provided
  if (!isNonEmptyString(config.apiKey)) {
    config.apiKey = getEnvVar('AZURE_OPENAI_API_KEY');

    if (!isNonEmptyString(config.apiKey)) {
      throw new ConfigurationError('Azure OpenAI API key is required');
    }
  }

  // Set default model if not provided
  if (!isNonEmptyString(config.model)) {
    config.model = DEFAULT_MODELS.azure;
  }

  // Set default embedding model if not provided
  if (!isNonEmptyString(config.embeddingModel)) {
    config.embeddingModel = DEFAULT_MODELS.azureEmbedding;
  }

  // Set default API version if not provided
  if (!isNonEmptyString(config.apiVersion)) {
    config.apiVersion = '2023-05-15';
  }

  return config;
}

/**
 * Validates and normalizes an Anthropic configuration
 *
 * @param config - The Anthropic configuration to validate
 * @returns The validated and normalized configuration
 * @throws {ConfigurationError} If the configuration is invalid
 *
 * @example
 * ```typescript
 * const validatedConfig = validateAnthropicConfig({
 *   provider: 'anthropic',
 *   apiKey: process.env.ANTHROPIC_API_KEY
 * });
 * ```
 *
 * @since 1.0.0
 */
export function validateAnthropicConfig(config: AnthropicConfig): AnthropicConfig {
  if (!isAnthropicConfig(config)) {
    throw new ConfigurationError('Invalid Anthropic configuration');
  }

  // Get API key from environment if not provided
  if (!isNonEmptyString(config.apiKey)) {
    config.apiKey = getEnvVar('ANTHROPIC_API_KEY');

    if (!isNonEmptyString(config.apiKey)) {
      throw new ConfigurationError('Anthropic API key is required');
    }
  }

  // Set default model if not provided
  if (!isNonEmptyString(config.model)) {
    config.model = DEFAULT_MODELS.anthropic;
  }

  // Set default API version if not provided
  if (!isNonEmptyString(config.apiVersion)) {
    config.apiVersion = '2023-06-01';
  }

  return config;
}

/**
 * Validates and normalizes a Google configuration
 *
 * @param config - The Google configuration to validate
 * @returns The validated and normalized configuration
 * @throws {ConfigurationError} If the configuration is invalid
 *
 * @example
 * ```typescript
 * const validatedConfig = validateGoogleConfig({
 *   provider: 'google',
 *   apiKey: process.env.GOOGLE_API_KEY
 * });
 * ```
 *
 * @since 1.0.0
 */
export function validateGoogleConfig(config: GoogleConfig): GoogleConfig {
  if (!isGoogleConfig(config)) {
    throw new ConfigurationError('Invalid Google configuration');
  }

  // Check if either API key or service account is provided
  if (!isNonEmptyString(config.apiKey) && !config.serviceAccount) {
    // Try to get API key from environment
    config.apiKey = getEnvVar('GOOGLE_API_KEY');

    if (!isNonEmptyString(config.apiKey)) {
      throw new ConfigurationError('Google API key or service account is required');
    }
  }

  // If service account is provided, validate it
  if (config.serviceAccount) {
    if (!hasRequiredProperties(config.serviceAccount, ['clientEmail', 'privateKey', 'projectId'])) {
      throw new ConfigurationError('Google service account must include clientEmail, privateKey, and projectId');
    }
  }

  // Set default model if not provided
  if (!isNonEmptyString(config.model)) {
    config.model = DEFAULT_MODELS.google;
  }

  return config;
}

/**
 * Validates and normalizes a test provider configuration (for testing purposes only)
 *
 * @param config - The test provider configuration to validate
 * @returns The validated and normalized configuration
 * @throws {ConfigurationError} If the configuration is invalid
 */
export function validateTestConfig(config: TestProviderConfig): TestProviderConfig {
  if (!isTestConfig(config)) {
    throw new ConfigurationError('Invalid test provider configuration');
  }

  // Validate API key
  if (!isNonEmptyString(config.apiKey)) {
    throw new ConfigurationError('Test API key is required');
  }

  // Set default model if not provided
  if (!isNonEmptyString(config.model)) {
    config.model = 'test-model';
  }

  return config;
}

/**
 * Merges default options with user-provided options
 *
 * @param defaultOptions - The default options
 * @param userOptions - The user-provided options
 * @returns The merged options
 *
 * @example
 * ```typescript
 * const options = mergeOptions(
 *   { temperature: 0.7, maxTokens: 1000 },
 *   { temperature: 0.5 }
 * );
 * // Result: { temperature: 0.5, maxTokens: 1000 }
 * ```
 *
 * @since 1.0.0
 */
export function mergeOptions<T extends Record<string, any>>(defaultOptions: T, userOptions?: Partial<T>): T {
  if (!userOptions) {
    return { ...defaultOptions };
  }

  return {
    ...defaultOptions,
    ...userOptions,
  };
}
