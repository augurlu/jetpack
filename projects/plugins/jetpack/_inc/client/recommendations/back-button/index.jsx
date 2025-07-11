import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import Gridicon from 'components/gridicon';

import './style.scss';

const BackButton = () => {
	const onBackClick = useCallback( () => history.back(), [] );

	return (
		<button className="jp-recommendations-back-btn" onClick={ onBackClick }>
			<Gridicon size={ 18 } icon="arrow-left" />
			{
				/* translators: As in go back to the previous page. */
				__( 'Back', 'jetpack' )
			}
		</button>
	);
};

export default BackButton;
