/**
 * @fileoverview Tests for structured data generation functionality
 */

import { describe, it, expect, vi } from 'vitest';
import type { OpenAI } from 'openai';
import { generateStructured } from '../core/structured';
import { testUtils } from './setup';
import { z } from 'zod';

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
        create: vi.fn().mockImplementation(async ({ stream, functions }) => {
          const mockResponse = {
            name: functions[0].name,
            arguments: JSON.stringify({
              name: 'Test User',
              age: 25,
              email: 'test@example.com',
            }),
          };

          if (stream) {
            // Return an async iterable for streaming
            return {
              [Symbol.asyncIterator]: async function* () {
                yield {
                  choices: [
                    {
                      delta: {
                        function_call: mockResponse,
                      },
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
                message: {
                  function_call: mockResponse,
                },
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

describe('Structured Data Generation', () => {
  const userSchema = z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  });

  describe('Basic Generation', () => {
    it('should generate structured data with default options', async () => {
      const response = await generateStructured('Generate user data', {
        config: testUtils.createMockConfig(),
        schema: userSchema,
      });
      const data = await response.json();

      expect(data.content).toMatchObject({
        name: 'Test User',
        age: 25,
        email: 'test@example.com',
      });
      expect(data.model).toBe('gpt-4');
      expect(data.usage).toBeDefined();
    });

    it('should include system message when provided', async () => {
      const response = await generateStructured('Generate user data', {
        config: testUtils.createMockConfig(),
        schema: userSchema,
        systemMessage: 'You are a user data generator',
      });
      const data = await response.json();

      expect(data.content).toMatchObject({
        name: 'Test User',
        age: 25,
        email: 'test@example.com',
      });
    });

    it('should use custom function name and description', async () => {
      const response = await generateStructured('Generate user data', {
        config: testUtils.createMockConfig(),
        schema: userSchema,
        functionName: 'generate_user',
        functionDescription: 'Generate user profile data',
      });
      const data = await response.json();

      expect(data.content).toMatchObject({
        name: 'Test User',
        age: 25,
        email: 'test@example.com',
      });
    });
  });

  describe('Streaming', () => {
    it('should stream structured data when requested', async () => {
      const response = await generateStructured('Generate user data', {
        stream: true,
        config: testUtils.createMockConfig(),
        schema: userSchema,
      });

      expect(response).toBeDefined();
      expect(response instanceof Response).toBe(true);
      expect(response.body).toBeDefined();

      const reader = response.body!.getReader();
      const { value, done } = await reader.read();

      expect(done).toBe(false);
      const text = new TextDecoder().decode(value);
      const data = JSON.parse(text);
      const content = JSON.parse(data.content);
      expect(content).toMatchObject({
        name: 'Test User',
        age: 25,
        email: 'test@example.com',
      });
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
        generateStructured('Generate user data', {
          stream: true,
          config: { ...testUtils.createMockConfig(), client: mockClient },
          schema: userSchema,
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
        generateStructured('Generate user data', {
          stream: true,
          config: { ...testUtils.createMockConfig(), client: mockClient },
          schema: userSchema,
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

      await expect(
        generateStructured('Generate user data', {
          config,
          schema: userSchema,
        }),
      ).rejects.toThrow('API key must be provided');
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
        generateStructured('Generate user data', {
          config: { ...testUtils.createMockConfig(), client: mockClient },
          schema: userSchema,
        }),
      ).rejects.toThrow('API Error');
    });

    it('should handle invalid response data', async () => {
      // Mock an invalid response
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValueOnce({
              choices: [
                {
                  message: {
                    function_call: {
                      name: 'generate_structured_data',
                      arguments: JSON.stringify({
                        name: 'Test User',
                        age: 'invalid', // Should be a number
                        email: 'test@example.com',
                      }),
                    },
                  },
                },
              ],
            }),
          },
        },
      } as unknown as OpenAI;

      await expect(
        generateStructured('Generate user data', {
          config: { ...testUtils.createMockConfig(), client: mockClient },
          schema: userSchema,
        }),
      ).rejects.toThrow();
    });
  });
});
