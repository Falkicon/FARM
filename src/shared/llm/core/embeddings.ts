/**
 * @fileoverview Embeddings functionality for vector representations
 */

import { z } from 'zod';
import type { LLMConfig } from './base';

/**
 * Embeddings configuration
 */
export interface EmbeddingsConfig extends LLMConfig {
  /** Model to use for embeddings (e.g., 'text-embedding-3-small') */
  model: string;
  /** Dimensions of the embedding vectors */
  dimensions?: number;
  /** Whether to normalize the embeddings */
  normalize?: boolean;
}

/**
 * Embeddings input validation schema
 */
export const EmbeddingsInputSchema = z.object({
  /** Text to generate embeddings for */
  input: z.union([z.string(), z.array(z.string())]),
  /** Optional user identifier for tracking */
  user: z.string().optional(),
});

export type EmbeddingsInput = z.infer<typeof EmbeddingsInputSchema>;

/**
 * Embeddings response format
 */
export interface EmbeddingsResponse {
  /** Object type identifier */
  object: 'list';
  /** Array of embedding objects */
  data: Array<{
    /** Object type identifier */
    object: 'embedding';
    /** Embedding vector */
    embedding: number[];
    /** Index in the input array */
    index: number;
  }>;
  /** Model used to generate embeddings */
  model: string;
  /** Usage statistics */
  usage: {
    /** Number of prompt tokens */
    prompt_tokens: number;
    /** Total tokens used */
    total_tokens: number;
  };
}

/**
 * Error thrown when embeddings generation fails
 */
export class EmbeddingsError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'EmbeddingsError';
  }
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

/**
 * Find the most similar embeddings using cosine similarity
 */
export function findSimilarEmbeddings(
  query: number[],
  embeddings: Array<{ embedding: number[]; metadata?: any }>,
  topK: number = 5,
): Array<{ similarity: number; metadata?: any }> {
  return embeddings
    .map((item) => ({
      similarity: cosineSimilarity(query, item.embedding),
      metadata: item.metadata,
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Base class for embeddings providers
 */
export abstract class EmbeddingsProvider {
  protected config: EmbeddingsConfig;

  constructor(config: EmbeddingsConfig) {
    this.config = config;
  }

  /**
   * Generate embeddings for the given input
   */
  abstract generateEmbeddings(input: EmbeddingsInput): Promise<EmbeddingsResponse>;

  /**
   * Process input before generating embeddings
   */
  protected async validateInput(input: unknown): Promise<EmbeddingsInput> {
    try {
      return await EmbeddingsInputSchema.parseAsync(input);
    } catch (error) {
      throw new EmbeddingsError('Invalid embeddings input', error as Error);
    }
  }

  /**
   * Post-process embeddings response
   */
  protected processResponse(response: EmbeddingsResponse): EmbeddingsResponse {
    if (this.config.normalize) {
      response.data = response.data.map((item) => ({
        ...item,
        embedding: normalizeVector(item.embedding),
      }));
    }
    return response;
  }
}
