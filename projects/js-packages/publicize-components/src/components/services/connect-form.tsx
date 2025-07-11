import { Button } from '@automattic/jetpack-components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import clsx from 'clsx';
import { store } from '../../social-store';
import { KeyringResult } from '../../social-store/types';
import { SupportedService } from '../services/use-supported-services';
import { CustomInputs } from './custom-inputs';
import styles from './style.module.scss';
import { useRequestAccess } from './use-request-access';
import type { FormEvent } from 'react';

type ConnectFormProps = {
	service: SupportedService;
	isSmall?: boolean;
	onSubmit?: VoidFunction;
	displayInputs?: boolean;
	hasConnections?: boolean;
	buttonLabel?: string;
};

/**
 * Connect form component
 *
 * @param {ConnectFormProps} props - Component props
 *
 * @return Connect form component
 */
export function ConnectForm( {
	service,
	isSmall,
	onSubmit,
	displayInputs,
	hasConnections,
	buttonLabel,
}: ConnectFormProps ) {
	const { setKeyringResult } = useDispatch( store );

	const { isConnectionsModalOpen } = useSelect( select => select( store ), [] );

	const [ isConnecting, setIsConnecting ] = useState( false );

	const isFetchingServicesList = useSelect(
		select => select( store ).isFetchingServicesList(),
		[]
	);

	const onConfirm = useCallback(
		( result: KeyringResult ) => {
			// Set the keyring result only if the modal is open
			if ( isConnectionsModalOpen() ) {
				setKeyringResult( result );
			}
		},
		[ setKeyringResult, isConnectionsModalOpen ]
	);

	const requestAccess = useRequestAccess( {
		service,
		onConfirm,
	} );

	const onSubmitForm = useCallback(
		async ( event: FormEvent ) => {
			event.preventDefault();
			// Prevent Jetpack settings from being submitted
			event.stopPropagation();

			if ( onSubmit ) {
				return onSubmit();
			}

			setIsConnecting( true );

			const formData = new FormData( event.target as HTMLFormElement );

			await requestAccess( formData );
		},
		[ onSubmit, requestAccess ]
	);

	return (
		<form
			className={ clsx( styles[ 'connect-form' ], { [ styles.small ]: isSmall } ) }
			onSubmit={ onSubmitForm }
		>
			{ displayInputs ? (
				<div className={ clsx( styles[ 'fields-wrapper' ], styles.input ) }>
					<CustomInputs service={ service } />
				</div>
			) : null }

			<div className={ styles[ 'fields-wrapper' ] }>
				<div className={ styles[ 'fields-item' ] }>
					<Button
						variant={ hasConnections ? 'secondary' : 'primary' }
						type="submit"
						className={ styles[ 'connect-button' ] }
						disabled={ isFetchingServicesList }
					>
						{ ( label => {
							if ( label ) {
								return label;
							}

							if ( isFetchingServicesList && isConnecting ) {
								return __( 'Connecting…', 'jetpack-publicize-components' );
							}

							return hasConnections
								? _x( 'Connect more', '', 'jetpack-publicize-components' )
								: __( 'Connect', 'jetpack-publicize-components' );
						} )( buttonLabel ) }
					</Button>
				</div>
			</div>
		</form>
	);
}
