#!/usr/bin/env node

import { execSync } from 'child_process';
import { platform } from 'os';
import net from 'net';

const isWindows: boolean = platform() === 'win32';
const ports: number[] = [3000, 8000]; // Frontend and backend ports

console.log('[PORTS] Checking:', ports.join(', '));

async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        server.once('close', () => resolve(false));
        server.close();
      })
      .listen(port);
  });
}

async function killProcessOnPort(port: number): Promise<void> {
  try {
    if (!(await isPortInUse(port))) {
      console.log(`[INFO] Port ${port} is not in use`);
      return;
    }

    if (isWindows) {
      try {
        // First try graceful shutdown with PowerShell
        const psCmd = `
                    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue;
                    if ($process) {
                        $process | Stop-Process -Force;
                        Write-Host "[INFO] Process on port ${port} terminated";
                    } else {
                        Write-Host "[INFO] No process found on port ${port}";
                    }
                `;
        execSync(`powershell -Command "${psCmd}"`, { stdio: 'inherit' });

        // If port is still in use, try netstat and taskkill
        if (await isPortInUse(port)) {
          const pid = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`)
            .toString()
            .split(/\s+/)
            .filter(Boolean)
            .pop();

          if (pid) {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
          }
        }
      } catch (error) {
        console.log(`[WARN] Could not terminate process on port ${port} gracefully`);
      }
    } else {
      try {
        // Try SIGTERM first
        execSync(`lsof -ti:${port} | xargs -r kill -15`, { stdio: 'inherit' });
        console.log(`[INFO] Sent SIGTERM to process on port ${port}`);

        // Give process time to shutdown gracefully
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Force kill if still running
        if (await isPortInUse(port)) {
          execSync(`lsof -ti:${port} | xargs -r kill -9`, { stdio: 'inherit' });
        }
      } catch (error) {
        console.log(`[WARN] Could not terminate process on port ${port}`);
      }
    }

    // Wait for port to be released
    let retries = 5;
    while (retries > 0 && await isPortInUse(port)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }

    if (await isPortInUse(port)) {
      console.warn(`[WARN] Port ${port} is still in use after multiple attempts`);
    } else {
      console.log(`[SUCCESS] Port ${port} is now available`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`[WARN] Error handling port ${port}:`, error.message);
    }
  }
}

// Run checks and kill processes
Promise.all(ports.map(killProcessOnPort))
  .then(() => {
    console.log('[DONE] Port check complete');
    process.exit(0);
  })
  .catch(() => {
    console.log('[ERROR] Failed to check or kill ports');
    process.exit(1);
  });
