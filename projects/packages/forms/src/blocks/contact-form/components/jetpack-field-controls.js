import {
	FontSizePicker,
	InspectorAdvancedControls,
	InspectorControls,
	LineHeightControl,
	BlockControls,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	BaseControl,
	PanelBody,
	TextControl,
	ToggleControl,
	RangeControl,
} from '@wordpress/components';
import { isValidElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import JetpackFieldWidth from '../../shared/components/jetpack-field-width';
import ToolbarRequiredGroup from '../../shared/components/toolbar-required-group';
import { useFormStyle, FORM_STYLE, getBlockStyle } from '../util/form';
import JetpackManageResponsesSettings from './jetpack-manage-responses-settings';

const JetpackFieldControls = ( {
	attributes,
	blockClassNames,
	clientId,
	id,
	placeholder,
	placeholderField = 'placeholder',
	hidePlaceholder,
	required,
	setAttributes,
	type,
	width,
	extraFieldSettings = [],
} ) => {
	const formStyle = useFormStyle( clientId );
	const blockStyle = getBlockStyle( blockClassNames );
	const isChoicesBlock = [ 'radio', 'checkbox' ].includes( type );

	const setNumberAttribute =
		( key, parse = parseInt ) =>
		value => {
			const parsedValue = parse( value, 10 );

			setAttributes( {
				[ key ]: ! isNaN( parsedValue ) ? parsedValue : undefined,
			} );
		};

	const optionColorLabel =
		blockStyle === 'button'
			? __( 'Button Text', 'jetpack-forms' )
			: __( 'Option Text', 'jetpack-forms', 0 );

	const inputColorLabel = isChoicesBlock
		? optionColorLabel
		: __( 'Field Text', 'jetpack-forms', 0 );

	const backgroundColorLabel = isChoicesBlock
		? __( 'Background', 'jetpack-forms' )
		: __( 'Field Background', 'jetpack-forms', 0 );

	const stylesPanelTitle = isChoicesBlock
		? __( 'Options Styles', 'jetpack-forms' )
		: __( 'Input Field Styles', 'jetpack-forms', 0 );

	const colorSettings = [
		{
			value: attributes.labelColor,
			onChange: value => setAttributes( { labelColor: value } ),
			label: __( 'Label Text', 'jetpack-forms' ),
		},
		{
			value: attributes.inputColor,
			onChange: value => setAttributes( { inputColor: value } ),
			label: inputColorLabel,
		},
	];

	if ( isChoicesBlock && blockStyle === 'button' ) {
		colorSettings.push( {
			value: attributes.buttonBackgroundColor,
			onChange: value => setAttributes( { buttonBackgroundColor: value } ),
			label: __( 'Button Background', 'jetpack-forms' ),
		} );
	}

	if ( ! isChoicesBlock || formStyle === FORM_STYLE.OUTLINED ) {
		colorSettings.push( {
			value: attributes.fieldBackgroundColor,
			onChange: value => setAttributes( { fieldBackgroundColor: value } ),
			label: backgroundColorLabel,
		} );

		colorSettings.push( {
			value: attributes.borderColor,
			onChange: value => setAttributes( { borderColor: value } ),
			label: __( 'Border', 'jetpack-forms' ),
		} );
	}

	const setId = value => {
		const newValue = value.replace( /[^a-zA-Z0-9_-]/g, '' );
		setAttributes( { id: newValue } );
	};

	let fieldSettings = [
		<ToggleControl
			key="required"
			label={ __( 'Field is required', 'jetpack-forms' ) }
			checked={ required }
			onChange={ value => setAttributes( { required: value } ) }
			help={ __( 'You can edit the "required" label in the editor', 'jetpack-forms' ) }
			__nextHasNoMarginBottom={ true }
		/>,
		! hidePlaceholder && (
			<TextControl
				key="placeholderField"
				label={ __( 'Placeholder text', 'jetpack-forms' ) }
				value={ placeholder || '' }
				onChange={ value => setAttributes( { [ placeholderField ]: value } ) }
				help={ __(
					'Show visitors an example of the type of content expected. Otherwise, leave blank.',
					'jetpack-forms'
				) }
				__nextHasNoMarginBottom={ true }
				__next40pxDefaultSize={ true }
			/>
		),
		<JetpackFieldWidth key="width" setAttributes={ setAttributes } width={ width } />,
		<ToggleControl
			key="shareFieldAttributes"
			label={ __( 'Sync fields style', 'jetpack-forms' ) }
			checked={ attributes.shareFieldAttributes }
			onChange={ value => setAttributes( { shareFieldAttributes: value } ) }
			help={ __( 'Deactivate for individual styling of this block', 'jetpack-forms' ) }
			__nextHasNoMarginBottom={ true }
		/>,
	];

	extraFieldSettings.forEach( ( { element, index } ) => {
		if ( ! isValidElement( element ) ) {
			return;
		}

		if ( index >= 0 && index < fieldSettings.length ) {
			fieldSettings = [
				...fieldSettings.slice( 0, index ),
				element,
				...fieldSettings.slice( index ),
			];
		} else {
			fieldSettings.push( element );
		}
	} );

	return (
		<>
			<BlockControls>
				<ToolbarRequiredGroup
					required={ required }
					onClick={ () => setAttributes( { required: ! required } ) }
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Manage responses', 'jetpack-forms' ) }>
					<JetpackManageResponsesSettings isChildBlock />
				</PanelBody>
				<PanelBody title={ __( 'Field settings', 'jetpack-forms' ) }>
					<>{ fieldSettings }</>
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Color', 'jetpack-forms' ) }
					initialOpen={ false }
					colorSettings={ colorSettings }
				/>
				<PanelBody title={ stylesPanelTitle } initialOpen={ false }>
					<BaseControl __nextHasNoMarginBottom={ true }>
						<FontSizePicker
							withReset={ true }
							size="__unstable-large"
							__nextHasNoMarginBottom
							onChange={ fieldFontSize => setAttributes( { fieldFontSize } ) }
							value={ attributes.fieldFontSize }
						/>
					</BaseControl>
					<BaseControl __nextHasNoMarginBottom={ true }>
						<LineHeightControl
							__nextHasNoMarginBottom={ true }
							__unstableInputWidth="100%"
							value={ attributes.lineHeight }
							onChange={ setNumberAttribute( 'lineHeight', parseFloat ) }
							size="__unstable-large"
						/>
					</BaseControl>
					{ ( isChoicesBlock || blockStyle === 'button' ) && (
						<>
							<RangeControl
								label={ __( 'Button border width', 'jetpack-forms' ) }
								value={ attributes.buttonBorderWidth }
								initialPosition={ 1 }
								onChange={ setNumberAttribute( 'buttonBorderWidth' ) }
								min={ 0 }
								max={ 100 }
								__nextHasNoMarginBottom={ true }
								__next40pxDefaultSize={ true }
							/>
							<RangeControl
								label={ __( 'Button border radius', 'jetpack-forms' ) }
								value={ attributes.buttonBorderRadius }
								initialPosition={ 0 }
								onChange={ setNumberAttribute( 'buttonBorderRadius' ) }
								min={ 0 }
								max={ 100 }
								__nextHasNoMarginBottom={ true }
								__next40pxDefaultSize={ true }
							/>
						</>
					) }
					{ ( ! isChoicesBlock || formStyle === FORM_STYLE.OUTLINED ) && (
						<>
							<RangeControl
								label={ __( 'Border width', 'jetpack-forms' ) }
								value={ attributes.borderWidth }
								initialPosition={ 1 }
								onChange={ setNumberAttribute( 'borderWidth' ) }
								min={ 0 }
								max={ 100 }
								__nextHasNoMarginBottom={ true }
								__next40pxDefaultSize={ true }
							/>
							<RangeControl
								label={ __( 'Border radius', 'jetpack-forms' ) }
								value={ attributes.borderRadius }
								initialPosition={ 0 }
								onChange={ setNumberAttribute( 'borderRadius' ) }
								min={ 0 }
								max={ 100 }
								__nextHasNoMarginBottom={ true }
								__next40pxDefaultSize={ true }
							/>
						</>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Label styles', 'jetpack-forms' ) } initialOpen={ false }>
					<BaseControl __nextHasNoMarginBottom={ true }>
						<FontSizePicker
							withReset={ true }
							size="__unstable-large"
							__nextHasNoMarginBottom
							onChange={ labelFontSize => setAttributes( { labelFontSize } ) }
							value={ attributes.labelFontSize }
						/>
					</BaseControl>
					<BaseControl __nextHasNoMarginBottom={ true }>
						<LineHeightControl
							__unstableInputWidth="100%"
							__nextHasNoMarginBottom={ true }
							value={ attributes.labelLineHeight }
							onChange={ setNumberAttribute( 'labelLineHeight', parseFloat ) }
							size="__unstable-large"
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<InspectorAdvancedControls>
				<TextControl
					label={ __( 'Name/ID', 'jetpack-forms' ) }
					value={ id || '' }
					onChange={ setId }
					help={ __(
						"Customize the input's name/ID. Only alphanumeric, dash and underscore characters are allowed",
						'jetpack-forms'
					) }
					__nextHasNoMarginBottom={ true }
					__next40pxDefaultSize={ true }
				/>
			</InspectorAdvancedControls>
		</>
	);
};

export default JetpackFieldControls;
