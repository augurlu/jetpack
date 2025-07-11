import { getRedirectUrl } from '@automattic/jetpack-components';
import { ConnectScreen } from '@automattic/jetpack-connection';
import { VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, external } from '@wordpress/icons';
import connectImage from './connect.png';
import styles from './styles.module.scss';
import type { FC, ReactNode } from 'react';

// This is copied from the connection package.
// The connection package main file is not TypeScript currently and therefore cannot export types.
// Doing this here to avoid editing the connection package too much as it is widely used.
interface ConnectScreenProps {
	// API root
	apiRoot: string;
	// API nonce
	apiNonce: string;
	// Registration nonce
	registrationNonce: string;
	// The redirect admin UR
	redirectUri: string;
	// Additional page elements to show before the call to action
	children?: ReactNode;
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
}

const ConnectionScreenBody: FC< ConnectScreenProps > = props => {
	const { title } = props;

	return (
		<ConnectScreen
			buttonLabel={ __( 'Connect your user account', 'jetpack-my-jetpack' ) }
			loadingLabel={ __( 'Connecting your account…', 'jetpack-my-jetpack' ) }
			images={ [ connectImage ] }
			from="my-jetpack"
			{ ...props }
			title={
				title ||
				__( 'Unlock all the amazing features of Jetpack by connecting now', 'jetpack-my-jetpack' )
			}
		>
			{ /*
						Since the list style type is set to none, `role=list` is required for VoiceOver (on Safari) to announce the list.
						See: https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html
						*/ }
			<ul role="list">
				<li>{ __( 'Receive instant downtime alerts', 'jetpack-my-jetpack' ) }</li>
				<li>{ __( 'Automatically share your content on social media', 'jetpack-my-jetpack' ) }</li>
				<li>{ __( 'Let your subscribers know when you post', 'jetpack-my-jetpack' ) }</li>
				<li>
					{ __( 'Receive notifications about new likes and comments', 'jetpack-my-jetpack' ) }
				</li>
				<li>{ __( 'Let visitors share your content on social media', 'jetpack-my-jetpack' ) }</li>
				<li>{ __( 'Create better content with powerful AI tools', 'jetpack-my-jetpack' ) }</li>
				<li>
					{ __( 'And more!', 'jetpack-my-jetpack' ) }{ ' ' }
					<a
						href={ getRedirectUrl( 'jetpack-features' ) }
						target="_blank"
						className={ styles[ 'all-features' ] }
						rel="noreferrer"
					>
						{ __( 'See all Jetpack features', 'jetpack-my-jetpack' ) }
						<Icon icon={ external } />
						<VisuallyHidden as="span">
							{
								/* translators: accessibility text */
								__( '(opens in a new tab)', 'jetpack-my-jetpack' )
							}
						</VisuallyHidden>
					</a>
				</li>
			</ul>
		</ConnectScreen>
	);
};

export default ConnectionScreenBody;
