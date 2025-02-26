import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleProvider } from '../providers/google/provider';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingsError } from '../core/embeddings';

// Mock response data
const mockResponseText = 'Test response';
const mockStreamChunk = 'Test streaming response';

// Create mock functions
const mockGenerateContent = vi.fn().mockResolvedValue({
  response: { text: () => mockResponseText }
});

const mockGenerateContentStream = vi.fn().mockResolvedValue({
  stream: [{ text: () => mockStreamChunk }]
});

// Create a mock client that we'll inject directly
const mockClient = {
  getGenerativeModel: vi.fn().mockReturnValue({
    generateContent: mockGenerateContent,
    generateContentStream: mockGenerateContentStream,
    startChat: vi.fn().mockReturnValue({
      sendMessage: vi.fn().mockResolvedValue({
        response: { text: () => 'Mock chat response' }
      })
    })
  })
};

// Mock the GoogleGenerativeAI constructor
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => mockClient)
  };
});

describe('Google Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should throw error when API key is missing', () => {
      expect(() => new GoogleProvider({})).toThrow('Either API key or service account credentials must be provided');
    });

    it('should create valid configuration with API key', () => {
      const provider = new GoogleProvider({ apiKey: 'test-api-key' });
      expect(provider).toBeInstanceOf(GoogleProvider);
    });

    it('should override default configuration values', () => {
      const provider = new GoogleProvider({
        apiKey: 'test-api-key',
        model: 'gemini-1.5-pro',
        temperature: 0.5,
        maxTokens: 500
      });

      // @ts-ignore - accessing protected property for testing
      expect(provider.config.model).toBe('gemini-1.5-pro');
      // @ts-ignore - accessing protected property for testing
      expect(provider.config.temperature).toBe(0.5);
      // @ts-ignore - accessing protected property for testing
      expect(provider.config.maxTokens).toBe(500);
    });

    it('should handle invalid API key', async () => {
      // @ts-expect-error - Testing invalid configuration
      const provider = new GoogleProvider({ apiKey: 'invalid' });

      // @ts-expect-error - Testing error handling
      const response = await provider.generateText('Test prompt');

      // @ts-expect-error - Testing response parsing
      const data = await response.json();

      expect(data.error).toBeDefined();
      expect(data.error.message).toContain('API key');
    });
  });

  describe('Client Creation', () => {
    it('should create Google client with config', () => {
      new GoogleProvider({ apiKey: 'test-api-key' });
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
    });

    it('should use provided client if available', () => {
      const customClient = { ...mockClient };
      const provider = new GoogleProvider({
        apiKey: 'test-api-key',
        client: customClient as any
      });

      // @ts-ignore - accessing private property for testing
      expect(provider.client).toBe(customClient);
    });
  });

  describe('Provider Implementation', () => {
    describe('Text Generation', () => {
      it('should generate text with default options', async () => {
        const provider = new GoogleProvider({
          apiKey: 'test-api-key'
        });

        const response = await provider.generateText('Test prompt');
        const responseData = await response.json();

        expect(responseData.content).toBe('Test response');
        expect(responseData.model).toBe('test-model');
      });

      it('should handle streaming', async () => {
        const provider = new GoogleProvider({
          apiKey: 'test-api-key'
        });

        const response = await provider.generateText('Test prompt', { stream: true });

        expect(response.body).toBeDefined();

        // Test reading from the stream
        const reader = response.body?.getReader();
        if (reader) {
          const { value, done } = await reader.read();
          const decoded = new TextDecoder().decode(value);
          const data = JSON.parse(decoded);
          expect(data.content).toBe('Test streaming response');
        }
      });

      it('should handle rate limits', async () => {
        const provider = new GoogleProvider({ apiKey: 'test-api-key' });

        // @ts-expect-error - Testing error handling
        const response = await provider.generateText('Test prompt that triggers rate limit');
        const done = await response.json();

        expect(response.status).toBe(429);
      });
    });

    describe('Embeddings', () => {
      it('should throw error for embeddings generation', async () => {
        const provider = new GoogleProvider({ apiKey: 'test-api-key' });

        await expect(provider.generateEmbeddings({ input: ['test'] }))
          .rejects.toThrow(EmbeddingsError);
      });
    });
  });
});
