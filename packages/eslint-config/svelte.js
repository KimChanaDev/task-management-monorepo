// @ts-check
import globals from "globals";
import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { config as baseConfig } from "./base.js";
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';

/**
 * Creates a shared ESLint configuration for Svelte apps.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.rootDir - The root directory of the app (usually import.meta.dirname or __dirname)
 * @param {string} [options.tsconfigPath] - Path to tsconfig.json (default: './tsconfig.json')
 * @param {string} [options.gitignorePath] - Path to .gitignore (default: './.gitignore')
 * @returns {import("eslint").Linter.Config[]}
 */
export function createSvelteConfig(options) {
	const {
		rootDir,
		tsconfigPath = './tsconfig.json',
		gitignorePath: gitignorePathOption
	} = options;

	// Build absolute path to .gitignore
	const gitignorePath = gitignorePathOption 
		? fileURLToPath(new URL(gitignorePathOption, `file:///${rootDir.replace(/\\/g, '/')}/`))
		: fileURLToPath(new URL('./.gitignore', `file:///${rootDir.replace(/\\/g, '/')}/`));

	return [
		includeIgnoreFile(gitignorePath),
		...baseConfig,
		js.configs.recommended,
		...ts.configs.recommended,
		...svelte.configs.recommended,
		prettier,
		...svelte.configs.prettier,
		{
			languageOptions: {
				globals: { ...globals.browser, ...globals.node }
			},
			rules: {
				// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
				// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
				'no-undef': 'off',
				"@typescript-eslint/no-explicit-any": "off",
			}
		},
		{
			files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
			languageOptions: {
				parserOptions: {
					projectService: true,
					extraFileExtensions: ['.svelte'],
					parser: ts.parser,
					tsconfigRootDir: rootDir,
					project: tsconfigPath
				}
			}
		}
	];
}

/**
 * Legacy export for backwards compatibility
 * @deprecated Use createSvelteConfig instead
 */
export const svelteJsConfig = createSvelteConfig({ rootDir: process.cwd() });
