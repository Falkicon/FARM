/**
 * @fileoverview Tests for text generation functionality
 */

import { describe, it, expect, vi } from 'vitest';
import type { OpenAI } from 'openai';
import { generateText } from '../core/generation';
import { testUtils, createMockStream } from './setup';

const mockOpenAIStream = vi.hoisted(() => vi.fn().mockImplementation(() => createMockStream()));

// Mock OpenAI client
vi.mock('openai', () => ({
  default: class MockOpenAI {
    apiKey: string;
    organization?: string;

    constructor(config: { apiKey: string; organization?: string }) {
      this.apiKey = config.apiKey;
      this.organization = config.organization;
    }

    chat = {
      completions: {
        create: vi.fn().mockImplementation(async ({ stream }) => {
          if (stream) {
            // Return an async iterable for streaming
            return {
              [Symbol.asyncIterator]: async function* () {
                yield {
                  choices: [
                    {
                      delta: { content: 'test response' },
                      index: 0,
                      finish_reason: null,
                    },
                  ],
                };
              },
            };
          }
          return {
            choices: [
              {
                message: { content: 'test response' },
                finish_reason: 'stop',
              },
            ],
            model: 'gpt-4',
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30,
            },
          };
        }),
      },
    };
  },
}));

// Mock Vercel AI SDK
vi.mock('ai', () => ({
  OpenAIStream: mockOpenAIStream,
}));

describe('Text Generation', () => {
  describe('Basic Generation', () => {
    it('should generate text with default options', async () => {
      const response = await generateText('Hello', {
        config: testUtils.createMockConfig(),
      });
      const data = await response.json();

      expect(data).toMatchObject({
        content: 'test response',
        model: 'gpt-4',
      });
      expect(data.usage).toBeDefined();
    });

    it('should include system message when provided', async () => {
      const response = await generateText('Hello', {
        config: testUtils.createMockConfig(),
        systemMessage: 'You are a helpful assistant',
      });
      const data = await response.json();

      expect(data.content).toBe('test response');
    });

    it('should use custom configuration', async () => {
      const config = testUtils.createMockConfig({
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
      });

      const response = await generateText('Hello', { config });
      const data = await response.json();

      expect(data.content).toBe('test response');
    });
  });

  describe('Streaming', () => {
    it('should stream response when requested', async () => {
      const response = await generateText('Hello', {
        stream: true,
        config: testUtils.createMockConfig(),
      });

      expect(response).toBeDefined();
      expect(response instanceof Response).toBe(true);
      expect(response.body).toBeDefined();

      const reader = response.body!.getReader();
      const { value, done } = await reader.read();

      expect(done).toBe(false);
      const text = new TextDecoder().decode(value);
      const data = JSON.parse(text);
      expect(data.content).toBe('test response');
    });

    it('should handle streaming errors gracefully', async () => {
      // Mock an error response
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValueOnce(new Error('API Error')),
          },
        },
      } as unknown as OpenAI;

      await expect(
        generateText('Hello', {
          stream: true,
          config: { ...testUtils.createMockConfig(), client: mockClient },
        }),
      ).rejects.toThrow('API Error');
    });

    it('should handle missing response body', async () => {
      // Mock a response without a body
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValueOnce(undefined),
          },
        },
      } as unknown as OpenAI;

      await expect(
        generateText('Hello', {
          stream: true,
          config: { ...testUtils.createMockConfig(), client: mockClient },
        }),
      ).rejects.toThrow('No response body available for streaming');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key', async () => {
      const config = {
        provider: 'openai' as const,
        model: 'gpt-4',
      };

      await expect(generateText('Hello', { config })).rejects.toThrow('API key must be provided');
    });

    it('should handle API errors', async () => {
      // Mock an error response
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValueOnce(new Error('API Error')),
          },
        },
      } as unknown as OpenAI;

      await expect(
        generateText('Hello', {
          config: { ...testUtils.createMockConfig(), client: mockClient },
        }),
      ).rejects.toThrow('API Error');
    });
  });
});
