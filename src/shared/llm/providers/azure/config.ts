/**
 * @fileoverview Azure OpenAI provider configuration for Vercel AI SDK
 */

import OpenAI from 'openai';
import type { LLMConfig } from '../../core/base';

/**
 * Azure OpenAI-specific configuration options
 */
export interface AzureOpenAIConfig extends LLMConfig {
  provider: 'azure';
  /** Azure OpenAI API key */
  apiKey: string;
  /** Azure OpenAI endpoint */
  endpoint: string;
  /** Azure OpenAI deployment name */
  deploymentName: string;
  /** Model identifier */
  model: string;
  /** Embedding dimensions */
  dimensions?: number;
  /** API version */
  apiVersion?: string;
  /** Pre-configured OpenAI client (for testing) */
  client?: OpenAI;
}

/**
 * Default configuration for Azure OpenAI
 */
export const DEFAULT_AZURE_OPENAI_CONFIG: Partial<AzureOpenAIConfig> = {
  provider: 'azure',
  apiVersion: '2024-02-15-preview',
  temperature: 0.7,
  maxTokens: 1000,
  model: 'text-embedding-3-small',
  dimensions: 1536,
};

/**
 * Initialize Azure OpenAI configuration
 */
export function initializeAzureOpenAIConfig(config: Partial<AzureOpenAIConfig>): AzureOpenAIConfig {
  if (!config.apiKey && !config.client) {
    throw new Error('API key must be provided for Azure OpenAI configuration');
  }

  if (!config.endpoint) {
    throw new Error('Endpoint must be provided for Azure OpenAI configuration');
  }

  if (!config.deploymentName) {
    throw new Error('Deployment name must be provided for Azure OpenAI configuration');
  }

  return {
    ...DEFAULT_AZURE_OPENAI_CONFIG,
    ...config,
  } as AzureOpenAIConfig;
}

/**
 * Create Azure OpenAI client instance
 */
export function createAzureOpenAIClient(config: AzureOpenAIConfig): OpenAI {
  if (!config.apiKey) {
    throw new Error('Azure OpenAI API key is required');
  }

  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: `${config.endpoint}/openai/deployments/${config.deploymentName}`,
    defaultQuery: { 'api-version': config.apiVersion },
    defaultHeaders: { 'api-key': config.apiKey },
  });
}

/**
 * Create a streaming response from Azure OpenAI
 */
export async function createStreamingResponse(
  client: OpenAI,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  config: Partial<AzureOpenAIConfig> = {},
): Promise<Response> {
  try {
    const response = await client.chat.completions.create({
      model: config.deploymentName ?? '',
      stream: true,
      messages,
      temperature: config.temperature ?? DEFAULT_AZURE_OPENAI_CONFIG.temperature,
      max_tokens: config.maxTokens ?? DEFAULT_AZURE_OPENAI_CONFIG.maxTokens,
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
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({
                    content,
                    model: config.deploymentName,
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
