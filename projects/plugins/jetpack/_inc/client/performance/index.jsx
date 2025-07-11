import { __ } from '@wordpress/i18n';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySite from 'components/data/query-site';
import { isUnavailableInOfflineMode, hasConnectedOwner } from 'state/connection';
import { getModule, getModuleOverride } from 'state/modules';
import { isModuleFound } from 'state/search';
import Media from './media';
import Search from './search';
import SpeedUpSite from './speed-up-site';

class Performance extends Component {
	render() {
		const commonProps = {
			getModule: this.props.module,
			isUnavailableInOfflineMode: this.props.isUnavailableInOfflineMode,
			isModuleFound: this.props.isModuleFound,
			getModuleOverride: this.props.getModuleOverride,
			hasConnectedOwner: this.props.hasConnectedOwner,
		};

		if ( ! this.props.searchTerm && ! this.props.active ) {
			return null;
		}

		const found = [ 'photon', 'videopress', 'photon-cdn', 'search' ].some(
			this.props.isModuleFound
		);

		if ( ! found ) {
			return null;
		}

		return (
			<div>
				<QuerySite />
				<h1 className="screen-reader-text">{ __( 'Jetpack Performance Settings', 'jetpack' ) }</h1>
				<h2 className="jp-settings__section-title">
					{ this.props.searchTerm
						? __( 'Performance', 'jetpack' )
						: __(
								'Load pages faster, optimize images, and speed up your visitors’ experience.',
								'jetpack'
						  ) }
				</h2>
				<Search { ...commonProps } />
				<SpeedUpSite { ...commonProps } />
				<Media { ...commonProps } />
			</div>
		);
	}
}

export default connect( state => {
	return {
		module: module_name => getModule( state, module_name ),
		isUnavailableInOfflineMode: module_name => isUnavailableInOfflineMode( state, module_name ),
		isModuleFound: module_name => isModuleFound( state, module_name ),
		getModuleOverride: module_name => getModuleOverride( state, module_name ),
		hasConnectedOwner: hasConnectedOwner( state ),
	};
} )( Performance );
