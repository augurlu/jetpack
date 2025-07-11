import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectScreen from '../visual';

const CONNECTION_BUTTON_LABEL = 'Set up Jetpack';
const requiredProps = {
	buttonLabel: CONNECTION_BUTTON_LABEL,
};

describe( 'ConnectScreen', () => {
	it( 'renders children', () => {
		render(
			<ConnectScreen { ...requiredProps }>
				<p>Connect children</p>
			</ConnectScreen>
		);
		expect( screen.getByText( 'Connect children' ) ).toBeInTheDocument();
	} );

	it( 'displays required terms of service text and a clickable connection button with the proper label text', () => {
		render( <ConnectScreen { ...requiredProps } /> );

		expect(
			screen.getByText(
				( content, { textContent } ) =>
					content !== '' && // filter out parent/wrapper elements
					textContent.startsWith(
						`By clicking ${ CONNECTION_BUTTON_LABEL }, you agree to our Terms of Service`
					)
			)
		).toBeInTheDocument();

		expect( screen.getByRole( 'button', { name: CONNECTION_BUTTON_LABEL } ) ).toBeEnabled();
	} );

	it( 'applies correct href to terms of service', () => {
		render( <ConnectScreen { ...requiredProps } /> );
		const terms = screen.getByRole( 'link', { name: 'Terms of Service (opens in a new tab)' } );
		expect( terms ).toHaveAttribute( 'href', 'https://jetpack.com/redirect/?source=wpcom-tos' );
		expect( terms ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'applies correct href to share', () => {
		render( <ConnectScreen { ...requiredProps } /> );
		const share = screen.getByRole( 'link', {
			name: 'sync your site‘s data (opens in a new tab)',
		} );
		expect( share ).toHaveAttribute(
			'href',
			'https://jetpack.com/redirect/?source=jetpack-support-what-data-does-jetpack-sync'
		);
		expect( share ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'shows error into button', () => {
		render( <ConnectScreen { ...requiredProps } displayButtonError /> );
		expect( screen.getByText( 'An error occurred. Please try again.' ) ).toBeInTheDocument();
	} );

	// we have an acessibility breach into our loading state
	it.todo( 'shows loading into button' );

	it( 'calls handleButtonClick', async () => {
		const user = userEvent.setup();
		const handleButtonClick = jest.fn();
		render( <ConnectScreen { ...requiredProps } handleButtonClick={ handleButtonClick } /> );
		const button = screen.getByRole( 'button', { name: 'Set up Jetpack' } );
		await user.click( button );
		expect( handleButtonClick ).toHaveBeenCalled();
	} );
} );
