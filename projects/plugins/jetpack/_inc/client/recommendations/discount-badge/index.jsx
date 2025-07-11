import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';

import './style.scss';

const DiscountBadge = ( { className, discount, suffix } ) => {
	if ( ! discount ) {
		return null;
	}

	return (
		<div className={ clsx( 'jp-recommendations-discount-badge', className ) }>
			{ sprintf(
				// translators: %d is the percentage value, %% the percentage symbol
				__( '%d%% off', 'jetpack' ), // @wordpress/valid-sprintf doesn't understand that the % symbol must be escaped
				discount
			) }
			{ suffix }
		</div>
	);
};

export default DiscountBadge;
