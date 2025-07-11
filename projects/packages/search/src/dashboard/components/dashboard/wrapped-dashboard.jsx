import analytics from '@automattic/jetpack-analytics';
import restApi from '@automattic/jetpack-api';
import { shouldUseInternalLinks } from '@automattic/jetpack-shared-extension-utils';
import { useSelect, select as syncSelect } from '@wordpress/data';
import { useMemo } from 'react';
import SearchConnectionPage from 'components/pages/connection-page';
import SearchDashboardPage from 'components/pages/dashboard-page';
import UpsellPage from 'components/pages/upsell-page';
import useConnection from 'hooks/use-connection';
import { STORE_ID } from 'store';

/**
 * Return appropriate components.
 *
 * @return {import('react').Component} WrappedDashboard component.
 */
export default function WrappedDashboard() {
	const { isFullyConnected } = useConnection();
	// Introduce the gate for new pricing with URL parameter `new_pricing_202208=1`
	const isNewPricing = useSelect( select => select( STORE_ID ).isNewPricing202208(), [] );

	const initializeAnalytics = () => {
		const tracksUser = syncSelect( STORE_ID ).getWpcomUser();
		const blogId = syncSelect( STORE_ID ).getBlogId();

		if ( tracksUser ) {
			analytics.initialize( tracksUser.ID, tracksUser.login, {
				blog_id: blogId,
			} );
		}
	};

	useMemo( () => {
		const apiRootUrl = syncSelect( STORE_ID ).getAPIRootUrl();
		const wpcomOriginApiUrl = syncSelect( STORE_ID ).getWpcomOriginApiUrl();
		const apiNonce = syncSelect( STORE_ID ).getAPINonce();
		apiRootUrl && restApi.setApiRoot( apiRootUrl );
		wpcomOriginApiUrl && restApi.setWpcomOriginApiUrl( wpcomOriginApiUrl );
		apiNonce && restApi.setApiNonce( apiNonce );
		initializeAnalytics();
		analytics.tracks.recordEvent( 'jetpack_search_admin_page_view', {
			current_version: syncSelect( STORE_ID ).getVersion(),
		} );
	}, [] );

	return (
		<>
			{ ! isFullyConnected && ! isNewPricing && <SearchConnectionPage /> }
			{ ( isFullyConnected || isNewPricing ) && <WrappedDashboard202208 /> }
		</>
	);
}

/**
 * Returns AfterConnectionPage component if site is fully connected otherwise UpsellPage component.
 *
 * @return {import('react').Component} NewWrappedDashboard component.
 */
function WrappedDashboard202208() {
	const { isFullyConnected } = useConnection();

	return (
		<>
			{ isFullyConnected && <AfterConnectionPage /> }
			{ ! isFullyConnected && <UpsellPage /> }
		</>
	);
}

/**
 * Returns SearchDashboardPage component if supports search otherwise UpsellPage component
 *
 * @return {import('react').Component} AfterConnectionPage component.
 */
function AfterConnectionPage() {
	useSelect( select => select( STORE_ID ).getSearchPlanInfo(), [] );
	const supportsSearch = useSelect( select => select( STORE_ID ).supportsSearch() );

	const isPageLoading = useSelect(
		select =>
			select( STORE_ID ).isResolving( 'getSearchPlanInfo' ) ||
			! select( STORE_ID ).hasStartedResolution( 'getSearchPlanInfo' )
	);

	return (
		<>
			{ supportsSearch && (
				<SearchDashboardPage
					isLoading={ isPageLoading }
					useInternalLinks={ shouldUseInternalLinks() }
				/>
			) }
			{ ! supportsSearch && <UpsellPage isLoading={ isPageLoading } /> }
		</>
	);
}
