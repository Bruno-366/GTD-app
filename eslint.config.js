import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	// Base JS rules for all files
	{
		...js.configs.recommended,
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},

	// TypeScript files — syntax checking only (no type-aware project rules)
	{
		files: ['**/*.{ts,tsx}'],
		plugins: { '@typescript-eslint': ts },
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.serviceworker
			}
		},
		rules: {
			...ts.configs['recommended'].rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},

	// Svelte files
	{
		files: ['**/*.svelte'],
		plugins: { svelte },
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser
			},
			globals: {
				...globals.browser
			}
		},
		rules: {
			...svelte.configs.recommended.rules
		}
	},

	// Ignore build artifacts and generated files
	{
		ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**']
	}
];
