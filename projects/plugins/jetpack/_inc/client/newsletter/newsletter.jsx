import { getRedirectUrl } from '@automattic/jetpack-components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import Card from 'components/card';
import { withModuleSettingsFormHelpers } from 'components/module-settings/with-module-settings-form-helpers';
import { ModuleToggle } from 'components/module-toggle';
import SettingsCard from 'components/settings-card';
import SettingsGroup from 'components/settings-group';
import analytics from 'lib/analytics';
import { FEATURE_NEWSLETTER_JETPACK } from 'lib/plans/constants';
import {
	isCurrentUserLinked,
	isUnavailableInOfflineMode,
	isOfflineMode,
	hasConnectedOwner,
} from 'state/connection';
import { isWpAdminSubscriberManagementEnabled, getSiteAdminUrl } from 'state/initial-state';
import { getModule } from 'state/modules';
import { SUBSCRIPTIONS_MODULE_NAME } from './constants';

const trackViewSubsClick = () => {
	analytics.tracks.recordJetpackClick( 'manage-subscribers' );
};

/**
 * Newsletter component.
 *
 * @param {object} props - Component props.
 * @return {import('react').Component} Newsletter component.
 */
function Newsletter( props ) {
	const {
		siteRawUrl,
		blogID,
		isSavingAnyOption,
		isLinked,
		isSubscriptionsActive,
		unavailableInOfflineMode,
		subscriptions,
		siteHasConnectedUser,
		wpAdminSubscriberManagementEnabled,
		siteAdminUrl,
		updateOptions,
		getOptionValue,
		refreshSettings,
	} = props;

	const getSubClickableCard = () => {
		if ( unavailableInOfflineMode || ! isSubscriptionsActive || ! isLinked ) {
			return '';
		}

		return (
			<Card
				compact
				className="jp-settings-card__configure-link"
				onClick={ trackViewSubsClick }
				href={
					wpAdminSubscriberManagementEnabled
						? siteAdminUrl + 'admin.php?page=subscribers'
						: getRedirectUrl( 'jetpack-settings-jetpack-manage-subscribers', {
								site: blogID ?? siteRawUrl,
						  } )
				}
				target="_blank"
				rel="noopener noreferrer"
			>
				{ __( 'Manage all subscribers', 'jetpack' ) }
			</Card>
		);
	};

	const toggleModule = useCallback(
		module => {
			const status = getOptionValue( module );
			// Track the toggle (analytics)
			analytics.tracks.recordEvent( 'jetpack_wpa_settings_toggle', {
				module: module,
				setting: module,
				toggled: status ? 'off' : 'on',
			} );

			updateOptions( { [ module ]: ! status } ).then( () => {
				// Refresh settings if the module is being activated
				if ( ! status ) {
					refreshSettings();
				}
			} );
		},
		[ getOptionValue, updateOptions, refreshSettings ]
	);

	return (
		<SettingsCard
			{ ...props }
			header={ __( 'Newsletter', 'jetpack' ) }
			hideButton
			feature={ FEATURE_NEWSLETTER_JETPACK }
			module={ SUBSCRIPTIONS_MODULE_NAME }
			isDisabled={ ! siteHasConnectedUser }
		>
			<SettingsGroup
				hasChild
				disableInOfflineMode
				disableInSiteConnectionMode={ ! siteHasConnectedUser }
				module={ subscriptions }
				support={ {
					text: __(
						'Allows readers to subscribe to your posts or comments, and receive notifications of new content by email.',
						'jetpack'
					),
					link: getRedirectUrl( 'jetpack-support-subscriptions' ),
				} }
			>
				<ModuleToggle
					slug="subscriptions"
					disabled={ ! siteHasConnectedUser || unavailableInOfflineMode }
					activated={ isSubscriptionsActive }
					toggling={ isSavingAnyOption( SUBSCRIPTIONS_MODULE_NAME ) }
					toggleModule={ toggleModule }
				>
					<span className="jp-form-toggle-explanation">
						{ __(
							'Let visitors subscribe to this site and receive emails when you publish a post',
							'jetpack'
						) }
					</span>
				</ModuleToggle>
			</SettingsGroup>

			{ getSubClickableCard() }
		</SettingsCard>
	);
}

export default withModuleSettingsFormHelpers(
	connect( ( state, ownProps ) => {
		return {
			isLinked: isCurrentUserLinked( state ),
			isOffline: isOfflineMode( state ),
			isSubscriptionsActive: ownProps.getOptionValue( SUBSCRIPTIONS_MODULE_NAME ),
			unavailableInOfflineMode: isUnavailableInOfflineMode( state, SUBSCRIPTIONS_MODULE_NAME ),
			subscriptions: getModule( state, SUBSCRIPTIONS_MODULE_NAME ),
			siteHasConnectedUser: hasConnectedOwner( state ),
			wpAdminSubscriberManagementEnabled: isWpAdminSubscriberManagementEnabled( state ),
			siteAdminUrl: getSiteAdminUrl( state ),
		};
	} )( Newsletter )
);
