import { createSvelteConfig } from '@repo/eslint-config/svelte-js';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import("eslint").Linter.Config[]} */
export default createSvelteConfig({
	rootDir: __dirname,
	tsconfigPath: './tsconfig.json',
	gitignorePath: './.gitignore'
});
