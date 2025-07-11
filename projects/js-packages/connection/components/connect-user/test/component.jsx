import { render } from '@testing-library/react';
import ConnectUser from '../index';

describe( 'ConnectUser', () => {
	const testProps = {
		connectUrl: 'https://jetpack.wordpress.com/jetpack.authorize/1/?response_type=code',
		from: 'example',
		redirectUri: 'https://example.org',
	};

	describe( 'Render the user connection - calypso', () => {
		let redirectUrl = null;
		const redirectFunc = url => ( redirectUrl = url );

		render(
			<ConnectUser
				{ ...testProps }
				forceCalypsoFlow={ true }
				redirectFunc={ redirectFunc } // eslint-disable-line react/jsx-no-bind
			/>
		);

		it( 'the redirect happened', () => {
			expect( redirectUrl ).toEqual( testProps.connectUrl + '&from=' + testProps.from );
		} );
	} );
} );
