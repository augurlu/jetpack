/**
 * External dependencies
 */
import { Button, Flex } from '@wordpress/components';
import { useKeyboardShortcut } from '@wordpress/compose';
import { useImperativeHandle, useRef, useEffect, useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, closeSmall, arrowUp, undo } from '@wordpress/icons';
import { forwardRef } from 'react';
/**
 * Internal dependencies
 */
import {
	GuidelineMessage,
	ErrorMessage,
	UpgradeMessage,
	FairUsageLimitMessage,
} from '../message/index.tsx';
import AIControl from './ai-control.tsx';
import './style.scss';
/**
 * Types
 */
import type { RequestingErrorProps, RequestingStateProp } from '../../types.ts';
import type { MutableRefObject, ReactElement, MouseEvent } from 'react';

type ExtensionAIControlProps = {
	className?: string;
	disabled?: boolean;
	value: string;
	placeholder?: string;
	showButtonLabels?: boolean;
	isTransparent?: boolean;
	state?: RequestingStateProp;
	showGuideLine?: boolean;
	error?: RequestingErrorProps;
	requestsRemaining?: number;
	showUpgradeMessage?: boolean;
	showFairUsageMessage?: boolean;
	upgradeUrl?: string;
	wrapperRef?: MutableRefObject< HTMLDivElement | null >;
	onChange?: ( newValue: string ) => void;
	onSend?: ( currentValue: string ) => void;
	onStop?: () => void;
	onClose?: () => void;
	onUndo?: () => void;
	onUpgrade?: ( event: MouseEvent< HTMLButtonElement > ) => void;
	onTryAgain?: () => void;
	lastAction?: string;
	blockType: string;
};

/**
 * ExtensionAIControl component. Used by the AI Assistant inline extensions, adding logic and components to the base AIControl component.
 *
 * @param {ExtensionAIControlProps} props - Component props
 * @param {MutableRefObject}        ref   - Ref to the component
 * @return {ReactElement}                 Rendered component
 */
export function ExtensionAIControl(
	{
		className,
		disabled = false,
		value = '',
		placeholder = '',
		showButtonLabels = true,
		isTransparent = false,
		state = 'init',
		showGuideLine = false,
		error,
		requestsRemaining,
		showUpgradeMessage = false,
		showFairUsageMessage = false,
		upgradeUrl,
		wrapperRef,
		onChange,
		onSend,
		onStop,
		onClose,
		onUndo,
		onUpgrade,
		onTryAgain,
		lastAction,
		blockType,
	}: ExtensionAIControlProps,
	ref: MutableRefObject< HTMLInputElement >
): ReactElement {
	const loading = state === 'requesting' || state === 'suggesting';
	const [ editRequest, setEditRequest ] = useState( false );
	const [ lastValue, setLastValue ] = useState( value || null );
	const promptUserInputRef = useRef( null );
	const isDone = value?.length <= 0 && state === 'done';

	// Pass the ref to forwardRef.
	useImperativeHandle( ref, () => promptUserInputRef.current );

	useEffect( () => {
		if ( editRequest ) {
			promptUserInputRef?.current?.focus();
		}
	}, [ editRequest ] );

	const sendHandler = useCallback( () => {
		setLastValue( value );
		setEditRequest( false );
		onSend?.( value );
	}, [ onSend, value ] );

	const changeHandler = useCallback(
		( newValue: string ) => {
			onChange?.( newValue );
			if ( state === 'init' ) {
				return;
			}

			if ( ! lastValue ) {
				// here we're coming from a one-click action
				setEditRequest( newValue.length > 0 );
			} else {
				// here we're coming from an edit action
				setEditRequest( newValue !== lastValue );
			}
		},
		[ onChange, lastValue, state ]
	);

	const stopHandler = useCallback( () => {
		onStop?.();
	}, [ onStop ] );

	const closeHandler = useCallback( () => {
		onClose?.();
	}, [ onClose ] );

	const undoHandler = useCallback( () => {
		onUndo?.();
	}, [ onUndo ] );

	const upgradeHandler = useCallback(
		( event: MouseEvent< HTMLButtonElement > ) => {
			onUpgrade?.( event );
		},
		[ onUpgrade ]
	);

	const tryAgainHandler = useCallback( () => {
		onTryAgain?.();
	}, [ onTryAgain ] );

	useKeyboardShortcut(
		'enter',
		e => {
			e.preventDefault();
			sendHandler();
		},
		{
			target: promptUserInputRef,
		}
	);

	const actions = (
		<>
			{ loading ? (
				<Button
					className="jetpack-components-ai-control__controls-prompt_button"
					onClick={ stopHandler }
					variant="secondary"
					label={ __( 'Stop request', 'jetpack-ai-client' ) }
				>
					{ showButtonLabels ? __( 'Stop', 'jetpack-ai-client' ) : <Icon icon={ closeSmall } /> }
				</Button>
			) : (
				<>
					{ value?.length > 0 && (
						<div className="jetpack-components-ai-control__controls-prompt_button_wrapper">
							<Button
								className="jetpack-components-ai-control__controls-prompt_button"
								onClick={ sendHandler }
								variant="primary"
								disabled={ ! value?.length || disabled }
								label={ __( 'Send request', 'jetpack-ai-client' ) }
							>
								{ showButtonLabels ? (
									__( 'Generate', 'jetpack-ai-client' )
								) : (
									<Icon icon={ arrowUp } />
								) }
							</Button>
						</div>
					) }
					{ isDone && (
						<div className="jetpack-components-ai-control__controls-prompt_button_wrapper">
							<Flex gap={ 1 } role="group" className="jetpack-components-ai-control__button-group">
								<Button
									className="jetpack-components-ai-control__controls-prompt_button"
									label={ __( 'Undo', 'jetpack-ai-client' ) }
									onClick={ undoHandler }
									tooltipPosition="top"
								>
									<Icon icon={ undo } />
								</Button>
								<Button
									className="jetpack-components-ai-control__controls-prompt_button"
									label={ __( 'Close', 'jetpack-ai-client' ) }
									onClick={ closeHandler }
									variant="tertiary"
								>
									{ __( 'Close', 'jetpack-ai-client' ) }
								</Button>
							</Flex>
						</div>
					) }
				</>
			) }
		</>
	);

	let message = null;

	if ( error?.message ) {
		message = (
			<ErrorMessage
				error={ error.message }
				code={ error.code }
				onTryAgainClick={ tryAgainHandler }
				onUpgradeClick={ upgradeHandler }
				upgradeUrl={ upgradeUrl }
			/>
		);
	} else if ( showFairUsageMessage ) {
		message = <FairUsageLimitMessage />;
	} else if ( showUpgradeMessage ) {
		message = (
			<UpgradeMessage
				requestsRemaining={ requestsRemaining }
				onUpgradeClick={ upgradeHandler }
				upgradeUrl={ upgradeUrl }
			/>
		);
	} else if ( showGuideLine ) {
		message = isDone ? (
			<GuidelineMessage
				aiFeedbackThumbsOptions={ {
					showAIFeedbackThumbs: true,
					ratedItem: 'ai-assistant',
					prompt: lastAction,
					block: blockType,
				} }
			/>
		) : (
			<GuidelineMessage />
		);
	}

	return (
		<AIControl
			className={ className }
			disabled={ disabled || loading }
			value={ value }
			placeholder={ placeholder }
			isTransparent={ isTransparent }
			state={ state }
			onChange={ changeHandler }
			actions={ actions }
			message={ message }
			promptUserInputRef={ promptUserInputRef }
			wrapperRef={ wrapperRef }
		/>
	);
}

export default forwardRef( ExtensionAIControl );
