import domReady from '@wordpress/dom-ready';
import { validate as emailValidatorValidate } from 'email-validator';
// NOTE: We only import the debounce package here for to reduced bundle size.
//       Do not import the entire lodash library!
// eslint-disable-next-line lodash/import-scope
import debounce from 'lodash/debounce';
import { BLOCK_CLASS } from './constants';

import './view.scss';

function fetchSubscription( blogId, email, params ) {
	let url =
		'https://public-api.wordpress.com/rest/v1.1/sites/' +
		encodeURIComponent( blogId ) +
		'/email_follow/subscribe?email=' +
		encodeURIComponent( email );

	for ( const param in params ) {
		url += '&' + encodeURIComponent( param ) + '=' + encodeURIComponent( params[ param ] );
	}
	return new Promise( function ( resolve, reject ) {
		const xhr = new XMLHttpRequest();
		xhr.open( 'GET', url );
		xhr.onload = function () {
			if ( xhr.status === 200 ) {
				const res = JSON.parse( xhr.responseText );
				resolve( res );
			} else {
				const res = JSON.parse( xhr.responseText );
				reject( res );
			}
		};
		xhr.send();
	} );
}

function validateEmail( form, emailField ) {
	const email = emailField.value;
	const errorClass = 'error';
	emailField.classList.remove( errorClass );
	if ( ! emailValidatorValidate( email ) ) {
		emailField.classList.add( errorClass );
		if ( typeof document.createElement( 'input' ).reportValidity === 'function' ) {
			// In case that browser supports it, trigger HTML5 validation
			form.reportValidity();
		}
		return false;
	}

	return true;
}

const handleEmailValidation = ( form, emailField ) => {
	return debounce( () => {
		validateEmail( form, emailField );
	}, 1000 );
};

function activateSubscription( block, blogId ) {
	const form = block.querySelector( 'form' );
	const emailField = block.querySelector( 'input[name=email]' );
	const processingEl = block.querySelector( '.' + BLOCK_CLASS + '_processing' );
	const errorEl = block.querySelector( '.' + BLOCK_CLASS + '_error' );
	const successEl = block.querySelector( '.' + BLOCK_CLASS + '_success' );
	emailField.addEventListener( 'input', handleEmailValidation( form, emailField ) );
	form.addEventListener( 'submit', e => {
		e.preventDefault();
		if ( ! validateEmail( form, emailField ) ) {
			return;
		}
		const email = emailField.value;
		const params = [].slice
			.call( form.querySelectorAll( 'input[type="hidden"].mc-submit-param' ) )
			.reduce( ( accumulator, node ) => ( { ...accumulator, [ node.name ]: node.value } ), {} );
		block.classList.add( 'is-processing' );
		emailField.removeEventListener( 'input', handleEmailValidation( form, emailField ) );
		processingEl.classList.add( 'is-visible' );
		fetchSubscription( blogId, email, params ).then(
			response => {
				processingEl.classList.remove( 'is-visible' );
				if ( response.error && response.error !== 'member_exists' ) {
					errorEl.classList.add( 'is-visible' );
				} else {
					successEl.classList.add( 'is-visible' );
				}
			},
			() => {
				processingEl.classList.remove( 'is-visible' );
				errorEl.classList.add( 'is-visible' );
			}
		);
	} );
}

const initializeMailchimpBlocks = () => {
	const mailchimpBlocks = Array.from( document.querySelectorAll( '.' + BLOCK_CLASS ) );
	mailchimpBlocks.forEach( block => {
		if ( block.getAttribute( 'data-jetpack-block-initialized' ) === 'true' ) {
			return;
		}

		const blog_id = block.getAttribute( 'data-blog-id' );
		try {
			activateSubscription( block, blog_id );
		} catch ( err ) {
			// eslint-disable-next-line no-undef -- webpack sets process.env.NODE_ENV
			if ( 'production' !== process.env.NODE_ENV ) {
				// eslint-disable-next-line no-console
				console.error( err );
			}
		}

		block.setAttribute( 'data-jetpack-block-initialized', 'true' );
	} );
};

if ( typeof window !== 'undefined' ) {
	domReady( initializeMailchimpBlocks );
}
