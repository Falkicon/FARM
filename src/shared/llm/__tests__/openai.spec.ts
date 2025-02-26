import { describe, it, expect, vi } from 'vitest';
import { initializeOpenAIConfig, createOpenAIClient, createStreamingResponse, type OpenAIConfig } from '../providers/openai/config';
import { testUtils, createMockOpenAIClient } from './setup';

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
            return {
              choices: [{
                delta: { content: 'test response' },
                index: 0,
                finish_reason: null
              }]
            };
          }
          return {
            choices: [{ message: { content: 'test response' } }]
          };
        })
      }
    };
  }
}));

// Mock Vercel AI SDK
vi.mock('ai', () => {
  const mockStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('test response'));
      controller.close();
    }
  });

  return {
    OpenAIStream: vi.fn().mockReturnValue(mockStream)
  };
});

describe('OpenAI Provider', () => {
  describe('Configuration', () => {
    it('should throw error when API key is missing', () => {
      expect(() => initializeOpenAIConfig({
        provider: 'openai',
        model: 'gpt-4'
      })).toThrow('API key must be provided');
    });

    it('should create valid configuration with API key', () => {
      const config = initializeOpenAIConfig({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4'
      });

      expect(config).toMatchObject({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      });
    });

    it('should override default configuration values', () => {
      const config = initializeOpenAIConfig({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-3.5-turbo',
        temperature: 0.9,
        maxTokens: 2000
      });

      expect(config).toMatchObject({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-3.5-turbo',
        temperature: 0.9,
        maxTokens: 2000
      });
    });
  });

  describe('Client Creation', () => {
    it('should create OpenAI client with config', () => {
      const config = testUtils.createMockConfig();
      const client = createOpenAIClient(config as OpenAIConfig);

      expect(client).toBeDefined();
      expect(client.apiKey).toBe('test-key');
    });

    it('should include organization ID when provided', () => {
      const config = testUtils.createMockConfig({ organization: 'test-org' });
      const client = createOpenAIClient(config as OpenAIConfig);

      expect(client.organization).toBe('test-org');
    });
  });

  describe('Streaming', () => {
    it('should create streaming response with default config', async () => {
      const client = createMockOpenAIClient();
      const messages = testUtils.createMockMessages();

      const response = await createStreamingResponse(client, messages);
      expect(response).toBeDefined();
      expect(response instanceof Response).toBe(true);
    });

    it('should use provided configuration for streaming', async () => {
      const client = createMockOpenAIClient();
      const messages = testUtils.createMockMessages();
      const config = {
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        maxTokens: 500
      };

      const response = await createStreamingResponse(client, messages, config);
      expect(response).toBeDefined();
      expect(response instanceof Response).toBe(true);
    });

    it('should handle streaming errors gracefully', async () => {
      const client = createMockOpenAIClient();
      const messages = testUtils.createMockMessages();

      // Mock an error response
      vi.spyOn(client.chat.completions, 'create').mockRejectedValueOnce(
        new Error('API Error')
      );

      await expect(createStreamingResponse(client, messages))
        .rejects.toThrow('API Error');
    });
  });
});
