import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

// Ensure docs directory exists
const docsDir: string = join(process.cwd(), 'docs');
if (!existsSync(docsDir)) {
  mkdirSync(docsDir);
}

function runCommand(command: string): void {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

// Run the TypeScript compiler to compile generate-docs.ts
console.log('Compiling documentation generator...');
runCommand('npx tsc -p scripts/tsconfig.json');

// Run the compiled documentation generator
console.log('Generating Fluent UI documentation...');
runCommand('node dist/scripts/generate-docs.js');

console.log('Documentation generated successfully in docs/fluent-components.md');
