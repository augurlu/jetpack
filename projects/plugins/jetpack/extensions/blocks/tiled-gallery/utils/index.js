import { isWoASite, isSimpleSite } from '@automattic/jetpack-script-data';
import { isPrivateSite } from '@automattic/jetpack-shared-extension-utils';
import { isBlobURL } from '@wordpress/blob';
import { select } from '@wordpress/data';
import { range } from 'lodash';
import photon from 'photon';
import isOfflineMode from '../../../shared/is-offline-mode';
import { PHOTON_MAX_RESIZE } from '../constants';

let jetpackPlanFromState;

window.addEventListener( 'load', function () {
	const hasImageCompare = select( 'core/block-editor' )
		.getBlocks()
		.some( block => block.name === 'jetpack/image-compare' );
	if ( hasImageCompare && ! jetpackPlanFromState ) {
		jetpackPlanFromState = window?.Jetpack_Editor_Initial_State?.jetpack?.jetpack_plan;
	}
} );

export function isSquareishLayout( layout ) {
	return [ 'circle', 'square' ].includes( layout );
}

/**
 * Build src and srcSet properties which can be used on an <img />
 *
 * @param {object} img                     - Image
 * @param {number} img.height              - Image height
 * @param {string} img.url                 - Image URL
 * @param {number} img.width               - Image width
 * @param {object} galleryAtts             - Gallery attributes relevant for image optimization.
 * @param {string} galleryAtts.layoutStyle - Gallery layout. 'rectangular', 'circle', etc.
 * @param {number} galleryAtts.columns     - Gallery columns. Not applicable for all layouts.
 * @return {object} Returns an object. If possible, the object will include `src` and `srcSet` properties {string} for use on an image.
 */
export function photonizedImgProps( img, galleryAtts = {} ) {
	if ( ! img.height || ! img.width ) {
		return img.url ? { src: img.url } : {};
	}

	// Do not use Photon if we are in offline mode.
	if ( isOfflineMode() ) {
		return { src: img.url };
	}

	// Do not Photonize images that are still uploading, are from localhost, or are private + atomic
	if (
		isBlobURL( img.url ) ||
		/^https?:\/\/localhost/.test( img.url ) ||
		/^https?:\/\/.*\.local\//.test( img.url ) ||
		( isWoASite() && isPrivateSite() )
	) {
		return { src: img.url };
	}

	// Drop query args, photon URLs can't handle them
	// This should be the "raw" url, we'll add dimensions later
	const url = img.url.split( '?', 1 )[ 0 ];
	const { height, width } = img;
	const { layoutStyle } = galleryAtts;

	const photonImplementation = true === isVIP() || isSimpleSite() ? photonWpcomImage : photon;

	/**
	 * Build the `src`
	 * We don't know what the viewport size will be like. Use full size src.
	 */

	let src;
	if ( isSquareishLayout( layoutStyle ) && width && height ) {
		// Layouts with 1:1 width/height ratio should be made square
		const size = Math.min( PHOTON_MAX_RESIZE, width, height );
		src = photonImplementation( url, {
			resize: `${ size },${ size }`,
		} );
	} else {
		src = photonImplementation( url );
	}

	/**
	 * Build a sensible `srcSet` that will let the browser get an optimized image based on
	 * viewport width.
	 */

	const step = 300;
	const srcsetMinWith = 600;

	let srcSet;
	if ( isSquareishLayout( layoutStyle ) ) {
		const minWidth = Math.min( srcsetMinWith, width, height );
		const maxWidth = Math.min( PHOTON_MAX_RESIZE, width, height );

		srcSet = range( minWidth, maxWidth, step )
			.map( srcsetWidth => {
				const srcsetSrc = photonImplementation( url, {
					resize: `${ srcsetWidth },${ srcsetWidth }`,
					strip: 'info',
				} );
				return srcsetSrc ? `${ srcsetSrc } ${ srcsetWidth }w` : null;
			} )
			.filter( Boolean )
			.join( ',' );
	} else {
		const minWidth = Math.min( srcsetMinWith, width );
		const maxWidth = Math.min( PHOTON_MAX_RESIZE, width );

		srcSet = range( minWidth, maxWidth, step )
			.map( srcsetWidth => {
				const srcsetSrc = photonImplementation( url, {
					strip: 'info',
					width: srcsetWidth,
				} );
				return srcsetSrc ? `${ srcsetSrc } ${ srcsetWidth }w` : null;
			} )
			.filter( Boolean )
			.join( ',' );
	}

	return Object.assign( { src }, srcSet && { srcSet } );
}
function isVIP() {
	/*global jetpack_plan*/
	// Use `jetpackPlanFromState` if available, otherwise fall back to `jetpack_plan` defined within the render function in tiled-gallery.php.
	let jetpackPlan;
	if ( typeof jetpackPlanFromState !== 'undefined' ) {
		jetpackPlan = jetpackPlanFromState;
	} else if ( typeof jetpack_plan !== 'undefined' ) {
		jetpackPlan = jetpack_plan;
	}
	return jetpackPlan && jetpackPlan?.data === 'vip';
}

/**
 * Apply photon arguments to *.files.wordpress.com images
 * or images on mapped domains on private simple sites.
 *
 * This function largely duplicates the functionality of the photon.js lib.
 * This is necessary because we want to serve images from *.files.wordpress.com so that private
 * WordPress.com sites can use this block which depends on a Photon-like image service.
 *
 * If we pass all images through Photon servers, some images are unreachable. *.files.wordpress.com
 * is already photon-like so we can pass it the same parameters for image resizing.
 *
 * @param {string} url  - Image url
 * @param {object} opts - Options to pass to photon
 * @return {string}      Url string with options applied
 */
function photonWpcomImage( url, opts = {} ) {
	// Adhere to the same options API as the photon.js lib
	const photonLibMappings = {
		width: 'w',
		height: 'h',
		letterboxing: 'lb',
		removeLetterboxing: 'ulb',
	};

	// Discard some param parts
	const urlObj = Object.assign( new URL( url, window.location.href ), {
		username: '',
		password: '',
		port: '',
		search: '',
		hash: '',
	} );

	// Build query
	for ( const [ k, v ] of Object.entries( opts ) ) {
		urlObj.searchParams.set(
			Object.hasOwn( photonLibMappings, k ) ? photonLibMappings[ k ] : k,
			v
		);
	}

	return urlObj.toString();
}
