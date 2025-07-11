/*
 * External dependencies
 */
import { PROMPT_TONES_MAP, speakToneIcon, TONE_LABEL } from '@automattic/jetpack-ai-client';
import { useAnalytics } from '@automattic/jetpack-shared-extension-utils';
import {
	MenuItem,
	MenuGroup,
	ToolbarDropdownMenu,
	DropdownMenu,
	Icon,
	Button,
	Tooltip,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import './style.scss';

const PROMPT_TONES_LIST = [
	'formal',
	'informal',
	'optimistic',
	'humorous',
	'serious',
	'skeptical',
	'empathetic',
	'confident',
	'passionate',
	'provocative',
] as const;

export const DEFAULT_PROMPT_TONE = 'formal';

export type ToneProp = ( typeof PROMPT_TONES_LIST )[ number ];

type ToneToolbarDropdownMenuProps = {
	value?: ToneProp;
	onChange: ( value: ToneProp ) => void;
	label?: string;
	disabled?: boolean;
};

const ToneMenuGroup = ( { value, onChange }: ToneToolbarDropdownMenuProps ) => (
	<MenuGroup label={ __( 'Select tone', 'jetpack' ) }>
		{ PROMPT_TONES_LIST.map( tone => {
			return (
				<MenuItem
					key={ `key-${ tone }` }
					onClick={ () => onChange( tone ) }
					isSelected={ value === tone }
				>
					{ `${ PROMPT_TONES_MAP[ tone ].emoji } ${ PROMPT_TONES_MAP[ tone ].label }` }
				</MenuItem>
			);
		} ) }
	</MenuGroup>
);

export function ToneDropdownMenu( {
	label = TONE_LABEL,
	value = DEFAULT_PROMPT_TONE,
	onChange,
	disabled = false,
}: ToneToolbarDropdownMenuProps ) {
	return (
		<DropdownMenu
			icon={ speakToneIcon }
			label={ label }
			className="ai-assistant__tone-dropdown"
			popoverProps={ {
				variant: 'toolbar',
			} }
			toggleProps={ {
				children: (
					<>
						<div className="ai-assistant__tone-dropdown__toggle-label">{ label }</div>
						<Icon icon={ chevronRight } />
					</>
				),
				disabled,
			} }
		>
			{ ( { onClose } ) => (
				<ToneMenuGroup
					value={ value }
					onChange={ newTone => {
						onChange( newTone );
						onClose();
					} }
				/>
			) }
		</DropdownMenu>
	);
}

export default function ToneToolbarDropdownMenu( {
	value = DEFAULT_PROMPT_TONE,
	onChange,
	disabled = false,
}: ToneToolbarDropdownMenuProps ) {
	const { tracks } = useAnalytics();

	const toggleHandler = isOpen => {
		if ( isOpen ) {
			tracks.recordEvent( 'jetpack_ai_assistant_block_toolbar_menu_show', { tool: 'tone' } );
		}
	};

	return disabled ? (
		<Tooltip text={ TONE_LABEL }>
			<Button disabled>
				<Icon icon={ speakToneIcon } />
			</Button>
		</Tooltip>
	) : (
		<ToolbarDropdownMenu
			icon={ speakToneIcon }
			label={ TONE_LABEL }
			popoverProps={ {
				variant: 'toolbar',
			} }
			disabled={ disabled }
			onToggle={ toggleHandler }
		>
			{ () => <ToneMenuGroup value={ value } onChange={ onChange } /> }
		</ToolbarDropdownMenu>
	);
}
