import { vi } from 'vitest';
import { afterEach } from 'vitest';

// Mock customElements with basic functionality
const customElementRegistry = new Map();

// Create base class that properly extends HTMLElement
class MockElement extends HTMLElement {
  static observedAttributes = [];

  shadowRoot: ShadowRoot | null = null;
  $fastController = {
    isConnected: false,
    addStyles: vi.fn(),
    removeStyles: vi.fn(),
    onConnectedCallback: vi.fn(),
    onDisconnectedCallback: vi.fn(),
  };

  $emit = vi.fn();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.$fastController.isConnected = true;
    this.$fastController.onConnectedCallback();
  }

  disconnectedCallback() {
    this.$fastController.isConnected = false;
    this.$fastController.onDisconnectedCallback();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    const callback = (this as any)[`${name}Changed`];
    if (callback) {
      callback.call(this, oldValue, newValue);
    }
  }
}

// Mock customElements registry
global.customElements = {
  define: (name: string, constructor: CustomElementConstructor) => {
    if (customElementRegistry.has(name)) {
      throw new Error(`A custom element with name '${name}' has already been defined`);
    }
    customElementRegistry.set(name, constructor);
  },
  get: (name: string) => customElementRegistry.get(name),
  upgrade: vi.fn(),
  whenDefined: (name: string) => Promise.resolve(customElementRegistry.get(name)),
} as any;

// Mock window.customElements
Object.defineProperty(window, 'customElements', {
  value: global.customElements,
  writable: true,
});

// Mock FASTElement
vi.mock('@microsoft/fast-element', async () => {
  const actual = await vi.importActual('@microsoft/fast-element');
  return {
    ...actual as any,
    FASTElement: class extends MockElement {
      static define(nameOrDef: any) {
        const name = typeof nameOrDef === 'string' ? nameOrDef : nameOrDef.name;
        customElements.define(name, this);
        return this;
      }
    },
    Observable: {
      track: vi.fn(),
      notify: vi.fn(),
      getNotifier: vi.fn().mockReturnValue({
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        notify: vi.fn(),
      }),
    },
    attr: () => (proto: any, key: string) => {
      const privateKey = `_${key}`;
      Object.defineProperty(proto, key, {
        get() { return this[privateKey]; },
        set(value) {
          const oldValue = this[privateKey];
          this[privateKey] = value;
          this.attributeChangedCallback?.(key, oldValue, value);
        },
        enumerable: true,
        configurable: true
      });
    },
    observable: () => (proto: any, key: string) => {
      const privateKey = `_${key}`;
      Object.defineProperty(proto, key, {
        get() { return this[privateKey]; },
        set(value) {
          const oldValue = this[privateKey];
          this[privateKey] = value;
          const callback = this[`${key}Changed`];
          if (callback) {
            callback.call(this, oldValue, value);
          }
        },
        enumerable: true,
        configurable: true
      });
    },
    volatile: () => (proto: any, key: string) => {
      const privateKey = `_${key}`;
      Object.defineProperty(proto, key, {
        get() { return this[privateKey]; },
        set(value) {
          this[privateKey] = value;
        },
        enumerable: true,
        configurable: true
      });
    },
    css: vi.fn().mockReturnValue({}),
    html: vi.fn().mockReturnValue({}),
  };
});

// Mock CSSStyleSheet
class MockCSSStyleSheet {
  replaceSync = vi.fn();
}
global.CSSStyleSheet = MockCSSStyleSheet as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
} as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Clean up after each test
afterEach(() => {
  document.body.innerHTML = '';
  customElementRegistry.clear();
  vi.clearAllMocks();
});
