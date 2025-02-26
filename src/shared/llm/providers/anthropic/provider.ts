/**
 * @fileoverview Anthropic provider implementation
 */

import Anthropic from '@anthropic-ai/sdk';
import { EmbeddingsProvider, type EmbeddingsInput, type EmbeddingsResponse, EmbeddingsError } from '../../core/embeddings';
import { AnthropicConfig, createAnthropicClient, generateAnthropicStream, initializeAnthropicConfig } from './config';

type MessageRole = 'user' | 'assistant';
type Message = {
  role: MessageRole;
  content: string;
};

/**
 * Anthropic provider implementation
 */
export class AnthropicProvider extends EmbeddingsProvider {
  private client: Anthropic;
  protected config: AnthropicConfig;

  constructor(config: Partial<AnthropicConfig>) {
    // Initialize configuration
    const fullConfig = initializeAnthropicConfig(config);
    super(fullConfig);
    this.config = fullConfig;

    // Create client
    this.client = config.client ?? createAnthropicClient(fullConfig);
  }

  /**
   * Generate text using Anthropic
   */
  async generateText(
    prompt: string,
    options: {
      stream?: boolean;
      systemMessage?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<Response> {
    try {
      // Prepare messages
      const messages: Message[] = [];

      // Add system message if provided
      if (options.systemMessage) {
        messages.push({
          role: 'assistant' as const,
          content: options.systemMessage
        });
      }

      // Add user prompt
      messages.push({
        role: 'user' as const,
        content: prompt
      });

      // Handle streaming
      if (options.stream) {
        return generateAnthropicStream(this.client, messages, {
          ...this.config,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      }

      // Handle non-streaming
      const response = await this.client.messages.create({
        model: this.config.model,
        messages,
        max_tokens: options.maxTokens || this.config.maxTokens || 1000,
        temperature: options.temperature || this.config.temperature || 0.7,
      });

      // Get content from response
      const content = response.content.find(block => block.type === 'text')?.text || '';

      // Return completion as a Response object
      return new Response(JSON.stringify({
        content,
        model: this.config.model,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during text generation');
    }
  }

  /**
   * Generate structured data using Anthropic
   */
  async generateStructured<T>(
    prompt: string,
    options: {
      stream?: boolean;
      systemMessage?: string;
      temperature?: number;
      maxTokens?: number;
      functionName: string;
      functionDescription: string;
      parameters: Record<string, unknown>;
    }
  ): Promise<Response> {
    try {
      // Prepare messages
      const messages: Message[] = [];

      // Add system message if provided
      if (options.systemMessage) {
        messages.push({
          role: 'assistant' as const,
          content: options.systemMessage
        });
      }

      // Add function description to system message
      messages.push({
        role: 'assistant' as const,
        content: `You are a helpful assistant that generates structured data in the following format: ${JSON.stringify(options.parameters)}`
      });

      // Add user prompt
      messages.push({
        role: 'user' as const,
        content: prompt
      });

      // Handle streaming
      if (options.stream) {
        return generateAnthropicStream(this.client, messages, {
          ...this.config,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });
      }

      // Handle non-streaming
      const response = await this.client.messages.create({
        model: this.config.model,
        messages,
        max_tokens: options.maxTokens || this.config.maxTokens || 1000,
        temperature: options.temperature || this.config.temperature || 0.7,
      });

      // Parse response as JSON
      try {
        const content = response.content.find(block => block.type === 'text')?.text;
        const parsedData = content ? JSON.parse(content) as T : {} as T;

        // Return completion as a Response object
        return new Response(JSON.stringify({
          content: parsedData,
          model: this.config.model,
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        }));
      } catch (parseError) {
        throw new Error(`Failed to parse structured data response as JSON: ${(parseError as Error).message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during structured data generation');
    }
  }

  /**
   * Generate embeddings using Anthropic
   * Note: Anthropic doesn't directly support embeddings through this SDK
   */
  async generateEmbeddings(input: EmbeddingsInput): Promise<EmbeddingsResponse> {
    throw new EmbeddingsError(`Embeddings generation is not supported by Anthropic for input with ${input.input.length} items`);
  }
}
