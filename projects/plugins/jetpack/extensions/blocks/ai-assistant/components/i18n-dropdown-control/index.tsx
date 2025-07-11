/*
 * External dependencies
 */
import { LANGUAGE_MAP, TRANSLATE_LABEL } from '@automattic/jetpack-ai-client';
import { useAnalytics } from '@automattic/jetpack-shared-extension-utils';
import {
	MenuItem,
	MenuGroup,
	ToolbarDropdownMenu,
	DropdownMenu,
	Button,
	Tooltip,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, chevronRight, globe } from '@wordpress/icons';
/*
 * Internal dependencies
 */
import './style.scss';

const LANGUAGE_LIST = [
	'en',
	'es',
	'fr',
	'de',
	'it',
	'pt',
	'ru',
	'zh',
	'ja',
	'ar',
	'hi',
	'ko',
	// more languages here...
] as const;

export type LanguageProp = ( typeof LANGUAGE_LIST )[ number ];

type LanguageDropdownControlProps = {
	value?: LanguageProp;
	onChange: ( value: string, name?: string ) => void;
	label?: string;
	disabled?: boolean;
};

const defaultLanguageLocale =
	window?.Jetpack_Editor_Initial_State?.siteLocale || navigator?.language;

export const defaultLanguage = ( defaultLanguageLocale?.split( '-' )[ 0 ] || 'en' ) as LanguageProp;

export const defaultLocale = defaultLanguageLocale?.split( '-' )?.[ 1 ] || null;

export const I18nMenuGroup = ( {
	value,
	onChange,
}: Pick< LanguageDropdownControlProps, 'value' | 'onChange' > ) => {
	const languageList = [ ...LANGUAGE_LIST.filter( language => language !== defaultLanguage ) ];
	// Move the default language to the top of the list if it is included on LANGUAGE_LIST.
	if ( LANGUAGE_LIST.includes( defaultLanguage ) ) {
		languageList.unshift( defaultLanguage );
	}

	return (
		<MenuGroup label={ __( 'Select language', 'jetpack' ) }>
			{ languageList.map( language => {
				return (
					<MenuItem
						key={ `key-${ language }` }
						onClick={ () => onChange( language + ' (' + LANGUAGE_MAP[ language ].label + ')' ) }
						isSelected={ value === language }
					>
						{ LANGUAGE_MAP[ language ].label }
					</MenuItem>
				);
			} ) }
		</MenuGroup>
	);
};

export default function I18nDropdownControl( {
	value = defaultLanguage,
	label = TRANSLATE_LABEL,
	onChange,
	disabled = false,
}: LanguageDropdownControlProps ) {
	const { tracks } = useAnalytics();

	const toggleHandler = isOpen => {
		if ( isOpen ) {
			tracks.recordEvent( 'jetpack_ai_assistant_block_toolbar_menu_show', { tool: 'i18n' } );
		}
	};

	return disabled ? (
		<Tooltip text={ label }>
			<Button disabled>
				<Icon icon={ globe } />
			</Button>
		</Tooltip>
	) : (
		<ToolbarDropdownMenu
			icon={ globe }
			label={ label }
			popoverProps={ {
				variant: 'toolbar',
			} }
			onToggle={ toggleHandler }
		>
			{ () => <I18nMenuGroup value={ value } onChange={ onChange } /> }
		</ToolbarDropdownMenu>
	);
}

export function I18nMenuDropdown( {
	value = defaultLanguage,
	label = TRANSLATE_LABEL,
	onChange,
	disabled = false,
}: Pick< LanguageDropdownControlProps, 'label' | 'onChange' | 'value' | 'disabled' > & {
	toggleProps?: Record< string, unknown >;
} ) {
	return (
		<DropdownMenu
			className="ai-assistant__i18n-dropdown"
			icon={ globe }
			label={ label }
			toggleProps={ {
				children: (
					<>
						<div className="ai-assistant__i18n-dropdown__toggle-label">{ label }</div>
						<Icon icon={ chevronRight } />
					</>
				),
				disabled,
			} }
		>
			{ ( { onClose } ) => (
				<I18nMenuGroup
					onChange={ ( ...args ) => {
						onChange( ...args );
						onClose();
					} }
					value={ value }
				/>
			) }
		</DropdownMenu>
	);
}
