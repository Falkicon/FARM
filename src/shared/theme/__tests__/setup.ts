import { vi, beforeEach } from 'vitest';
import { FASTElement } from '@microsoft/fast-element';

// Add more detailed logging for test debugging with improved formatting
const DEBUG_TESTS = true;
const debugLog = (message: string, data?: any) => {
  if (DEBUG_TESTS) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.mmm format
    const formattedMessage = `[${timestamp}][TestDebug] ${message}`;

    if (data) {
      // Format data to be more readable
      const dataStr = typeof data === 'object'
        ? JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')
        : data.toString();
      console.log(`${formattedMessage}\n  ${dataStr}`);
    } else {
      console.log(formattedMessage);
    }
  }
};

// Helper function to check if running in development mode
const isDevelopment = () => process.env.NODE_ENV === 'development';

// Define log entry type
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

// Create a queue for log messages to prevent overlapping
const logQueue: LogEntry[] = [];
let isProcessingLogs = false;

// Process logs sequentially to prevent overlapping
const processLogQueue = () => {
  if (isProcessingLogs || logQueue.length === 0) return;

  isProcessingLogs = true;
  const { level, message, data } = logQueue.shift()!;

  const timestamp = new Date().toISOString().substring(11, 23);
  const formattedMessage = `[${timestamp}][${level}] ${message}`;

  if (data) {
    // Use type assertion to handle the dynamic property access
    (console[level as keyof Console] as Function)(formattedMessage, data);
  } else {
    (console[level as keyof Console] as Function)(formattedMessage);
  }

  isProcessingLogs = false;

  // Process next log if available
  setTimeout(processLogQueue, 0);
};

// Enhanced logging functions
export const logger = {
  debug: (message: string, data?: any) => {
    if (isDevelopment() || DEBUG_TESTS) {
      logQueue.push({ level: 'debug', message, data });
      processLogQueue();
    }
  },
  info: (message: string, data?: any) => {
    logQueue.push({ level: 'info', message, data });
    processLogQueue();
  },
  warn: (message: string, data?: any) => {
    logQueue.push({ level: 'warn', message, data });
    processLogQueue();
  },
  error: (message: string, data?: any) => {
    logQueue.push({ level: 'error', message, data });
    processLogQueue();
  }
};

// Mock FASTElement for testing
class MockFASTElement extends HTMLElement {
  $fastController: any;
  shadowRoot: ShadowRoot | null = null;
  private eventListeners: Map<string, Set<{ listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions }>> = new Map();
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    super();
    this.$fastController = {
      addStyles: vi.fn(),
      removeStyles: vi.fn(),
      addBehaviors: vi.fn(),
      removeBehaviors: vi.fn(),
      onConnectedCallback: vi.fn(),
      onDisconnectedCallback: vi.fn(),
      onAttributeChangedCallback: vi.fn()
    };

    // Create shadow root for testing shadow DOM operations
    this.attachShadow({ mode: 'open' });

    if (isDevelopment()) {
      logger.debug('MockFASTElement initialized with controller', this.$fastController);
    }
  }

  // Add basic lifecycle methods
  connectedCallback() {
    // Set up media query listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryListener = (e: MediaQueryListEvent) => {
      this.handlePreferenceChange(e);
    };
    mediaQuery.addEventListener('change', this.mediaQueryListener);

    this.$fastController.onConnectedCallback();
    this.dispatchEvent(new CustomEvent('connected'));
  }

  disconnectedCallback() {
    // Clean up media query listener
    if (this.mediaQueryListener) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.removeEventListener('change', this.mediaQueryListener);
      this.mediaQueryListener = null;
    }

    // Clean up all event listeners
    for (const [type, listeners] of this.eventListeners.entries()) {
      for (const { listener, options } of listeners) {
        super.removeEventListener(type, listener, options);
      }
      listeners.clear();
    }
    this.eventListeners.clear();

    this.$fastController.onDisconnectedCallback();
    this.dispatchEvent(new CustomEvent('disconnected'));
  }

  private handlePreferenceChange(e: MediaQueryListEvent) {
    this.dispatchEvent(new CustomEvent('prefers-color-scheme-change', {
      detail: { matches: e.matches }
    }));
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.$fastController.onAttributeChangedCallback(name, oldValue, newValue);
    this.dispatchEvent(new CustomEvent('attributechanged', {
      detail: { name, oldValue, newValue }
    }));
  }

  // Override event handling
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    const listeners = this.eventListeners.get(type)!;
    const listenerInfo = { listener, options };
    listeners.add(listenerInfo);

    // Call original addEventListener
    super.addEventListener(type, listener, options);

    if (isDevelopment()) {
      logger.debug('MockFASTElement added event listener', { type, options });
    }
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      for (const listenerInfo of listeners) {
        if (listenerInfo.listener === listener) {
          listeners.delete(listenerInfo);
          // Call original removeEventListener
          super.removeEventListener(type, listener, options);

          if (isDevelopment()) {
            logger.debug('MockFASTElement removed event listener', { type, options });
          }
          break;
        }
      }
      if (listeners.size === 0) {
        this.eventListeners.delete(type);
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    try {
      // Create a new event with the same properties
      const newEvent = new CustomEvent(event.type, {
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        composed: event.composed,
        detail: (event as any).detail
      });

      // Set target and currentTarget
      Object.defineProperties(newEvent, {
        target: { value: this },
        currentTarget: { value: this },
        srcElement: { value: this }
      });

      // Call listeners directly first
      const listeners = this.eventListeners.get(event.type);
      if (listeners) {
        for (const { listener } of listeners) {
          try {
            if (typeof listener === 'function') {
              listener.call(this, newEvent);
            } else if ('handleEvent' in listener) {
              listener.handleEvent.call(this, newEvent);
            }
          } catch (error) {
            logger.error('MockFASTElement error in event listener', error);
            // Emit error event
            const errorEvent = new CustomEvent('error', {
              bubbles: true,
              cancelable: false,
              detail: { error, originalEvent: event }
            });
            this.dispatchEvent(errorEvent);
          }
        }
      }

      // Call original dispatchEvent for native behavior
      return super.dispatchEvent(newEvent);
    } catch (error) {
      logger.error('MockFASTElement error in dispatchEvent', error);
      // Emit error event
      const errorEvent = new CustomEvent('error', {
        bubbles: true,
        cancelable: false,
        detail: { error, originalEvent: event }
      });
      this.dispatchEvent(errorEvent);
      return false;
    }
  }

  // Add support for custom element lifecycle
  static get observedAttributes() {
    return ['mode', 'high-contrast'];
  }
}

// Register mock element if not already registered
try {
  if (!customElements.get('mock-element')) {
    customElements.define('mock-element', MockFASTElement);

    if (isDevelopment()) {
      logger.debug('Mock element registered', 'mock-element');
    }
  } else {
    if (isDevelopment()) {
      logger.debug('Mock element already registered', 'mock-element');
    }
  }
} catch (error) {
  logger.warn('Error registering mock element', error);
}

// Map to store media query objects for later access
const mediaQueries = new Map<string, any>();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    const mediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn((listener: EventListener) => {
        mediaQueryList.addEventListener('change', listener);
      }),
      removeListener: vi.fn((listener: EventListener) => {
        mediaQueryList.removeEventListener('change', listener);
      }),
      addEventListener: vi.fn((type: string, listener: EventListener) => {
        if (!mediaQueryList._listeners[type]) {
          mediaQueryList._listeners[type] = new Set();
        }
        mediaQueryList._listeners[type].add(listener);
      }),
      removeEventListener: vi.fn((type: string, listener: EventListener) => {
        if (mediaQueryList._listeners[type]) {
          mediaQueryList._listeners[type].delete(listener);
        }
      }),
      dispatchEvent: vi.fn((event: Event) => {
        const listeners = mediaQueryList._listeners[event.type];
        if (listeners) {
          listeners.forEach((listener: EventListener) => {
            listener(event);
          });
        }
        return true;
      }),
      _listeners: {} as Record<string, Set<EventListener>>,
      setMatches: function (matches: boolean) {
        this.matches = matches;
        this.dispatchEvent(new Event('change'));
      }
    };

    // Store in mediaQueries map for later access
    mediaQueries.set(query, mediaQueryList);

    return mediaQueryList;
  }
});

// Mock CSS properties for testing
export const cssProperties = (() => {
  const properties = new Map<string, string>();

  return {
    get: (name: string): string => {
      return properties.get(name) || '';
    },
    set: (name: string, value: string): void => {
      // Ensure value is a string before using string methods
      const valueStr = value != null ? String(value) : '';

      // Sanitize the value when setting it (similar to what the real implementation does)
      if (valueStr.includes(';')) {
        debugLog(`Sanitizing CSS value with semicolon: ${valueStr}`);
        properties.set(name, valueStr.split(';')[0].trim());
      } else {
        properties.set(name, valueStr);
      }
    },
    clear: (): void => {
      properties.clear();
    },
    has: (name: string): boolean => {
      return properties.has(name);
    },
    delete: (name: string): boolean => {
      return properties.delete(name);
    },
    size: (): number => {
      return properties.size;
    },
    // Add entries method to make it compatible with existing code
    entries: (): IterableIterator<[string, string]> => {
      return properties.entries();
    },
    // Add forEach method for compatibility
    forEach: (callback: (value: string, key: string) => void): void => {
      properties.forEach(callback);
    }
  };
})();

// Create a style element to hold our CSS custom properties
const styleElement = document.createElement('style');
document.head.appendChild(styleElement);

if (isDevelopment()) {
  logger.debug('Style element created and appended to head');
}

// Error types for CSS operations
class CSSPropertyError extends Error {
  constructor(message: string, public propertyName: string) {
    super(message);
    this.name = 'CSSPropertyError';
  }
}

// Helper function to sanitize CSS values
function sanitizeCSSValue(value: string): string {
  if (!value) {
    return '';
  }

  // First, check if it's a simple value (number + unit)
  const simpleValueRegex = /^-?\d*\.?\d+[a-z%]*$/i;
  if (simpleValueRegex.test(value)) {
    return value;
  }

  // For more complex values, remove potentially unsafe characters and CSS injection attempts
  const unsafe = /[;{}]/g;
  if (unsafe.test(value)) {
    if (isDevelopment()) {
      logger.warn('Unsafe token value detected', value);
    }

    // Extract the first valid CSS value
    const parts = value.split(/[;{}]/);
    const sanitized = parts[0].trim();

    if (isDevelopment()) {
      logger.debug('Sanitized value', { original: value, sanitized });
    }

    return sanitized || ''; // Ensure we return empty string if sanitized is falsy
  }

  return value.trim();
}

// Helper function to validate token format
function validateTokenFormat(token: string): { isValid: boolean; message?: string } {
  if (!token.startsWith('var(--') || !token.endsWith(')')) {
    logger.warn('Invalid token format', { token, message: 'Tokens must use CSS custom properties in the format var(--token-name).' });
    return { isValid: false, message: 'Invalid token format' };
  }
  return { isValid: true };
}

// Mock getComputedStyle with error handling and validation
window.getComputedStyle = vi.fn().mockImplementation((element) => {
  // Ensure we always return an object with getPropertyValue method
  return {
    getPropertyValue: (prop: string) => {
      try {
        // Handle both raw property names and var(--property) format
        let propertyName = prop;
        if (prop.startsWith('var(--')) {
          propertyName = prop.match(/--[^)]+/)![0];
        } else if (!prop.startsWith('--')) {
          propertyName = `--${prop}`;
        }

        const value = cssProperties.get(propertyName) || '';

        // Log for debugging
        logger.debug('getPropertyValue', {
          prop,
          propertyName,
          value,
          allProperties: Array.from(cssProperties.entries())
        });

        // Sanitize the value if it contains semicolons
        if (value.includes(';')) {
          const sanitized = value.split(';')[0].trim();
          debugLog('Sanitizing CSS value with semicolon: ' + value);
          return sanitized;
        }

        return value;
      } catch (error) {
        logger.error('Error in getPropertyValue', error);
        return '';
      }
    }
  };
});

// Add a flag to track if setup has been applied
const THEME_SETUP_APPLIED = Symbol('THEME_SETUP_APPLIED');

// Check if setup has already been applied to avoid duplicate definitions
if (!(globalThis as any)[THEME_SETUP_APPLIED]) {
  (globalThis as any)[THEME_SETUP_APPLIED] = true;

  // Mock style operations with error handling and validation
  try {
    Object.defineProperty(document.documentElement.style, 'setProperty', {
      value: (prop: string, value: string) => {
        try {
          if (!prop) {
            throw new CSSPropertyError('Property name cannot be empty', prop);
          }

          const propertyName = prop.startsWith('--') ? prop : `--${prop}`;
          const sanitized = sanitizeCSSValue(value);

          if (value !== sanitized) {
            logger.warn('Value was sanitized', { original: value, sanitized });
          }

          cssProperties.set(propertyName, sanitized);

          // Update the style element
          styleElement.textContent = Array.from(cssProperties.entries())
            .map(([p, v]) => `${p}: ${v};`)
            .join('\n');
        } catch (error) {
          logger.error('Error in setProperty', error);
        }
      },
      configurable: true,
      writable: true
    });
  } catch (error) {
    console.warn('Could not redefine style.setProperty, it may already be defined', error);
  }
}

Object.defineProperty(document.documentElement.style, 'getPropertyValue', {
  value: (prop: string) => {
    try {
      const propertyName = prop.startsWith('--') ? prop : `--${prop}`;
      const value = cssProperties.get(propertyName) || '';

      if (isDevelopment()) {
        logger.debug('getPropertyValue', {
          property: propertyName,
          value,
          exists: cssProperties.has(propertyName)
        });
      }

      return value;
    } catch (error) {
      logger.error('Error in getPropertyValue', error);
      return '';
    }
  }
});

Object.defineProperty(document.documentElement.style, 'removeProperty', {
  value: (prop: string) => {
    try {
      const propertyName = prop.startsWith('--') ? prop : `--${prop}`;
      const hadProperty = cssProperties.delete(propertyName);

      // Update the style element
      styleElement.textContent = Array.from(cssProperties.entries())
        .map(([p, v]) => `${p}: ${v};`)
        .join('\n');

      if (isDevelopment()) {
        logger.debug('removeProperty', {
          property: propertyName,
          wasRemoved: hadProperty,
          remainingProperties: Array.from(cssProperties.entries())
        });
      }

      return hadProperty ? propertyName : '';
    } catch (error) {
      logger.error('Error in removeProperty', error);
      return '';
    }
  }
});

// Export for testing
export { CSSPropertyError, sanitizeCSSValue, validateTokenFormat };

// Mock requestAnimationFrame with error handling
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  try {
    const handle = setTimeout(() => {
      try {
        callback(performance.now());
      } catch (error) {
        logger.error('Error in requestAnimationFrame callback', error);
      }
    }, 0) as unknown as number;

    if (isDevelopment()) {
      logger.debug('requestAnimationFrame scheduled', { handle });
    }

    return handle;
  } catch (error) {
    logger.error('Error scheduling requestAnimationFrame', error);
    return 0;
  }
};

// Mock cancelAnimationFrame with error handling
global.cancelAnimationFrame = (handle: number): void => {
  try {
    if (isDevelopment()) {
      logger.debug('cancelAnimationFrame called', { handle });
    }
    clearTimeout(handle);
  } catch (error) {
    logger.error('Error in cancelAnimationFrame', error);
  }
};

// Mock ResizeObserver with error handling
class MockResizeObserver {
  private observedElements = new Set<Element>();

  observe = vi.fn((element: Element) => {
    try {
      this.observedElements.add(element);
      if (isDevelopment()) {
        logger.debug('ResizeObserver.observe called', {
          element: element.tagName,
          id: element.id,
          observedCount: this.observedElements.size
        });
      }
    } catch (error) {
      logger.error('Error in ResizeObserver.observe', error);
    }
  });

  unobserve = vi.fn((element: Element) => {
    try {
      this.observedElements.delete(element);
      if (isDevelopment()) {
        logger.debug('ResizeObserver.unobserve called', {
          element: element.tagName,
          id: element.id,
          remainingObserved: this.observedElements.size
        });
      }
    } catch (error) {
      logger.error('Error in ResizeObserver.unobserve', error);
    }
  });

  disconnect = vi.fn(() => {
    try {
      this.observedElements.clear();
      if (isDevelopment()) {
        logger.debug('ResizeObserver.disconnect called');
      }
    } catch (error) {
      logger.error('Error in ResizeObserver.disconnect', error);
    }
  });
}

global.ResizeObserver = MockResizeObserver;

// Mock performance.now() for consistent timing in tests
let currentTime = 0;
performance.now = vi.fn(() => currentTime);

// Helper to advance time
export const advanceTime = (ms: number) => {
  currentTime += ms;
  return currentTime;
};

// Mock queueMicrotask to run immediately in tests
global.queueMicrotask = (callback: () => void) => {
  try {
    Promise.resolve().then(callback);
  } catch (error) {
    logger.error('Error in queueMicrotask', error);
  }
};

if (isDevelopment()) {
  logger.debug('Test environment setup completed');
}

// Track DOM attribute changes for verification
const domAttributeChanges = new Map<string, string[]>();
const originalSetAttribute = Element.prototype.setAttribute;
const originalGetAttribute = Element.prototype.getAttribute;

// Enhanced setAttribute mock
Element.prototype.setAttribute = function (name: string, value: string) {
  try {
    // Track the change without recursion
    if (!domAttributeChanges.has(name)) {
      domAttributeChanges.set(name, []);
    }
    domAttributeChanges.get(name)!.push(value);

    // Call original without development mode check to prevent recursion
    originalSetAttribute.call(this, name, value);
  } catch (error) {
    logger.error('Error in setAttribute', { error, name, value });
    // Emit error event with details
    const errorEvent = new CustomEvent('error', {
      bubbles: true,
      cancelable: false,
      detail: {
        error,
        operation: 'setAttribute',
        attribute: name,
        value
      }
    });
    this.dispatchEvent(errorEvent);
    // Re-throw to allow error handling tests to work
    throw error;
  }
};

// Enhanced getAttribute mock
Element.prototype.getAttribute = function (name: string) {
  try {
    const value = originalGetAttribute.call(this, name);
    if (isDevelopment()) {
      logger.debug('getAttribute', { element: this, name, value });
    }
    return value;
  } catch (error) {
    logger.error('Error in getAttribute', error);
    // Emit error event with details
    const errorEvent = new CustomEvent('error', {
      bubbles: true,
      cancelable: false,
      detail: {
        error,
        operation: 'getAttribute',
        attribute: name
      }
    });
    this.dispatchEvent(errorEvent);
    throw error;
  }
};

// Enhanced removeAttribute mock
const originalRemoveAttribute = Element.prototype.removeAttribute;
Element.prototype.removeAttribute = function (name: string) {
  try {
    originalRemoveAttribute.call(this, name);
    if (isDevelopment()) {
      logger.debug('removeAttribute', { element: this, name });
    }
  } catch (error) {
    logger.error('Error in removeAttribute', error);
    // Emit error event with details
    const errorEvent = new CustomEvent('error', {
      bubbles: true,
      cancelable: false,
      detail: {
        error,
        operation: 'removeAttribute',
        attribute: name
      }
    });
    this.dispatchEvent(errorEvent);
    throw error;
  }
};

// Helper function to create announcer element
function createAnnouncer(text: string, removeAfter = 3000): HTMLElement {
  // Remove any existing announcer
  const existingAnnouncer = document.querySelector('[role="status"]');
  if (existingAnnouncer) {
    existingAnnouncer.remove();
  }

  const announcer = document.createElement('div');
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.textContent = text;
  document.body.appendChild(announcer);

  if (isDevelopment()) {
    logger.debug('Created announcer', { text, removeAfter });
  }

  // Schedule removal
  if (removeAfter > 0) {
    setTimeout(() => {
      if (document.body.contains(announcer)) {
        announcer.remove();
        if (isDevelopment()) {
          logger.debug('Removed announcer');
        }
      }
    }, removeAfter);
  }

  return announcer;
}

// Mock high contrast support
const highContrastMediaQuery = {
  matches: false,
  media: '(forced-colors: active)',
  onchange: null,
  listeners: new Set<(e: MediaQueryListEvent) => void>(),

  addListener(listener: (e: MediaQueryListEvent) => void) {
    this.listeners.add(listener);
  },

  removeListener(listener: (e: MediaQueryListEvent) => void) {
    this.listeners.delete(listener);
  },

  addEventListener(type: string, listener: (e: MediaQueryListEvent) => void) {
    if (type === 'change') {
      this.listeners.add(listener);
    }
  },

  removeEventListener(type: string, listener: (e: MediaQueryListEvent) => void) {
    if (type === 'change') {
      this.listeners.delete(listener);
    }
  },

  dispatchEvent(event: Event): boolean {
    if (event instanceof Event && event.type === 'change') {
      const mediaQueryEvent = { matches: this.matches, media: this.media } as MediaQueryListEvent;
      this.listeners.forEach(listener => listener(mediaQueryEvent));
    }
    return true;
  }
};

// Helper function to toggle high contrast mode
function setHighContrastMode(enabled: boolean) {
  highContrastMediaQuery.matches = enabled;
  document.documentElement.setAttribute('high-contrast', String(enabled));
  document.documentElement.setAttribute('aria-highcontrast', String(enabled));

  const theme = document.documentElement.getAttribute('theme') || 'light';
  const announceText = `Theme changed to ${theme} ${enabled ? 'high contrast' : ''} mode`.trim();
  createAnnouncer(announceText);

  // Notify listeners
  highContrastMediaQuery.dispatchEvent(new Event('change'));

  if (isDevelopment()) {
    logger.debug('High contrast mode changed', { enabled, theme });
  }
}

// Export helper functions
export { createAnnouncer, setHighContrastMode };

// Add more detailed logging to simulateThemeChange
export function simulateThemeChange(isDark: boolean): void {
  debugLog(`Simulating theme change to ${isDark ? 'dark' : 'light'} mode`);

  const mediaQueryKey = '(prefers-color-scheme: dark)';
  const mediaQuery = window.matchMedia(mediaQueryKey);

  // Store the media query in the map if it doesn't exist
  if (!mediaQueries.has(mediaQueryKey)) {
    debugLog('Adding new media query to map');
    mediaQueries.set(mediaQueryKey, {
      matches: !isDark, // Set to opposite initially to ensure change event fires
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
      media: mediaQueryKey,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      setMatches: vi.fn()
    });
  }

  const mockMediaQuery = mediaQueries.get(mediaQueryKey)!;

  // Update matches property
  mockMediaQuery.matches = isDark;

  // Create and dispatch MediaQueryListEvent
  const event = new Event('change') as MediaQueryListEvent;
  Object.defineProperty(event, 'matches', { value: isDark });
  Object.defineProperty(event, 'media', { value: mediaQueryKey });

  debugLog('Dispatching MediaQueryListEvent');
  mockMediaQuery.dispatchEvent(event);

  // Call setMatches if it exists (for compatibility with different mock implementations)
  if (typeof mockMediaQuery.setMatches === 'function') {
    debugLog('Calling setMatches on media query');
    mockMediaQuery.setMatches(isDark);
  } else {
    debugLog('setMatches method not found on media query');
  }

  debugLog('Theme change simulation complete');
}

// Enhanced microtask and timer handling
const pendingMicrotasks = new Set<() => void | Promise<void>>();
const pendingTimers = new Map<number, {
  callback: () => void | Promise<void>,
  delay: number,
  isAnimationFrame: boolean,
  promise?: Promise<void>
}>();

let timerIdCounter = 1;

// Replace setTimeout with a simpler version for testing
const mockSetTimeout = (callback: () => void | Promise<void>, delay: number): number => {
  const id = timerIdCounter++;
  pendingTimers.set(id, {
    callback,
    delay,
    isAnimationFrame: false,
    promise: undefined
  });
  return id;
};

// Replace clearTimeout with a simpler version for testing
const mockClearTimeout = (id: number | undefined): void => {
  if (typeof id === 'number') {
    pendingTimers.delete(id);
  }
};

// Cast to any to avoid complex type issues with Node.js typings
global.setTimeout = mockSetTimeout as any;
global.clearTimeout = mockClearTimeout as any;

// Helper functions for tests
export const testHelpers = {
  flushMicrotasks: async () => {
    const tasks = Array.from(pendingMicrotasks);
    const taskCount = tasks.length;
    logger.debug('Flushing microtasks', { count: taskCount });

    pendingMicrotasks.clear();
    const results: Promise<void>[] = [];

    for (const task of tasks) {
      try {
        logger.debug('Executing microtask');
        const result = task();
        if (result instanceof Promise) {
          logger.debug('Awaiting promise from microtask');
          results.push(result);
        }
      } catch (error) {
        logger.error('Error in microtask', error);
      }
    }

    if (results.length > 0) {
      await Promise.all(results);
      logger.debug('All microtask promises resolved');
    }

    logger.debug('Finished flushing microtasks');
  },

  flushTimers: async () => {
    const timers = Array.from(pendingTimers.entries());
    const timerCount = timers.length;
    debugLog(`Starting flushTimers with ${timerCount} pending timers`);

    if (timerCount === 0) {
      debugLog('No timers to flush');
      return;
    }

    logger.debug('Flushing timers', { count: timerCount });
    const results: Promise<any>[] = [];

    // Log timer details for debugging
    debugLog(`Timer details: ${JSON.stringify(timers.map(([id, timer]) => ({ id, delay: timer.delay })))}`);

    for (const [id, { callback }] of timers) {
      try {
        debugLog(`Executing timer ${id}`);
        logger.debug('Executing timer', { id });
        const result = callback();
        if (result instanceof Promise) {
          debugLog(`Timer ${id} returned a promise, awaiting it`);
          logger.debug('Awaiting promise from timer', { id });
          results.push(result);
        } else {
          debugLog(`Timer ${id} executed synchronously with result: ${result}`);
        }
      } catch (error) {
        debugLog(`Error in timer ${id}: ${error}`);
        logger.error('Error in timer callback', { id, error });
      }
    }

    // Clear the timers after executing them
    pendingTimers.clear();

    if (results.length > 0) {
      debugLog(`Awaiting ${results.length} promises from timers`);
      await Promise.all(results);
      debugLog('All timer promises resolved');
      logger.debug('All timer promises resolved');
    }

    debugLog('Finished flushing timers');
    logger.debug('Finished flushing timers');
  },

  flushAll: async () => {
    const MAX_ITERATIONS = 10;
    const MAX_TIME_MS = 5000;
    const startTime = Date.now();
    let iteration = 0;
    let reachedMax = false;

    debugLog('Starting flushAll');
    logger.debug('Starting flushAll');

    while (iteration < MAX_ITERATIONS) {
      iteration++;
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime > MAX_TIME_MS) {
        debugLog(`Exceeded maximum time (${MAX_TIME_MS}ms), breaking out of flushAll`);
        reachedMax = true;
        break;
      }

      const pendingMicrotasksCount = pendingMicrotasks.size;
      const pendingTimersCount = pendingTimers.size;

      debugLog(`FlushAll iteration ${iteration}: ${pendingMicrotasksCount} microtasks, ${pendingTimersCount} timers, elapsed ${elapsedTime}ms`);
      logger.debug('FlushAll iteration', {
        iteration,
        pendingMicrotasks: pendingMicrotasksCount,
        pendingTimers: pendingTimersCount,
        elapsedTime
      });

      if (pendingMicrotasksCount === 0 && pendingTimersCount === 0) {
        debugLog(`No pending tasks, breaking out of flushAll at iteration ${iteration}`);
        break;
      }

      // Flush microtasks first
      if (pendingMicrotasksCount > 0) {
        debugLog(`Flushing ${pendingMicrotasksCount} microtasks`);
        await testHelpers.flushMicrotasks();
      }

      // Then flush timers
      if (pendingTimersCount > 0) {
        debugLog(`Flushing ${pendingTimersCount} timers`);
        await testHelpers.flushTimers();
      }
    }

    const totalTime = Date.now() - startTime;
    debugLog(`FlushAll completed after ${iteration} iterations in ${totalTime}ms, reached max: ${reachedMax}`);
    logger.debug('FlushAll completed', {
      totalIterations: iteration,
      reachedMax,
      elapsedTime: totalTime
    });
  },

  getDispatchedEvents: () => {
    const events = Array.from(dispatchedEvents);
    logger.debug('Getting dispatched events', { count: events.length, events });
    return events;
  },

  getAttributeChanges: (attributeName: string) => {
    const changes = domAttributeChanges.get(attributeName) || [];
    logger.debug('Getting attribute changes', {
      attribute: attributeName,
      count: changes.length,
      changes
    });
    return changes;
  },

  clearTracking: () => {
    logger.debug('Clearing all tracking', {
      dispatchedEvents: dispatchedEvents.size,
      attributeChanges: domAttributeChanges.size,
      microtasks: pendingMicrotasks.size,
      timers: pendingTimers.size
    });
    dispatchedEvents.clear();
    domAttributeChanges.clear();
    pendingMicrotasks.clear();
    pendingTimers.clear();
  }
};

// Track dispatched events
const dispatchedEvents = new Set<string>();

// Track MutationObserver instances for debugging
const mutationObservers = new Set<MockMutationObserver>();

// Mock MutationObserver with enhanced logging
class MockMutationObserver {
  callback: MutationCallback;
  target: Element | null = null;
  options: MutationObserverInit | null = null;
  id: number;
  static instanceCounter = 0;

  constructor(callback: MutationCallback) {
    this.id = ++MockMutationObserver.instanceCounter;
    this.callback = callback;
    mutationObservers.add(this);
    logger.debug(`[MockMutationObserver] Created instance #${this.id}`);
  }

  observe(target: Element, options?: MutationObserverInit): void {
    this.target = target;
    this.options = options || null;
    logger.debug(`[MockMutationObserver] Instance #${this.id} observing:`, {
      target: target.tagName,
      id: (target as Element).id,
      options: this.options
    });
  }

  disconnect(): void {
    logger.debug(`[MockMutationObserver] Instance #${this.id} disconnected`);
    this.target = null;
    this.options = null;
  }

  takeRecords(): MutationRecord[] {
    logger.debug(`[MockMutationObserver] Instance #${this.id} takeRecords called`);
    return [];
  }

  simulateMutation(type: MutationRecordType): void {
    logger.debug(`[MockMutationObserver] Instance #${this.id} simulating mutation:`, { type });
    if (this.target && this.callback) {
      const record: MutationRecord = {
        type,
        target: this.target,
        addedNodes: [] as any,
        removedNodes: [] as any,
        previousSibling: null,
        nextSibling: null,
        attributeName: 'mode',
        attributeNamespace: null,
        oldValue: null
      };
      this.callback([record], this);
    } else {
      logger.warn(`[MockMutationObserver] Instance #${this.id} cannot simulate mutation - no target or callback`);
    }
  }
}

// Replace global MutationObserver with mock
global.MutationObserver = MockMutationObserver as any;

// Add helper to get all observers
export const getMutationObservers = () => Array.from(mutationObservers);

// Reset ThemeProvider instance before each test
beforeEach(async () => {
  // Clear mutation observers tracking
  mutationObservers.clear();
  MockMutationObserver.instanceCounter = 0;
  logger.debug('Reset MutationObserver tracking');

  // Instead of directly accessing private properties, we'll patch the global MutationObserver
  // This ensures that when ThemeProvider creates a new MutationObserver, it gets our mock
  logger.debug('Ensuring MutationObserver is properly mocked');

  // Log the current global MutationObserver
  logger.debug('Current global MutationObserver:', {
    isMocked: global.MutationObserver === MockMutationObserver,
    constructor: global.MutationObserver.name
  });
});
