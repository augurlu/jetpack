import { each, get, omit } from 'lodash';
import { Component } from 'react';
import { connectModuleOptions } from 'components/module-settings/connect-module-options';
import analytics from 'lib/analytics';

/**
 * High order component that provides a <form> with functionality
 * to handle input values on the forms' own React component state.
 *
 * @param {import('react').Component} InnerComponent - The component with a top level form element
 * @return {[import('react').Component]} The component with new functionality
 */
export function withModuleSettingsFormHelpers( InnerComponent ) {
	class SettingsForm extends Component {
		state = {
			options: {},
		};

		onOptionChange = event => {
			const optionName = event.target.name;
			let optionValue;
			// Get the option value from the `checked` property if present.
			if ( event.target.type === 'checkbox' ) {
				optionValue =
					typeof event.target.checked !== 'undefined' ? event.target.checked : event.target.value;
			} else {
				optionValue = event.target.value;
			}

			this.updateFormStateOptionValue( optionName, optionValue );
		};

		/**
		 * Updates the list of form values to save, usually options to set or modules to activate.
		 * Receives an object with key => value pairs to set multiple options or a string and a value to set a single option.
		 *
		 * @param {string|object} optionMaybeOptions - options to update.
		 * @param {*}             optionValue        - value to set if it's a single option
		 * @return {boolean}       Always true
		 */
		updateFormStateOptionValue = ( optionMaybeOptions, optionValue = undefined ) => {
			if ( 'string' === typeof optionMaybeOptions ) {
				optionMaybeOptions = { [ optionMaybeOptions ]: optionValue };
			}
			const newOptions = {
				...this.state.options,
				...optionMaybeOptions,
			};
			this.setState( { options: newOptions } );
			return true;
		};

		resetFormStateOption = optionToReset => {
			this.setState( { options: omit( this.state.options, [ optionToReset ] ) } );
			return true;
		};

		updateFormStateAndSaveOptionValue = ( optionMaybeOptions, optionValue = undefined ) => {
			if ( 'string' === typeof optionMaybeOptions ) {
				optionMaybeOptions = { [ optionMaybeOptions ]: optionValue };
			}
			this.props.updateOptions( { ...this.state.options, ...optionMaybeOptions } ).then( () => {
				this.setState( { options: { ...this.state.options, ...optionMaybeOptions } } );
			} );
		};

		/**
		 * Receives an option and the module it depends on.
		 * If the module is active, only the option is added to the list of form values to send.
		 * If it's inactive, an additional option stating that the module must be activated is added to the list.
		 *
		 * @param {string}  module       - the module.
		 * @param {string}  moduleOption - the option slug for the module.
		 * @param {boolean} deactivate   - whether to deactive the module too.
		 */
		updateFormStateModuleOption = ( module, moduleOption, deactivate = false ) => {
			this.trackSettingsToggle( module, moduleOption, ! this.getOptionValue( moduleOption ) );

			// If the module is active, check if we're going to update the option or update and deactivate.
			if ( this.getOptionValue( module ) ) {
				if ( deactivate ) {
					// If after toggling the option the module is no longer needed to be active, deactivate it.
					this.props.updateOptions( {
						[ module ]: false,
						[ moduleOption ]: ! this.getOptionValue( moduleOption ),
					} );
				} else {
					// We pass the value to set.
					this.props.updateOptions( {
						[ moduleOption ]: ! this.getOptionValue( moduleOption ),
					} );
				}
			} else {
				// If the module is inactive, we pass the module to activate and the value to set.
				this.props.updateOptions( {
					[ module ]: true,
					[ moduleOption ]: true,
				} );
			}
		};

		/**
		 * Instantly activate or deactivate a module.
		 *
		 * @param {string} module - the module slug.
		 */
		toggleModuleNow = module => {
			this.props.updateOptions( { [ module ]: ! this.getOptionValue( module ) } );
		};

		componentDidUpdate() {
			if ( this.isDirty() ) {
				this.props.setUnsavedSettingsFlag();
			}
		}

		onSubmit = event => {
			event.preventDefault();
			this.props
				.updateOptions( this.state.options )
				.then( () => {
					// Track it

					const saneOptions = {};

					each( this.state.options, ( value, key ) => {
						key = key.replace( /-/, '_' );
						saneOptions[ key ] = value;
					} );

					this.trackFormSubmission( saneOptions );

					this.setState( { options: {} } );
				} )
				.then( () => {
					this.props.refreshSettings();
					this.props.clearUnsavedSettingsFlag();
				} );
		};

		/**
		 * Retrieves an option from an existing module, or from an array of modules
		 * if the form was initialized with an array
		 * @param {string}  settingName           - the setting to get.
		 * @param {string}  module                - the module related to the setting.
		 * @param {boolean} ignoreDisabledModules - Whether to ignore settings for disabled modules.
		 * @return {*}                 the current value of the settings.
		 */
		getOptionValue = ( settingName, module = '', ignoreDisabledModules = true ) => {
			return get(
				this.state.options,
				settingName,
				this.props.getSettingCurrentValue( settingName, module, ignoreDisabledModules )
			);
		};

		shouldSaveButtonBeDisabled = () => {
			// Check if the form is not currently dirty
			return this.isSavingAnyOption() || ! this.isDirty();
		};

		/**
		 * Check if there are unsaved settings in the card.
		 *
		 * @return {boolean}  True if the form has unsaved changes.
		 */
		isDirty = () => {
			return !! Object.keys( this.state.options ).length;
		};

		/**
		 * Checks if a setting is currently being saved.
		 *
		 * @param {string | Array} settings - The settings to check for a current saving in progress
		 *
		 * @return {boolean} True if specified settings are being saved, false otherwise.
		 */
		isSavingAnyOption = ( settings = '' ) => {
			return this.props.isUpdating( settings );
		};

		/**
		 * Tracks form submissions
		 * @param {object} options - options passed to recordEvent
		 */
		trackFormSubmission = options => {
			analytics.tracks.recordEvent( 'jetpack_wpa_settings_form_submit', options );
		};

		/**
		 * Tracks settings toggles
		 * @param {string}  module    - the module slug.
		 * @param {string}  setting   - the setting slug.
		 * @param {boolean} activated - whether the settings is currently on
		 */
		trackSettingsToggle = ( module, setting, activated ) => {
			analytics.tracks.recordEvent( 'jetpack_wpa_settings_toggle', {
				module: module,
				setting: setting,
				toggled: activated ? 'on' : 'off',
			} );
		};

		render() {
			return (
				<InnerComponent
					getOptionValue={ this.getOptionValue }
					onSubmit={ this.onSubmit }
					onOptionChange={ this.onOptionChange }
					updateFormStateOptionValue={ this.updateFormStateOptionValue }
					updateFormStateAndSaveOptionValue={ this.updateFormStateAndSaveOptionValue }
					toggleModuleNow={ this.toggleModuleNow }
					updateFormStateModuleOption={ this.updateFormStateModuleOption }
					shouldSaveButtonBeDisabled={ this.shouldSaveButtonBeDisabled }
					isSavingAnyOption={ this.isSavingAnyOption }
					isDirty={ this.isDirty }
					resetFormStateOption={ this.resetFormStateOption }
					optionsState={ this.state.options }
					{ ...this.props }
				/>
			);
		}
	}

	return connectModuleOptions( SettingsForm );
}
