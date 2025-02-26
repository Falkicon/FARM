/**
 * @fileoverview Test setup and utilities for LLM module tests
 */

import { afterEach, beforeEach, vi } from 'vitest';
import type { OpenAI } from 'openai';

/**
 * Mock OpenAI client factory
 */
export function createMockOpenAIClient(): OpenAI {
  return {
    apiKey: 'test-key',
    organization: 'test-org',
    chat: {
      completions: {
        create: vi.fn().mockImplementation(async ({ stream }) => {
          if (stream) {
            return {
              choices: [{
                delta: { content: 'test response' },
                index: 0,
                finish_reason: null
              }]
            };
          }
          return {
            choices: [{
              message: {
                content: 'test response',
                function_call: {
                  name: 'testFunction',
                  arguments: '{"test":"value"}'
                }
              }
            }],
            model: 'gpt-4',
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30
            }
          };
        })
      }
    },
    embeddings: {
      create: vi.fn().mockImplementation(async () => {
        return {
          data: [
            {
              embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
            }
          ],
          model: 'text-embedding-3-small',
          usage: {
            prompt_tokens: 10,
            total_tokens: 10
          }
        };
      })
    }
  } as unknown as OpenAI;
}

/**
 * Create a simulated stream response
 */
export function createMockStream(content: string = 'test response') {
  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(JSON.stringify({
        content,
        model: 'gpt-4',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      })));
      controller.close();
    }
  });
}

/**
 * Create a mock text generation response
 */
export function createMockTextResponse(content: string = 'mock response', model: string = 'test-model') {
  return {
    content,
    model,
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30
    }
  };
}

/**
 * Create a mock structured data response
 */
export function createMockStructuredResponse<T = any>(model: string = 'test-model'): any {
  return {
    content: { result: 'mock data' } as T,
    model,
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30
    }
  };
}

/**
 * Create a mock embedding response
 */
export function createMockEmbeddingResponse(count: number = 1, model: string = 'test-model'): any {
  const embeddings = Array(count).fill([0.1, 0.2, 0.3, 0.4, 0.5]);

  return {
    embeddings,
    model,
    usage: {
      promptTokens: 10,
      totalTokens: 10
    }
  };
}

/**
 * Common test setup
 */
beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Common test cleanup
 */
afterEach(() => {
  vi.resetAllMocks();
});

/**
 * Mock environment variables
 */
export const mockEnv = {
  OPENAI_API_KEY: 'test-key',
  OPENAI_ORG_ID: 'test-org'
};

/**
 * Test utilities
 */
export const testUtils = {
  /**
   * Create a mock configuration object
   */
  createMockConfig: (overrides = {}) => ({
    provider: 'openai' as const,
    apiKey: 'test-key',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    ...overrides
  }),

  /**
   * Create mock chat messages
   */
  createMockMessages: () => [
    { role: 'system' as const, content: 'You are a helpful assistant.' },
    { role: 'user' as const, content: 'Hello!' }
  ]
};
