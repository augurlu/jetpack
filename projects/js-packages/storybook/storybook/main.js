/**
 * This file is inspired by https://github.com/WordPress/gutenberg/blob/trunk/storybook/main.js
 */

import path from 'node:path';
import { fileURLToPath } from 'url';
import postcssPlugins from '@wordpress/postcss-plugins-preset';
import { EsbuildPlugin } from 'esbuild-loader';
import remarkGfm from 'remark-gfm';
import projects from './projects.js';

const storiesSearch = '*.@(mdx|@(story|stories).@(js|jsx|ts|tsx))';
const stories = [ process.env.NODE_ENV !== 'test' && `./stories/**/${ storiesSearch }` ]
	.concat( projects.map( project => `${ project }/**/stories/${ storiesSearch }` ) )
	.filter( Boolean );

const includePaths = [ fileURLToPath( new URL( '.', import.meta.url ) ) ].concat( projects );

const customEnvVariables = {};

const sbconfig = {
	stories,
	addons: [
		{
			name: '@storybook/addon-docs',
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [ remarkGfm ],
					},
				},
			},
		},
		'@storybook/addon-storysource',
		'@storybook/addon-a11y',
		'@storybook/addon-essentials',
		'storybook-addon-mock',
		'@storybook/addon-webpack5-compiler-babel',
	],
	webpackFinal: async config => {
		// Remove source maps in production builds.
		if ( process.env.NODE_ENV === 'production' ) {
			config.devtool = false;
		}

		// Remove minimization in dev builds.
		if ( process.env.NODE_ENV !== 'production' ) {
			config.optimization.minimize = false;
		}

		// Remove ProgressPlugin
		config.plugins = config.plugins.filter( p => p.constructor.name !== 'ProgressPlugin' );

		// Use esbuild to minify.
		config.optimization.minimizer = [
			new EsbuildPlugin( {
				target: 'esnext',
			} ),
		];

		// Find the DefinePlugin
		const plugin = config.plugins.find( p => p.definitions?.[ 'process.env' ] );
		// Add custom env variables
		// https://github.com/storybookjs/storybook/issues/12270
		Object.keys( customEnvVariables ).forEach( key => {
			plugin.definitions[ 'process.env' ][ key ] = JSON.stringify( customEnvVariables[ key ] );
		} );

		// Add sass handling.
		config.module.rules.push( {
			test: /\.scss$/,
			use: [
				'style-loader',
				'css-loader',
				{
					loader: 'postcss-loader',
					options: {
						postcssOptions: {
							ident: 'postcss',
							plugins: postcssPlugins,
						},
					},
				},
				{ loader: 'sass-loader', options: { api: 'modern-compiler' } },
			],
			include: includePaths,
		} );

		// Conform to Webpack module resolution rule for Search dashboard.
		config.resolve.modules.push(
			fileURLToPath( new URL( '../../../packages/search/src/dashboard/', import.meta.url ) )
		);

		// So packages don't need to be pre-built.
		config.resolve.conditionNames = [
			'jetpack:src',
			...( config.resolve.conditionNames ?? [ '...' ] ),
		];

		config.resolve.alias = {
			...config.resolve.alias,

			// Boost specific aliases
			$lib: path.join( __dirname, '../../../plugins/boost/app/assets/src/js/lib' ),
			$features: path.join( __dirname, '../../../plugins/boost/app/assets/src/js/features' ),
			$layout: path.join( __dirname, '../../../plugins/boost/app/assets/src/js/layout' ),
			$svg: path.join( __dirname, '../../../plugins/boost/app/assets/src/js/svg' ),
			$css: path.join( __dirname, '../../../plugins/boost/app/assets/src/css' ),
			$images: path.join( __dirname, '../../../plugins/boost/app/assets/static/images' ),
		};

		return config;
	},
	refs: {
		gutenberg: {
			title: 'Gutenberg Components',
			url: 'https://wordpress.github.io/gutenberg/',
		},
	},
	framework: {
		// Workaround https://github.com/storybookjs/storybook/issues/21710
		// from https://storybook.js.org/docs/faq#how-do-i-fix-module-resolution-in-special-environments
		name: path.dirname( require.resolve( '@storybook/react-webpack5/package.json' ) ),
		options: {},
	},
	docs: {
		autodocs: true,
	},
	staticDirs: [ '../public' ],
	typescript: {
		reactDocgen: 'react-docgen-typescript',
	},
	babel: async () => ( {
		presets: [ require.resolve( '@automattic/jetpack-webpack-config/babel/preset' ) ],
	} ),
};
export default sbconfig;
