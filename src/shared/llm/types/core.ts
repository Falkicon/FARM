/**
 * @fileoverview Core type definitions for the LLM module
 */

/**
 * Base request options for all LLM requests
 */
export interface BaseRequestOptions {
  /** Model to use for the request */
  model?: string;
  /** Temperature for controlling randomness (0-1) */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Whether to stream the response */
  stream?: boolean;
  /** System message to set context for the conversation */
  systemMessage?: string;
  /** Any additional provider-specific options */
  [key: string]: any;
}

/**
 * Options for text generation requests
 */
export interface TextGenerationOptions extends BaseRequestOptions {
  /** Tools that can be called by the model */
  tools?: any[];
  /** Tool registry for executing tool calls */
  toolRegistry?: any;
  /** Whether to bypass the mock response in test environment */
  bypassTestMock?: boolean;
}

/**
 * Options for structured data generation requests
 */
export interface StructuredDataOptions extends BaseRequestOptions {
  /** Name of the function to call */
  functionName: string;
  /** Description of the function */
  functionDescription?: string;
  /** Parameters schema for the function */
  parameters: any;
  /** Whether to bypass the mock response in test environment */
  bypassTestMock?: boolean;
}

/**
 * Options for embedding generation
 */
export interface EmbeddingOptions {
  /** Model to use for embeddings */
  model?: string;
  /** Text to generate embeddings for */
  input: string | string[];
  /** Whether to bypass the mock response in test environment */
  bypassTestMock?: boolean;
  /** Any additional provider-specific options */
  [key: string]: any;
}

/**
 * Response from an embedding request
 */
export interface EmbeddingResponse {
  /** Array of embedding vectors */
  embeddings: number[][];
  /** Model used to generate the embeddings */
  model: string;
  /** Usage statistics */
  usage?: {
    /** Number of tokens in the prompt */
    promptTokens: number;
    /** Total number of tokens used */
    totalTokens: number;
  };
}

/**
 * Message in a conversation
 */
export interface Message {
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool';
  /** Content of the message */
  content: string;
  /** Optional name for the message sender */
  name?: string;
  /** Tool calls made in the message */
  toolCalls?: any[];
}

/**
 * Tool call made by the model
 */
export interface ToolCall {
  /** Unique identifier for the tool call */
  id: string;
  /** Name of the tool to call */
  name: string;
  /** Arguments for the tool call */
  arguments: any;
}

/**
 * Result of a tool call
 */
export interface ToolCallResult {
  /** ID of the tool call this result is for */
  toolCallId: string;
  /** Result of the tool call */
  result: any;
}

/**
 * Response from a text generation request
 */
export interface TextGenerationResponse {
  /** Generated text content */
  content: string;
  /** Model used for generation */
  model: string;
  /** Tool calls made by the model */
  toolCalls?: ToolCall[];
  /** Usage statistics */
  usage?: {
    /** Number of tokens in the prompt */
    promptTokens: number;
    /** Number of tokens in the completion */
    completionTokens: number;
    /** Total number of tokens used */
    totalTokens: number;
  };
}

/**
 * Response from a structured data generation request
 */
export interface StructuredDataResponse<T = any> {
  /** Generated structured data */
  content: T;
  /** Model used for generation */
  model: string;
  /** Usage statistics */
  usage?: {
    /** Number of tokens in the prompt */
    promptTokens: number;
    /** Number of tokens in the completion */
    completionTokens: number;
    /** Total number of tokens used */
    totalTokens: number;
  };
}
