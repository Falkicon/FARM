# ARCHITECTURE.md

## 1. Introduction
- Purpose: Provide a high-level overview of the project architecture, serving as a central reference for both human developers and LLM agents.
- Vision: Align and maintain a coherent understanding of the codebase over time and across sessions, with particular emphasis on AI integration and modular design.
- Note: The project uses modern LLM modules located in `/src/shared/llm` for all AI integration needs.

## 2. Project Overview
- **Description:**
  A modern web application boilerplate built with FAST Element for web components, Fluent UI Web Components for design consistency, and Fastify as the backend server. The project incorporates robust AI integration using the Vercel AI SDK along with custom LLM modules.
- **Vision & Principles:**
  - Web-first development with strict type safety using TypeScript.
  - High performance, accessibility, and modularity.
  - Seamless integration of AI-powered functionalities, guided by best practices from the Vercel AI SDK and native web APIs.

## 3. Quick Start
- **Project Setup:**
  - Clone and install dependencies (see `package.json` for requirements)
  - Configure environment variables using `.env.example` template
  - Review documentation in `/docs` for detailed setup instructions

- **Development Architecture:**
  ```
  [Frontend: Port 3000] ←→ [Backend: Port 3001]
         ↓                         ↓
  FAST/Fluent UI            Fastify/Prisma
         ↓                         ↓
    Web Components          REST/GraphQL APIs
         ↓                         ↓
    Browser Runtime          Node.js Runtime
  ```

- **Key Development Patterns:**
  1. Component-First Development
     - Create and test components in isolation
     - Use FAST Element decorators and templates
     - Follow Fluent UI design patterns

  2. API-First Development
     - Define TypeScript interfaces
     - Implement endpoints with Fastify
     - Validate with OpenAPI/Swagger

  3. Testing Strategy
     - Unit tests for components and services
     - Integration tests for API endpoints
     - E2E tests for critical user flows

> Note: For detailed commands and scripts, refer to `package.json` and the documentation in `/docs`

## 4. Project Structure
- **Monorepo Layout:**
  ```
  /
  ├── src/
  │   ├── frontend/        # Frontend application code
  │   ├── backend/        # Fastify backend implementation
  │   └── shared/         # Shared utilities and modules
  │       ├── llm/        # LLM integration modules
  │       │   ├── core/   # Core LLM functionality
  │       │   ├── types/  # TypeScript types and interfaces
  │       │   └── docs/   # LLM module documentation
  │       └── theme/      # Shared theming and styling
  ├── scripts/           # Build and utility scripts
  ├── tests/            # Test configurations and helpers
  └── docs/             # Project documentation
  ```
- **Key Directories:**
  - `/src/frontend`: FAST Element and Fluent UI components
  - `/src/backend`: Fastify server with TypeScript and Prisma
  - `/src/shared`: Cross-cutting concerns and utilities
    - `/shared/llm`: Modern LLM integration with comprehensive provider support
    - `/shared/theme`: Theming and styling utilities
  - `/scripts`: Build automation and development tools
  - `/tests`: Test configurations and shared test utilities
  - `/docs`: Project documentation and specifications

## 5. Technology Stack
- **Frontend:**
  - FAST Element for web components and templating
  - Fluent UI Web Components for Microsoft's Fluent design system
  - Vite for modern build tooling and development experience
  - TypeScript with strict type checking (ES2022, ESNext modules)

- **Backend:**
  - Fastify for high-performance server operations
  - Prisma for type-safe database access and migrations
  - Environment management with dotenv

- **AI Integration:**
  - Vercel AI SDK for streaming AI responses and chat interfaces
  - Comprehensive LLM provider support through the `/shared/llm` module:
    - OpenAI integration for GPT models
    - Azure OpenAI integration for enterprise deployments
    - Anthropic integration for Claude models
    - Google integration for Gemini models
  - Standardized interfaces for text generation, structured data, and embeddings
  - Built-in testing utilities and mock responses

- **Testing & Quality:**
  - Vitest for unit/integration testing with native ESM support
  - Playwright for end-to-end testing across browsers
  - MSW for API mocking and testing
  - ESLint and Prettier for code quality

- **Documentation:**
  - TypeDoc for API documentation with markdown and diagram support
  - MkDocs for user and architectural documentation

> Note: For specific version numbers and dependencies, refer to `package.json`

## 6. Development Workflow
- **Local Development Environment:**
  - Concurrent frontend and backend development servers
  - Hot module replacement (HMR) for rapid iteration
  - Cross-platform compatibility (Windows, Linux, macOS)
  - Automated port management and environment setup

- **Development Practices:**
  - TypeScript-first development with strict type checking
  - Component-driven development using web components
  - Test-driven development (TDD) encouraged
  - Continuous integration with comprehensive testing

- **Build and Deployment:**
  - Separate frontend and backend build pipelines
  - Production optimization and bundling
  - Environment-specific configurations
  - Automated documentation generation

> Note: For available commands and scripts, refer to the "scripts" section in `package.json`

## 7. Frontend (Component) Architecture
- **Component Model:**
  Custom elements are built using FAST Element, enabling declarative attribute/property binding, reactive templating, and encapsulated styling via CSS tagged templates.
- **UI Integration:**
  Integration with Fluent UI Web Components ensures cohesive design and interactive behavior.
- **Composition & Reusability:**
  Components are designed to be modular and reusable, supporting maintainability and performance.

## 8. Backend Architecture
- **Fastify Server Setup:**
  The backend uses Fastify for high-performance server operations, structured routing, middleware integration, and robust error handling.
- **API Endpoints:**
  RESTful endpoints are defined with scalability in mind, ensuring clear API contracts and efficient data exchange.
- **Data Flow & Integration:**
  Prisma is used for ORM and database migrations, with dotenv managing environment variables for configuration.

## 9. Frontend–Backend Communication
- **API Contracts:**
  Communication is based on JSON data exchange, with strict TypeScript types enforcing API contracts between the frontend and backend.
- **AI-Powered Interactions:**
  The LLM module provides a unified interface for AI interactions with multiple providers:
  - Text generation for chat and completion tasks
  - Structured data generation with schema validation
  - Embeddings generation for semantic search and similarity
  - Streaming responses for real-time interactions
  - Tool calling for function execution and complex workflows

## 10. Testing, Quality Assurance, and Documentation
- **Testing Strategy:**
  - Unit and integration tests are implemented using Vitest.
  - End-to-end testing is carried out with Playwright.
  - The LLM module includes comprehensive test coverage:
    - Automatic test environment detection
    - Standardized mock responses
    - Provider-specific test suites
    - Error handling and edge case testing
- **Linting and Type Checking:**
  Code quality is maintained via ESLint and TypeScript's `tsc --noEmit` checks.
- **Documentation Generation:**
  API documentation is generated with Typedoc, and user documentation is managed using MkDocs, with detailed documentation for the LLM module available in `/shared/llm/docs`.

## 11. Performance Monitoring
- **Frontend Monitoring:**
  - Web Vitals tracking (Core Web Vitals, Custom Metrics)
  - Performance profiling and optimization
  - Error tracking with Sentry (@sentry/browser ^9.1.0)

- **Backend Monitoring:**
  - System metrics collection (systeminformation ^5.25.11)
  - Request/Response timing
  - Resource utilization tracking
  - Error rate monitoring

- **Performance Optimization:**
  - Automated performance testing in CI/CD
  - Performance budgets and thresholds
  - Caching strategies
  - Load balancing considerations

## 12. Security Architecture
- **HTTP Security:**
  - Helmet middleware (@fastify/helmet ^13.0.1) for HTTP headers security
  - CORS configuration (@fastify/cors ^10.0.2) for controlled cross-origin access
  - Multipart handling (@fastify/multipart ^9.0.3) for secure file uploads

- **Authentication & Authorization:**
  - JWT-based authentication (jsonwebtoken ^9.0.2)
  - Role-based access control (RBAC)
  - Secure session management

- **Data Protection:**
  - Environment variables management with dotenv
  - Secure API key storage
  - Data encryption in transit and at rest

- **Security Best Practices:**
  - Regular dependency auditing (npm audit)
  - Input validation and sanitization
  - Rate limiting and request throttling
  - Comprehensive error handling without information leakage

## 13. Future Directions and Extensibility
- **LLM Module Enhancement:**
  The LLM module now provides a unified interface for all AI providers (OpenAI, Azure, Anthropic, Google) with standardized configuration, error handling, and testing capabilities. Future enhancements will focus on additional providers, performance optimizations, and advanced features.
- **Submodule Documentation:**
  Detailed architectural documents are maintained in corresponding submodules (e.g., `/src/frontend/ARCHITECTURE.md`, `/src/backend/ARCHITECTURE.md`, `/shared/llm/docs`).
- **Scalability and Maintenance:**
  New features should be developed in a modular way, ensuring that the architectural integrity is preserved and enhanced over time, leveraging community insights from the Vercel AI SDK documentation.
- **Integration Guidelines:**
  For detailed usage, best practices, and integration guidelines for AI functionalities, please refer to the documentation available in `/shared/llm/docs` and the official Vercel AI SDK documentation.

## 14. Conclusion
- This document provides a concise yet detailed overview of the project's architecture, integrating modern web technologies with advanced AI capabilities.
- Regular reviews and updates are essential to keep the architecture aligned with evolving project needs and industry best practices.
