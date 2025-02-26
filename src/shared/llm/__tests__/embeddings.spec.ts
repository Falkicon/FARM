import { describe, it, expect, vi } from 'vitest';
import {
  normalizeVector,
  cosineSimilarity,
  euclideanDistance,
  findSimilarEmbeddings,
  EmbeddingsError
} from '../core/embeddings';
import {
  OpenAIEmbeddingsProvider,
  DEFAULT_OPENAI_EMBEDDINGS_CONFIG,
  type OpenAIEmbeddingsConfig
} from '../providers/openai/embeddings';

describe('Embeddings Core', () => {
  describe('Vector Operations', () => {
    it('should normalize vectors to unit length', () => {
      const vector = [3, 4]; // 3-4-5 triangle
      const normalized = normalizeVector(vector);

      // Length should be 1
      const length = Math.sqrt(normalized.reduce((sum, val) => sum + val * val, 0));
      expect(length).toBeCloseTo(1);

      // Proportions should be maintained
      expect(normalized[0]).toBeCloseTo(0.6); // 3/5
      expect(normalized[1]).toBeCloseTo(0.8); // 4/5
    });

    describe('Similarity Calculations', () => {
      it('should calculate cosine similarity correctly', () => {
        const a = [1, 0, 0];
        const b = [1, 0, 0];
        const c = [0, 1, 0];

        // Same vector should have similarity 1
        expect(cosineSimilarity(a, b)).toBeCloseTo(1);

        // Perpendicular vectors should have similarity 0
        expect(cosineSimilarity(a, c)).toBeCloseTo(0);
      });

      it('should calculate euclidean distance correctly', () => {
        const a = [1, 0, 0];
        const b = [0, 1, 0];

        expect(euclideanDistance(a, b)).toBeCloseTo(Math.sqrt(2));
      });

      it('should throw error for vectors of different lengths', () => {
        const a = [1, 0];
        const b = [1, 2, 3];

        expect(() => cosineSimilarity(a, b)).toThrow('Vectors must have the same length');
        expect(() => euclideanDistance(a, b)).toThrow('Vectors must have the same length');
      });
    });
  });

  describe('Similarity Search', () => {
    it('should find most similar embeddings', () => {
      const query = [1, 0, 0];
      const embeddings = [
        { embedding: [1, 0, 0], metadata: { id: 1 } },    // Same as query
        { embedding: [0, 1, 0], metadata: { id: 2 } },    // Perpendicular
        { embedding: [-1, 0, 0], metadata: { id: 3 } },   // Opposite
        { embedding: [0.9, 0.1, 0], metadata: { id: 4 } } // Similar
      ];

      const results = findSimilarEmbeddings(query, embeddings, 2);

      expect(results).toHaveLength(2);
      expect(results[0].similarity).toBeCloseTo(1);     // Exact match
      expect(results[0].metadata.id).toBe(1);
      expect(results[1].similarity).toBeCloseTo(0.994); // Similar vector
      expect(results[1].metadata.id).toBe(4);
    });

    it('should respect topK parameter', () => {
      const query = [1, 0];
      const embeddings = Array(10).fill(0).map((_, i) => ({
        embedding: [1, i / 10],
        metadata: { id: i }
      }));

      const results = findSimilarEmbeddings(query, embeddings, 3);
      expect(results).toHaveLength(3);
    });
  });
});

describe('OpenAI Embeddings Provider', () => {
  const baseConfig: OpenAIEmbeddingsConfig = {
    provider: 'openai',
    apiKey: 'test-key',
    model: 'text-embedding-ada-002'
  };

  describe('Configuration', () => {
    it('should use default configuration values', () => {
      const provider = new OpenAIEmbeddingsProvider(baseConfig);

      expect(provider['config'].model).toBe('text-embedding-ada-002');
      expect(provider['config'].dimensions).toBe(DEFAULT_OPENAI_EMBEDDINGS_CONFIG.dimensions);
      expect(provider['config'].normalize).toBe(DEFAULT_OPENAI_EMBEDDINGS_CONFIG.normalize);
    });

    it('should allow overriding configuration values', () => {
      const config: OpenAIEmbeddingsConfig = {
        ...baseConfig,
        dimensions: 512,
        normalize: true
      };
      const provider = new OpenAIEmbeddingsProvider(config);

      expect(provider['config'].dimensions).toBe(512);
      expect(provider['config'].normalize).toBe(true);
    });
  });

  describe('Embeddings Generation', () => {
    it('should generate embeddings for single input', async () => {
      const mockClient = {
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: [{ embedding: Array(1536).fill(0.1) }],
            usage: {
              prompt_tokens: 10,
              total_tokens: 10
            }
          })
        }
      };

      const provider = new OpenAIEmbeddingsProvider({
        ...baseConfig,
        client: mockClient as any
      });

      const result = await provider.generateEmbeddings({ input: 'test input' });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].embedding).toHaveLength(1536);
    });

    it('should generate embeddings for multiple inputs', async () => {
      const mockClient = {
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: [
              { embedding: Array(1536).fill(0.1) },
              { embedding: Array(1536).fill(0.2) }
            ],
            usage: {
              prompt_tokens: 20,
              total_tokens: 20
            }
          })
        }
      };

      const provider = new OpenAIEmbeddingsProvider({
        ...baseConfig,
        client: mockClient as any
      });

      const result = await provider.generateEmbeddings({
        input: ['test input 1', 'test input 2']
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].embedding).toHaveLength(1536);
      expect(result.data[1].embedding).toHaveLength(1536);
    });

    it('should handle API errors gracefully', async () => {
      const mockClient = {
        embeddings: {
          create: vi.fn().mockRejectedValue(new Error('API Error'))
        }
      };

      const provider = new OpenAIEmbeddingsProvider({
        ...baseConfig,
        client: mockClient as any
      });

      await expect(provider.generateEmbeddings({
        input: 'test input'
      })).rejects.toThrow(EmbeddingsError);
    });

    it('should validate input', async () => {
      const provider = new OpenAIEmbeddingsProvider(baseConfig);

      await expect(provider.generateEmbeddings({
        input: {} as any // Invalid input type
      })).rejects.toThrow(EmbeddingsError);
    });

    it('should normalize embeddings when configured', async () => {
      const mockClient = {
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: [{ embedding: [0.5, 0.5, 0.5] }],
            usage: {
              prompt_tokens: 10,
              total_tokens: 10
            }
          })
        }
      };

      const provider = new OpenAIEmbeddingsProvider({
        ...baseConfig,
        normalize: true,
        client: mockClient as any
      });

      const result = await provider.generateEmbeddings({ input: 'test input' });
      const normalizedVector = [
        0.5773502691896258,
        0.5773502691896258,
        0.5773502691896258
      ];
      expect(result.data[0].embedding).toEqual(normalizedVector);
    });
  });
});
