/**
 * @fileoverview Azure OpenAI provider implementation
 */

import OpenAI from 'openai';
import {
  EmbeddingsProvider,
  type EmbeddingsInput,
  type EmbeddingsResponse,
  EmbeddingsError,
} from '../../core/embeddings';
import {
  initializeAzureOpenAIConfig,
  createAzureOpenAIClient,
  createStreamingResponse,
  type AzureOpenAIConfig,
} from './config';

// Define message types for API communication
type MessageRole = 'user' | 'assistant' | 'system';
type Message = {
  role: MessageRole;
  content: string;
};

/**
 * Azure OpenAI provider implementation
 */
export class AzureOpenAIProvider extends EmbeddingsProvider {
  private client: OpenAI;
  protected config: AzureOpenAIConfig;

  constructor(config: Partial<AzureOpenAIConfig>) {
    // Initialize configuration
    const fullConfig = initializeAzureOpenAIConfig(config);
    super(fullConfig);
    this.config = fullConfig;

    // Create client
    this.client = config.client ?? createAzureOpenAIClient(fullConfig);
  }

  /**
   * Generate text using Azure OpenAI
   */
  async generateText(
    prompt: string,
    options: {
      stream?: boolean;
      systemMessage?: string;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<Response> {
    try {
      // Prepare messages
      const messages: Message[] = [];

      // Add system message if provided
      if (options.systemMessage) {
        messages.push({
          role: 'system',
          content: options.systemMessage,
        });
      }

      // Add user prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      // Handle streaming
      if (options.stream) {
        return createStreamingResponse(this.client, messages, {
          ...this.config,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        });
      }

      // Handle non-streaming
      const completion = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages,
        temperature: options.temperature ?? this.config.temperature,
        max_tokens: options.maxTokens ?? this.config.maxTokens,
      });

      // Return completion as a Response object
      return new Response(
        JSON.stringify({
          content: completion.choices[0]?.message?.content || '',
          model: completion.model,
          usage: completion.usage,
        }),
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during text generation');
    }
  }

  /**
   * Generate structured data using Azure OpenAI
   */
  async generateStructured(
    prompt: string,
    options: {
      stream?: boolean;
      systemMessage?: string;
      temperature?: number;
      maxTokens?: number;
      functionName: string;
      functionDescription: string;
      parameters: Record<string, unknown>;
    },
  ): Promise<Response> {
    try {
      // Prepare messages
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      // Add system message if provided
      if (options.systemMessage) {
        messages.push({
          role: 'system',
          content: options.systemMessage,
        });
      }

      // Add user prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      // Create function definition
      const functionDefinition = {
        name: options.functionName,
        description: options.functionDescription,
        parameters: options.parameters,
      };

      // Handle streaming
      if (options.stream) {
        const response = await this.client.chat.completions.create({
          model: this.config.deploymentName,
          messages,
          temperature: options.temperature ?? this.config.temperature,
          max_tokens: options.maxTokens ?? this.config.maxTokens,
          stream: true,
          functions: [functionDefinition],
          function_call: { name: functionDefinition.name },
        });

        if (!response) {
          throw new Error('No response body available for streaming');
        }

        // Create a stream manually for testing
        const stream = new ReadableStream({
          start: (controller) => {
            const processStream = async () => {
              try {
                for await (const chunk of response) {
                  const functionCall = chunk.choices[0]?.delta?.function_call;
                  if (functionCall?.arguments) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        JSON.stringify({
                          content: functionCall.arguments,
                          model: this.config.deploymentName,
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
            };
            processStream();
          },
        });

        return new Response(stream);
      }

      // Handle non-streaming
      const completion = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages,
        temperature: options.temperature ?? this.config.temperature,
        max_tokens: options.maxTokens ?? this.config.maxTokens,
        functions: [functionDefinition],
        function_call: { name: functionDefinition.name },
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No structured data generated');
      }

      // Return completion as a Response object
      return new Response(
        JSON.stringify({
          content: JSON.parse(functionCall.arguments),
          model: completion.model,
          usage: completion.usage,
        }),
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during structured data generation');
    }
  }

  /**
   * Generate embeddings using Azure OpenAI
   */
  async generateEmbeddings(input: EmbeddingsInput): Promise<EmbeddingsResponse> {
    try {
      // Validate input
      const validatedInput = await this.validateInput(input);

      // Convert input to array if string
      const inputs = Array.isArray(validatedInput.input) ? validatedInput.input : [validatedInput.input];

      // Generate embeddings
      const response = await this.client.embeddings.create({
        model: this.config.deploymentName,
        input: inputs,
        dimensions: this.config.dimensions,
        user: validatedInput.user,
      });

      // Format response
      const result: EmbeddingsResponse = {
        object: 'list',
        data: response.data.map((item, index) => ({
          object: 'embedding',
          embedding: item.embedding,
          index,
        })),
        model: response.model,
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          total_tokens: response.usage.total_tokens,
        },
      };

      // Post-process response (e.g., normalize vectors)
      return this.processResponse(result);
    } catch (error) {
      if (error instanceof Error) {
        throw new EmbeddingsError('Failed to generate embeddings', error);
      }
      throw new EmbeddingsError('Unknown error occurred during embeddings generation');
    }
  }
}
