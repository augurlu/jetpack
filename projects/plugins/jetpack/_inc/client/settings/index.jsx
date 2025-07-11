import { GlobalNotices, ThemeProvider } from '@automattic/jetpack-components';
import { __, sprintf } from '@wordpress/i18n';
import { Component } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import Discussion from 'discussion';
import Earn from 'earn';
import Subscriptions from 'newsletter';
import Performance from 'performance';
import Privacy from 'privacy';
import SearchableModules from 'searchable-modules';
import Security from 'security';
import Sharing from 'sharing';
import { isModuleActivated as isModuleActivatedSelector } from 'state/modules';
import Traffic from 'traffic';
import Writing from 'writing';
import { FEATURE_JETPACK_EARN } from '../lib/plans/constants';

class Settings extends Component {
	static displayName = 'SearchableSettings';

	render() {
		const {
			location = { pathname: '' },
			rewindStatus,
			searchTerm,
			siteAdminUrl,
			siteRawUrl,
			blogID,
			userCanManageModules,
		} = this.props;
		const { pathname } = location;
		const commonProps = {
			searchTerm,
			rewindStatus,
			userCanManageModules,
		};

		return (
			<ThemeProvider>
				<div className="jp-settings-container">
					<div className="jp-no-results">
						{ searchTerm
							? sprintf(
									/* translators: placeholder is a searchterm entered in searchform. */
									__( 'No search results found for %s', 'jetpack' ),
									searchTerm
							  )
							: __( 'Enter a search term to find settings or close search.', 'jetpack' ) }
					</div>
					<Security
						siteAdminUrl={ siteAdminUrl }
						siteRawUrl={ siteRawUrl }
						active={
							'/security' === pathname || ( '/settings' === pathname && userCanManageModules )
						}
						{ ...commonProps }
					/>
					<Discussion
						siteRawUrl={ siteRawUrl }
						active={ '/discussion' === pathname }
						{ ...commonProps }
					/>
					<Subscriptions
						siteRawUrl={ siteRawUrl }
						blogID={ blogID }
						active={ '/newsletter' === pathname }
						{ ...commonProps }
					/>
					<Earn
						siteRawUrl={ siteRawUrl }
						active={ '/earn' === pathname }
						feature={ FEATURE_JETPACK_EARN }
						{ ...commonProps }
					/>
					<Performance active={ '/performance' === pathname } { ...commonProps } />
					<Traffic
						siteRawUrl={ siteRawUrl }
						siteAdminUrl={ siteAdminUrl }
						active={ '/traffic' === pathname }
						{ ...commonProps }
					/>
					<Writing
						siteAdminUrl={ siteAdminUrl }
						active={
							'/writing' === pathname ||
							( ! userCanManageModules &&
								this.props.isModuleActivated( 'post-by-email' ) &&
								! this.props.isModuleActivated( 'publicize' ) )
						}
						{ ...commonProps }
					/>
					<Sharing
						siteAdminUrl={ siteAdminUrl }
						active={
							'/sharing' === pathname ||
							( '/settings' === pathname &&
								! userCanManageModules &&
								this.props.isModuleActivated( 'publicize' ) )
						}
						{ ...commonProps }
					/>
					<Privacy active={ '/privacy' === pathname } { ...commonProps } />
					<SearchableModules searchTerm={ searchTerm } />
				</div>
				<GlobalNotices />
			</ThemeProvider>
		);
	}
}

export default connect( state => {
	return {
		isModuleActivated: module => isModuleActivatedSelector( state, module ),
	};
} )( props => <Settings { ...props } location={ useLocation() } /> );
