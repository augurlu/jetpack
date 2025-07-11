// React eslint config.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import { rules as eslintConfigPrettierRules } from 'eslint-config-prettier';
import { defineConfig, javascriptFiles } from './base.mjs';

/**
 * Generate the base eslint config.
 *
 * @param {string} configurl - File URL for the eslint.config.mjs. Pass `import.meta.url`.
 * @return {object[]} Eslint config.
 */
export default function makeReactConfig( configurl ) {
	const basedir = path.dirname( fileURLToPath( configurl ) );

	const compat = new FlatCompat( {
		baseDirectory: basedir,
		resolvePluginsRelativeTo: fileURLToPath( import.meta.url ),
	} );

	return defineConfig(
		{
			files: javascriptFiles,
			extends: [ fixupConfigRules( compat.extends( 'plugin:@wordpress/react' ) ) ],
		},
		{
			name: 'Prettier react rule disables',
			files: javascriptFiles,
			rules: Object.fromEntries(
				Object.entries( eslintConfigPrettierRules ).filter(
					( [ k, v ] ) => k.startsWith( 'react' ) && ( v === 0 || v === 'off' )
				)
			),
		},
		{
			name: 'Monorepo react config',
			files: javascriptFiles,
			settings: {
				react: {
					version: 'detect', // React version. "detect" automatically picks the version you have installed.
				},
			},
			rules: {
				'react/jsx-no-bind': [ 'error', { ignoreRefs: true } ],
				'react/no-danger': 'error',
				'react/no-did-mount-set-state': 'error',
				'react/no-did-update-set-state': 'error',
				'react/prefer-es6-class': 'warn',
			},
		}
	);
}
