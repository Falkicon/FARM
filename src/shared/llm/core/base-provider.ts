/**
 * @fileoverview Base provider class for LLM providers
 * @since 1.0.0
 */

import { ProviderConfig } from '../types/providers';
import { validateConfig } from './config';
import { ConfigurationError } from './errors';
import { isTestEnvironment } from './env';

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
  protected isTest: boolean;

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

    // Check if we're in a test environment
    this.isTest = isTestEnvironment();
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
   * Checks if the provider is running in a test environment
   *
   * @returns True if the provider is running in a test environment
   *
   * @example
   * ```typescript
   * if (provider.isTestEnvironment()) {
   *   // Use mock responses
   * }
   * ```
   *
   * @since 1.0.0
   */
  isTestEnvironment(): boolean {
    return this.isTest;
  }
}
