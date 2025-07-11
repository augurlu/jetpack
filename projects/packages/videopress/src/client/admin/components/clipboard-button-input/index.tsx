/**
 * External dependencies
 */
import { Button } from '@automattic/jetpack-components';
import { useCopyToClipboard } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
/**
 * Internal dependencies
 */
import styles from './style.module.scss';
import { ClipboardButtonInputProps } from './types';
import type { FC, MouseEvent, ReactNode } from 'react';

/**
 * ClipboardButtionInput component
 *
 * @param {ClipboardButtonInput} props - Component props.
 * @return {ReactNode} - ClipboardButtonInput react component.
 */
const ClipboardButtonInput: FC< ClipboardButtonInputProps > = ( {
	text,
	value,
	onCopy,
	resetTime = 3000,
} ) => {
	const onClickInputHandler = ( event: MouseEvent< HTMLInputElement > ) => {
		event.currentTarget.select();
	};
	const copiedLabel = __( 'Copied!', 'jetpack-videopress-pkg' );
	const copyLabel = __( 'Copy', 'jetpack-videopress-pkg' );
	const [ hasCopied, setHasCopied ] = useState( false );

	const textToCopy = value || text;
	const ref = useCopyToClipboard( textToCopy, () => {
		const timer = setTimeout( () => {
			setHasCopied( false );
			clearTimeout( timer );
		}, resetTime );

		setHasCopied( true );
		onCopy?.();
	} );

	return (
		<div className={ styles.wrapper }>
			<input type="text" value={ text || value } onClick={ onClickInputHandler } readOnly />
			<Button weight="regular" variant="secondary" size="small" ref={ ref }>
				{ hasCopied ? copiedLabel : copyLabel }
			</Button>
		</div>
	);
};

export default ClipboardButtonInput;
