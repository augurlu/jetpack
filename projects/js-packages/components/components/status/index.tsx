import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Text from '../text/index.tsx';
import styles from './style.module.scss';
import type { JSX } from 'react';

interface StatusProps {
	status?: 'active' | 'error' | 'inactive' | 'action' | 'initializing';
	label?: string;
	className?: string;
}

const Status = ( { className, label, status = 'inactive' }: StatusProps ): JSX.Element => {
	const defaultLabels: Record< string, string > = {
		active: __( 'Active', 'jetpack-components' ),
		error: __( 'Error', 'jetpack-components' ),
		action: __( 'Action needed', 'jetpack-components' ),
		inactive: __( 'Inactive', 'jetpack-components' ),
		initializing: __( 'Setting up', 'jetpack-components' ),
	};

	return (
		<Text
			variant="body-extra-small"
			className={ clsx(
				styles.status,
				{
					[ styles[ `is-${ status }` ] ]: status,
				},
				className
			) }
		>
			<span className={ styles.status__indicator } />
			<span className={ styles.status__label }>
				{ label || label === '' ? label : defaultLabels[ status ] }
			</span>
		</Text>
	);
};

export default Status;
