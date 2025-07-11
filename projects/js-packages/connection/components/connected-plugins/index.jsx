import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { Fragment, useMemo } from 'react';
import DisconnectCard from '../disconnect-card';

/**
 * Render a list of connected plugins.
 *
 * @param {object} props - The properties
 * @return {import('react').Component} - The ConnectedPlugins React component
 */

const ConnectedPlugins = props => {
	const { connectedPlugins, disconnectingPlugin } = props;

	/**
	 * Add a slug property to each ConnectedPlugins object so they can be converted to an array.
	 * This allows the connected plugins to be iterated over more easily for display.
	 */
	const connectedPluginsArray = useMemo( () => {
		if ( connectedPlugins ) {
			const keys = Object.keys( connectedPlugins );
			return keys
				.map( key => {
					return Object.assign( { slug: key }, connectedPlugins[ key ] );
				} )
				.filter( plugin => {
					return disconnectingPlugin !== plugin.slug;
				} );
		}

		// No connected plugins.
		return [];
	}, [ connectedPlugins, disconnectingPlugin ] );

	if ( connectedPlugins && connectedPluginsArray.length > 0 ) {
		return (
			<Fragment>
				<div className="jp-connection__disconnect-dialog__step-copy">
					<p className="jp-connection__disconnect-dialog__large-text">
						{ __(
							'Jetpack is powering other plugins on your site. If you disconnect, these plugins will no longer work.',
							'jetpack-connection-js'
						) }
					</p>
				</div>
				<div className="jp-connection__disconnect-card__group">
					{ connectedPluginsArray.map( plugin => {
						return <DisconnectCard title={ plugin.name } key={ plugin.slug } />;
					} ) }
				</div>
			</Fragment>
		);
	}

	// Default to null if there are no connected plugins passed on the props
	return null;
};

ConnectedPlugins.propTypes = {
	/** Plugins that are using the Jetpack connection. */
	connectedPlugins: PropTypes.array,
	/** Slug of the plugin that has initiated the disconnect. */
	disconnectingPlugin: PropTypes.string,
};

export default ConnectedPlugins;
