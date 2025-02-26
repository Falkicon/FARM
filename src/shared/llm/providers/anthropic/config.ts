/**
 * @fileoverview Anthropic provider configuration for Vercel AI SDK
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMConfig } from '../../core/base';

/**
 * Anthropic-specific configuration options
 */
export interface AnthropicConfig extends LLMConfig {
  provider: 'anthropic';
  /** Anthropic API key */
  apiKey: string;
  /** Anthropic model to use (e.g., 'claude-3-opus-20240229') */
  model: string;
  /** Base URL for API requests */
  baseUrl?: string;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Temperature for response generation */
  temperature?: number;
  /** Pre-configured Anthropic client (for testing) */
  client?: Anthropic;
}

/**
 * Default configuration for Anthropic
 */
export const DEFAULT_ANTHROPIC_CONFIG: Partial<AnthropicConfig> = {
  provider: 'anthropic',
  model: 'claude-3-opus-20240229',
  temperature: 0.7,
  maxTokens: 1000,
};

/**
 * Initialize Anthropic configuration
 */
export function initializeAnthropicConfig(config: Partial<AnthropicConfig>): AnthropicConfig {
  if (!config.apiKey && !config.client) {
    throw new Error('API key must be provided for Anthropic configuration');
  }

  return {
    ...DEFAULT_ANTHROPIC_CONFIG,
    ...config,
  } as AnthropicConfig;
}

/**
 * Create Anthropic client instance
 */
export function createAnthropicClient(config: AnthropicConfig): Anthropic {
  if (!config.apiKey) {
    throw new Error('Anthropic API key is required');
  }

  return new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });
}

/**
 * Create a streaming response from Anthropic
 */
export async function generateAnthropicStream(
  client: Anthropic,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  config: Partial<AnthropicConfig> = {},
): Promise<Response> {
  try {
    // Convert messages to the format expected by Anthropic
    const anthropicMessages = messages.filter((msg) => msg.role !== 'system');
    const systemMessage = messages.find((msg) => msg.role === 'system')?.content || '';

    const response = await client.messages.create({
      model: config.model ?? DEFAULT_ANTHROPIC_CONFIG.model!,
      messages: anthropicMessages as Anthropic.MessageParam[],
      system: systemMessage,
      stream: true,
      max_tokens: config.maxTokens ?? DEFAULT_ANTHROPIC_CONFIG.maxTokens ?? 1000,
      temperature: config.temperature ?? DEFAULT_ANTHROPIC_CONFIG.temperature,
    });

    if (!response) {
      throw new Error('No response body available for streaming');
    }

    // Create a stream manually for testing
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && chunk.delta) {
              // Check if it's a TextDelta
              if ('text' in chunk.delta && chunk.delta.text) {
                const content = chunk.delta.text;
                if (content) {
                  controller.enqueue(
                    new TextEncoder().encode(
                      JSON.stringify({
                        content,
                        model: config.model ?? DEFAULT_ANTHROPIC_CONFIG.model,
                        usage: {
                          prompt_tokens: 0,
                          completion_tokens: 0,
                          total_tokens: 0,
                        },
                      }),
                    ),
                  );
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during streaming');
  }
}
