import killPort from 'kill-port';

const PORTS = [3000, 3001];

async function killPorts() {
  for (const port of PORTS) {
    try {
      await killPort(port);
      console.log(`Killed process on port ${port}`);
    } catch (error) {
      // Ignore errors if no process was running on the port
      if (!error.message.includes('No process')) {
        console.error(`Error killing process on port ${port}:`, error);
      }
    }
  }
}

killPorts();
