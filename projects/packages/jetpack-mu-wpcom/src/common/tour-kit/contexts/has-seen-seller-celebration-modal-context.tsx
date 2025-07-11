import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { createContext, useContext } from 'react';
import type { FC } from 'react';

type HasSeenSCModalResult = {
	has_seen_seller_celebration_modal: boolean;
};

type HasSeenSellerCelebrationModalContextType = {
	hasSeenSellerCelebrationModal: boolean;
	updateHasSeenSellerCelebrationModal: ( value: boolean ) => void;
};

const HasSeenSCModalContext = createContext< HasSeenSellerCelebrationModalContextType >( {
	hasSeenSellerCelebrationModal: false,
	updateHasSeenSellerCelebrationModal: () => {},
} );

export const useHasSeenSellerCelebrationModal = () => {
	return useContext( HasSeenSCModalContext );
};

export const HasSeenSellerCelebrationModalProvider: FC< { children: JSX.Element } > = function ( {
	children,
} ) {
	const [ hasSeenSellerCelebrationModal, setHasSeenSellerCelebrationModal ] = useState( false );

	/**
	 * Fetch the value that whether the video celebration modal has been seen.
	 */
	function fetchHasSeenSellerCelebrationModal() {
		apiFetch< HasSeenSCModalResult >( {
			path: '/wpcom/v2/block-editor/has-seen-seller-celebration-modal',
		} )
			.then( ( result: HasSeenSCModalResult ) =>
				setHasSeenSellerCelebrationModal( result.has_seen_seller_celebration_modal )
			)
			.catch( () => setHasSeenSellerCelebrationModal( false ) );
	}

	/**
	 * Update the value that whether the video celebration modal has been seen.
	 *
	 * @param value - The value to update.
	 */
	function updateHasSeenSellerCelebrationModal( value: boolean ) {
		apiFetch( {
			method: 'PUT',
			path: '/wpcom/v2/block-editor/has-seen-seller-celebration-modal',
			data: { has_seen_seller_celebration_modal: value },
		} ).finally( () => {
			setHasSeenSellerCelebrationModal( true );
		} );
	}

	useEffect( () => {
		fetchHasSeenSellerCelebrationModal();
	}, [] );

	return (
		<HasSeenSCModalContext.Provider
			value={ { hasSeenSellerCelebrationModal, updateHasSeenSellerCelebrationModal } }
		>
			{ children }
		</HasSeenSCModalContext.Provider>
	);
};
