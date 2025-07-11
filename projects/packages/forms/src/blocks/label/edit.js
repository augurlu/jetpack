import { RichText, store as blockEditorStore, useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { clsx } from 'clsx';
import { useSyncedAttributes } from '../shared/hooks/use-synced-attributes';
import useVariationStyleProperties from '../shared/hooks/use-variation-style-properties.js';
import { ALLOWED_FORMATS, DATE_FORMATS, FORM_STYLE } from '../shared/util/constants.js';
import getBlockStyle from '../shared/util/get-block-style.js';

const SYNCED_ATTRIBUTE_KEYS = [ 'textColor', 'fontFamily', 'fontSize', 'style' ];

const getLabelOrFallback = ( label, placeholder ) => {
	if ( label === '' ) {
		return placeholder;
	}

	return label ?? placeholder;
};

const OPTIONS_FIELDS = [ 'jetpack/field-radio', 'jetpack/field-checkbox-multiple' ];

function useSiblingBlock( clientId ) {
	const inputBlock = useSelect(
		select => {
			const { getBlock, getBlockRootClientId } = select( blockEditorStore );

			// Get the parent block's clientId.
			const parentClientId = getBlockRootClientId( clientId );
			if ( ! parentClientId ) {
				return {};
			}
			// Get the parent block
			const parentBlock = getBlock( parentClientId );
			if ( ! parentBlock ) {
				return {};
			}

			const siblingBlockType = OPTIONS_FIELDS.includes( parentBlock.name )
				? 'jetpack/options'
				: 'jetpack/input';

			return parentBlock.innerBlocks.find( block => block.name === siblingBlockType );
		},
		[ clientId ]
	);

	return inputBlock;
}

const WithNotchedWrapper = ( {
	formStyle,
	styles,
	cssVars,
	className,
	children,
	forcePlainStyle = false,
} ) => {
	if ( formStyle === FORM_STYLE.OUTLINED && ! forcePlainStyle ) {
		return (
			<div className="notched-label" style={ cssVars }>
				<div className={ clsx( 'notched-label__leading', className ) } style={ styles } />
				<div className={ clsx( 'notched-label__notch', className ) } style={ styles }>
					{ children }
				</div>
				<div className={ clsx( 'notched-label__filler', className ) } style={ styles } />
				<div className={ clsx( 'notched-label__trailing', className ) } style={ styles } />
			</div>
		);
	}

	return <>{ children }</>;
};

const LabelEdit = ( { clientId, attributes, name, setAttributes, context } ) => {
	const {
		'jetpack/form-class-name': formClassName,
		'jetpack/field-required': required,
		'jetpack/field-date-format': dateFormat,
		'jetpack/field-share-attributes': isSynced,
	} = context;
	useSyncedAttributes( name, isSynced, SYNCED_ATTRIBUTE_KEYS, attributes, setAttributes );

	const { label, placeholder, requiredText } = attributes;
	const placeholderValue = placeholder !== '' ? placeholder : __( 'Add label…', 'jetpack-forms' );
	const suffix = dateFormat
		? `(${ DATE_FORMATS.find( f => f.value === dateFormat )?.label })`
		: undefined;
	const formStyle = getBlockStyle( formClassName );
	const className = clsx( 'jetpack-field-label', {
		'notched-label__label': formStyle === FORM_STYLE.OUTLINED,
		'animated-label__label': formStyle === FORM_STYLE.ANIMATED,
		'below-label__label': formStyle === FORM_STYLE.BELOW,
	} );

	const inputBlock = useSiblingBlock( clientId );

	const variationProps = useVariationStyleProperties( {
		clientId,
		inputBlockName: inputBlock?.name,
		inputBlockAttributes: inputBlock?.attributes,
	} );
	const blockProps = useBlockProps( {
		className,
		style: variationProps?.cssVars,
	} );

	// Do not allow enter key to create a new line in the label if the form style is not default.
	// Animated and Outlined styles have a notched label, so we don't want to allow new lines in the label.
	const onKeyDown = useCallback(
		event => {
			if ( event.key === 'Enter' && FORM_STYLE.DEFAULT !== formStyle ) {
				event.preventDefault();
			}
		},
		[ formStyle ]
	);

	// The label value to use for the RichText field must manually fall back to the
	// placeholder to be rendered in previews.
	const isPreviewMode = useSelect( select => {
		return select( blockEditorStore ).getSettings().isPreviewMode;
	}, [] );
	const labelValue = isPreviewMode ? getLabelOrFallback( label, placeholderValue ) : label;

	return (
		<WithNotchedWrapper
			formStyle={ formStyle }
			forcePlainStyle={ ! inputBlock }
			styles={ variationProps?.style }
			cssVars={ variationProps?.cssVars }
			className={ variationProps?.className }
		>
			<div { ...blockProps }>
				<RichText
					allowedFormats={ ALLOWED_FORMATS }
					className="jetpack-field-label__input"
					onChange={ value => setAttributes( { label: value } ) }
					placeholder={ placeholderValue }
					onKeyDown={ onKeyDown }
					tagName="label"
					value={ labelValue }
					withoutInteractiveFormatting
				/>
				{ suffix && <span className="jetpack-field-label__suffix">{ suffix }</span> }
				{ required && (
					<RichText
						allowedFormats={ ALLOWED_FORMATS }
						className="required"
						onChange={ value => setAttributes( { requiredText: value } ) }
						tagName="span"
						value={ requiredText || __( '(required)', 'jetpack-forms' ) }
						withoutInteractiveFormatting
					/>
				) }
			</div>
		</WithNotchedWrapper>
	);
};

export default LabelEdit;
