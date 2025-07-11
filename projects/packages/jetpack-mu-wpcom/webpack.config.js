const path = require( 'path' );
const jetpackWebpackConfig = require( '@automattic/jetpack-webpack-config/webpack' );
const verbumConfig = require( './verbum.webpack.config.js' );

module.exports = async () => {
	return [
		...verbumConfig,
		{
			entry: {
				'a8c-posts-list': './src/features/wpcom-blocks/a8c-posts-list/blocks/posts-list/index.js',
				'block-inserter-modifications': './src/features/block-inserter-modifications/index.js',
				'core-customizer-css':
					'./src/features/custom-css/custom-css/js/core-customizer-css.core-4.9.js',
				'core-customizer-css-preview':
					'./src/features/custom-css/custom-css/js/core-customizer-css-preview.js',
				'customizer-control': './src/features/custom-css/custom-css/css/customizer-control.css',
				'error-reporting': './src/features/error-reporting/index.js',
				'holiday-snow': './src/features/holiday-snow/holiday-snow.scss',
				'jetpack-global-styles': './src/features/jetpack-global-styles/index.js',
				'jetpack-global-styles-customizer-fonts':
					'./src/features/jetpack-global-styles/customizer-fonts/index.js',
				'mailerlite-subscriber-popup': './src/features/mailerlite/subscriber-popup.js',
				'newspack-blocks-blog-posts-editor': './src/features/newspack-blocks/blog-posts/editor.js',
				'newspack-blocks-blog-posts-view': './src/features/newspack-blocks/blog-posts/view.js',
				'newspack-blocks-carousel-editor': './src/features/newspack-blocks/carousel/editor.js',
				'newspack-blocks-carousel-view': './src/features/newspack-blocks/carousel/view.js',
				'override-preview-button-url':
					'./src/features/override-preview-button-url/override-preview-button-url.js',
				'paragraph-block-placeholder':
					'./src/features/paragraph-block-placeholder/paragraph-block-placeholder.js',
				'tags-education': './src/features/tags-education/tags-education.js',
				'wpcom-admin-bar': './src/features/wpcom-admin-bar/wpcom-admin-bar.js',
				'wpcom-blocks-event-countdown-editor':
					'./src/features/wpcom-blocks/event-countdown/editor.js',
				'wpcom-blocks-event-countdown-view': './src/features/wpcom-blocks/event-countdown/view.js',
				'wpcom-blocks-timeline-editor': './src/features/wpcom-blocks/timeline/editor.js',
				'wpcom-blocks-timeline-view': './src/features/wpcom-blocks/timeline/view.js',
				'wpcom-block-description-links': './src/features/wpcom-block-description-links/index.tsx',
				'wpcom-block-editor-nux': './src/features/wpcom-block-editor-nux/index.js',
				'wpcom-comment-like': [
					'./src/features/wpcom-comments/wpcom-comment-like.js',
					'./src/features/wpcom-comments/wpcom-comment-like.css',
				],
				'wpcom-hotfixes-colors-modern': './src/features/wpcom-hotfixes/colors/modern/colors.css',
				'wpcom-dashboard-widgets':
					'./src/features/wpcom-dashboard-widgets/wpcom-dashboard-widgets.js',
				'wpcom-global-styles-editor': './src/features/wpcom-global-styles/index.js',
				'wpcom-global-styles-frontend':
					'./src/features/wpcom-global-styles/wpcom-global-styles-view.js',
				'wpcom-documentation-links':
					'./src/features/wpcom-documentation-links/wpcom-documentation-links.ts',
				'wpcom-media-url-upload': './src/features/wpcom-media/wpcom-media-url-upload.js',
				'wpcom-options-general': [
					'./src/features/wpcom-options-general/options-general.ts',
					'./src/features/wpcom-options-general/options-general.scss',
				],
				'wpcom-post-list-tracks': './src/features/wpcom-post-list/js/wpcom-post-list-tracks.ts',
				'wpcom-plugins-banner': './src/features/wpcom-plugins/js/banner.js',
				'wpcom-plugins-banner-style': './src/features/wpcom-plugins/css/banner.css',
				'wpcom-profile-settings-link-to-wpcom':
					'./src/features/wpcom-profile-settings/profile-settings-link-to-wpcom.ts',
				'wpcom-replace-site-visibility':
					'./src/features/replace-site-visibility/replace-site-visibility.tsx',
				'wpcom-sidebar-notice': './src/features/wpcom-sidebar-notice/wpcom-sidebar-notice.js',
				'adminbar-launch-button': './src/features/launch-button/index.js',
			},
			mode: jetpackWebpackConfig.mode,
			devtool: jetpackWebpackConfig.devtool,
			output: {
				...jetpackWebpackConfig.output,
				filename: '[name]/[name].js',
				path: path.resolve( __dirname, 'src/build' ),
			},
			optimization: {
				...jetpackWebpackConfig.optimization,
			},
			resolve: {
				...jetpackWebpackConfig.resolve,
				alias: {
					...jetpackWebpackConfig.resolve.alias,
					/** Replace the classnames used by @automattic/newspack-blocks with clsx because we changed to use clsx */
					classnames: await findPackage( 'clsx' ),
				},
				fallback: {
					...jetpackWebpackConfig.resolve.fallback,
					events: require.resolve( 'events/' ),
				},
			},
			node: false,
			plugins: [
				...jetpackWebpackConfig.StandardPlugins( {
					MiniCssExtractPlugin: { filename: '[name]/[name].css' },
					DefinePlugin: {
						// __i18n_text_domain__ is used in page-pattern-modal npm package, which is used only by starter-page-templates feature.
						// Consider moving page-pattern-modal package to starter-page-templates and remove this.
						__i18n_text_domain__: JSON.stringify( 'jetpack-mu-wpcom' ),
					},
				} ),
			],
			module: {
				strictExportPresence: true,
				rules: [
					// Transpile JavaScript.
					jetpackWebpackConfig.TranspileRule( {
						exclude: /node_modules\//,
					} ),

					// Transpile @automattic/* in node_modules too.
					jetpackWebpackConfig.TranspileRule( {
						includeNodeModules: [ '@automattic/' ],
					} ),

					// Handle CSS.
					jetpackWebpackConfig.CssRule( {
						extensions: [ 'css', 'scss' ],
						extraLoaders: [ { loader: 'sass-loader', options: { api: 'modern-compiler' } } ],
					} ),

					// Handle images.
					jetpackWebpackConfig.FileRule(),
				],
			},
			externals: {
				...jetpackWebpackConfig.externals,
				jetpackConfig: JSON.stringify( {
					consumer_slug: 'jetpack-mu-wpcom',
				} ),
			},
		},
	];
};

/**
 * Given a package name, finds the absolute path for it.
 *
 * require.resolve() will resolve to the main file of the package, using Node's resolution algorithm to find
 * a `package.json` and looking at the field `main`. This function will return the folder that contains `package.json`
 * instead of trying to resolve the main file.
 *
 * Example: `@wordpress/data` may resolve to `/home/myUser/wp-calypso/node_modules/@wordpress/data`.
 *
 * Note this is not the same as looking for `__dirname+'/node_modules/'+pkgName`, as the package may be in a parent
 * `node_modules`
 * @param {string} pkgName - Name of the package to search for.
 * @return {string} - The absolute path of the package.
 */
async function findPackage( pkgName ) {
	const { packageDirectory } = await import( 'package-directory' ); // Whee ESM-only.
	const fullPath = require.resolve( pkgName );
	const packagePath = await packageDirectory( { cwd: fullPath } );
	return packagePath;
}
