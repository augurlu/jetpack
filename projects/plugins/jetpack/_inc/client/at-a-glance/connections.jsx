import { isWoASite } from '@automattic/jetpack-script-data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf, _x } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ConnectButton from 'components/connect-button';
import DashItem from 'components/dash-item';
import QueryUserConnectionData from 'components/data/query-user-connection';
import Gridicon from 'components/gridicon';
import {
	getSiteConnectionStatus,
	isConnectionOwner,
	isConnectionOwnerName,
	isCurrentUserLinked,
	isOfflineMode,
	isFetchingUserData as _isFetchingUserData,
	getConnectedWpComUser as _getConnectedWpComUser,
} from 'state/connection';
import {
	userCanDisconnectSite,
	userCanConnectAccount,
	getUserGravatar,
	getUsername,
	getSiteIcon,
} from 'state/initial-state';

export class DashConnections extends Component {
	/*
	 * Render a card for site connection. If it's connected, indicate if user is the connection owner.
	 * Show alternative message if site is in offline mode.
	 *
	 * @returns {string}
	 */
	siteConnection() {
		let cardContent = '';

		if ( this.props.isOfflineMode ) {
			cardContent = (
				<div className="jp-connection-settings__info">
					{ this.props.siteIcon ? (
						<img
							width="64"
							height="64"
							className="jp-connection-settings__site-icon"
							src={ this.props.siteIcon }
							alt=""
						/>
					) : (
						<Gridicon icon="globe" size={ 64 } />
					) }
					<div className="jp-connection-settings__text">
						{ __(
							'Your site is in Offline Mode, so it can not be connected to WordPress.com.',
							'jetpack'
						) }
					</div>
				</div>
			);
		} else if ( true === this.props.siteConnectionStatus ) {
			cardContent = (
				<div>
					<div className="jp-connection-settings__info">
						{ this.props.siteIcon ? (
							<img
								width="64"
								height="64"
								className="jp-connection-settings__site-icon"
								src={ this.props.siteIcon }
								alt=""
							/>
						) : (
							<Gridicon icon="globe" size={ 64 } />
						) }
						<div className="jp-connection-settings__text">
							{ this.props.isConnectionOwner && (
								<span className="jp-connection-settings__is-owner">
									{ __( 'You are the Jetpack owner.', 'jetpack' ) }
								</span>
							) }

							{ ! this.props.isConnectionOwner && this.props.isConnectionOwnerName && (
								<span className="jp-connection-settings__is-owner">
									{ sprintf(
										/* translators: Placeholder is the WordPress user login name. */
										__( 'The connection owner is %s.', 'jetpack' ),
										this.props.isConnectionOwnerName
									) }
								</span>
							) }

							{ this.props.userCanDisconnectSite ? (
								<div className="jp-connection-settings__actions">
									<ConnectButton asLink autoOpenInDisconnectRoute={ true } />
								</div>
							) : (
								<div className="jp-connection-settings__actions">
									<span>{ __( 'This site is connected to WordPress.com.', 'jetpack' ) }</span>
								</div>
							) }
						</div>
					</div>
				</div>
			);
		}

		return cardContent;
	}

	/*
	 * Render a card for user linking. If it's connected, show the currently linked user.
	 * Show an alternative message if site is in Offline Mode.
	 *
	 * @returns {string}
	 */
	userConnection() {
		// Hide disconnect button for connection owners on WoA sites
		const shouldShowDisconnectButton = ! ( isWoASite() && this.props.isConnectionOwner );
		const LinkUnlinkBtn = (
			<ConnectButton asBanner connectUser={ true } from="connection-settings" />
		);

		let cardContent = '';

		if ( this.props.isOfflineMode ) {
			// return nothing if this is an account connection card
			return (
				<div className="jp-connection-settings__info">
					{ this.props.userGravatar ? (
						<img
							alt="gravatar"
							width="64"
							height="64"
							className="jp-connection-settings__gravatar"
							src={ this.props.userGravatar }
						/>
					) : (
						<Gridicon icon="user" size={ 64 } />
					) }
					<div className="jp-connection-settings__text">
						{ __(
							'The site is in Offline Mode, so you can not connect to WordPress.com.',
							'jetpack'
						) }
					</div>
				</div>
			);
		}

		if ( ! this.props.isLinked ) {
			cardContent = <div className="jp-connection-settings__info">{ LinkUnlinkBtn }</div>;
		} else if ( this.props.isFetchingUserData ) {
			cardContent = __( 'Loading…', 'jetpack' );
		} else if ( ! this.props.wpComConnectedUser?.email ) {
			// Couldn't fetch the data for some reason.
			cardContent = (
				<div>
					<div className="jp-connection-settings__info">
						<Gridicon icon="user" size={ 64 } />
						<div className="jp-connection-settings__text">
							{ __( 'Failed to fetch connection data, please try again later.', 'jetpack' ) }
						</div>
					</div>
				</div>
			);
		} else {
			cardContent = (
				<div>
					<div className="jp-connection-settings__info">
						<img
							alt="gravatar"
							width="64"
							height="64"
							className="jp-connection-settings__gravatar"
							src={ this.props.wpComConnectedUser.avatar }
						/>
						<div className="jp-connection-settings__text">
							{ createInterpolateElement(
								sprintf(
									/* translators: Placeholder is the WordPress user login name. */
									__( 'Connected as <span>%s</span>', 'jetpack' ),
									this.props.wpComConnectedUser.login
								),
								{
									span: <span className="jp-connection-settings__username" />,
								}
							) }
							<div className="jp-connection-settings__email">
								{ this.props.wpComConnectedUser.email }
							</div>
						</div>
					</div>
					{ shouldShowDisconnectButton && (
						<div className="jp-connection-settings__actions">{ LinkUnlinkBtn }</div>
					) }
				</div>
			);
		}

		return cardContent;
	}

	render() {
		return (
			<div>
				<QueryUserConnectionData />
				<div className="jp-at-a-glance__item-grid">
					<div className="jp-at-a-glance__left">
						<div className="jp-dash-item__interior">
							<DashItem
								className="jp-connection-type"
								label={ _x( 'Site connection', 'Dashboard widget header', 'jetpack' ) }
							>
								{ this.siteConnection() }
							</DashItem>
						</div>
					</div>
					{ this.props.userCanConnectAccount && (
						<div className="jp-at-a-glance__right">
							<div className="jp-dash-item__interior">
								<DashItem
									className="jp-connection-type"
									label={ _x( 'Account connection', 'Dashboard widget header', 'jetpack' ) }
								>
									{ this.userConnection() }
								</DashItem>
							</div>
						</div>
					) }
				</div>
			</div>
		);
	}
}

DashConnections.propTypes = {
	siteConnectionStatus: PropTypes.any.isRequired,
	isOfflineMode: PropTypes.bool.isRequired,
	userCanDisconnectSite: PropTypes.bool.isRequired,
	isConnectionOwner: PropTypes.bool.isRequired,
	isLinked: PropTypes.bool.isRequired,
	userGravatar: PropTypes.any.isRequired,
	username: PropTypes.any.isRequired,
};

export default connect( state => {
	return {
		siteConnectionStatus: getSiteConnectionStatus( state ),
		isOfflineMode: isOfflineMode( state ),
		userCanDisconnectSite: userCanDisconnectSite( state ),
		userCanConnectAccount: userCanConnectAccount( state ),
		userGravatar: getUserGravatar( state ),
		username: getUsername( state ),
		isConnectionOwner: isConnectionOwner( state ),
		isConnectionOwnerName: isConnectionOwnerName( state ),
		isLinked: isCurrentUserLinked( state ),
		siteIcon: getSiteIcon( state ),
		isFetchingUserData: _isFetchingUserData( state ),
		wpComConnectedUser: _getConnectedWpComUser( state ),
	};
} )( DashConnections );
