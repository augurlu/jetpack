import { useModuleStatus } from '@automattic/jetpack-shared-extension-utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionEdit } from '../edit';

const setAttributes = jest.fn();

const defaultAttributes = {
	borderRadius: 0,
	borderWeight: 0,
	includeSocialFollowers: true,
	padding: 0,
	spacing: 0,
	submitButtonText: 'Submit',
	subscriptionPlaceholderText: 'Activate Subscriptions',
	subscribePlaceholder: 'Do it',
	showSubscribersTotal: false,
	buttonOnNewLine: false,
};

const defaultProps = {
	attributes: defaultAttributes,
	setAttributes,
	emailFieldBackgroundColor: '',
	buttonBackgroundColor: '',
	setButtonBackgroundColor: '',
	fallbackButtonBackgroundColo: '',
	textColor: '',
	fallbackTextColor: '',
	setTextColor: '',
	borderColor: '',
	fontSize: 12,
};

jest.mock( '@automattic/jetpack-shared-extension-utils', () => ( {
	__esModule: true,
	...jest.requireActual( '@automattic/jetpack-shared-extension-utils' ),
	useModuleStatus: jest.fn().mockReturnValue( {
		isModuleActive: true,
		isLoadingModules: false,
		isChangingStatus: false,
		changeStatus: jest.fn(),
	} ),
} ) );

jest.mock( '../constants', () => ( {
	IS_GRADIENT_AVAILABLE: true,
} ) );

jest.mock( '@wordpress/block-editor', () => ( {
	...jest.requireActual( '@wordpress/block-editor' ),
	__experimentalUseGradient: jest.fn().mockReturnValue( {
		gradientClass: undefined,
		gradientValue: undefined,
		setGradient: jest.fn(),
	} ),
} ) );

beforeEach( () => {
	useModuleStatus.mockReturnValue( {
		isModuleActive: true,
		changeStatus: jest.fn(),
	} );
} );
jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useSelect: () => ( {
		subscriberCounts: 100,
		subscriberCountString: 'Join 100 other subscribers',
	} ),
} ) );

jest.mock( '@wordpress/notices', () => {}, { virtual: true } );

describe( 'SubscriptionEdit', () => {
	test( 'adds correct classes when button on new line', async () => {
		const { container, rerender } = render( <SubscriptionEdit { ...defaultProps } /> );

		expect(
			// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
			container.querySelector( '.wp-block-jetpack-subscriptions__use-newline' )
		).not.toBeInTheDocument();

		const updatedProps = {
			...defaultProps,
			attributes: {
				...defaultAttributes,
				buttonOnNewLine: true,
			},
		};
		rerender( <SubscriptionEdit { ...updatedProps } /> );

		expect(
			// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
			container.querySelector( '.wp-block-jetpack-subscriptions__use-newline' )
		).toBeInTheDocument();
	} );

	test( 'renders text field with placeholder text', async () => {
		render( <SubscriptionEdit { ...defaultProps } /> );

		expect(
			screen.getByPlaceholderText( defaultAttributes.subscribePlaceholder )
		).toBeInTheDocument();
	} );

	test( 'renders button with default text', async () => {
		render( <SubscriptionEdit { ...defaultProps } /> );

		expect( screen.getByText( defaultAttributes.submitButtonText ) ).toBeInTheDocument();
	} );

	test( 'calls setAttributes handler on button when value changes', async () => {
		render( <SubscriptionEdit { ...defaultProps } /> );

		expect( screen.getByText( defaultAttributes.submitButtonText ) ).toBeInTheDocument();
	} );

	test( 'displays subscriber total', async () => {
		setAttributes.mockClear();
		const user = userEvent.setup();
		render( <SubscriptionEdit { ...defaultProps } /> );
		// Apparently we need to use the End key to get the text in the right place now.
		await user.type( screen.getByText( defaultAttributes.submitButtonText ), '{End}-right-now!' );

		expect( setAttributes ).toHaveBeenCalledWith( {
			submitButtonText: `${ defaultAttributes.submitButtonText }-right-now!`,
		} );
	} );

	test( 'displays subscriber total after update', async () => {
		const { container, rerender } = render( <SubscriptionEdit { ...defaultProps } /> );
		expect(
			// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
			container.querySelector( '.wp-block-jetpack-subscriptions__subscount' )
		).not.toBeInTheDocument();
		expect(
			// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
			container.querySelector( '.wp-block-jetpack-subscriptions__show-subs' )
		).not.toBeInTheDocument();

		const updatedProps = {
			...defaultProps,
			attributes: {
				...defaultAttributes,
				showSubscribersTotal: true,
			},
		};
		rerender( <SubscriptionEdit { ...updatedProps } /> );

		expect(
			// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
			container.querySelector( '.wp-block-jetpack-subscriptions__show-subs' )
		).toBeInTheDocument();
		expect(
			// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
			container.querySelector( '.wp-block-jetpack-subscriptions__subscount' )
		).toBeInTheDocument();
	} );
} );
