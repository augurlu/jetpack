import restApi from '@automattic/jetpack-api';
import { jest } from '@jest/globals';

jest.unstable_mockModule( '../assignLocation', () => {
	return {
		__esModule: true,
		assignLocation: jest.fn(),
	};
} );

const { default: controls } = await import( '../controls' );
const { assignLocation: stubAssign } = await import( '../assignLocation' );

const {
	REGISTER_SITE: registerSite,
	CONNECT_USER: connectUser,
	FETCH_AUTHORIZATION_URL: fetchAuthorizationUrl,
} = controls;

const stubRegisterSite = jest.spyOn( restApi, 'registerSite' ).mockReturnValue();
const stubFetchAuthorizationUrl = jest.spyOn( restApi, 'fetchAuthorizationUrl' ).mockReturnValue();

const getAuthorizationUrl = jest.fn();
const resolveSelect = () => ( { getAuthorizationUrl } );

describe( 'controls', () => {
	beforeEach( () => {
		stubAssign.mockClear();
		stubRegisterSite.mockClear();
		stubFetchAuthorizationUrl.mockClear();
	} );

	describe( 'REGISTER_SITE', () => {
		it( 'resolves with result', async () => {
			const redirectUri = 'REDIRECT_URI';
			const from = 'FROM';
			const fakeResult = {};
			stubRegisterSite.mockResolvedValue( fakeResult );

			const result = await registerSite( { redirectUri, from } );
			expect( result ).toEqual( fakeResult );
			expect( stubRegisterSite ).toHaveBeenCalledWith( null, redirectUri, from );
		} );

		it( 'resolves with error', async () => {
			const fakeError = new Error( 'failed' );
			stubRegisterSite.mockRejectedValue( fakeError );
			await expect( registerSite( {} ) ).rejects.toThrow( fakeError );
		} );
	} );

	describe( 'CONNECT_USER', () => {
		const generateUrls = () => {
			const authorizeUrl = new URL( 'https://authorize.url' );

			const authorizeUrlWithFrom = new URL( authorizeUrl );
			authorizeUrlWithFrom.searchParams.set( 'from', 'jetpack' );

			const authorizeUrlWithParam = new URL( authorizeUrl );
			authorizeUrlWithParam.searchParams.set( 'param', 'fake' );

			const authorizeUrlWithParamAndFrom = new URL( authorizeUrlWithParam );
			authorizeUrlWithParamAndFrom.searchParams.set( 'from', 'jetpack' );

			return {
				authorizeUrl: authorizeUrl.toString(),
				authorizeUrlWithParam: authorizeUrlWithParam.toString(),
				authorizeUrlWithFrom: authorizeUrlWithFrom.toString(),
				authorizeUrlWithParamAndFrom: authorizeUrlWithParamAndFrom.toString(),
			};
		};

		it( 'redirects with assign', async () => {
			const { authorizeUrl } = generateUrls();
			getAuthorizationUrl.mockResolvedValue( authorizeUrl );

			const url = await connectUser( { resolveSelect } )();
			expect( stubAssign ).toHaveBeenCalledWith( authorizeUrl );
			expect( url ).toEqual( authorizeUrl );
		} );

		it( 'redirects adding from', async () => {
			const {
				authorizeUrl,
				authorizeUrlWithFrom,
				authorizeUrlWithParam,
				authorizeUrlWithParamAndFrom,
			} = generateUrls();

			// url without param
			getAuthorizationUrl.mockResolvedValue( authorizeUrl );
			const noParam = await connectUser( { resolveSelect } )( { from: 'jetpack' } );
			expect( stubAssign ).toHaveBeenCalledWith( authorizeUrlWithFrom );
			expect( noParam ).toEqual( authorizeUrlWithFrom );

			// url with param
			getAuthorizationUrl.mockResolvedValue( authorizeUrlWithParam );
			const param = await connectUser( { resolveSelect } )( { from: 'jetpack' } );
			expect( stubAssign ).toHaveBeenCalledWith( authorizeUrlWithParamAndFrom );
			expect( param ).toEqual( authorizeUrlWithParamAndFrom );
		} );

		it( 'redirects with custom func', async () => {
			const redirectFunc = jest.fn();
			const { authorizeUrl } = generateUrls();
			getAuthorizationUrl.mockResolvedValue( authorizeUrl );
			await connectUser( { resolveSelect } )( { redirectFunc } );
			expect( redirectFunc ).toHaveBeenCalledWith( authorizeUrl );
		} );

		it( 'rejects with error', async () => {
			const error = new Error( 'failed' );
			getAuthorizationUrl.mockRejectedValue( error );
			await expect( connectUser( { resolveSelect } )( {} ) ).rejects.toThrow( error );
		} );
	} );

	describe( 'FETCH_AUTHORIZATION_URL', () => {
		it( 'resolves with result', async () => {
			const redirectUri = 'REDIRECT_URI';
			const URL = 'https://authorize.url';
			stubFetchAuthorizationUrl.mockResolvedValue( URL );

			const result = await fetchAuthorizationUrl( { redirectUri } );
			expect( result ).toEqual( URL );
			expect( stubFetchAuthorizationUrl ).toHaveBeenCalledWith( redirectUri );
		} );

		it( 'resolves with error', async () => {
			const fakeError = new Error( 'failed' );
			stubFetchAuthorizationUrl.mockRejectedValue( fakeError );

			await expect( fetchAuthorizationUrl( {} ) ).rejects.toThrow( fakeError );
		} );
	} );
} );
