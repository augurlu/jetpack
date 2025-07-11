/**
 * External dependencies
 */
import { useLocation, useNavigate } from 'react-router';

type SearchParamNameProp = 'page' | 'q';

export const useSearchParams = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const searchParams = new URLSearchParams( location.search );

	/**
	 * Gets a given parameter from the search query.
	 *
	 * @param {SearchParamNameProp} parameterName - The name of the parameter to get from the query string.
	 * @param {string}              defaultValue  - The default value to return if the given parameter is not set on the query string.
	 * @return {string|null}                       The value of the parameter if it's set. The defaultValue if the parameter is not set.
	 */
	const getParam = ( parameterName: SearchParamNameProp, defaultValue: string = null ): string => {
		return searchParams.has( parameterName ) ? searchParams.get( parameterName ) : defaultValue;
	};

	/**
	 * Sets a given parameter on the search query data, but does not refresh the URL.
	 *
	 * @param {SearchParamNameProp} parameterName - The name of the parameter to set on the query string.
	 * @param {string}              value         - The value to be set for the parameter on the query string.
	 */
	const setParam = ( parameterName: SearchParamNameProp, value: string = null ) => {
		searchParams.set( parameterName, value );
	};

	/**
	 * Deletes a given parameter from the search query data, which results on removing
	 * it from the URL when it gets updated.
	 *
	 * @param {SearchParamNameProp} parameterName - The name of the parameter to delete.
	 */
	const deleteParam = ( parameterName: SearchParamNameProp ) => {
		searchParams.delete( parameterName );
	};

	/**
	 * Update the URL query string with the current values of the searchParams object.
	 */
	const update = () => {
		const searchFragment = '?' + searchParams.toString();
		if ( searchFragment !== location.search ) {
			navigate( {
				search: searchFragment,
			} );
		}
	};

	/**
	 * Force an empty query string.
	 */
	const reset = () => {
		if ( '' !== location.search ) {
			navigate(
				{
					pathname: location.pathname,
					search: '',
				},
				{ replace: true }
			);
		}
	};

	return {
		getParam,
		setParam,
		deleteParam,
		update,
		reset,
	};
};
