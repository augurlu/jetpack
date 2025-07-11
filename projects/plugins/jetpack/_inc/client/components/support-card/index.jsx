import { getRedirectUrl } from '@automattic/jetpack-components';
import { isWoASite } from '@automattic/jetpack-script-data';
import { useDispatch } from '@wordpress/data';
import { __, _x, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'components/button';
import Card from 'components/card';
import JetpackBanner from 'components/jetpack-banner';
import analytics from 'lib/analytics';
import {
	getJetpackProductUpsellByFeature,
	FEATURE_PRIORITY_SUPPORT_JETPACK,
} from 'lib/plans/constants';
import {
	getSiteConnectionStatus,
	hasConnectedOwner,
	isCurrentUserLinked,
	isConnectionOwner,
	connectUser,
} from 'state/connection';
import { isDevVersion as _isDevVersion, getUpgradeUrl } from 'state/initial-state';
import { siteHasFeature, hasActiveProductPurchase, isFetchingSiteData } from 'state/site';

const HelpCenterButton = ( { onClick } ) => {
	const helpCenterDispatch = useDispatch( 'automattic/help-center' );
	const setShowHelpCenter = helpCenterDispatch?.setShowHelpCenter;

	const text = __( 'Search our support site', 'jetpack' );

	return setShowHelpCenter ? (
		<Button
			// eslint-disable-next-line react/jsx-no-bind
			onClick={ () => {
				onClick?.();

				helpCenterDispatch?.setShowHelpCenter( true );
			} }
		>
			{ text }
		</Button>
	) : (
		<Button
			onClick={ onClick }
			href={ isWoASite() ? getRedirectUrl( 'calypso-help' ) : getRedirectUrl( 'jetpack-support' ) }
			isExternalLink={ true }
		>
			{ text }
		</Button>
	);
};

class SupportCard extends Component {
	static displayName = 'SupportCard';

	static defaultProps = {
		className: '',
		siteConnectionStatus: false,
	};

	trackBannerClick = () => {
		analytics.tracks.recordJetpackClick( {
			target: 'banner-click',
			feature: 'support',
			page: this.props.path,
			is_user_wpcom_connected: this.props.isCurrentUserLinked ? 'yes' : 'no',
			is_connection_owner: this.props.isConnectionOwner ? 'yes' : 'no',
		} );
	};

	/**
	 * Track the click and show the user connection screen.
	 */
	handleConnectClick = () => {
		this.trackBannerClick();
		this.props.connectUser();
	};

	trackSearchClick = () => {
		analytics.tracks.recordJetpackClick( {
			target: 'support-card',
			button: 'support-search',
			page: this.props.path,
		} );
	};

	trackGettingStartedClick = () => {
		analytics.tracks.recordJetpackClick( {
			target: 'support-card',
			button: 'getting-started',
			page: this.props.path,
		} );
	};

	render() {
		const { hasSupport } = this.props;
		if ( this.props.isFetchingSiteData ) {
			return <div />;
		}

		const classes = clsx( this.props.className, 'jp-support-card' );

		return (
			<div className={ classes }>
				<Card className="jp-support-card__happiness">
					<div className="jp-support-card__happiness-contact">
						<h3 className="jp-support-card__header">{ __( 'We’re here to help', 'jetpack' ) }</h3>
						<p className="jp-support-card__description">
							{ hasSupport
								? sprintf(
										/* translators: placeholder is either Jetpack or WordPress.com */
										__( 'Your paid plan gives you access to prioritized %s support.', 'jetpack' ),
										isWoASite() ? 'WordPress.com' : 'Jetpack'
								  )
								: __(
										'Jetpack offers support via community forums for any site without a paid product.',
										'jetpack'
								  ) }
						</p>
						<p className="jp-support-card__description">
							{ isWoASite() || (
								<Button
									onClick={ this.trackGettingStartedClick }
									href={ getRedirectUrl( 'jetpack-support-getting-started' ) }
									isExternalLink={ true }
								>
									{ __( 'Getting started with Jetpack', 'jetpack' ) }
								</Button>
							) }
							<HelpCenterButton onClick={ this.trackSearchClick } />
						</p>
					</div>
				</Card>
				{ this.props.siteConnectionStatus && ! hasSupport && this.props.hasConnectedOwner && (
					<JetpackBanner
						title={ __( 'Get a faster resolution to your support questions.', 'jetpack' ) }
						plan={ getJetpackProductUpsellByFeature( FEATURE_PRIORITY_SUPPORT_JETPACK ) }
						callToAction={ _x( 'Upgrade', 'Call to action to buy a new plan', 'jetpack' ) }
						onClick={ this.trackBannerClick }
						href={ this.props.supportUpgradeUrl }
					/>
				) }
				{ this.props.siteConnectionStatus && ! hasSupport && ! this.props.hasConnectedOwner && (
					<JetpackBanner
						title={ __(
							'Connect your WordPress.com account and upgrade to get a faster resolution to your support questions.',
							'jetpack'
						) }
						plan={ getJetpackProductUpsellByFeature( FEATURE_PRIORITY_SUPPORT_JETPACK ) }
						callToAction={ __( 'Connect', 'jetpack' ) }
						onClick={ this.handleConnectClick }
					/>
				) }
			</div>
		);
	}
}

SupportCard.propTypes = {
	siteConnectionStatus: PropTypes.any.isRequired,
	className: PropTypes.string,
	isCurrentUserLinked: PropTypes.bool,
	isConnectionOwner: PropTypes.bool,
};

export default connect(
	state => {
		return {
			siteConnectionStatus: getSiteConnectionStatus( state ),
			isFetchingSiteData: isFetchingSiteData( state ),
			isDevVersion: _isDevVersion( state ),
			supportUpgradeUrl: getUpgradeUrl( state, 'support' ),
			isCurrentUserLinked: isCurrentUserLinked( state ),
			isConnectionOwner: isConnectionOwner( state ),
			hasConnectedOwner: hasConnectedOwner( state ),
			hasSupport: siteHasFeature( state, 'support' ) || hasActiveProductPurchase( state ),
		};
	},
	dispatch => ( {
		connectUser: () => {
			return dispatch( connectUser() );
		},
	} )
)( SupportCard );
