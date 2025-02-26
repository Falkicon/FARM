# Farm Theme System

A robust, type-safe, and performant system for managing design tokens and theme switching in web applications.

## Features

- **Singleton Pattern**: Ensures consistent theme state across the application
- **Theme Mode Management**: Easily switch between light and dark themes
- **Type Safety**: Strong typing for all tokens and APIs
- **Performance Optimization**: Minimal DOM operations and efficient token access
- **Error Handling**: Comprehensive error handling with fallback values
- **Event System**: Subscribe to theme changes to update components
- **CSS Custom Properties**: Leverages native CSS for efficient theme application
- **Web Component**: Can be used as both a JavaScript API and a Web Component

## Installation

```bash
npm install @farm/theme
```

## Quick Example

```typescript
import { ThemeProvider } from '@farm/theme';

// Get the singleton instance
const themeProvider = ThemeProvider.getInstance();

// Access theme tokens
const primaryColor = themeProvider.getToken('color.primary');

// Switch themes
themeProvider.setTheme('dark');

// Subscribe to theme changes
themeProvider.addEventListener('theme-change', (event) => {
  console.log(`Theme changed to: ${event.detail.theme}`);
});
```

## Documentation

For detailed documentation, please refer to:

- [**Architecture**](./docs/ARCHITECTURE.md): Design decisions and system structure
  - Core components
  - Singleton pattern
  - Event system
  - Performance considerations

- [**API Reference**](./docs/API.md): Comprehensive API documentation
  - ThemeProvider methods
  - Event handling
  - Token management
  - Web component usage

- [**Usage Guide**](./docs/USAGE.md): Step-by-step guide on how to use the theme system
  - Basic setup
  - Theme switching
  - Token access
  - Event subscription

- [**Examples**](./docs/EXAMPLES.md): Practical examples of theme system implementation
  - Basic usage
  - Advanced scenarios
  - Integration with frameworks
  - Custom theme creation

- [**Testing Guide**](./docs/TESTING.md): Testing approach and best practices
  - Unit testing
  - Integration testing
  - Event testing
  - Performance testing

- [**Roadmap**](./docs/ROADMAP.md): Future plans and enhancements
  - Planned features
  - Improvements
  - Timeline

- [**Changelog**](./docs/CHANGELOG.md): History of changes and improvements
  - Version history
  - Breaking changes
  - New features
  - Bug fixes

- [**Contributing Guide**](./docs/CONTRIBUTING.md): Guidelines for contributors
  - Development setup
  - Coding standards
  - Pull request process
  - Documentation requirements

## Browser Support

The theme system supports all modern browsers, including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Current Status

The theme system is stable and ready for production use. For details on completed features and upcoming work, see the [Roadmap](./docs/ROADMAP.md).

## Recent Improvements

- Enhanced performance with optimized token access
- Improved theme switching with smoother transitions
- Added comprehensive documentation and examples
- Fixed issues with theme persistence
- Implemented better error handling and fallbacks

## Support

If you encounter any issues or have questions about the theme system, please file an issue in the repository or contact the Farm team.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
