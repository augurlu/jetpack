import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import config from 'config';
import logger from '../logger.js';
const { E2E_DEBUG } = process.env;
export const BASE_DOCKER_CMD = 'pnpm jetpack docker --type e2e --name t1';

/**
 * Executes a shell command and return it as a Promise.
 *
 * @param {string} cmd - shell command
 * @return {Promise<string>} output
 */
export async function execShellCommand( cmd ) {
	return new Promise( resolve => {
		let result = '';
		const cmdExec = exec( cmd, error => {
			if ( error ) {
				logger.warn( `CLI: ${ error.toString() }` );
				return resolve( error );
			}
			// return resolve( stderr );
			return resolve( result );
		} );
		const output = data => {
			// remove the new line at the end
			// data = data.replace( /\n$/, '' );
			logger.cli( data.replace( /\n$/, '' ) );
			result += data;
		};
		cmdExec.stdout.on( 'data', output );
		cmdExec.stderr.on( 'data', output );
	} );
}

/**
 * Execute shell command synchronously
 *
 * @param {string} cmd - shell command
 * @return {string} output
 */
export function execSyncShellCommand( cmd ) {
	return execSync( cmd ).toString();
}

/**
 * Reset WordPress install
 */
export async function resetWordpressInstall() {
	const cmd = 'pnpm e2e-env reset';
	await cancelPartnerPlan();
	execSyncShellCommand( cmd );
}

/**
 * Cancel partner plan
 */
async function cancelPartnerPlan() {
	logger.step( `Cancelling partner plan` );
	const [ clientID, clientSecret ] = config.get( 'jetpackStartSecrets' );
	const cmd = `sh /usr/local/src/jetpack-monorepo/tools/partner-cancel.sh -- --partner_id=${ clientID } --partner_secret=${ clientSecret } --allow-root`;
	await execContainerShellCommand( cmd );
}

/**
 * Runs wp cli command to activate jetpack module, also checks if the module is available in the list of active modules.
 *
 * @param {page}   page   - Playwright page object
 * @param {string} module - Jetpack module name
 * @return {boolean} Always true.
 */
export async function activateModule( page, module ) {
	const cliCmd = `jetpack module activate ${ module }`;
	const activeModulesCmd = 'option get jetpack_active_modules --format=json';
	await execWpCommand( cliCmd );

	const modulesList = JSON.parse( await execWpCommand( activeModulesCmd ) );

	if ( ! modulesList.includes( module ) ) {
		throw new Error( `Failed to activate module ${ module }!` );
	}

	return true;
}

/**
 * Exec wp cli command.
 *
 * @param {string}  wpCmd   - command
 * @param {boolean} sendUrl - Whether to add a `--url` argument
 * @return {Promise<string>} output
 */
export async function execWpCommand( wpCmd, sendUrl = true ) {
	const urlArgument = sendUrl ? `--url="${ resolveSiteUrl() }"` : '';
	const cmd = `${ BASE_DOCKER_CMD } wp -- ${ wpCmd } ${ urlArgument }`;
	let result = await execShellCommand( cmd );

	if ( typeof result !== 'object' && result.length > 0 ) {
		// Something in playwright 1.26 has started outputting these warnings. Strip them off.
		result = result.replace(
			/^(\(node:\d+\) ExperimentalWarning: Custom ESM Loaders is an experimental feature\. This feature could change at any time\n\(Use `node --trace-warnings \.\.\.` to show where the warning was created\)\n)+/,
			''
		);

		// Jetpack's `wp` command outputs a script header for some reason. Let's clean it up.
		result = result.replace( '#!/usr/bin/env php\n', '' ).trim();
	}

	return result;
}

/**
 * Exec shell command in container.
 *
 * @param {string} cmd - shell command
 * @return {Promise<string>} output
 */
export async function execContainerShellCommand( cmd ) {
	return execShellCommand( `${ BASE_DOCKER_CMD } -v exec-silent ${ cmd }` );
}

/**
 * Log WordPress debug.log file.
 */
export async function logDebugLog() {
	let log;
	try {
		log = execSyncShellCommand( `${ BASE_DOCKER_CMD } exec-silent cat wp-content/debug.log` );
	} catch ( error ) {
		logger.error( `Error caught when trying to save debug log! ${ error }` );
		return;
	}

	const escapedDate = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const filename = `debug_${ escapedDate }.log`;
	fs.writeFileSync( path.resolve( config.get( 'dirs.logs' ), filename ), log );

	const lines = log.split( '\n' );
	log = lines
		.filter( line => {
			return ! (
				line.startsWith( '> ' ) ||
				line.includes( 'pnpm run' ) ||
				line.includes( 'Done ' )
			);
		} )
		.join( '\n' );

	if ( log.length > 1 && E2E_DEBUG ) {
		logger.debug( '#### WP DEBUG.LOG ####' );
		logger.debug( log );
	}
}

/**
 * Log Apache access log file.
 */
export async function logAccessLog() {
	// const apacheLog = execSyncShellCommand( 'pnpm wp-env logs tests --watch=false' );
	const apacheLog = 'EMPTY';
	const escapedDate = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const filename = `access_${ escapedDate }.log`;
	fs.writeFileSync( path.resolve( config.get( 'dirs.logs' ), filename ), apacheLog );
}

/**
 * Formats a given file name by replacing unaccepted characters (e.g. space)
 *
 * @param {string}  filePath         - the file path. can be absolute file path, file name only, with or without extension
 * @param {boolean} includeTimestamp - if true, the current timestamp will be added as a prefix
 * @return {string} the formatted file path
 */
export function fileNameFormatter( filePath, includeTimestamp = true ) {
	const parts = path.parse( path.normalize( filePath ) );
	let fileName = parts.name;
	const ext = parts.ext;
	const dirname = parts.dir;

	if ( includeTimestamp ) {
		fileName = `${ Date.now() }_${ fileName }`;
	}

	fileName = fileName.replace( /\W/g, '_' );

	return path.join( dirname, `${ fileName }${ ext }` );
}

/**
 * Get test site config.
 *
 * @return {object} Site config
 */
function getConfigTestSite() {
	const testSite = process.env.TEST_SITE ? process.env.TEST_SITE : 'default';
	logger.debug( `Using '${ testSite }' test site config` );
	return config.get( `testSites.${ testSite }` );
}

/**
 * Get site credentials.
 *
 * @return {object} Credentials.
 */
export function getSiteCredentials() {
	const site = getConfigTestSite();
	return { username: site.username, password: site.password, apiPassword: site.apiPassword };
}

/**
 * Set environment variables expected by @wordpress/e2e-test-utils-playwright
 */
export function setWpEnvVars() {
	const site = getConfigTestSite();
	const storage = config.get( 'temp.storage' );

	process.env.WP_BASE_URL = resolveSiteUrl();
	process.env.WP_USERNAME = site.username;
	process.env.WP_PASSWORD = site.password;
	if ( storage ) {
		process.env.STORAGE_STATE_PATH = storage;
	}
}

/**
 * Get DotCom credentials.
 *
 * @return {object} Credentials.
 */
export function getDotComCredentials() {
	const site = getConfigTestSite();
	return {
		username: site.dotComAccount[ 0 ],
		password: site.dotComAccount[ 1 ],
		userId: site.dotComAccount[ 2 ],
		email: site.dotComAccount[ 3 ],
	};
}

/**
 * Get Mailchimp credentials.
 *
 * @return {object} Credentials.
 */
export function getMailchimpCredentials() {
	const site = getConfigTestSite();
	return {
		username: site.mailchimpLogin[ 0 ],
		password: site.mailchimpLogin[ 1 ],
	};
}

/**
 * Reads and returns the content of the file expected to store an URL.
 * The file path is stored in config.
 * No validation is done on the file content, so an invalid URL can be returned.
 *
 * @return {string} the file content, or undefined in file doesn't exist or cannot be read
 */
export function getReusableUrlFromFile() {
	let urlFromFile;
	try {
		urlFromFile = fs
			.readFileSync( config.get( 'temp.tunnels' ), 'utf8' )
			.replace( 'http:', 'https:' );
	} catch ( error ) {
		if ( error.code === 'ENOENT' ) {
			// We expect this, reduce noise in logs
			console.warn( "Tunnels file doesn't exist" );
		} else {
			console.error( error );
		}
	}
	return urlFromFile;
}

/**
 * There are two ways to set the target site url:
 * 1. Write it in 'temp.tunnels' file
 * 2. Configure a test site in local config and use a TEST_SITE env variable with the config property name. This overrides any value written in file
 * If none of the above is valid we throw an error
 *
 * @return {string} URL.
 */
export function resolveSiteUrl() {
	let url;

	if ( process.env.TEST_SITE ) {
		url = config.get( `testSites.${ process.env.TEST_SITE }` ).get( 'url' );
	} else {
		logger.debug( 'Checking for existing tunnel url' );
		url = getReusableUrlFromFile();
	}

	validateUrl( url );
	logger.debug( `Using site ${ url }` );
	return url;
}

/**
 * Throw an error if the passed parameter is not a valid URL
 *
 * @param {string} url - the string to to be validated as URL
 */
export function validateUrl( url ) {
	const obj = new URL( url );
	if ( ! obj ) {
		throw new Error( `Undefined or invalid url!` );
	}
}

/**
 * Checks if the test site is a local one, with wp-cli accessible or a remote one
 *
 * @return {boolean} true if site is local
 */
export function isLocalSite() {
	return ! process.env.TEST_SITE;
}

/**
 * Log environment details.
 */
export async function logEnvironment() {
	try {
		const envFilePath = path.join( `${ config.get( 'dirs.output' ) }`, 'environment.json' );

		let env = { plugins: [] };

		if ( fs.existsSync( envFilePath ) ) {
			env = fs.readFileSync( envFilePath );
		}

		const credentials = getSiteCredentials();
		const plugins = await fetch( resolveSiteUrl() + '/index.php?rest_route=/wp/v2/plugins', {
			headers: {
				Authorization:
					'Basic ' +
					Buffer.from( credentials.username + ':' + credentials.apiPassword ).toString( 'base64' ),
			},
		} ).then( res => res.json() );

		for ( const p of plugins ) {
			env.plugins.push( {
				plugin: p.plugin,
				version: p.version,
				status: p.status,
			} );
		}

		fs.writeFileSync( envFilePath, JSON.stringify( env ) );
	} catch ( error ) {
		logger.error( `Logging environment details failed! ${ error }` );
	}
}

/**
 * Get Jetpack version.
 *
 * @return {string|undefined} Version.
 */
export async function getJetpackVersion() {
	let version;

	try {
		const envFilePath = path.join( `${ config.get( 'dirs.output' ) }`, 'environment.json' );

		if ( ! fs.existsSync( envFilePath ) ) {
			await logEnvironment();
		}

		const fileContent = fs.readFileSync( envFilePath, 'utf8' );
		const env = JSON.parse( fileContent );

		const jetpack = env.plugins.filter( function ( p ) {
			return p.plugin.endsWith( '/jetpack' ) && p.status === 'active';
		} );

		version = jetpack[ 0 ].version;

		if ( process.env.GITHUB_SHA && ! process.env.TEST_SITE ) {
			version += `-${ process.env.GITHUB_SHA }`;
		}

		logger.debug( `Jetpack version: ${ version }` );
	} catch ( error ) {
		console.log( `ERROR: Failed to get Jetpack version. ${ error }` );
	}

	return version;
}
