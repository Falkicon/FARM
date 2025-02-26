/**
 * @fileoverview Type guards and validation utilities for the LLM module
 * @since 1.0.0
 */

import {
  TextGenerationResponse,
  StructuredDataResponse,
  EmbeddingResponse,
  Message,
  ToolCall
} from '../types/core';

import {
  ProviderConfig,
  OpenAIConfig,
  AzureOpenAIConfig,
  AnthropicConfig,
  GoogleConfig
} from '../types/providers';

// For testing purposes
interface TestProviderConfig extends ProviderConfig {
  provider: 'test';
  apiKey: string;
  model?: string;
}

/**
 * Type guard to check if a value is a non-null object
 *
 * @param value - The value to check
 * @returns True if the value is a non-null object
 *
 * @example
 * ```typescript
 * if (isObject(value)) {
 *   // value is a non-null object
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if a value is a TextGenerationResponse
 *
 * @param value - The value to check
 * @returns True if the value is a TextGenerationResponse
 *
 * @example
 * ```typescript
 * if (isTextGenerationResponse(response)) {
 *   console.log(response.content);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isTextGenerationResponse(value: unknown): value is TextGenerationResponse {
  return (
    isObject(value) &&
    typeof value.content === 'string' &&
    typeof value.model === 'string'
  );
}

/**
 * Type guard to check if a value is a StructuredDataResponse
 *
 * @param value - The value to check
 * @returns True if the value is a StructuredDataResponse
 *
 * @example
 * ```typescript
 * if (isStructuredDataResponse(response)) {
 *   console.log(response.content);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isStructuredDataResponse<T = any>(value: unknown): value is StructuredDataResponse<T> {
  return (
    isObject(value) &&
    'content' in value &&
    typeof value.model === 'string'
  );
}

/**
 * Type guard to check if a value is an EmbeddingResponse
 *
 * @param value - The value to check
 * @returns True if the value is an EmbeddingResponse
 *
 * @example
 * ```typescript
 * if (isEmbeddingResponse(response)) {
 *   console.log(response.embeddings);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isEmbeddingResponse(value: unknown): value is EmbeddingResponse {
  return (
    isObject(value) &&
    Array.isArray(value.embeddings) &&
    typeof value.model === 'string'
  );
}

/**
 * Type guard to check if a value is a Message
 *
 * @param value - The value to check
 * @returns True if the value is a Message
 *
 * @example
 * ```typescript
 * if (isMessage(value)) {
 *   console.log(value.content);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isMessage(value: unknown): value is Message {
  return (
    isObject(value) &&
    typeof value.content === 'string' &&
    (
      value.role === 'user' ||
      value.role === 'assistant' ||
      value.role === 'system' ||
      value.role === 'function' ||
      value.role === 'tool'
    )
  );
}

/**
 * Type guard to check if a value is a ToolCall
 *
 * @param value - The value to check
 * @returns True if the value is a ToolCall
 *
 * @example
 * ```typescript
 * if (isToolCall(value)) {
 *   console.log(value.name);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isToolCall(value: unknown): value is ToolCall {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    'arguments' in value
  );
}

/**
 * Type guard to check if a value is an OpenAIConfig
 *
 * @param config - The configuration to check
 * @returns True if the configuration is an OpenAIConfig
 *
 * @example
 * ```typescript
 * if (isOpenAIConfig(config)) {
 *   console.log(config.organization);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isOpenAIConfig(config: unknown): config is OpenAIConfig {
  return (
    isObject(config) &&
    config.provider === 'openai' &&
    (config.apiKey === undefined || typeof config.apiKey === 'string') &&
    (config.model === undefined || typeof config.model === 'string') &&
    (config.organization === undefined || typeof config.organization === 'string') &&
    (config.embeddingModel === undefined || typeof config.embeddingModel === 'string')
  );
}

/**
 * Type guard to check if a value is a GoogleConfig
 *
 * @param config - The configuration to check
 * @returns True if the configuration is a GoogleConfig
 *
 * @example
 * ```typescript
 * if (isGoogleConfig(config)) {
 *   console.log(config.serviceAccount);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isGoogleConfig(config: unknown): config is GoogleConfig {
  return (
    isObject(config) &&
    config.provider === 'google' &&
    (config.apiKey === undefined || typeof config.apiKey === 'string') &&
    (config.model === undefined || typeof config.model === 'string') &&
    (config.serviceAccount === undefined ||
      (isObject(config.serviceAccount) &&
        typeof config.serviceAccount.clientEmail === 'string' &&
        typeof config.serviceAccount.privateKey === 'string' &&
        typeof config.serviceAccount.projectId === 'string'))
  );
}

/**
 * Type guard to check if a value is an AzureOpenAIConfig
 *
 * @param config - The configuration to check
 * @returns True if the configuration is an AzureOpenAIConfig
 *
 * @example
 * ```typescript
 * if (isAzureOpenAIConfig(config)) {
 *   console.log(config.endpoint);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isAzureOpenAIConfig(config: unknown): config is AzureOpenAIConfig {
  return (
    isObject(config) &&
    config.provider === 'azure' &&
    (config.apiKey === undefined || typeof config.apiKey === 'string') &&
    (config.endpoint === undefined || typeof config.endpoint === 'string') &&
    (config.deploymentName === undefined || typeof config.deploymentName === 'string') &&
    (config.model === undefined || typeof config.model === 'string') &&
    (config.apiVersion === undefined || typeof config.apiVersion === 'string') &&
    (config.embeddingModel === undefined || typeof config.embeddingModel === 'string')
  );
}

/**
 * Type guard to check if a value is an AnthropicConfig
 *
 * @param config - The configuration to check
 * @returns True if the configuration is an AnthropicConfig
 *
 * @example
 * ```typescript
 * if (isAnthropicConfig(config)) {
 *   console.log(config.model);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isAnthropicConfig(config: unknown): config is AnthropicConfig {
  return (
    isObject(config) &&
    config.provider === 'anthropic' &&
    (config.apiKey === undefined || typeof config.apiKey === 'string') &&
    (config.model === undefined || typeof config.model === 'string') &&
    (config.apiVersion === undefined || typeof config.apiVersion === 'string')
  );
}

/**
 * Type guard to check if a value is a TestProviderConfig
 *
 * @param config - The configuration to check
 * @returns True if the configuration is a TestProviderConfig
 */
export function isTestConfig(config: unknown): config is TestProviderConfig {
  return (
    isObject(config) &&
    config.provider === 'test' &&
    typeof config.apiKey === 'string' &&
    (config.model === undefined || typeof config.model === 'string')
  );
}

/**
 * Validates that a configuration has the required properties
 *
 * @param config - The configuration to validate
 * @param requiredProps - The required properties
 * @returns True if the configuration has all required properties
 *
 * @example
 * ```typescript
 * if (hasRequiredProperties(config, ['apiKey', 'model'])) {
 *   // config has apiKey and model properties
 * }
 * ```
 *
 * @since 1.0.0
 */
export function hasRequiredProperties(
  config: Record<string, unknown>,
  requiredProps: string[]
): boolean {
  return requiredProps.every(prop =>
    prop in config && config[prop] !== undefined && config[prop] !== null
  );
}

/**
 * Validates that a value is a string and not empty
 *
 * @param value - The value to validate
 * @returns True if the value is a non-empty string
 *
 * @example
 * ```typescript
 * if (!isNonEmptyString(apiKey)) {
 *   throw new ConfigurationError('API key must be a non-empty string');
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Validates that a value is a number within a specified range
 *
 * @param value - The value to validate
 * @param min - The minimum allowed value (inclusive)
 * @param max - The maximum allowed value (inclusive)
 * @returns True if the value is a number within the specified range
 *
 * @example
 * ```typescript
 * if (!isNumberInRange(temperature, 0, 1)) {
 *   throw new ConfigurationError('Temperature must be between 0 and 1');
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isNumberInRange(
  value: unknown,
  min: number,
  max: number
): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}
