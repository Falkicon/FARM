/**
 * @fileoverview Base provider class for LLM providers
 * @since 1.0.0
 */

import { ProviderConfig } from '../types/providers';
import { validateConfig } from './config';
import { ConfigurationError } from './errors';
import { isTestEnvironment } from './env';
import type { BaseRequestOptions } from '../types/core';

/**
 * Base provider configuration
 */
export interface BaseProviderConfig {
  provider: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

/**
 * Default configuration for all providers
 */
export const DEFAULT_PROVIDER_CONFIG: Partial<BaseProviderConfig> = {
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * Base provider class for LLM providers
 *
 * @template T - The provider configuration type
 *
 * @example
 * ```typescript
 * class OpenAIProvider extends BaseProvider<OpenAIConfig> {
 *   constructor(config: OpenAIConfig) {
 *     super(config);
 *     // Provider-specific initialization
 *   }
 *
 *   // Implement required methods
 * }
 * ```
 *
 * @since 1.0.0
 */
export abstract class BaseProvider<T extends ProviderConfig> {
  protected config: T;

  /**
   * Creates a new provider instance
   *
   * @param config - The provider configuration
   * @throws {ConfigurationError} If the configuration is invalid
   *
   * @example
   * ```typescript
   * const provider = new OpenAIProvider({
   *   provider: 'openai',
   *   apiKey: process.env.OPENAI_API_KEY
   * });
   * ```
   *
   * @since 1.0.0
   */
  constructor(config: T) {
    if (!config) {
      throw new ConfigurationError('Provider configuration is required');
    }

    // Validate and normalize the configuration
    this.config = validateConfig(config);
  }

  /**
   * Gets the provider name
   *
   * @returns The provider name
   *
   * @example
   * ```typescript
   * const providerName = provider.getProviderName();
   * console.log(providerName); // 'openai'
   * ```
   *
   * @since 1.0.0
   */
  getProviderName(): string {
    return this.config.provider;
  }

  /**
   * Gets the provider configuration
   *
   * @returns The provider configuration
   *
   * @example
   * ```typescript
   * const config = provider.getConfig();
   * console.log(config.model); // 'gpt-4'
   * ```
   *
   * @since 1.0.0
   */
  getConfig(): T {
    return { ...this.config };
  }

  /**
   * Validate the provider configuration
   * @throws ConfigurationError if the configuration is invalid
   */
  protected validateConfig(): void {
    // Check for required API key in non-test environments
    if (!this.config.apiKey && !isTestEnvironment()) {
      throw new ConfigurationError(`${this.config.provider} API key is required`);
    }
  }

  /**
   * Merge request options with provider configuration
   * @param options Request options
   * @returns Merged options
   */
  protected mergeOptions<T extends BaseRequestOptions>(options: T): T & Partial<ProviderConfig> {
    return { ...this.config, ...options } as T & Partial<ProviderConfig>;
  }

  /**
   * Generate text using the provider's API
   * @param prompt The prompt to generate text from
   * @param options Options for the generation
   * @returns A Response object with the generated text
   */
  abstract generateText(prompt: string, options?: any): Promise<Response>;

  /**
   * Generate structured data using the provider's API
   * @param prompt The prompt to generate structured data from
   * @param options Options for the generation
   * @returns A Response object with the generated structured data
   */
  abstract generateStructured(prompt: string, options: any): Promise<Response>;

  /**
   * Generate embeddings for a text
   */
  async generateEmbeddings(
    _text: string,
    _options?: any
  ): Promise<Response> {
    throw new Error('Method not implemented');
  }
}
