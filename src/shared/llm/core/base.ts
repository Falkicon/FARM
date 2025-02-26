/**
 * @fileoverview Base configuration and setup for Vercel AI SDK integration
 */

// Define our own interface for stream callbacks since the import is not available
export interface AIStreamCallbacksAndOptions {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onCompletion?: (completion: string) => void;
  onFinal?: (completion: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Configuration options for LLM providers
 */
export interface LLMConfig {
  /** Provider type (e.g., 'openai', 'anthropic', etc.) */
  provider: string;
  /** API key for the provider */
  apiKey?: string;
  /** Base URL for API requests */
  baseUrl?: string;
  /** Model to use (e.g., 'gpt-4', 'claude-3', etc.) */
  model?: string;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Temperature for response generation */
  temperature?: number;
  /** Stream options and callbacks */
  streamOptions?: AIStreamCallbacksAndOptions;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<LLMConfig> = {
  temperature: 0.7,
  maxTokens: 1000,
};

/**
 * Initialize LLM configuration with provided options
 */
export function initializeConfig(config: Partial<LLMConfig> & { provider: string }): LLMConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
  } as LLMConfig;
}
