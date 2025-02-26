/**
 * Farm LLM Module
 *
 * A unified interface for interacting with various Large Language Model (LLM) providers,
 * built on top of the Vercel AI SDK.
 */

// Core exports
export * from './core/base';
export * from './core/generation';
export * from './core/structured';
export * from './core/tools';
export * from './core/prompts';
export * from './core/embeddings';
export * from './core/errors';
export * from './core/env';
export * from './core/mocks';
export * from './core/guards';
export * from './core/config';

// Export BaseProvider from base-provider.ts
export { BaseProvider } from './core/base-provider';

// Export other items from provider.ts (excluding BaseProvider)
export { DEFAULT_PROVIDER_CONFIG } from './core/provider';

// Error exports - explicitly re-export to avoid ambiguity
import {
  LLMError,
  ConfigurationError,
  AuthenticationError,
  RateLimitError,
  TimeoutError,
  APIError,
  EmbeddingsError,
  StructuredDataError,
  ToolCallingError,
  UnsupportedFeatureError,
  ModelError,
  ContentFilterError,
  ResponseFormatError,
  StreamingError,
  ValidationError
} from './core/errors';

export {
  LLMError,
  ConfigurationError,
  AuthenticationError,
  RateLimitError,
  TimeoutError,
  APIError,
  EmbeddingsError,
  StructuredDataError,
  ToolCallingError,
  UnsupportedFeatureError,
  ModelError,
  ContentFilterError,
  ResponseFormatError,
  StreamingError,
  ValidationError
};

// Provider exports - using import/export pattern to avoid circular dependencies
import { OpenAIProvider } from './providers/openai/provider';
import { AzureOpenAIProvider } from './providers/azure/provider';
import { AnthropicProvider } from './providers/anthropic/provider';
import { GoogleProvider } from './providers/google/provider';

export {
  OpenAIProvider,
  AzureOpenAIProvider,
  AnthropicProvider,
  GoogleProvider
};

// Type exports
import type {
  ProviderConfig,
  OpenAIConfig,
  AzureOpenAIConfig,
  AnthropicConfig,
  GoogleConfig
} from './types/providers';

export type {
  ProviderConfig,
  OpenAIConfig,
  AzureOpenAIConfig,
  AnthropicConfig,
  GoogleConfig
};

// Export core types
export type {
  BaseRequestOptions,
  TextGenerationOptions,
  StructuredDataOptions,
  EmbeddingOptions,
  EmbeddingResponse,
  Message,
  ToolCall,
  ToolCallResult,
  TextGenerationResponse,
  StructuredDataResponse
} from './types/core';

// Export tools types
export * from './types/tools';

/**
 * Provider factory function to create a provider based on configuration
 */
export type ProviderType = 'openai' | 'azure' | 'anthropic' | 'google';

export interface ProviderFactoryConfig {
  provider: ProviderType;
  apiKey?: string;
  [key: string]: any; // Allow any additional properties
}

/**
 * Creates a provider instance based on the specified configuration
 *
 * @example
 * ```typescript
 * const provider = createProvider({
 *   provider: 'openai',
 *   apiKey: process.env.OPENAI_API_KEY
 * });
 * ```
 */
export function createProvider(config: ProviderFactoryConfig) {
  const { provider, ...providerConfig } = config;

  switch (provider) {
    case 'openai':
      return new OpenAIProvider(providerConfig);
    case 'azure':
      return new AzureOpenAIProvider(providerConfig);
    case 'anthropic':
      return new AnthropicProvider(providerConfig);
    case 'google':
      return new GoogleProvider(providerConfig);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
