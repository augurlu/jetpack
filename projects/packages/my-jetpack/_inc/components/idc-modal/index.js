import { Modal } from '@wordpress/components';
import { useState, useCallback } from 'react';
import styles from './styles.module.scss';

/**
 * Wrapper for the IDC Screen to display it in a modal.
 *
 * @return {import('react').Component|null} The IDC Screen modal component.
 */
function IDCModal() {
	const [ isOpen, setOpen ] = useState( true );

	const closeModal = useCallback( () => setOpen( false ), [] );

	if ( ! isOpen ) {
		return null;
	}

	if ( ! Object.hasOwn( window, 'JP_IDENTITY_CRISIS__INITIAL_STATE' ) ) {
		return null;
	}

	const { containerID, isSafeModeConfirmed } = window.JP_IDENTITY_CRISIS__INITIAL_STATE;

	if ( ! containerID || isSafeModeConfirmed ) {
		return null;
	}

	return (
		<Modal onRequestClose={ closeModal } overlayClassName={ styles.modal }>
			<div id={ containerID } className={ styles.container }></div>
		</Modal>
	);
}

export default IDCModal;
