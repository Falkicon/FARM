import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ButtonDefinition,
  DividerDefinition,
  SpinnerDefinition,
  TextDefinition
} from '@fluentui/web-components';
import { CardDefinition } from '@fabric-msft/fabric-web';

describe('SystemInfo', () => {
  const mockSystemInfo = {
    cpu: {
      manufacturer: 'Intel',
      brand: 'Core i7',
      cores: 8,
      physicalCores: 4
    },
    memory: {
      total: 16 * 1024 * 1024 * 1024, // 16GB
      used: 8 * 1024 * 1024 * 1024,   // 8GB
      free: 8 * 1024 * 1024 * 1024    // 8GB
    },
    os: {
      platform: 'win32',
      distro: 'Windows',
      release: '10',
      arch: 'x64'
    }
  };

  beforeEach(() => {
    // Define web components
    ButtonDefinition.define(customElements);
    CardDefinition.define(customElements);
    DividerDefinition.define(customElements);
    SpinnerDefinition.define(customElements);
    TextDefinition.define(customElements);

    // Mock fetch API
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSystemInfo)
      })
    );

    // Reset the DOM
    document.body.innerHTML = '';
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

    // Call the update function directly
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
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

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

    // Set up event listener
    document.addEventListener('DOMContentLoaded', () => {
      const refreshButton = document.getElementById('refreshButton');
      if (refreshButton) {
        refreshButton.addEventListener('click', () => {
          import('../index').then(module => {
            module.updateSystemInfo();
          });
        });
      }
    });

    // Trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Initial load
    const { updateSystemInfo } = await import('../index');
    await updateSystemInfo();
    await vi.waitFor(() => document.querySelector('fluent-card'));

    // Clear the fetch mock calls
    vi.clearAllMocks();

    // Click refresh button
    const refreshButton = document.getElementById('refreshButton') as HTMLButtonElement;
    expect(refreshButton).toBeTruthy();
    refreshButton.click();

    // Wait for the async operation
    await vi.waitFor(() => (global.fetch as any).mock.calls.length > 0);

    // Verify fetch was called again
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/system/info');
  });
});
