/*
 * External dependencies
 */
import { aiAssistantIcon, LANGUAGE_MAP, PROMPT_TONES_MAP } from '@automattic/jetpack-ai-client';
import { RangeControl, Button, BaseControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
/**
 * Internal dependencies
 */
import { I18nMenuDropdown } from '../../../../blocks/ai-assistant/components/i18n-dropdown-control';
import { ToneDropdownMenu } from '../../../../blocks/ai-assistant/components/tone-dropdown-control';
/**
 * Types and constants
 */
import type { LanguageProp } from '../../../../blocks/ai-assistant/components/i18n-dropdown-control';
import type { ToneProp } from '../../../../blocks/ai-assistant/components/tone-dropdown-control';

export type AiExcerptControlProps = {
	/*
	 * Whether the component is disabled.
	 */
	disabled?: boolean;

	/*
	 * The number of words in the generated excerpt.
	 */
	words?: number;

	/*
	 * The minimum number of words in the generated excerpt.
	 */
	minWords?: number;

	/*
	 * The maximum number of words in the generated excerpt.
	 */
	maxWords?: number;

	/*
	 * Callback to change the number of words in the generated excerpt.
	 */
	onWordsNumberChange?: ( words: number ) => void;

	language?: LanguageProp;
	onLanguageChange?: ( language: LanguageProp ) => void;

	tone?: ToneProp;
	onToneChange?: ( tone: ToneProp ) => void;
};

import './style.scss';

export function AiExcerptControl( {
	minWords = 10,
	maxWords = 100,
	disabled,

	words,
	onWordsNumberChange,

	language,
	onLanguageChange,

	tone,
	onToneChange,
}: AiExcerptControlProps ) {
	const [ isSettingActive, setIsSettingActive ] = useState( false );

	function toggleSetting() {
		setIsSettingActive( prev => ! prev );
	}

	// const langLabel = language || __( 'Language', 'jetpack' );
	// const toneLabel = tone || __( 'Tone', 'jetpack' );

	const lang = language?.split( ' ' )[ 0 ];
	const langLabel = LANGUAGE_MAP[ lang ]?.label || __( 'Language', 'jetpack' );
	const toneLabel = PROMPT_TONES_MAP[ tone ]?.label || __( 'Tone', 'jetpack' );

	return (
		<div className="jetpack-ai-generate-excerpt-control">
			<BaseControl
				className="jetpack-ai-generate-excerpt-control__header"
				__nextHasNoMarginBottom={ true }
			>
				<BaseControl.VisualLabel>{ __( 'Settings', 'jetpack' ) }</BaseControl.VisualLabel>
				<Button
					label={ __( 'Advanced AI options', 'jetpack' ) }
					icon={ aiAssistantIcon }
					onClick={ toggleSetting }
					aria-pressed={ isSettingActive }
					isSmall
				/>
			</BaseControl>

			{ isSettingActive && (
				<>
					<I18nMenuDropdown
						disabled={ disabled }
						onChange={ onLanguageChange }
						value={ language }
						label={ langLabel }
					/>

					<ToneDropdownMenu
						disabled={ disabled }
						label={ toneLabel }
						value={ tone }
						onChange={ onToneChange }
					/>
				</>
			) }

			<RangeControl
				label={ __( 'Desired length', 'jetpack' ) }
				value={ words }
				onChange={ onWordsNumberChange }
				min={ minWords }
				max={ maxWords }
				help={ __(
					'Sets the desired length in words for the auto-generated excerpt. The final count may vary due to how AI works.',
					'jetpack'
				) }
				showTooltip={ false }
				disabled={ disabled }
				__next40pxDefaultSize
			/>
		</div>
	);
}
