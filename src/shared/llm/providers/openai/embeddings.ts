/**
 * @fileoverview OpenAI embeddings provider implementation
 */

import OpenAI from 'openai';
import { EmbeddingsProvider, type EmbeddingsConfig, type EmbeddingsInput, type EmbeddingsResponse, EmbeddingsError } from '../../core/embeddings';
import { createOpenAIClient } from './config';

/**
 * OpenAI-specific embeddings configuration
 */
export interface OpenAIEmbeddingsConfig extends EmbeddingsConfig {
  provider: 'openai';
  /** Pre-configured OpenAI client (for testing) */
  client?: OpenAI;
}

/**
 * Default configuration for OpenAI embeddings
 */
export const DEFAULT_OPENAI_EMBEDDINGS_CONFIG: Partial<OpenAIEmbeddingsConfig> = {
  provider: 'openai',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  normalize: true
};

/**
 * OpenAI embeddings provider implementation
 */
export class OpenAIEmbeddingsProvider extends EmbeddingsProvider {
  private client: OpenAI;

  constructor(config: OpenAIEmbeddingsConfig) {
    super({
      ...DEFAULT_OPENAI_EMBEDDINGS_CONFIG,
      ...config
    });

    this.client = config.client ?? createOpenAIClient(config);
  }

  /**
   * Generate embeddings using OpenAI's API
   */
  async generateEmbeddings(input: EmbeddingsInput): Promise<EmbeddingsResponse> {
    try {
      // Validate input
      const validatedInput = await this.validateInput(input);

      // Convert input to array if string
      const inputs = Array.isArray(validatedInput.input)
        ? validatedInput.input
        : [validatedInput.input];

      // Generate embeddings
      const response = await this.client.embeddings.create({
        model: this.config.model,
        input: inputs,
        dimensions: this.config.dimensions,
        user: validatedInput.user
      });

      // Format response
      const result: EmbeddingsResponse = {
        object: 'list',
        data: response.data.map((item, index) => ({
          object: 'embedding',
          embedding: item.embedding,
          index
        })),
        model: response.model,
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          total_tokens: response.usage.total_tokens
        }
      };

      // Post-process response (e.g., normalize vectors)
      return this.processResponse(result);
    } catch (error) {
      if (error instanceof Error) {
        throw new EmbeddingsError('Failed to generate embeddings', error);
      }
      throw new EmbeddingsError('Unknown error occurred during embeddings generation');
    }
  }
}
