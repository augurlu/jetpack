import { __ } from '@wordpress/i18n';
import useConnection from '../../use-connection';
import ConnectScreenVisual from './visual';
import type { FC, ReactNode } from 'react';

export type Props = {
	// API root
	apiRoot: string;
	// API nonce
	apiNonce: string;
	// Registration nonce
	registrationNonce: string;
	// The redirect admin UR
	redirectUri: string;
	// Additional page elements to show before the call to action
	children: ReactNode;
	// The Title
	title?: string;
	// The Connect Button label
	buttonLabel?: string;
	// The text read by screen readers when connecting
	loadingLabel?: string;
	// Where the connection request is coming from
	from?: string;
	// Whether to initiate the connection process automatically upon rendering the component
	autoTrigger?: boolean;
	// Images to display on the right side
	images?: string[];
	// The assets base URL
	assetBaseUrl?: string;
	// Whether to not require a user connection and just redirect after site connection
	skipUserConnection?: boolean;
	// Whether to skip the pricing page after the connection screen
	skipPricingPage?: boolean;
	// Additional page elements to show after the call to action
	footer?: ReactNode;
	// The logo to display at the top of the component
	logo?: ReactNode;
};

/*
 * The Connection Screen component.
 */
const ConnectScreen: FC< Props > = ( {
	title,
	buttonLabel,
	loadingLabel,
	apiRoot,
	apiNonce,
	registrationNonce,
	from,
	redirectUri,
	images,
	children,
	assetBaseUrl,
	autoTrigger,
	footer,
	skipUserConnection,
	skipPricingPage,
	logo,
} ) => {
	const {
		handleRegisterSite,
		siteIsRegistering,
		userIsConnecting,
		registrationError,
		isOfflineMode,
	} = useConnection( {
		registrationNonce,
		redirectUri,
		apiRoot,
		apiNonce,
		autoTrigger,
		from,
		skipUserConnection,
		skipPricingPage,
	} );

	const displayButtonError = Boolean( registrationError );
	const buttonIsLoading = siteIsRegistering || userIsConnecting;
	const errorCode = registrationError?.response?.code;

	return (
		<ConnectScreenVisual
			title={
				title ||
				__( 'Over 5 million WordPress sites are faster and more secure', 'jetpack-connection-js' )
			}
			images={ images || [] }
			assetBaseUrl={ assetBaseUrl }
			buttonLabel={ buttonLabel || __( 'Set up Jetpack', 'jetpack-connection-js' ) }
			loadingLabel={ loadingLabel }
			handleButtonClick={ handleRegisterSite }
			displayButtonError={ displayButtonError }
			errorCode={ errorCode }
			buttonIsLoading={ buttonIsLoading }
			footer={ footer }
			isOfflineMode={ isOfflineMode }
			logo={ logo }
		>
			{ children }
		</ConnectScreenVisual>
	);
};

export default ConnectScreen;
