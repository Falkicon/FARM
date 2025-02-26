import { describe, it, expect, vi } from 'vitest';
import { initializeAnthropicConfig, createAnthropicClient, generateAnthropicStream, type AnthropicConfig } from '../providers/anthropic/config';
import { AnthropicProvider } from '../providers/anthropic/provider';
import type Anthropic from '@anthropic-ai/sdk';

// Mock Anthropic client
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      apiKey: string;

      constructor(config: { apiKey: string; baseURL?: string }) {
        this.apiKey = config.apiKey;
      }

      messages = {
        create: vi.fn().mockImplementation(async ({ stream }) => {
          if (stream) {
            return {
              [Symbol.asyncIterator]: async function* () {
                yield {
                  delta: { text: 'test response' },
                  type: 'content_block_delta',
                  index: 0
                };
              }
            };
          }
          return {
            content: [{ type: 'text', text: 'test response' }],
            model: 'claude-3-opus-20240229',
            usage: {
              input_tokens: 10,
              output_tokens: 20
            }
          };
        })
      };
    }
  };
});

/**
 * Create a mock Anthropic client for testing
 */
function createMockAnthropicClient(): Anthropic {
  return {
    apiKey: 'test-key',
    messages: {
      create: vi.fn().mockImplementation(async ({ stream }) => {
        if (stream) {
          return {
            [Symbol.asyncIterator]: async function* () {
              yield {
                delta: { text: 'test response' },
                type: 'content_block_delta',
                index: 0
              };
            }
          };
        }
        return {
          content: [{ type: 'text', text: 'test response' }],
          model: 'claude-3-opus-20240229',
          usage: {
            input_tokens: 10,
            output_tokens: 20
          }
        };
      })
    }
  } as unknown as Anthropic;
}

describe('Anthropic Provider', () => {
  describe('Configuration', () => {
    it('should throw error when API key is missing', () => {
      expect(() => initializeAnthropicConfig({
        provider: 'anthropic',
        model: 'claude-3-opus-20240229'
      })).toThrow('API key must be provided');
    });

    it('should create valid configuration with API key', () => {
      const config = initializeAnthropicConfig({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229'
      });

      expect(config).toMatchObject({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229',
        temperature: 0.7,
        maxTokens: 1000
      });
    });

    it('should override default configuration values', () => {
      const config = initializeAnthropicConfig({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-sonnet-20240229',
        temperature: 0.9,
        maxTokens: 2000
      });

      expect(config).toMatchObject({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-sonnet-20240229',
        temperature: 0.9,
        maxTokens: 2000
      });
    });
  });

  describe('Client Creation', () => {
    it('should create Anthropic client with config', () => {
      const config = {
        provider: 'anthropic' as const,
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229'
      };
      const client = createAnthropicClient(config as AnthropicConfig);

      expect(client).toBeDefined();
      expect(client.apiKey).toBe('test-key');
    });

    it('should include baseURL when provided', () => {
      const config = {
        provider: 'anthropic' as const,
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229',
        baseUrl: 'https://custom-api.anthropic.com'
      };

      // We can't directly check the baseURL property, but we can verify
      // that the client is created without errors
      const client = createAnthropicClient(config as AnthropicConfig);
      expect(client).toBeDefined();
    });
  });

  describe('Streaming', () => {
    it('should create streaming response with default config', async () => {
      const client = createMockAnthropicClient();
      const messages = [
        { role: 'user' as const, content: 'Hello!' }
      ];

      const response = await generateAnthropicStream(client, messages);
      expect(response).toBeDefined();
      expect(response instanceof Response).toBe(true);
    });

    it('should use provided configuration for streaming', async () => {
      const client = createMockAnthropicClient();
      const messages = [
        { role: 'user' as const, content: 'Hello!' }
      ];
      const config = {
        model: 'claude-3-sonnet-20240229',
        temperature: 0.5,
        maxTokens: 500
      };

      const response = await generateAnthropicStream(client, messages, config);
      expect(response).toBeDefined();
      expect(response instanceof Response).toBe(true);
    });

    it('should handle streaming errors gracefully', async () => {
      const client = createMockAnthropicClient();
      const messages = [
        { role: 'user' as const, content: 'Hello!' }
      ];

      // Mock an error response
      vi.spyOn(client.messages, 'create').mockRejectedValueOnce(
        new Error('API Error')
      );

      await expect(generateAnthropicStream(client, messages))
        .rejects.toThrow('API Error');
    });
  });

  describe('Provider Implementation', () => {
    describe('Text Generation', () => {
      it('should generate text with default options', async () => {
        const provider = new AnthropicProvider({
          provider: 'anthropic',
          apiKey: 'test-key',
          model: 'claude-3-opus-20240229',
          client: createMockAnthropicClient()
        });

        const response = await provider.generateText('Hello');
        const data = await response.json();

        expect(data).toMatchObject({
          content: 'test response',
          model: 'claude-3-opus-20240229'
        });
      });

      it('should include system message when provided', async () => {
        const provider = new AnthropicProvider({
          provider: 'anthropic',
          apiKey: 'test-key',
          model: 'claude-3-opus-20240229',
          client: createMockAnthropicClient()
        });

        const response = await provider.generateText('Hello', {
          systemMessage: 'You are a helpful assistant'
        });
        const data = await response.json();

        expect(data.content).toBe('test response');
      });

      it('should stream response when requested', async () => {
        const provider = new AnthropicProvider({
          provider: 'anthropic',
          apiKey: 'test-key',
          model: 'claude-3-opus-20240229',
          client: createMockAnthropicClient()
        });

        const response = await provider.generateText('Hello', {
          stream: true
        });

        expect(response).toBeDefined();
        expect(response instanceof Response).toBe(true);
        expect(response.body).toBeDefined();
      });

      it('should handle errors gracefully', async () => {
        const mockClient = createMockAnthropicClient();
        vi.spyOn(mockClient.messages, 'create').mockRejectedValueOnce(
          new Error('API Error')
        );

        const provider = new AnthropicProvider({
          provider: 'anthropic',
          apiKey: 'test-key',
          model: 'claude-3-opus-20240229',
          client: mockClient
        });

        await expect(provider.generateText('Hello'))
          .rejects.toThrow('API Error');
      });
    });

    describe('Structured Data Generation', () => {
      it('should generate structured data with default options', async () => {
        const provider = new AnthropicProvider({
          provider: 'anthropic',
          apiKey: 'test-key',
          model: 'claude-3-opus-20240229',
          client: createMockAnthropicClient()
        });

        // Mock the client to return a JSON string
        const mockClient = createMockAnthropicClient();
        vi.spyOn(mockClient.messages, 'create').mockResolvedValueOnce({
          content: [{ type: 'text', text: '{"name":"John","age":30}' }],
          model: 'claude-3-opus-20240229',
          usage: {
            input_tokens: 10,
            output_tokens: 20
          }
        } as any);

        provider['client'] = mockClient;

        const response = await provider.generateStructured('Generate a person', {
          functionName: 'generate_person',
          functionDescription: 'Generate a person object',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          }
        });

        const data = await response.json();
        expect(data.content).toMatchObject({
          name: 'John',
          age: 30
        });
      });

      it('should handle JSON parsing errors', async () => {
        const provider = new AnthropicProvider({
          provider: 'anthropic',
          apiKey: 'test-key',
          model: 'claude-3-opus-20240229',
          client: createMockAnthropicClient()
        });

        // Mock the client to return an invalid JSON string
        const mockClient = createMockAnthropicClient();
        vi.spyOn(mockClient.messages, 'create').mockResolvedValueOnce({
          content: [{ type: 'text', text: 'This is not valid JSON' }],
          model: 'claude-3-opus-20240229',
          usage: {
            input_tokens: 10,
            output_tokens: 20
          }
        } as any);

        provider['client'] = mockClient;

        await expect(provider.generateStructured('Generate a person', {
          functionName: 'generate_person',
          functionDescription: 'Generate a person object',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          }
        })).rejects.toThrow('Failed to parse structured data response as JSON');
      });
    });

    describe('Embeddings', () => {
      it('should throw error for embeddings generation', async () => {
        const provider = new AnthropicProvider({
          provider: 'anthropic',
          apiKey: 'test-key',
          model: 'claude-3-opus-20240229',
          client: createMockAnthropicClient()
        });

        await expect(provider.generateEmbeddings({
          input: ['Hello, world!']
        })).rejects.toThrow('Embeddings generation is not supported by Anthropic');
      });
    });
  });
});
