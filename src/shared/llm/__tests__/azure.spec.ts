/**
 * @fileoverview Tests for Azure OpenAI provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeAzureOpenAIConfig, createAzureOpenAIClient, createStreamingResponse, type AzureOpenAIConfig } from '../providers/azure/config';
import { AzureOpenAIProvider } from '../providers/azure/provider';
import { testUtils } from './setup';

// Mock OpenAI client
vi.mock('openai', () => ({
  default: class MockOpenAI {
    apiKey: string;
    baseURL: string;

    constructor(config: { apiKey: string; baseURL: string }) {
      this.apiKey = config.apiKey;
      this.baseURL = config.baseURL;
    }

    chat = {
      completions: {
        create: vi.fn().mockImplementation(async ({ stream, functions }) => {
          if (stream) {
            let chunkIndex = 0;
            const chunks = functions
              ? [{ function_call: { arguments: '{"name":"test","age":25}' } }]
              : [{ content: 'test ' }, { content: 'response' }];

            return {
              [Symbol.asyncIterator]: () => ({
                async next() {
                  if (chunkIndex >= chunks.length) {
                    return { done: true, value: undefined };
                  }
                  const value = {
                    choices: [{
                      delta: chunks[chunkIndex]
                    }]
                  };
                  chunkIndex++;
                  return { done: false, value };
                }
              })
            };
          }
          return {
            choices: [{
              message: functions
                ? { function_call: { arguments: '{"name":"test","age":25}' } }
                : { content: 'test response' }
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
    };

    embeddings = {
      create: vi.fn().mockImplementation(async ({ input }) => {
        const inputs = Array.isArray(input) ? input : [input];
        return {
          data: inputs.map(() => ({ embedding: Array(1536).fill(0.1) })),
          model: 'text-embedding-3-small',
          usage: {
            prompt_tokens: 10,
            total_tokens: 10
          }
        };
      })
    };
  }
}));

describe('Azure OpenAI Provider', () => {
  const baseConfig = {
    provider: 'azure' as const,
    apiKey: 'test-key',
    endpoint: 'https://test.openai.azure.com',
    deploymentName: 'test-deployment'
  };

  describe('Configuration', () => {
    it('should throw error when API key is missing', () => {
      expect(() => initializeAzureOpenAIConfig({
        provider: 'azure',
        endpoint: 'https://test.openai.azure.com',
        deploymentName: 'test-deployment'
      })).toThrow('API key must be provided');
    });

    it('should throw error when endpoint is missing', () => {
      expect(() => initializeAzureOpenAIConfig({
        provider: 'azure',
        apiKey: 'test-key',
        deploymentName: 'test-deployment'
      })).toThrow('Endpoint must be provided');
    });

    it('should throw error when deployment name is missing', () => {
      expect(() => initializeAzureOpenAIConfig({
        provider: 'azure',
        apiKey: 'test-key',
        endpoint: 'https://test.openai.azure.com'
      })).toThrow('Deployment name must be provided');
    });

    it('should create valid configuration with required fields', () => {
      const config = initializeAzureOpenAIConfig(baseConfig);

      expect(config).toMatchObject({
        provider: 'azure',
        apiKey: 'test-key',
        endpoint: 'https://test.openai.azure.com',
        deploymentName: 'test-deployment',
        temperature: 0.7,
        maxTokens: 1000
      });
    });

    it('should override default configuration values', () => {
      const config = initializeAzureOpenAIConfig({
        ...baseConfig,
        temperature: 0.9,
        maxTokens: 2000,
        apiVersion: '2024-03-01-preview'
      });

      expect(config).toMatchObject({
        provider: 'azure',
        apiKey: 'test-key',
        endpoint: 'https://test.openai.azure.com',
        deploymentName: 'test-deployment',
        temperature: 0.9,
        maxTokens: 2000,
        apiVersion: '2024-03-01-preview'
      });
    });
  });

  describe('Client Creation', () => {
    it('should create Azure OpenAI client with config', () => {
      const config = baseConfig;
      const client = createAzureOpenAIClient(config as AzureOpenAIConfig);

      expect(client).toBeDefined();
      expect(client.apiKey).toBe('test-key');
      expect(client.baseURL).toBe('https://test.openai.azure.com/openai/deployments/test-deployment');
    });
  });

  describe('Provider Functionality', () => {
    let provider: AzureOpenAIProvider;

    beforeEach(() => {
      provider = new AzureOpenAIProvider(baseConfig);
    });

    describe('Text Generation', () => {
      it('should generate text with default options', async () => {
        const response = await provider.generateText('Hello');
        const data = await response.json();

        expect(data).toMatchObject({
          content: 'test response',
          model: 'gpt-4'
        });
        expect(data.usage).toBeDefined();
      });

      it('should include system message when provided', async () => {
        const response = await provider.generateText('Hello', {
          systemMessage: 'You are a helpful assistant'
        });
        const data = await response.json();

        expect(data.content).toBe('test response');
      });

      it('should handle streaming', async () => {
        const response = await provider.generateText('Hello', { stream: true });

        expect(response).toBeDefined();
        expect(response instanceof Response).toBe(true);
        expect(response.body).toBeDefined();

        const reader = response.body!.getReader();
        let content = '';

        // Read first chunk
        let result = await reader.read();
        expect(result.done).toBe(false);
        let text = new TextDecoder().decode(result.value);
        let data = JSON.parse(text);
        content += data.content;

        // Read second chunk
        result = await reader.read();
        expect(result.done).toBe(false);
        text = new TextDecoder().decode(result.value);
        data = JSON.parse(text);
        content += data.content;

        // Read final chunk (should be done)
        result = await reader.read();
        expect(result.done).toBe(true);

        // Verify complete content
        expect(content).toBe('test response');
      });
    });

    describe('Structured Data Generation', () => {
      const structuredOptions = {
        functionName: 'test_function',
        functionDescription: 'Test function',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          }
        }
      };

      it('should generate structured data', async () => {
        const response = await provider.generateStructured('Generate user data', structuredOptions);
        const data = await response.json();

        expect(data).toBeDefined();
        expect(data.model).toBe('gpt-4');
        expect(data.usage).toBeDefined();
      });

      it('should handle streaming structured data', async () => {
        const response = await provider.generateStructured('Generate user data', {
          ...structuredOptions,
          stream: true
        });

        expect(response).toBeDefined();
        expect(response instanceof Response).toBe(true);
        expect(response.body).toBeDefined();
      });
    });

    describe('Embeddings Generation', () => {
      it('should generate embeddings for single input', async () => {
        const result = await provider.generateEmbeddings({ input: 'test input' });
        expect(result.data).toHaveLength(1);
        expect(result.data[0].embedding).toHaveLength(1536);
      });

      it('should generate embeddings for multiple inputs', async () => {
        const result = await provider.generateEmbeddings({
          input: ['test input 1', 'test input 2']
        });
        expect(result.data).toHaveLength(2);
      });

      it('should handle embeddings errors', async () => {
        const mockClient = {
          embeddings: {
            create: vi.fn().mockRejectedValue(new Error('API Error'))
          }
        };

        const errorProvider = new AzureOpenAIProvider({
          ...baseConfig,
          client: mockClient as any
        });

        await expect(errorProvider.generateEmbeddings({
          input: 'test input'
        })).rejects.toThrow('Failed to generate embeddings');
      });
    });
  });
});
