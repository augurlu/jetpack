import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { imagePath } from 'constants/urls';

import './style.scss';

const JetpackLoadingIcon = ( { altText = __( 'Loading…', 'jetpack' ) } ) => {
	return (
		<div className="jp-loading-icon">
			<img src={ imagePath + '/jetpack-logomark-blue.svg' } alt={ altText } />
		</div>
	);
};

JetpackLoadingIcon.propTypes = {
	altText: PropTypes.string,
};

export { JetpackLoadingIcon };
