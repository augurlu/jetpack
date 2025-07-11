/* global window */
if ( ! window.matchMedia ) {
	window.matchMedia = query => ( {
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	} );
}

// Needed by various Gutenberg packages
if ( ! global.ResizeObserver ) {
	global.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

// jsdom doesn't support TextEncoder, so polyfill
// https://github.com/remix-run/react-router/issues/12363
if ( ! global.TextEncoder ) {
	const { TextEncoder, TextDecoder } = require( 'node:util' );
	global.TextEncoder = TextEncoder;
	global.TextDecoder = TextDecoder;
}
