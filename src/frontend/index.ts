import { ButtonDefinition, DividerDefinition, SpinnerDefinition, TextDefinition } from '@fluentui/web-components';

import { CardDefinition } from '@fabric-msft/fabric-web';

import { fabricLightTheme, setTheme } from '@fabric-msft/theme';

// Define each component
ButtonDefinition.define(customElements);
CardDefinition.define(customElements);
DividerDefinition.define(customElements);
SpinnerDefinition.define(customElements);
TextDefinition.define(customElements);

// Set theme
setTheme(fabricLightTheme);

// Helper function to format bytes
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

// Function to fetch system info
async function fetchSystemInfo() {
  try {
    const response = await fetch('http://localhost:3001/api/system/info');
    return await response.json();
  } catch (error) {
    console.error('Error fetching system info:', error);
    return null;
  }
}

// Function to update the UI with system info
export async function updateSystemInfo() {
  const systemInfoElement = document.getElementById('systemInfo');
  if (!systemInfoElement) return;

  systemInfoElement.innerHTML = '<fluent-spinner></fluent-spinner>';

  const data = await fetchSystemInfo();
  if (!data) {
    systemInfoElement.innerHTML = '<fluent-text appearance="body">Failed to load system information</fluent-text>';
    return;
  }

  systemInfoElement.innerHTML = `
    <div class="info-grid">
      <fluent-card class="info-card">
        <div class="card-content">
          <fluent-text weight="semibold" size="500">CPU Information</fluent-text>
          <fluent-divider></fluent-divider>
          <div class="info-item">
            <fluent-text>Manufacturer:</fluent-text>
            <fluent-text>${data.cpu.manufacturer}</fluent-text>
          </div>
          <div class="info-item">
            <fluent-text>Brand:</fluent-text>
            <fluent-text>${data.cpu.brand}</fluent-text>
          </div>
          <div class="info-item">
            <fluent-text>Cores:</fluent-text>
            <fluent-text>${data.cpu.cores} (${data.cpu.physicalCores} physical)</fluent-text>
          </div>
        </div>
      </fluent-card>

      <fluent-card class="info-card">
        <div class="card-content">
          <fluent-text weight="semibold" size="500">Memory Usage</fluent-text>
          <fluent-divider></fluent-divider>
          <div class="info-item">
            <fluent-text>Total:</fluent-text>
            <fluent-text>${formatBytes(data.memory.total)}</fluent-text>
          </div>
          <div class="info-item">
            <fluent-text>Used:</fluent-text>
            <fluent-text>${formatBytes(data.memory.used)}</fluent-text>
          </div>
          <div class="memory-bar">
            <div class="memory-used" style="width: ${((data.memory.used / data.memory.total) * 100).toFixed(1)}%"></div>
          </div>
          <div class="info-item">
            <fluent-text>Free:</fluent-text>
            <fluent-text>${formatBytes(data.memory.free)}</fluent-text>
          </div>
        </div>
      </fluent-card>

      <fluent-card class="info-card">
        <div class="card-content">
          <fluent-text weight="semibold" size="500">Operating System</fluent-text>
          <fluent-divider></fluent-divider>
          <div class="info-item">
            <fluent-text>Platform:</fluent-text>
            <fluent-text>${data.os.platform}</fluent-text>
          </div>
          <div class="info-item">
            <fluent-text>Distribution:</fluent-text>
            <fluent-text>${data.os.distro}</fluent-text>
          </div>
          <div class="info-item">
            <fluent-text>Release:</fluent-text>
            <fluent-text>${data.os.release}</fluent-text>
          </div>
          <div class="info-item">
            <fluent-text>Architecture:</fluent-text>
            <fluent-text>${data.os.arch}</fluent-text>
          </div>
        </div>
      </fluent-card>
    </div>
  `;
}

// Update system info every 30 seconds
setInterval(updateSystemInfo, 30000);

// Initial update
document.addEventListener('DOMContentLoaded', () => {
  // Set up refresh button click handler
  const refreshButton = document.getElementById('refreshButton');
  if (refreshButton) {
    refreshButton.addEventListener('click', updateSystemInfo);
  }

  // Initial update
  updateSystemInfo();
});
