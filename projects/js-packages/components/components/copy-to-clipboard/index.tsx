import { useCopyToClipboard } from '@wordpress/compose';
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Button from '../button/index.tsx';
import { ClipboardIcon, CheckmarkIcon } from '../icons/index.tsx';
import { CopyToClipboardProps } from './types.ts';
import type { FC, ReactNode } from 'react';

export const CopyToClipboard: FC< CopyToClipboardProps > = ( {
	buttonStyle = 'icon',
	textToCopy,
	onCopy,
	...buttonProps
} ) => {
	const [ hasCopied, setHasCopied ] = useState( false );

	const copyTimer = useRef< ReturnType< typeof setTimeout > | undefined >();

	const copyRef = useCopyToClipboard( textToCopy, () => {
		if ( copyTimer.current ) {
			clearTimeout( copyTimer.current );
		}

		setHasCopied( true );

		onCopy?.();

		copyTimer.current = setTimeout( () => {
			setHasCopied( false );
			copyTimer.current = undefined;
		}, 3000 );
	} );

	useEffect( () => {
		// Clear copyTimer on component unmount.
		return () => {
			if ( copyTimer.current ) {
				clearTimeout( copyTimer.current );
			}
		};
	}, [] );

	let icon: ReactNode = null;
	let label: ReactNode = null;

	if ( 'text' !== buttonStyle ) {
		icon = hasCopied ? <CheckmarkIcon /> : <ClipboardIcon />;
	}

	const defaultLabel = __( 'Copy to clipboard', 'jetpack-components' );

	if ( 'icon' !== buttonStyle ) {
		label = hasCopied ? __( 'Copied!', 'jetpack-components' ) : defaultLabel;
	}

	return (
		<Button
			aria-label={ defaultLabel }
			icon={ icon }
			children={ label }
			ref={ copyRef }
			{ ...buttonProps }
		/>
	);
};

export default CopyToClipboard;
