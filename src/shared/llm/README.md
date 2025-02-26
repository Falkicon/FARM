# Farm LLM Module

A unified interface for interacting with various Large Language Model (LLM) providers, including OpenAI, Azure OpenAI,
Anthropic, and Google.

## Features

- **Unified API**: Consistent interface across all providers
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Provider Support**: OpenAI, Azure OpenAI, Anthropic, and Google
- **Core Capabilities**:
  - Text generation
  - Structured data generation (with Zod schema validation)
  - Embeddings generation
- **Advanced Features**:
  - Streaming responses
  - Tool calling
  - Automatic test environment detection
  - Standardized error handling
- **Utilities**:
  - Environment variable management
  - Configuration validation
  - Type guards

## Installation

```bash
npm install @farm/llm
```

## Quick Example

```typescript
import { createProvider } from '@farm/llm';

// Create a provider using the factory function
const provider = createProvider({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate text
async function generateResponse() {
  const response = await provider.generateText({
    messages: [{ role: 'user', content: 'What is the capital of France?' }],
  });

  console.log(response.text);
}

// Generate structured data with Zod schema validation
import { z } from 'zod';

async function generateStructuredData() {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  });

  const response = await provider.generateStructured(
    {
      messages: [{ role: 'user', content: 'Generate a user profile for John Doe, age 30, email john@example.com' }],
    },
    schema,
  );

  console.log(response.data);
  // { name: 'John Doe', age: 30, email: 'john@example.com' }
}

// Generate embeddings
async function generateEmbeddings() {
  const response = await provider.generateEmbeddings({
    input: ['What is the capital of France?', 'What is the capital of Germany?'],
  });

  console.log(response.embeddings);
  // [[0.1, 0.2, ...], [0.3, 0.4, ...]]
}
```

## Documentation

For detailed documentation, please refer to:

- [**API Documentation**](./docs/API.md): Comprehensive API reference with examples

  - Provider configuration
  - Text generation
  - Structured data generation
  - Embeddings
  - Streaming
  - Tool calling
  - Error handling
  - Testing

- [**Architecture**](./docs/ARCHITECTURE.md): Design decisions and module structure

  - Core components
  - Provider architecture
  - Type system
  - Error handling strategy

- [**Testing Guide**](./docs/TESTING.md): Testing approach and best practices

  - Test structure and organization
  - Mock responses and utilities
  - Testing asynchronous operations
  - Timeout handling techniques
  - Performance testing

- [**Contributing Guide**](./docs/CONTRIBUTING.md): Guidelines for contributors

  - Development setup
  - Adding new providers
  - Testing requirements
  - Documentation standards

- [**Development Roadmap**](./docs/ROADMAP.md): Future development plans
  - Current status
  - Short-term goals
  - Medium and long-term vision

## Current Status

The LLM module is at a stable MVP state with all core functionality implemented and tested. For details on completed
features and upcoming work, see the [Roadmap](./docs/ROADMAP.md).

## Recent Improvements

- Enhanced provider implementations with standardized configuration handling
- Improved test reliability with better timeout handling and mocking
- Added comprehensive documentation including architecture, API reference, and testing guides
- Fixed issues with hanging tests by properly mocking timeouts
- Implemented better test environment detection for consistent behavior

## Support

If you encounter any issues or have questions about the LLM module, please file an issue in the repository or contact
the Farm team.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
