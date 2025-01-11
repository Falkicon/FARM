# FARM Stack

![FARM Stack](README-banner.png)

Modern web application boilerplate combining FAST Element 2.0, Fluent UI Web Components, and Fastify with a focus on developer experience and performance.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.0%2B-brightgreen)](https://nodejs.org/)
[![Documentation](https://img.shields.io/badge/docs-MkDocs-blue.svg)](https://falkicon.github.io/farm)

## Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher
- Python 3.x (for documentation)
- PostgreSQL 14 or higher (optional)

### Installation
```bash
# Clone repository
git clone https://github.com/Falkicon/farm.git
cd farm

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Development Scripts

```bash
# Development
npm run dev              # Start all development servers
npm run dev:frontend    # Frontend only (port 3000)
npm run dev:backend     # Backend only (port 3001)

# Building
npm run build           # Build all
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend

# Testing
npm run test           # Run unit tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run end-to-end tests with Playwright
npm run test:e2e:ui  # Run Playwright tests with UI

# Documentation
npm run docs          # Serve documentation
npm run docs:build    # Build documentation
npm run docs:deploy   # Deploy to GitHub Pages

# Code Quality
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run typecheck    # Run TypeScript checks

# Utilities
npm run clean        # Clean build artifacts
npm run clean:all    # Clean everything including node_modules
```

## Features

### Frontend
- 🎨 FAST Element 2.0 for high-performance web components
- 💅 Fluent UI Web Components for beautiful, accessible UI
- 🌐 Universal Router for client-side routing
- 📱 Responsive design with modern CSS
- 🔄 Type-safe development with TypeScript

### Backend
- 🚀 High-performance Fastify server
- 🔒 Security with Helmet, CORS, and JWT
- 📝 OpenAPI/Swagger documentation
- 🗃️ Prisma for type-safe database access
- 🔄 Real-time capabilities

### Development Experience
- 📚 Comprehensive documentation with MkDocs
- 🧪 Testing with Vitest and Playwright
- 📖 Continuous Integration with GitHub Actions
- 🛠️ ESLint and Prettier for code quality
- 🔍 TypeDoc for API documentation

## Project Structure

```
farm/
├── docs/                # Documentation
├── src/
│   ├── frontend/
│   │   ├── components/  # Web components
│   │   ├── styles/     # Global styles
│   │   ├── router/     # Client routing
│   │   └── utils/      # Frontend utilities
│   ├── backend/
│   │   ├── api/        # API routes
│   │   ├── services/   # Business logic
│   │   ├── prisma/     # Database schema
│   │   └── config/     # Configuration
│   └── shared/
│       ├── types/      # Shared types
│       └── utils/      # Shared utilities
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/           # End-to-end tests
└── public/            # Static assets
```

## Documentation

Visit our [comprehensive documentation](https://falkicon.github.io/farm) for:
- Getting Started Guide
- Component Documentation
- API Reference
- Development Workflow
- Deployment Guide
- Security Best Practices
- Performance Optimization

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details on:
- Development Setup
- Code Style Guidelines
- Pull Request Process
- Testing Requirements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
