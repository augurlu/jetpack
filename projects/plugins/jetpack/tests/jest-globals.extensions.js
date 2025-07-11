// Needed to use transpiled generator functions.
// See: https://babeljs.io/docs/en/babel-polyfill for details.
require( 'regenerator-runtime/runtime' );

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

// Needed to mock a new global added by Gutenberg G2 components.
if ( ! window.CSS ) {
	window.CSS = {
		escape: () => false,
		supports: () => false,
	};
}

// Mock this that's usually set by automattic/jetpack-connection.
window.JP_CONNECTION_INITIAL_STATE = {
	userConnectionData: {
		currentUser: {
			wpcomUser: { Id: 99999, login: 'bobsacramento', display_name: 'Bob Sacrmaneto' },
		},
	},
};

// Work around (presumably) https://github.com/microsoft/TypeScript/issues/43081
jest.mock( '@wordpress/data', () => {
	const ret = {};
	for ( const [ k, v ] of Object.entries(
		Object.getOwnPropertyDescriptors( jest.requireActual( '@wordpress/data' ) )
	) ) {
		Object.defineProperty( ret, k, { ...v, configurable: true } );
	}
	return ret;
} );
