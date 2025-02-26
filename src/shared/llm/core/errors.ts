/**
 * Error classes for the LLM module
 */

/**
 * Base error class for all LLM-related errors
 */
export class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Error thrown when there's an issue with the provider configuration
 */
export class ConfigurationError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Error thrown when there's an issue with authentication
 */
export class AuthenticationError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when a rate limit is exceeded
 */
export class RateLimitError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when a request times out
 */
export class TimeoutError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Error thrown when there's an issue with the API
 */
export class APIError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Error thrown when there's an issue with generating embeddings
 */
export class EmbeddingsError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'EmbeddingsError';
  }
}

/**
 * Error thrown when there's an issue with structured data generation
 */
export class StructuredDataError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'StructuredDataError';
  }
}

/**
 * Error thrown when there's an issue with tool calling
 */
export class ToolCallingError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'ToolCallingError';
  }
}

/**
 * Error thrown when a feature is not supported by a provider
 */
export class UnsupportedFeatureError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedFeatureError';
  }
}

/**
 * Error thrown when there's an issue with the model
 */
export class ModelError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'ModelError';
  }
}

/**
 * Error thrown when there's an issue with the content
 */
export class ContentFilterError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'ContentFilterError';
  }
}

/**
 * Error thrown when there's an issue with the response format
 */
export class ResponseFormatError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'ResponseFormatError';
  }
}

/**
 * Error thrown when there's an issue with the streaming response
 */
export class StreamingError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'StreamingError';
  }
}

/**
 * Error thrown when there's an issue with the validation
 */
export class ValidationError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
