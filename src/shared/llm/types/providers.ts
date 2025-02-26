/**
 * @fileoverview Provider-specific type definitions for the LLM module
 */

/**
 * Base configuration for all providers
 */
export interface ProviderConfig {
  /** Provider identifier */
  provider: string;
  /** API key for authentication */
  apiKey?: string;
  /** Model to use */
  model?: string;
  /** Temperature for controlling randomness (0-1) */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Base URL for API requests */
  baseUrl?: string;
  /** Any additional provider-specific options */
  [key: string]: any;
}

/**
 * OpenAI provider configuration
 */
export interface OpenAIConfig extends ProviderConfig {
  /** Provider identifier (always 'openai') */
  provider: 'openai';
  /** OpenAI organization ID */
  organization?: string;
  /** API version */
  apiVersion?: string;
  /** Model to use for embeddings */
  embeddingModel?: string;
}

/**
 * Azure OpenAI provider configuration
 */
export interface AzureOpenAIConfig extends ProviderConfig {
  /** Provider identifier (always 'azure') */
  provider: 'azure';
  /** Azure OpenAI endpoint */
  endpoint: string;
  /** Azure OpenAI deployment name */
  deploymentName: string;
  /** API version */
  apiVersion?: string;
  /** Model to use for embeddings */
  embeddingModel?: string;
}

/**
 * Anthropic provider configuration
 */
export interface AnthropicConfig extends ProviderConfig {
  /** Provider identifier (always 'anthropic') */
  provider: 'anthropic';
  /** API version */
  apiVersion?: string;
}

/**
 * Google (Gemini) provider configuration
 */
export interface GoogleConfig extends ProviderConfig {
  /** Provider identifier (always 'google') */
  provider: 'google';
  /** Google service account credentials */
  serviceAccount?: {
    /** Client email */
    clientEmail: string;
    /** Private key */
    privateKey: string;
    /** Project ID */
    projectId: string;
  };
}

/**
 * Mistral provider configuration
 */
export interface MistralConfig extends ProviderConfig {
  /** Provider identifier (always 'mistral') */
  provider: 'mistral';
}

/**
 * Amazon Bedrock provider configuration
 */
export interface BedrockConfig extends ProviderConfig {
  /** Provider identifier (always 'bedrock') */
  provider: 'bedrock';
  /** AWS region */
  region: string;
  /** AWS access key ID */
  accessKeyId?: string;
  /** AWS secret access key */
  secretAccessKey?: string;
  /** AWS session token */
  sessionToken?: string;
}
