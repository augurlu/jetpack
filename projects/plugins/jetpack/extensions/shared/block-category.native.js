import { getHostAppNamespace } from '@automattic/jetpack-shared-extension-utils';
import { JetpackLogo } from '@automattic/jetpack-shared-extension-utils/icons';
import { getCategories, setCategories, registerBlockCollection } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

const hostApp = getHostAppNamespace();
if ( hostApp === 'WordPress' ) {
	registerBlockCollection( 'jetpack', {
		title: __( 'Jetpack powered', 'jetpack' ),
		icon: <JetpackLogo />,
	} );
}

setCategories( [
	...getCategories().filter( ( { slug } ) => slug !== 'monetize' ),
	// Add a Monetize block category
	{
		slug: 'monetize',
		title: __( 'Monetize', 'jetpack' ),
		icon: <JetpackLogo />,
	},
] );

setCategories( [
	...getCategories().filter( ( { slug } ) => slug !== 'grow' ),
	// Add a Grow block category
	{
		slug: 'grow',
		title: __( 'Grow', 'jetpack' ),
		icon: <JetpackLogo />,
	},
] );
