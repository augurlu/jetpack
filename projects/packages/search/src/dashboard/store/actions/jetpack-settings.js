/*eslint lodash/import-scope: [2, "method"]*/
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import pick from 'lodash/pick';
import {
	removeUpdatingNotice,
	updatingNotice,
	errorNotice,
	successNotice,
} from 'components/global-notices/store/actions';
import { STORE_ID } from '../../store';
import {
	fetchJetpackSettings,
	updateJetpackSettings as updateJetpackSettingsControl,
} from '../controls';

export const SET_JETPACK_SETTINGS = 'SET_JETPACK_SETTINGS';
export const TOGGLE_SEARCH_MODULE = 'TOGGLE_SEARCH_MODULE';

/**
 * Yield actions to update Search Settings
 *
 * @param {object} settings - settings to apply.
 * @yield {object} - an action object.
 * @return {object} - an action object.
 */
export function* updateJetpackSettings( settings ) {
	try {
		yield updatingNotice();
		yield setUpdatingJetpackSettings();
		yield setJetpackSettings( settings );
		yield updateJetpackSettingsControl( settings );
		const updatedSettings = yield fetchJetpackSettings();
		yield setJetpackSettings( updatedSettings );
		return successNotice( __( 'Updated settings.', 'jetpack-search-pkg' ) );
	} catch {
		const oldSettings = pick( select( STORE_ID ).getSearchModuleStatus(), [
			'module_active',
			'instant_search_enabled',
		] );
		yield setJetpackSettings( oldSettings );
		return errorNotice( __( 'Error Update settings…', 'jetpack-search-pkg' ) );
	} finally {
		yield removeUpdatingNotice();
		yield setUpdatingJetpackSettingsDone();
	}
}

/**
 * Set state updating action
 *
 * @return {object} - an action object.
 */
export function setUpdatingJetpackSettings() {
	return setJetpackSettings( { is_updating: true } );
}

/**
 * Set state updating finished
 *
 * @return {object} - an action object.
 */
export function setUpdatingJetpackSettingsDone() {
	return setJetpackSettings( { is_updating: false } );
}

/**
 * Set Jetpack settings action
 *
 * @param {object} options - Jetpack settings.
 * @return {object} - an action object.
 */
export function setJetpackSettings( options ) {
	return { type: SET_JETPACK_SETTINGS, options };
}

export default { updateJetpackSettings, setJetpackSettings };
