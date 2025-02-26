/**
 * @fileoverview Tests for the new OpenAI provider implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OpenAIProviderNew, setMockClient } from '../providers/openai/provider-new';
import { ConfigurationError, AuthenticationError, RateLimitError, APIError } from '../core/errors';
import * as envModule from '../core/env';

describe('OpenAIProviderNew', () => {
  // Mock the isTestEnvironment function
  const isTestEnvironmentMock = vi.fn();

  // Create a mock OpenAI client
  const mockOpenAIClient = {
    chat: {
      completions: {
        create: vi.fn().mockImplementation((params) => {
          console.log('Mock chat.completions.create called with params:', JSON.stringify(params));

          // Return different responses based on the test case
          if (params.functions && params.function_call) {
            const response = {
              choices: [
                {
                  message: {
                    function_call: {
                      name: params.functions[0].name,
                      arguments: JSON.stringify({ test: 'value' }),
                    },
                    content: null,
                  },
                },
              ],
              model: 'gpt-4',
              usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
            };
            console.log('Mock returning function call response:', JSON.stringify(response));
            return response;
          } else if (params.messages.some((m: any) => m.role === 'system')) {
            const response = {
              choices: [
                {
                  message: {
                    content: 'Mock API response with system message',
                    function_call: undefined,
                  },
                },
              ],
              model: 'gpt-4',
              usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
            };
            console.log('Mock returning system message response:', JSON.stringify(response));
            return response;
          }

          // Default response
          const response = {
            choices: [
              {
                message: {
                  content: 'Mock API response',
                  function_call: undefined,
                },
              },
            ],
            model: 'gpt-4',
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
          };
          console.log('Mock returning default response:', JSON.stringify(response));
          return response;
        }),
      },
    },
    embeddings: {
      create: vi.fn().mockImplementation((params) => {
        console.log('Mock embeddings.create called with params:', JSON.stringify(params));

        // Handle array inputs
        if (Array.isArray(params.input)) {
          const embeddings = params.input.map((_: any, index: number) => ({
            embedding: index === 0 ? [0.1, 0.2, 0.3] : [0.4, 0.5, 0.6],
          }));
          const response = {
            data: embeddings,
            model: 'text-embedding-3-small',
            usage: { prompt_tokens: params.input.length * 10, total_tokens: params.input.length * 10 },
          };
          console.log('Mock returning array embeddings response:', JSON.stringify(response));
          return response;
        }

        // Default response for single input
        const response = {
          data: [{ embedding: [0.1, 0.2, 0.3] }],
          model: 'text-embedding-3-small',
          usage: { prompt_tokens: 10, total_tokens: 10 },
        };
        console.log('Mock returning single embedding response:', JSON.stringify(response));
        return response;
      }),
    },
  };

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Mock the isTestEnvironment function to always return true
    vi.spyOn(envModule, 'isTestEnvironment').mockImplementation(() => true);

    // Set the mock client
    setMockClient(mockOpenAIClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Create a provider instance for each test
  let provider: OpenAIProviderNew;

  beforeEach(() => {
    provider = new OpenAIProviderNew({
      provider: 'openai',
      apiKey: 'test-api-key',
      model: 'test-model',
      embeddingModel: 'test-embedding-model',
    });
  });

  // Helper function to create a provider with the mock client
  function createProviderWithMockClient() {
    // Set the mock client first
    setMockClient(mockOpenAIClient);

    // Create a new provider
    const testProvider = new OpenAIProviderNew({
      provider: 'openai',
      apiKey: 'test-api-key',
      model: 'gpt-4',
      embeddingModel: 'text-embedding-3-small',
    });

    // Debug: Check if the client is properly set
    console.log('Mock client set:', !!mockOpenAIClient);
    console.log('Provider client set:', !!(testProvider as any).client);

    return testProvider;
  }

  describe('constructor', () => {
    it('should initialize with valid configuration', () => {
      const provider = new OpenAIProviderNew({
        provider: 'openai',
        apiKey: 'test-api-key',
      });

      expect(provider).toBeDefined();
      expect(provider.getProviderName()).toBe('openai');
    });

    it('should throw if configuration is invalid', () => {
      expect(() => new OpenAIProviderNew(null as any)).toThrow(ConfigurationError);
      expect(() => new OpenAIProviderNew({} as any)).toThrow(ConfigurationError);
    });
  });

  describe('generateText', () => {
    it('should return mock response in test environment', async () => {
      isTestEnvironmentMock.mockReturnValue(true);

      const response = await provider.generateText('Test prompt');

      expect(response).toBeDefined();
      expect(response.content).toContain('mock response');
      expect(response.model).toBe('test-model');
      expect(mockOpenAIClient.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should call OpenAI API with correct parameters', async () => {
      // Create a provider with the mock client
      const testProvider = createProviderWithMockClient();

      // Set up the mock to return a specific response
      mockOpenAIClient.chat.completions.create.mockReturnValueOnce({
        choices: [
          {
            message: {
              content: 'Mock API response',
              function_call: undefined,
            },
          },
        ],
        model: 'gpt-4',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      });

      // Call the method
      const response = await testProvider.generateText('Test prompt', { bypassTestMock: true });

      // Verify the mock was called with the correct parameters
      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test prompt' }],
        }),
      );

      // Verify the response
      expect(response).toBeDefined();
      expect(response.content).toBe('Mock API response');
      expect(response.model).toBe('gpt-4');
      expect(response.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      });
    });

    it('should handle system messages', async () => {
      // Create a provider with the mock client
      const testProvider = createProviderWithMockClient();

      // Set up the mock to return a specific response
      mockOpenAIClient.chat.completions.create.mockReturnValueOnce({
        choices: [
          {
            message: {
              content: 'Mock API response with system message',
              function_call: undefined,
            },
          },
        ],
        model: 'gpt-4',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      });

      // Call the method
      await testProvider.generateText('Test prompt', {
        systemMessage: 'You are a helpful assistant',
        bypassTestMock: true,
      });

      // Verify the mock was called with the correct parameters
      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: 'Test prompt' },
          ],
        }),
      );
    });

    it('should handle API errors', async () => {
      // Create a provider with the mock client
      const errorProvider = createProviderWithMockClient();

      // Mock authentication error
      mockOpenAIClient.chat.completions.create.mockRejectedValueOnce({
        status: 401,
        message: 'Invalid API key',
      });

      await expect(errorProvider.generateText('Test prompt', { bypassTestMock: true })).rejects.toThrow(
        AuthenticationError,
      );

      // Mock rate limit error
      mockOpenAIClient.chat.completions.create.mockRejectedValueOnce({
        status: 429,
        message: 'Rate limit exceeded',
      });

      await expect(errorProvider.generateText('Test prompt', { bypassTestMock: true })).rejects.toThrow(RateLimitError);

      // Mock generic API error
      mockOpenAIClient.chat.completions.create.mockRejectedValueOnce({
        status: 500,
        message: 'Server error',
      });

      await expect(errorProvider.generateText('Test prompt', { bypassTestMock: true })).rejects.toThrow(APIError);
    });
  });

  describe('generateStructured', () => {
    it('should return mock response in test environment', async () => {
      isTestEnvironmentMock.mockReturnValue(true);

      const response = await provider.generateStructured('Test prompt', {
        functionName: 'testFunction',
        functionDescription: 'Test function',
        parameters: {
          type: 'object',
          properties: {
            test: { type: 'string' },
          },
        },
      });

      expect(response).toBeDefined();
      expect(response.content).toEqual(expect.objectContaining({ result: 'mock data' }));
      expect(response.model).toBe('test-model');
      expect(mockOpenAIClient.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should call OpenAI API with correct parameters', async () => {
      // Create a provider with the mock client
      const testProvider = createProviderWithMockClient();

      // Set up the mock to return a specific response
      mockOpenAIClient.chat.completions.create.mockReturnValueOnce({
        choices: [
          {
            message: {
              function_call: {
                name: 'testFunction',
                arguments: JSON.stringify({ test: 'value' }),
              },
              content: null,
            },
          },
        ],
        model: 'gpt-4',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      });

      // Call the method
      const response = await testProvider.generateStructured('Test prompt', {
        functionName: 'testFunction',
        functionDescription: 'Test function',
        parameters: {
          type: 'object',
          properties: {
            test: { type: 'string' },
          },
        },
        bypassTestMock: true,
      });

      // Verify the mock was called with the correct parameters
      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test prompt' }],
          functions: [
            {
              name: 'testFunction',
              description: 'Test function',
              parameters: {
                type: 'object',
                properties: {
                  test: { type: 'string' },
                },
              },
            },
          ],
          function_call: { name: 'testFunction' },
        }),
      );

      // Verify the response
      expect(response).toBeDefined();
      expect(response.content).toEqual({ test: 'value' });
      expect(response.model).toBe('gpt-4');
      expect(response.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      });
    });
  });

  describe('generateEmbeddings', () => {
    it('should return mock response in test environment', async () => {
      isTestEnvironmentMock.mockReturnValue(true);

      const response = await provider.generateEmbeddings('Test input');

      expect(response).toBeDefined();
      expect(response.embeddings).toHaveLength(1);
      expect(response.model).toBe('test-embedding-model');
      expect(mockOpenAIClient.embeddings.create).not.toHaveBeenCalled();
    });

    it('should call OpenAI API with correct parameters', async () => {
      // Create a provider with the mock client
      const testProvider = createProviderWithMockClient();

      // Set up the mock to return a specific response
      mockOpenAIClient.embeddings.create.mockReturnValueOnce({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
        model: 'text-embedding-3-small',
        usage: { prompt_tokens: 10, total_tokens: 10 },
      });

      // Call the method
      const response = await testProvider.generateEmbeddings('Test input', { bypassTestMock: true });

      // Verify the mock was called with the correct parameters
      expect(mockOpenAIClient.embeddings.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'text-embedding-3-small',
          input: ['Test input'],
        }),
      );

      // Verify the response
      expect(response).toBeDefined();
      expect(response.embeddings).toEqual([[0.1, 0.2, 0.3]]);
      expect(response.model).toBe('text-embedding-3-small');
      expect(response.usage).toEqual({
        promptTokens: 10,
        totalTokens: 10,
      });
    });

    it('should handle array inputs', async () => {
      // Create a provider with the mock client
      const testProvider = createProviderWithMockClient();

      // Set up the mock to return a specific response
      mockOpenAIClient.embeddings.create.mockReturnValueOnce({
        data: [{ embedding: [0.1, 0.2, 0.3] }, { embedding: [0.4, 0.5, 0.6] }],
        model: 'text-embedding-3-small',
        usage: { prompt_tokens: 20, total_tokens: 20 },
      });

      // Call the method
      const response = await testProvider.generateEmbeddings(['Input 1', 'Input 2'], { bypassTestMock: true });

      // Verify the mock was called with the correct parameters
      expect(mockOpenAIClient.embeddings.create).toHaveBeenCalledWith(
        expect.objectContaining({
          input: ['Input 1', 'Input 2'],
        }),
      );

      // Verify the response
      expect(response.embeddings).toEqual([
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ]);
    });
  });
});
