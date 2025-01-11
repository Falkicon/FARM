import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure docs directory exists
const docsDir = join(process.cwd(), 'docs');
if (!existsSync(docsDir)) {
  mkdirSync(docsDir);
}

// Run the TypeScript compiler to compile generate-docs.ts
console.log('Compiling documentation generator...');
execSync('npx tsc -p scripts/tsconfig.json');

// Run the compiled documentation generator
console.log('Generating Fluent UI documentation...');
execSync('node dist/scripts/generate-docs.js');

console.log('Documentation generated successfully in docs/fluent-components.md');
