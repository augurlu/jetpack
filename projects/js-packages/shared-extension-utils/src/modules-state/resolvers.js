import { setIsLoading, setJetpackModules } from './actions';
import { fetchJetpackModules } from './controls';

/**
 * Yield actions to get the Jetpack modules.
 *
 * @yield {object} - an action object.
 * @return {object} - an action object.
 */
export function* getJetpackModules() {
	try {
		yield setIsLoading( true );
		const data = yield fetchJetpackModules();
		if ( data ) {
			return setJetpackModules( { data } );
		}
	} catch ( e ) {
		console.error( e ); // eslint-disable-line no-console
	} finally {
		yield setIsLoading( false );
	}
}

export default { getJetpackModules };
