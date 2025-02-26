/**
 * @fileoverview OpenAI provider configuration for Vercel AI SDK
 */

import OpenAI from 'openai';
import type { LLMConfig } from '../../core/base';

/**
 * OpenAI-specific configuration options
 */
export interface OpenAIConfig extends LLMConfig {
  provider: 'openai';
  /** OpenAI model to use */
  model: string;
  /** Organization ID for OpenAI API */
  organization?: string;
  /** Pre-configured OpenAI client (for testing) */
  client?: OpenAI;
  baseUrl?: string;
}

/**
 * Default configuration for OpenAI
 */
export const DEFAULT_OPENAI_CONFIG: Partial<OpenAIConfig> = {
  provider: 'openai',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
};

/**
 * Initialize OpenAI configuration
 */
export function initializeOpenAIConfig(config: Partial<OpenAIConfig>): OpenAIConfig {
  if (!config.apiKey && !config.client) {
    throw new Error('API key must be provided for OpenAI configuration');
  }

  return {
    ...DEFAULT_OPENAI_CONFIG,
    ...config,
  } as OpenAIConfig;
}

/**
 * Create OpenAI client instance
 */
export function createOpenAIClient(config: OpenAIConfig): OpenAI {
  if (!config.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  return new OpenAI({
    apiKey: config.apiKey,
    organization: config.organization,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true // Allow testing in Node.js environments
  });
}

/**
 * Create a streaming response from OpenAI
 */
export async function createStreamingResponse(
  openai: OpenAI,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  config: Partial<OpenAIConfig> = {}
): Promise<Response> {
  try {
    const response = await openai.chat.completions.create({
      model: config.model ?? DEFAULT_OPENAI_CONFIG.model!,
      stream: true,
      messages,
      temperature: config.temperature ?? DEFAULT_OPENAI_CONFIG.temperature,
      max_tokens: config.maxTokens ?? DEFAULT_OPENAI_CONFIG.maxTokens,
    });

    if (!response) {
      throw new Error('No response body available for streaming');
    }

    // Create a stream manually for testing
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(new TextEncoder().encode(JSON.stringify({
                content,
                model: config.model ?? DEFAULT_OPENAI_CONFIG.model,
                usage: {
                  prompt_tokens: 0,
                  completion_tokens: 0,
                  total_tokens: 0
                }
              })));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    // Return a standard Response object with the stream
    return new Response(stream);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during streaming');
  }
}
