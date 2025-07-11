/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const path = require( 'path' );
const jetpackWebpackConfig = require( '@automattic/jetpack-webpack-config/webpack' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );

/**
 * Internal variables
 */
const sharedWebpackConfig = {
	mode: jetpackWebpackConfig.mode,
	devtool: jetpackWebpackConfig.devtool,
	entry: {
		editor: './src/blocks/contact-form/editor.js',
		view: './src/blocks/contact-form/view.js',
		'form-progress-indicator/style': './src/blocks/form-progress-indicator/style.scss',
		'form-step-navigation/style': './src/blocks/form-step-navigation/style.scss',
		'field-rating/style': './src/blocks/field-rating/style.scss',
	},
	output: {
		...jetpackWebpackConfig.output,
		path: path.join( __dirname, '../dist/blocks' ),
	},
	optimization: {
		...jetpackWebpackConfig.optimization,
	},
	resolve: {
		...jetpackWebpackConfig.resolve,
	},
	node: {},
	plugins: [ ...jetpackWebpackConfig.StandardPlugins() ],
	externals: {
		...jetpackWebpackConfig.externals,
		jetpackConfig: JSON.stringify( {
			consumer_slug: 'jetpack-forms',
		} ),
	},
	module: {
		strictExportPresence: true,
		rules: [
			// Transpile JavaScript
			jetpackWebpackConfig.TranspileRule( {
				exclude: /node_modules\//,
			} ),

			// Transpile @automattic/* in node_modules too.
			jetpackWebpackConfig.TranspileRule( {
				includeNodeModules: [
					'@automattic/',
					'debug/',
					'gridicons/',
					'punycode/',
					'query-string/',
					'split-on-first/',
					'strict-uri-encode/',
				],
			} ),

			// Handle CSS.
			jetpackWebpackConfig.CssRule( {
				extensions: [ 'css', 'sass', 'scss' ],
				extraLoaders: [
					{
						loader: 'postcss-loader',
						options: {
							// postcssOptions: { config: path.join( __dirname, 'postcss.config.js' ) },
							postcssOptions: { plugins: [ require( 'autoprefixer' ) ] },
						},
					},
					{ loader: 'sass-loader', options: { api: 'modern-compiler' } },
				],
			} ),

			// Handle images.
			jetpackWebpackConfig.FileRule(),
		],
	},
};

module.exports = [
	{
		...sharedWebpackConfig,
		plugins: [
			...sharedWebpackConfig.plugins,
			new CopyWebpackPlugin( {
				patterns: [
					{
						from: 'src/blocks/**/block.json',
						to: '[name][ext]',
						noErrorOnMissing: true,
					},
				],
			} ),
		],
	},
];
