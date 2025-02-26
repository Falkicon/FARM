/**
 * @fileoverview Standardized mock responses for testing
 */

import type { TextGenerationResponse, StructuredDataResponse, EmbeddingResponse } from '../types/core';

/**
 * Create a mock text generation response
 * @param content The response content
 * @param model The model name
 * @returns A Response object with the mock text generation response
 */
export function createMockTextResponse(content: string = 'Test response', model: string = 'test-model'): Response {
  const mockResponse: TextGenerationResponse = {
    content,
    model,
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    },
  };

  return new Response(JSON.stringify(mockResponse), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a mock structured data response
 * @param content The structured data content
 * @param model The model name
 * @returns A Response object with the mock structured data response
 */
export function createMockStructuredResponse<T = any>(content: T, model: string = 'test-model'): Response {
  const mockResponse: StructuredDataResponse<T> = {
    content,
    model,
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    },
  };

  return new Response(JSON.stringify(mockResponse), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a mock embeddings response
 * @param dimensions The number of dimensions for the embedding vectors
 * @param count The number of embedding vectors to generate
 * @param model The model name
 * @returns A mock embeddings response
 */
export function createMockEmbeddingsResponse(
  dimensions: number = 3,
  count: number = 1,
  model: string = 'test-embedding-model',
): EmbeddingResponse {
  // Generate mock embeddings with the specified dimensions
  const embeddings: number[][] = Array.from({ length: count }, () =>
    Array.from({ length: dimensions }, (_, i) => (i + 1) / dimensions),
  );

  return {
    embeddings,
    model,
    usage: {
      promptTokens: count * 5,
      totalTokens: count * 5,
    },
  };
}

/**
 * Create a mock streaming text response
 * @param chunks The text chunks to stream
 * @param model The model name
 * @returns A Response object with the streaming text response
 */
export function createMockStreamingResponse(
  chunks: string[] = ['Hello', ', ', 'world', '!'],
  model: string = 'test-model',
): Response {
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        const data = JSON.stringify({
          content: chunk,
          model,
        });
        controller.enqueue(new TextEncoder().encode(data));
        // Add a small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/json' },
  });
}
