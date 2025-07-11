// Packages we need to copy versions from for `@wordpress/dataviews/wp`.
const wpPkgs = {
	'@wordpress/components': [
		'change-case',
		'colord',
		'date-fns',
		'deepmerge',
		'@emotion/cache',
		'@emotion/css',
		'@emotion/react',
		'@emotion/styled',
		'@emotion/utils',
		'fast-deep-equal',
		'@floating-ui/react-dom',
		'framer-motion',
		'highlight-words-core',
		'is-plain-object',
		'memize',
		'@use-gesture/react',
		'uuid',
		'@wordpress/date',
		'@wordpress/hooks',
	],
	'@wordpress/element': [ 'react-dom' ],
	'@wordpress/data': [ 'use-memo-one' ],
};
const wpPkgFetches = {};

/**
 * Fix package dependencies.
 *
 * We could generally do the same with pnpm.overrides in packages.json, but this allows for comments.
 *
 * @param {object} pkg - Dependency package.json contents.
 * @return {object} Modified pkg.
 */
async function fixDeps( pkg ) {
	// Deps tend to get outdated due to a slow release cycle.
	// So change `^` to `>=` and hope any breaking changes will not really break.
	if (
		pkg.name === '@automattic/social-previews' ||
		pkg.name === '@automattic/components' ||
		pkg.name === '@automattic/launchpad'
	) {
		for ( const [ dep, ver ] of Object.entries( pkg.dependencies ) ) {
			if ( dep.startsWith( '@wordpress/' ) && ver.startsWith( '^' ) ) {
				pkg.dependencies[ dep ] = '>=' + ver.substring( 1 );
			}
		}
	}

	// Broken version, and a fix hasn't been released for a while yet.
	// p1743531431572359-slack-C02DQP0FP
	if (
		pkg.name.startsWith( '@automattic/launchpad' ) &&
		pkg.dependencies?.[ '@automattic/data-stores' ] === '^3.1.0'
	) {
		pkg.dependencies[ '@automattic/data-stores' ] = '3.1.0 || >3.1.1';
	}

	// Outdated dependency version causing dependabot warnings.
	// https://github.com/WordPress/gutenberg/issues/69557
	if (
		pkg.name.startsWith( '@wordpress/' ) &&
		pkg.dependencies?.[ '@babel/runtime' ] === '7.25.7'
	) {
		pkg.dependencies[ '@babel/runtime' ] = '^7.26.10';
	}

	// Missing dep or peer dep on react.
	// https://github.com/WordPress/gutenberg/issues/55171
	if (
		pkg.name === '@wordpress/icons' &&
		! pkg.dependencies?.react &&
		! pkg.peerDependencies?.react
	) {
		pkg.peerDependencies.react = '^18';
	}

	// We need to add the missing deps for `@wordpress/dataviews` because
	// the build fails when using pnpm with hoisting.
	// @see https://github.com/WordPress/gutenberg/issues/67864
	if ( pkg.name === '@wordpress/dataviews' ) {
		for ( const fromPkg of Object.keys( wpPkgs ) ) {
			if ( ! wpPkgFetches[ fromPkg ] ) {
				wpPkgFetches[ fromPkg ] = fetch( `https://registry.npmjs.org/${ fromPkg }` ).then( r =>
					r.json()
				);
			}
			const ver = pkg.dependencies[ fromPkg ].replace( /^\^/, '' );
			const deps = ( await wpPkgFetches[ fromPkg ] ).versions[ ver ].dependencies;
			for ( const dep of wpPkgs[ fromPkg ] ) {
				if ( deps[ dep ] === undefined ) {
					// prettier-ignore
					throw new Error( `pnpmfile hack needs updating, ${ fromPkg } ${ ver } doesn't depend on ${ dep } anymore?` );
				}
				pkg.optionalDependencies[ dep ] = deps[ dep ];
			}
		}

		// Gutenberg is intending to get rid of this. For now, let's just not upgrade it.
		// https://github.com/WordPress/gutenberg/issues/60975
		pkg.optionalDependencies[ 'framer-motion' ] += ' <11.5.0';
	}

	// Missing dep or peer dep.
	// https://github.com/TanStack/query/issues/9097
	if (
		pkg.name === '@tanstack/eslint-plugin-query' &&
		! pkg.dependencies?.typescript &&
		! pkg.peerDependencies?.typescript
	) {
		pkg.peerDependencies ??= {};
		pkg.peerDependencies.typescript = '*';
	}

	// Turn @wordpress/eslint-plugin's eslint plugin deps into peer deps.
	// https://github.com/WordPress/gutenberg/issues/39810
	if ( pkg.name === '@wordpress/eslint-plugin' ) {
		for ( const [ dep, ver ] of Object.entries( pkg.dependencies ) ) {
			if (
				dep.startsWith( 'eslint-plugin-' ) ||
				dep.endsWith( '/eslint-plugin' ) ||
				dep.startsWith( 'eslint-config-' ) ||
				dep.endsWith( '/eslint-config' ) ||
				dep.startsWith( '@typescript-eslint/' )
			) {
				delete pkg.dependencies[ dep ];
				pkg.peerDependencies[ dep ] = ver.replace( /^\^?/, '>=' );
			}
		}

		// Doesn't really need these at all with eslint 9 and our config.
		pkg.peerDependenciesMeta ??= {};
		pkg.peerDependenciesMeta[ '@typescript-eslint/eslint-plugin' ] = { optional: true };
		pkg.peerDependenciesMeta[ '@typescript-eslint/parser' ] = { optional: true };
	}

	// Unnecessarily explicit deps. I don't think we really even need @wordpress/babel-preset-default at all.
	if ( pkg.name === '@wordpress/babel-preset-default' || pkg.name === '@wordpress/eslint-plugin' ) {
		for ( const [ dep, ver ] of Object.entries( pkg.dependencies ) ) {
			if ( dep.startsWith( '@babel/' ) && ! ver.startsWith( '^' ) && ! ver.startsWith( '>' ) ) {
				pkg.dependencies[ dep ] = '^' + ver;
			}
		}
	}

	// Update localtunnel axios dep to avoid CVE
	// https://github.com/localtunnel/localtunnel/issues/632
	if ( pkg.name === 'localtunnel' && pkg.dependencies.axios === '0.21.4' ) {
		pkg.dependencies.axios = '^1.6.0';
	}

	// Avoid annoying flip-flopping of sub-dep peer deps.
	// https://github.com/localtunnel/localtunnel/issues/481
	if ( pkg.name === 'localtunnel' ) {
		for ( const [ dep, ver ] of Object.entries( pkg.dependencies ) ) {
			if ( ver.match( /^\d+(\.\d+)+$/ ) ) {
				pkg.dependencies[ dep ] = '^' + ver;
			}
		}
	}

	// Seemingly unmaintained upstream, and has strict deps that are outdated.
	// https://github.com/mbalabash/estimo/issues/50
	if ( pkg.name === 'estimo' ) {
		for ( const [ dep, ver ] of Object.entries( pkg.dependencies ) ) {
			if ( ver.match( /^\d+(\.\d+)+$/ ) ) {
				pkg.dependencies[ dep ] = '^' + ver;
			}
		}
	}

	// Outdated dependency.
	// https://github.com/istanbuljs/babel-plugin-istanbul/issues/300
	// https://github.com/jestjs/jest/issues/15236
	if ( pkg.name === 'babel-plugin-istanbul' && pkg.dependencies[ 'test-exclude' ] === '^6.0.0' ) {
		pkg.dependencies[ 'test-exclude' ] = '^7.0.0';
	}

	// Outdated dependency.
	// No upstream bug link yet, upstream seems unmaintained anyway.
	if ( pkg.name === 'rollup-plugin-postcss' && pkg.dependencies.cssnano === '^5.0.1' ) {
		pkg.dependencies.cssnano = '^5.0.1 || ^6 || ^7';
	}

	// Missing dep or peer dep on @babel/runtime
	// https://github.com/zillow/react-slider/issues/296
	if (
		pkg.name === 'react-slider' &&
		! pkg.dependencies?.[ '@babel/runtime' ] &&
		! pkg.peerDependencies?.[ '@babel/runtime' ]
	) {
		pkg.peerDependencies[ '@babel/runtime' ] = '^7';
	}

	// Apparently this package tried to switch from a dep to a peer dep, but screwed it up.
	// https://github.com/ajv-validator/ajv-formats/issues/80
	if ( pkg.name === 'ajv-formats' && pkg.dependencies?.ajv && pkg.peerDependencies?.ajv ) {
		delete pkg.dependencies.ajv;
		delete pkg.peerDependenciesMeta?.ajv;
	}

	// Gutenberg is intending to get rid of this. For now, let's just not upgrade it.
	// https://github.com/WordPress/gutenberg/issues/60975
	if ( pkg.name === '@wordpress/components' && pkg.dependencies?.[ 'framer-motion' ] ) {
		pkg.dependencies[ 'framer-motion' ] += ' <11.5.0';
	}

	// Types packages have outdated deps. Reset all their `@wordpress/*` deps to star-version,
	// which pnpm should 🤞 dedupe to match whatever is in use elsewhere in the monorepo.
	// https://github.com/Automattic/jetpack/pull/35904#discussion_r1508681777
	// Currently @types/wordpress__block-editor is the only one still in use; see also https://github.com/WordPress/gutenberg/issues/67691
	if ( pkg.name.startsWith( '@types/wordpress__' ) && pkg.dependencies ) {
		for ( const k of Object.keys( pkg.dependencies ) ) {
			if ( k.startsWith( '@wordpress/' ) ) {
				pkg.dependencies[ k ] = '*';
			}
		}
	}

	// Outdated, deprecated dependency.
	// https://github.com/fontello/svg2ttf/issues/123
	if ( pkg.name === 'svg2ttf' && pkg.dependencies?.[ '@xmldom/xmldom' ] === '^0.7.2' ) {
		pkg.dependencies[ '@xmldom/xmldom' ] = '^0.9';
	}

	// Outdated, deprecated dependency.
	// https://github.com/hipstersmoothie/react-docgen-typescript-plugin/issues/93
	if (
		pkg.name === '@storybook/react-docgen-typescript-plugin' &&
		pkg.dependencies?.[ 'flat-cache' ] === '^3.0.4'
	) {
		pkg.dependencies[ 'flat-cache' ] = '^4';
	}

	// Dependency on "latest" makes for many spurious updates. Leave it for the lockfile maintenance PRs.
	// No upstream evident to report bugs to.
	if ( pkg.name === '@paulirish/trace_engine' ) {
		for ( const k of Object.keys( pkg.dependencies ) ) {
			if ( pkg.dependencies[ k ] === 'latest' ) {
				pkg.dependencies[ k ] = '*';
			}
		}
	}

	// Hack-update Jest to v30 for ts-jest and @storybook/test-runner. Not sure if they'd 100% work, but they seem to work for us in CI.
	// https://github.com/storybookjs/test-runner/issues/567
	if ( pkg.name === '@storybook/test-runner' && pkg.dependencies.jest === '^29.6.4' ) {
		pkg.dependencies.jest = '^30.0.0';
		pkg.dependencies[ 'jest-circus' ] = '^30.0.0';
		pkg.dependencies[ 'jest-environment-node' ] = '^30.0.0';
		pkg.dependencies[ 'jest-runner' ] = '^30.0.0';
	}
	if (
		pkg.name === 'jest-watch-typeahead' &&
		pkg.peerDependencies.jest === '^27.0.0 || ^28.0.0 || ^29.0.0'
	) {
		pkg.peerDependencies.jest += ' || ^30.0.0';
		pkg.dependencies[ 'jest-regex-util' ] = '^30.0.0';
		pkg.dependencies[ 'jest-watcher' ] = '^30.0.0';
	}
	if ( pkg.name === 'jest-playwright-preset' && pkg.peerDependencies.jest === '^29.3.1' ) {
		pkg.peerDependencies.jest += ' || ^30.0.0';
		pkg.peerDependencies[ 'jest-circus' ] += ' || ^30.0.0';
		pkg.peerDependencies[ 'jest-environment-node' ] += ' || ^30.0.0';
		pkg.peerDependencies[ 'jest-runner' ] += ' || ^30.0.0';
	}

	return pkg;
}

/**
 * Fix package peer dependencies.
 *
 * This can't be done with pnpm.overrides.
 *
 * @param {object} pkg - Dependency package.json contents.
 * @return {object} Modified pkg.
 */
function fixPeerDeps( pkg ) {
	// Indirect deps that still depend on React <18.
	const reactOldPkgs = new Set( [
		// Still on 16.
		'react-autosize-textarea', // @wordpress/block-editor <https://github.com/WordPress/gutenberg/issues/39619>
	] );
	if ( reactOldPkgs.has( pkg.name ) ) {
		for ( const p of [ 'react', 'react-dom' ] ) {
			if ( ! pkg.peerDependencies?.[ p ] ) {
				continue;
			}

			if (
				pkg.peerDependencies[ p ].match( /(?:^|\|\|\s*)(?:\^16|16\.x)/ ) &&
				! pkg.peerDependencies[ p ].match( /(?:^|\|\|\s*)(?:\^17|17\.x)/ )
			) {
				pkg.peerDependencies[ p ] += ' || ^17';
			}
			if (
				pkg.peerDependencies[ p ].match( /(?:^|\|\|\s*)(?:\^17|17\.x)/ ) &&
				! pkg.peerDependencies[ p ].match( /(?:^|\|\|\s*)(?:\^18|18\.x)/ )
			) {
				pkg.peerDependencies[ p ] += ' || ^18';
			}
		}
	}

	// It assumes hoisting to find its plugins. Sigh. Add peer deps for the plugins we use.
	// https://github.com/ai/size-limit/issues/366
	if ( pkg.name === 'size-limit' ) {
		pkg.peerDependencies ??= {};
		pkg.peerDependencies[ '@size-limit/preset-app' ] = '*';
		pkg.peerDependenciesMeta ??= {};
		pkg.peerDependenciesMeta[ '@size-limit/preset-app' ] = { optional: true };
	}

	return pkg;
}

/**
 * Pnpm package hook.
 *
 * @see https://pnpm.io/pnpmfile#hooksreadpackagepkg-context-pkg--promisepkg
 * @param {object} pkg     - Dependency package.json contents.
 * @param {object} context - Pnpm object of some sort.
 * @return {object} Modified pkg.
 */
async function readPackage( pkg, context ) {
	if ( pkg.name ) {
		pkg = await fixDeps( pkg, context );
		pkg = fixPeerDeps( pkg, context );
	}
	return pkg;
}

/**
 * Pnpm lockfile hook.
 *
 * @see https://pnpm.io/pnpmfile#hooksafterallresolvedlockfile-context-lockfile--promiselockfile
 * @param {object} lockfile - Lockfile data.
 * @return {object} Modified lockfile.
 */
function afterAllResolved( lockfile ) {
	// If there's only one "importer", it's probably pnpx rather than the monorepo. Don't interfere.
	if ( Object.keys( lockfile.importers ).length === 1 ) {
		return lockfile;
	}

	for ( const [ k, v ] of Object.entries( lockfile.packages ) ) {
		// Forbid `@wordpress/scripts`. Brings in too many different versions of deps, like (as of March 2025) eslint 8 when we've already updated to eslint 9.
		if ( k.startsWith( '@wordpress/scripts@' ) ) {
			throw new Error(
				"Please don't bring in `@wordpress/scripts`. It brings in different versions of a lot of dependencies, and we generally have our own way to do the things that it tries to do.\nFor example, instead of `wp-scripts build`, run `webpack` directly with a config based on our monorepo-internal `@automattic/jetpack-webpack-config` package."
			);
		}

		// Encourage `sass-embedded` over `sass`. Supposed to be faster, and it would be easy for `sass` to leak in.
		if ( k.startsWith( 'sass@' ) || k.startsWith( 'node-sass@' ) ) {
			throw new Error(
				// prettier-ignore
				`Please use \`sass-embedded\` rather than \`${ k.replace( /@.*/, '' ) }\`. We've standardized on the former.`
			);
		}

		// Forbid installing webpack without webpack-cli. It results in lots of spurious lockfile changes.
		// https://github.com/pnpm/pnpm/issues/3935
		if ( k.startsWith( 'webpack@' ) && ! v.optionalDependencies?.[ 'webpack-cli' ] ) {
			throw new Error(
				"Something you've done is trying to add a dependency on webpack without webpack-cli.\nThis is not allowed, as it tends to result in pnpm lockfile flip-flopping.\nSee https://github.com/pnpm/pnpm/issues/3935 for the upstream bug report.\n"
			);
		}
	}

	return lockfile;
}

module.exports = {
	hooks: {
		readPackage,
		afterAllResolved,
	},
};
