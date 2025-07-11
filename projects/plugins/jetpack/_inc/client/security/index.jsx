import { __ } from '@wordpress/i18n';
import { get } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryAkismetKeyCheck from 'components/data/query-akismet-key-check';
import QuerySite from 'components/data/query-site';
import { getVaultPressData } from 'state/at-a-glance';
import { isOfflineMode, isUnavailableInOfflineMode, hasConnectedOwner } from 'state/connection';
import { getSiteId } from 'state/initial-state';
import { getModule } from 'state/modules';
import { isModuleFound } from 'state/search';
import { getSettings } from 'state/settings';
import { siteHasFeature } from 'state/site';
import { isPluginActive, isPluginInstalled } from 'state/site/plugins';
import { AccountProtection } from './account-protection';
import AllowList from './allowList';
import Antispam from './antispam';
import BackupsScan from './backups-scan';
import { JetpackBackup } from './jetpack-backup';
import { Monitor } from './monitor';
import { Protect } from './protect';
import { SSO } from './sso';
import Waf from './waf';

export class Security extends Component {
	static displayName = 'SecuritySettings';

	/**
	 * Check if Akismet plugin is being searched and matched.
	 *
	 * @return {boolean} False if the plugin is inactive or if the search doesn't match it. True otherwise.
	 */
	isAkismetFound = () => {
		if ( ! this.props.isPluginActive( 'akismet/akismet.php' ) ) {
			return false;
		}

		if ( this.props.searchTerm ) {
			const akismetData = this.props.isPluginInstalled( 'akismet/akismet.php' );
			return (
				[
					'akismet',
					'antispam',
					'spam',
					'comments',
					akismetData.Description,
					akismetData.PluginURI,
				]
					.join( ' ' )
					.toLowerCase()
					.indexOf( this.props.searchTerm.toLowerCase() ) > -1
			);
		}

		return true;
	};

	render() {
		const commonProps = {
			settings: this.props.settings,
			getModule: this.props.module,
			isOfflineMode: this.props.isOfflineMode,
			isUnavailableInOfflineMode: this.props.isUnavailableInOfflineMode,
			rewindStatus: this.props.rewindStatus,
			siteRawUrl: this.props.siteRawUrl,
			blogID: this.props.blogID,
			hasConnectedOwner: this.props.hasConnectedOwner,
		};

		const isSearchTerm = this.props.searchTerm;

		if ( ! isSearchTerm && ! this.props.active ) {
			return null;
		}

		const foundProtect = this.props.isModuleFound( 'protect' ),
			foundAccountProtection = this.props.isModuleFound( 'account-protection' ),
			foundSso = this.props.isModuleFound( 'sso' ),
			foundAkismet = this.isAkismetFound(),
			rewindActive =
				! isSearchTerm && 'active' === get( this.props.rewindStatus, [ 'state' ], false ),
			foundBackups = this.props.isModuleFound( 'vaultpress' ) || rewindActive,
			foundMonitor = this.props.isModuleFound( 'monitor' );

		if (
			! foundSso &&
			! foundProtect &&
			! foundAccountProtection &&
			! foundAkismet &&
			! foundBackups &&
			! foundMonitor
		) {
			return null;
		}

		const foundWaf = this.props.isModuleFound( 'waf' );

		const backupsContent = this.props.backupsOnly ? (
			<JetpackBackup { ...commonProps } vaultPressData={ this.props.vaultPressData } />
		) : (
			<BackupsScan { ...commonProps } />
		);

		return (
			<div>
				<QuerySite />
				<h1 className="screen-reader-text">{ __( 'Jetpack Security Settings', 'jetpack' ) }</h1>
				<h2 className="jp-settings__section-title">
					{ isSearchTerm
						? __( 'Security', 'jetpack' )
						: __(
								'Your site is protected by Jetpack. You’ll be notified if anything needs attention.',
								'jetpack',
								/* dummy arg to avoid bad minification */ 0
						  ) }
				</h2>
				{ foundBackups && backupsContent }
				{ foundMonitor && <Monitor { ...commonProps } /> }
				{ foundAkismet && (
					<>
						<Antispam { ...commonProps } />
						<QueryAkismetKeyCheck />
					</>
				) }
				{ foundAccountProtection && (
					<AccountProtection isModuleFound={ this.props.isModuleFound } { ...commonProps } />
				) }
				{ foundWaf && <Waf { ...commonProps } /> }
				{ foundProtect && <Protect { ...commonProps } /> }
				{ ( foundWaf || foundProtect ) && <AllowList { ...commonProps } /> }
				{ foundSso && <SSO { ...commonProps } /> }
			</div>
		);
	}
}

export default connect( state => {
	return {
		backupsOnly: siteHasFeature( state, 'backups' ) && ! siteHasFeature( state, 'scan' ),
		module: module_name => getModule( state, module_name ),
		settings: getSettings( state ),
		isOfflineMode: isOfflineMode( state ),
		isUnavailableInOfflineMode: module_name => isUnavailableInOfflineMode( state, module_name ),
		isModuleFound: module_name => isModuleFound( state, module_name ),
		isPluginActive: plugin_slug => isPluginActive( state, plugin_slug ),
		isPluginInstalled: plugin_slug => isPluginInstalled( state, plugin_slug ),
		vaultPressData: getVaultPressData( state ),
		hasConnectedOwner: hasConnectedOwner( state ),
		blogID: getSiteId( state ),
	};
} )( Security );
