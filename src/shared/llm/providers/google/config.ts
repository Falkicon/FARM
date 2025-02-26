/**
 * @fileoverview Google (Gemini) provider configuration for Vercel AI SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAuth } from 'google-auth-library';
import type { LLMConfig } from '../../core/base';

/**
 * Google-specific configuration options
 */
export interface GoogleConfig extends LLMConfig {
  provider: 'google';
  /** Google API key */
  apiKey: string;
  /** Google model to use (e.g., 'gemini-pro') */
  model: string;
  /** Base URL for API requests */
  baseUrl?: string;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Temperature for response generation */
  temperature?: number;
  /** Pre-configured Google client (for testing) */
  client?: GoogleGenerativeAI;
  /** Service account credentials for authentication (alternative to API key) */
  serviceAccountCredentials?: {
    clientEmail: string;
    privateKey: string;
    projectId: string;
  };
}

/**
 * Default configuration for Google
 */
export const DEFAULT_GOOGLE_CONFIG: Partial<GoogleConfig> = {
  provider: 'google',
  model: 'gemini-pro',
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * Initialize Google configuration
 */
export function initializeGoogleConfig(config: Partial<GoogleConfig>): GoogleConfig {
  if (!config.apiKey && !config.serviceAccountCredentials && !config.client) {
    throw new Error('Either API key or service account credentials must be provided for Google configuration');
  }

  return {
    ...DEFAULT_GOOGLE_CONFIG,
    ...config,
  } as GoogleConfig;
}

/**
 * Create Google client instance
 */
export function createGoogleClient(config: GoogleConfig): GoogleGenerativeAI {
  if (!config.apiKey && !config.serviceAccountCredentials) {
    throw new Error('Either Google API key or service account credentials are required');
  }

  // If API key is provided, use it
  if (config.apiKey) {
    return new GoogleGenerativeAI(config.apiKey);
  }

  // If service account credentials are provided, use them
  if (config.serviceAccountCredentials) {
    const auth = new GoogleAuth({
      credentials: {
        client_email: config.serviceAccountCredentials.clientEmail,
        private_key: config.serviceAccountCredentials.privateKey,
        project_id: config.serviceAccountCredentials.projectId,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // Create client with auth
    // Note: The Gemini API doesn't directly support service account auth in the same way
    // This is a placeholder for future implementation
    throw new Error('Service account authentication is not yet supported for Google Gemini');
  }

  // This should never happen due to the check at the beginning
  throw new Error('No authentication method provided for Google client');
}

/**
 * Create a streaming response from Google
 */
export async function createStreamingResponse(
  client: GoogleGenerativeAI,
  messages: Array<{ role: 'user' | 'model' | 'system'; content: string }>,
  config: Partial<GoogleConfig> = {}
): Promise<Response> {
  try {
    const model = client.getGenerativeModel({
      model: config.model ?? DEFAULT_GOOGLE_CONFIG.model!,
      generationConfig: {
        maxOutputTokens: config.maxTokens ?? DEFAULT_GOOGLE_CONFIG.maxTokens,
        temperature: config.temperature ?? DEFAULT_GOOGLE_CONFIG.temperature,
      }
    });

    // Convert messages to Google format
    const chatSession = model.startChat();
    const prompt = convertMessagesToPrompt(messages);

    // Start streaming generation
    const result = await model.generateContentStream(prompt);

    if (!result) {
      throw new Error('No response body available for streaming');
    }

    // Create a stream manually
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const content = chunk.text();
            if (content) {
              controller.enqueue(new TextEncoder().encode(JSON.stringify({
                content,
                model: config.model ?? DEFAULT_GOOGLE_CONFIG.model,
                usage: {
                  prompt_tokens: 0,
                  completion_tokens: 0,
                  total_tokens: 0
                }
              })));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during streaming');
  }
}

/**
 * Convert messages array to Google prompt format
 */
function convertMessagesToPrompt(messages: Array<{ role: 'user' | 'model' | 'system'; content: string }>): string {
  let systemMessage = '';
  let prompt = '';

  // Extract system message if present
  const systemMessages = messages.filter(msg => msg.role === 'system');
  if (systemMessages.length > 0) {
    systemMessage = systemMessages.map(msg => msg.content).join('\n');
  }

  // Build conversation
  const conversationMessages = messages.filter(msg => msg.role !== 'system');

  for (const message of conversationMessages) {
    if (message.role === 'user') {
      prompt += `User: ${message.content}\n`;
    } else if (message.role === 'model') {
      prompt += `Assistant: ${message.content}\n`;
    }
  }

  // Add system message as a prefix if present
  if (systemMessage) {
    prompt = `System: ${systemMessage}\n${prompt}`;
  }

  // Add final assistant prompt
  if (!prompt.endsWith('Assistant: ')) {
    prompt += 'Assistant: ';
  }

  return prompt;
}
