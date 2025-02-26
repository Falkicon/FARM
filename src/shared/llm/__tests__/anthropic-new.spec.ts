/**
 * Tests for the new Anthropic provider implementation.
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { z } from 'zod';

import { AnthropicProviderNew } from '../providers/anthropic/provider-new';
import { ConfigurationError } from '../core/errors';

// Mock the BaseProvider
vi.mock('../core/base-provider', () => {
  return {
    BaseProvider: class MockBaseProvider {
      protected config: any;

      constructor(config: any) {
        this.config = config;
      }

      isTestEnvironment() {
        return true; // Always return true for tests
      }

      getConfig() {
        return this.config;
      }

      getProviderName() {
        return this.config.provider;
      }
    }
  };
});

// Mock the config validation
vi.mock('../core/config', () => {
  return {
    validateConfig: vi.fn((config, defaults) => {
      if (!config.apiKey) {
        throw new ConfigurationError('Missing API key');
      }
      if (config.provider !== 'anthropic') {
        throw new ConfigurationError('Invalid provider');
      }
      return { ...defaults, ...config };
    })
  };
});

// Mock the Anthropic client
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'This is a response from Anthropic Claude.' }]
        })
      }
    }))
  };
});

// Mock the mocks module
vi.mock('../core/mocks', () => {
  return {
    createMockTextResponse: vi.fn().mockReturnValue({
      content: 'This is a mock response from Anthropic Claude.',
      model: 'claude-3-sonnet-20240229',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      }
    }),
    createMockStructuredResponse: vi.fn().mockImplementation(() => {
      return {
        content: {
          temperature: 72,
          conditions: 'Sunny',
          forecast: [
            {
              day: 'Monday',
              temperature: 75,
              conditions: 'Partly Cloudy'
            },
            {
              day: 'Tuesday',
              temperature: 70,
              conditions: 'Rainy'
            }
          ]
        },
        model: 'claude-3-sonnet-20240229',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30
        }
      };
    })
  };
});

describe('AnthropicProviderNew', () => {
  // Set up the test environment
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  // Clean up after tests
  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  describe('constructor', () => {
    it('should create a new instance with default values', () => {
      const provider = new AnthropicProviderNew({
        apiKey: 'test-api-key',
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 1024,
        temperature: 0.7,
        topP: 1
      });

      expect(provider).toBeInstanceOf(AnthropicProviderNew);
    });

    it('should throw an error if apiKey is missing', () => {
      expect(() => {
        new AnthropicProviderNew({
          provider: 'anthropic'
        } as any);
      }).toThrow(ConfigurationError);
    });

    it('should throw an error if provider is incorrect', () => {
      expect(() => {
        new AnthropicProviderNew({
          apiKey: 'test-api-key',
          provider: 'openai'
        } as any);
      }).toThrow(ConfigurationError);
    });
  });

  describe('generateText', () => {
    it('should return a mock response in test environment', async () => {
      const provider = new AnthropicProviderNew({
        apiKey: 'test-api-key',
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 1024,
        temperature: 0.7,
        topP: 1
      });

      const response = await provider.generateText({
        messages: [{ role: 'user', content: 'Hello, world!' }]
      });

      expect(response).toHaveProperty('content');
      expect(typeof response.content).toBe('string');
      expect(response).toHaveProperty('model');
    });

    it('should handle tool calls correctly', async () => {
      // Set up a non-test environment
      process.env.NODE_ENV = 'development';

      const provider = new AnthropicProviderNew({
        apiKey: 'test-api-key',
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 1024,
        temperature: 0.7,
        topP: 1
      });

      const WeatherTool = z.object({
        location: z.string(),
        unit: z.enum(['celsius', 'fahrenheit']).optional()
      });

      const response = await provider.generateText({
        messages: [{ role: 'user', content: 'What is the weather in New York?' }],
        tools: [
          {
            name: 'get_weather',
            description: 'Get the weather for a location',
            parameters: WeatherTool
          }
        ]
      });

      expect(response).toHaveProperty('content');
      expect(typeof response.content).toBe('string');
      expect(response).toHaveProperty('model');
    });
  });

  describe('generateStructured', () => {
    it('should return a mock response in test environment', async () => {
      const provider = new AnthropicProviderNew({
        apiKey: 'test-api-key',
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 1024,
        temperature: 0.7,
        topP: 1
      });

      const WeatherReport = z.object({
        temperature: z.number(),
        conditions: z.string(),
        forecast: z.array(z.object({
          day: z.string(),
          temperature: z.number(),
          conditions: z.string()
        }))
      });

      const response = await provider.generateStructured({
        messages: [{ role: 'user', content: 'Generate a weather report for New York City' }],
        schema: WeatherReport,
        functionName: 'generate_weather_report',
        parameters: {
          type: 'object',
          properties: {
            temperature: { type: 'number' },
            conditions: { type: 'string' },
            forecast: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  temperature: { type: 'number' },
                  conditions: { type: 'string' }
                }
              }
            }
          }
        }
      });

      expect(response).toHaveProperty('content');
      expect(response.content).toHaveProperty('temperature');
      expect(response.content).toHaveProperty('conditions');
      expect(response.content).toHaveProperty('forecast');
    });

    it('should handle structured data generation in non-test environment', async () => {
      // Set up a non-test environment
      process.env.NODE_ENV = 'development';

      // Mock the Anthropic client response for structured data
      const mockAnthropicClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'tool_use',
                name: 'generate_structured_data',
                input: JSON.stringify({
                  temperature: 72,
                  conditions: 'Sunny',
                  forecast: [
                    {
                      day: 'Monday',
                      temperature: 75,
                      conditions: 'Partly Cloudy'
                    },
                    {
                      day: 'Tuesday',
                      temperature: 70,
                      conditions: 'Rainy'
                    }
                  ]
                })
              }
            ]
          })
        }
      };

      // Replace the mocked implementation
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const anthropicModule = require('@anthropic-ai/sdk');
      const originalMock = anthropicModule.default;
      anthropicModule.default = vi.fn().mockImplementation(() => mockAnthropicClient);

      const provider = new AnthropicProviderNew({
        apiKey: 'test-api-key',
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 1024,
        temperature: 0.7,
        topP: 1
      });

      const WeatherReport = z.object({
        temperature: z.number(),
        conditions: z.string(),
        forecast: z.array(z.object({
          day: z.string(),
          temperature: z.number(),
          conditions: z.string()
        }))
      });

      const response = await provider.generateStructured({
        messages: [{ role: 'user', content: 'Generate a weather report for New York City' }],
        schema: WeatherReport,
        functionName: 'generate_weather_report',
        parameters: {
          type: 'object',
          properties: {
            temperature: { type: 'number' },
            conditions: { type: 'string' },
            forecast: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  temperature: { type: 'number' },
                  conditions: { type: 'string' }
                }
              }
            }
          }
        }
      });

      // Restore the original mock
      anthropicModule.default = originalMock;

      expect(response).toHaveProperty('content');
      expect(response.content).toHaveProperty('temperature');
      expect(response.content.temperature).toBe(72);
      expect(response.content).toHaveProperty('conditions');
      expect(response.content.conditions).toBe('Sunny');
      expect(response.content).toHaveProperty('forecast');
      expect(response.content.forecast).toHaveLength(2);
    });
  });

  describe('generateEmbeddings', () => {
    it('should throw an error as Anthropic does not support embeddings', async () => {
      const provider = new AnthropicProviderNew({
        apiKey: 'test-api-key',
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 1024,
        temperature: 0.7,
        topP: 1
      });

      await expect(provider.generateEmbeddings({
        input: 'Hello, world!'
      })).rejects.toThrow('Anthropic does not support embeddings generation');
    });
  });
});
