import { useEffect, useCallback, useState } from '@wordpress/element';
import type { MutableRefObject } from 'react';

/**
 * A hook that returns true/false if ref node receives focus by either tabbing or clicking into any of its children.
 * @param  ref - MutableRefObject< null | HTMLElement >
 * @return {boolean} - True if the ref node has focus, false otherwise.
 */
const useFocusHandler = ( ref: MutableRefObject< null | HTMLElement > ): boolean => {
	const [ hasFocus, setHasFocus ] = useState( false );

	const handleFocus = useCallback( () => {
		const doc = ref.current?.ownerDocument;
		if ( doc && doc.hasFocus() && ref.current?.contains( doc.activeElement ) ) {
			setHasFocus( true );
		} else {
			setHasFocus( false );
		}
	}, [ ref ] );

	const handleMousedown = useCallback(
		( event: MouseEvent ) => {
			if ( ref.current?.contains( event.target as Node ) ) {
				setHasFocus( true );
			} else {
				setHasFocus( false );
			}
		},
		[ ref ]
	);

	const handleKeyup = useCallback(
		( event: KeyboardEvent ) => {
			if ( event.key === 'Tab' ) {
				if ( ref.current?.contains( event.target as Node ) ) {
					setHasFocus( true );
				} else {
					setHasFocus( false );
				}
			}
		},
		[ ref ]
	);

	useEffect( () => {
		document.addEventListener( 'focusin', handleFocus );
		document.addEventListener( 'mousedown', handleMousedown );
		document.addEventListener( 'keyup', handleKeyup );

		return () => {
			document.removeEventListener( 'focusin', handleFocus );
			document.removeEventListener( 'mousedown', handleMousedown );
			document.removeEventListener( 'keyup', handleKeyup );
		};
	}, [ ref, handleFocus, handleKeyup, handleMousedown ] );

	return hasFocus;
};

export default useFocusHandler;
