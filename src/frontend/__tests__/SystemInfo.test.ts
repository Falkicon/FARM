import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Remove Fluent UI imports since we'll mock them
// import { ButtonDefinition, DividerDefinition, SpinnerDefinition, TextDefinition } from '@fluentui/web-components';
// import { CardDefinition } from '@fabric-msft/fabric-web';

describe('SystemInfo', () => {
  const mockSystemInfo = {
    cpu: {
      manufacturer: 'Intel',
      brand: 'Core i7',
      cores: 8,
      physicalCores: 4,
    },
    memory: {
      total: 16 * 1024 * 1024 * 1024, // 16GB
      used: 8 * 1024 * 1024 * 1024, // 8GB
      free: 8 * 1024 * 1024 * 1024, // 8GB
    },
    os: {
      platform: 'win32',
      distro: 'Windows',
      release: '10',
      arch: 'x64',
    },
  };

  beforeEach(() => {
    // Clear module cache
    vi.resetModules();

    // Clear any intervals
    vi.clearAllTimers();

    // Mock setInterval to prevent automatic updates
    vi.spyOn(global, 'setInterval').mockImplementation(() => {
      return setTimeout(() => { }, 0) as unknown as NodeJS.Timeout;
    });

    // Mock web components
    class MockFluentSpinner extends HTMLElement {
      constructor() {
        super();
        this.innerHTML = '<div class="spinner"></div>';
      }
    }

    class MockFluentCard extends HTMLElement {
      constructor() {
        super();
      }
    }

    class MockFluentText extends HTMLElement {
      constructor() {
        super();
      }

      get appearance() {
        return this.getAttribute('appearance') || '';
      }

      set appearance(value) {
        this.setAttribute('appearance', value);
      }
    }

    class MockFluentButton extends HTMLElement {
      constructor() {
        super();
      }
    }

    class MockFluentDivider extends HTMLElement {
      constructor() {
        super();
      }
    }

    // Register mock components if not already defined
    if (!customElements.get('fluent-spinner')) {
      customElements.define('fluent-spinner', MockFluentSpinner);
    }
    if (!customElements.get('fluent-card')) {
      customElements.define('fluent-card', MockFluentCard);
    }
    if (!customElements.get('fluent-text')) {
      customElements.define('fluent-text', MockFluentText);
    }
    if (!customElements.get('fluent-button')) {
      customElements.define('fluent-button', MockFluentButton);
    }
    if (!customElements.get('fluent-divider')) {
      customElements.define('fluent-divider', MockFluentDivider);
    }

    // Mock fetch API
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSystemInfo),
      }),
    );

    // Reset the DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Restore original setInterval
    vi.restoreAllMocks();
  });

  it('should render system info correctly', async () => {
    // Setup initial DOM
    document.body.innerHTML = `
      <div id="systemInfo">
        <fluent-spinner></fluent-spinner>
      </div>
    `;

    const el = document.getElementById('systemInfo')!;

    // Import dynamically to ensure DOM is ready
    const { updateSystemInfo } = await import('../index');
    await updateSystemInfo();

    // Wait for content to be updated
    await vi.waitFor(() => el.querySelector('fluent-card'));

    // Verify CPU card
    const cpuCard = el.querySelector('fluent-card:first-child');
    expect(cpuCard).toBeTruthy();
    expect(cpuCard?.textContent).toContain('CPU Information');
    expect(cpuCard?.textContent).toContain('Intel');
    expect(cpuCard?.textContent).toContain('Core i7');
    expect(cpuCard?.textContent).toContain('8');
    expect(cpuCard?.textContent).toContain('4');

    // Verify memory card
    const memoryCard = el.querySelector('fluent-card:nth-child(2)');
    expect(memoryCard).toBeTruthy();
    expect(memoryCard?.textContent).toContain('Memory Usage');
    expect(memoryCard?.textContent).toContain('16.00 GB');
    expect(memoryCard?.textContent).toContain('8.00 GB');

    // Verify OS card
    const osCard = el.querySelector('fluent-card:last-child');
    expect(osCard).toBeTruthy();
    expect(osCard?.textContent).toContain('Operating System');
    expect(osCard?.textContent).toContain('Windows');
    expect(osCard?.textContent).toContain('10');
    expect(osCard?.textContent).toContain('x64');

    // Verify memory bar
    const memoryBar = el.querySelector('.memory-bar .memory-used');
    expect(memoryBar).toBeTruthy();
    expect(memoryBar?.getAttribute('style')).toBe('width: 50.0%');
  });

  it('should handle fetch errors gracefully', async () => {
    // Mock fetch to simulate an error
    global.fetch = vi.fn().mockImplementation(() => Promise.reject(new Error('Network error')));

    // Setup initial DOM
    document.body.innerHTML = `
      <div id="systemInfo">
        <fluent-spinner></fluent-spinner>
      </div>
    `;

    const el = document.getElementById('systemInfo')!;

    const { updateSystemInfo } = await import('../index');
    await updateSystemInfo();

    // Wait for error message to appear
    await vi.waitFor(() => el.querySelector('fluent-text'));

    const errorText = el.querySelector('fluent-text');
    expect(errorText).toBeTruthy();
    expect(errorText?.textContent).toBe('Failed to load system information');
    expect(errorText?.getAttribute('appearance')).toBe('body');
  });

  it('should update when refresh button is clicked', async () => {
    // Setup initial DOM
    document.body.innerHTML = `
      <div>
        <button id="refreshButton">Refresh</button>
        <div id="systemInfo">
          <fluent-spinner></fluent-spinner>
        </div>
      </div>
    `;

    // Set up fetch mock
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSystemInfo),
      })
    );
    global.fetch = fetchMock;

    // Import the module but don't need to extract updateSystemInfo
    await import('../index');

    // Trigger DOMContentLoaded to set up click handler
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Wait for initial fetch and DOM update
    await vi.waitFor(() => document.querySelector('fluent-card'));

    // Clear any intervals and reset fetch mock
    vi.clearAllTimers();
    fetchMock.mockClear();

    // Click refresh button
    const refreshButton = document.getElementById('refreshButton') as HTMLButtonElement;
    expect(refreshButton).toBeTruthy();
    refreshButton.click();

    // Wait for the fetch call
    await vi.waitFor(() => fetchMock.mock.calls.length === 1);

    // Verify fetch was called with the correct URL
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/system/info');
  });
});
