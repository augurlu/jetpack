import { isSimpleSite } from '@automattic/jetpack-script-data';
import apiFetch from '@wordpress/api-fetch';
import { store as editorStore } from '@wordpress/editor';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { PRODUCT_TYPE_PAYMENT_PLAN } from '../../shared/components/product-management-controls/constants';
import { getMessageByProductType } from '../../shared/components/product-management-controls/utils';
import executionLock from '../../shared/execution-lock';
import getConnectUrl from '../../shared/get-connect-url';
import {
	saveProduct,
	setApiState,
	setConnectUrl,
	setProducts,
	setSiteSlug,
	setConnectedAccountDefaultCurrency,
	setSubscriberCounts,
	setNewsletterCategories,
	setNewsletterCategoriesSubscriptionsCount,
	setTotalEmailsSentCount,
} from './actions';
import { API_STATE_CONNECTED, API_STATE_NOTCONNECTED } from './constants';
import { onError } from './utils';

const EXECUTION_KEY = 'membership-products-resolver-getProducts';
const SUBSCRIBER_COUNT_EXECUTION_KEY = 'membership-products-resolver-getSubscriberCounts';
const TOTAL_EMAILS_SENT_COUNT_EXECUTION_KEY =
	'membership-products-resolver-getTotalEmailsSentCount';
const GET_NEWSLETTER_CATEGORIES_EXECUTION_KEY =
	'membership-products-resolver-getNewsletterCategories';
const GET_NEWSLETTER_CATEGORIES_SUBSCRIPTIONS_COUNT_EXECUTION_KEY =
	'membership-products-resolver-getNewsletterCategoriesSubscriptionsCount';
let hydratedFromAPI = false;

const fetchMemberships = async () => {
	const origin = getQueryArg( window.location.href, 'origin' );
	const path = addQueryArgs( '/wpcom/v2/memberships/status', {
		source: origin === 'https://wordpress.com' ? 'gutenberg-wpcom' : 'gutenberg',
		type: 'all',
		is_editable: true,
	} );

	const response = await apiFetch( { path, method: 'GET' } );

	if ( ! response && typeof response !== 'object' ) {
		throw new Error( 'Unexpected API response' );
	}

	/**
	 * WP_Error returns a list of errors with custom names:
	 * `errors: { foo: [ 'message' ], bar: [ 'message' ] }`
	 * Since we don't know their names, to get the message, we transform the object
	 * into an array, and just pick the first message of the first error.
	 *
	 * @see https://developer.wordpress.org/reference/classes/wp_error/
	 */
	const wpError = response?.errors && Object.values( response.errors )?.[ 0 ]?.[ 0 ];
	if ( wpError ) {
		throw new Error( wpError );
	}

	return response;
};

const mapAPIResponseToMembershipProductsStoreData = ( response, registry, dispatch ) => {
	const postId = registry.select( editorStore ).getCurrentPostId();

	dispatch( setConnectUrl( getConnectUrl( postId, response.connect_url ) ) );
	dispatch( setSiteSlug( response.site_slug ) );
	dispatch( setProducts( response.products ) );
	dispatch( setConnectedAccountDefaultCurrency( response.connected_account_default_currency ) );
	dispatch(
		setApiState( response.connected_account_id ? API_STATE_CONNECTED : API_STATE_NOTCONNECTED )
	);
};

const fetchSubscriberCounts = async () => {
	const response = await apiFetch( {
		path: addQueryArgs( '/wpcom/v2/subscribers/counts', {
			subscriber_status: 'active',
			subscription_status: 'active',
		} ),
	} );

	if ( ! response || typeof response !== 'object' ) {
		throw new Error( 'Unexpected API response' );
	}

	/**
	 * WP_Error returns a list of errors with custom names:
	 * `errors: { foo: [ 'message' ], bar: [ 'message' ] }`
	 * Since we don't know their names, to get the message, we transform the object
	 * into an array, and just pick the first message of the first error.
	 *
	 * @see https://developer.wordpress.org/reference/classes/wp_error/
	 */
	const wpError = response?.errors && Object.values( response.errors )?.[ 0 ]?.[ 0 ];
	if ( wpError ) {
		throw new Error( wpError );
	}

	return response;
};

const fetchTotalEmailsSentCount = async ( blogId, postId ) => {
	if ( ! blogId || ! postId ) {
		return;
	}

	const baseUrl = isSimpleSite() ? '/rest/v1.1/sites' : '/jetpack/v4/stats-app/sites';
	const response = await apiFetch( {
		path: baseUrl + `/${ blogId }/stats/opens/emails/${ postId }/rate`,
	} );

	if ( ! response || typeof response !== 'object' ) {
		throw new Error( 'Unexpected API response' );
	}

	/**
	 * WP_Error returns a list of errors with custom names:
	 * `errors: { foo: [ 'message' ], bar: [ 'message' ] }`
	 * Since we don't know their names, to get the message, we transform the object
	 * into an array, and just pick the first message of the first error.
	 *
	 * @see https://developer.wordpress.org/reference/classes/wp_error/
	 */
	const wpError = response?.errors && Object.values( response.errors )?.[ 0 ]?.[ 0 ];
	if ( wpError ) {
		throw new Error( wpError );
	}

	return response;
};

const fetchNewsletterCategories = async () => {
	const response = await apiFetch( {
		path: '/wpcom/v2/newsletter-categories',
	} );

	if ( ! response || typeof response !== 'object' ) {
		throw new Error( 'Unexpected API response' );
	}

	/**
	 * WP_Error returns a list of errors with custom names:
	 * `errors: { foo: [ 'message' ], bar: [ 'message' ] }`
	 * Since we don't know their names, to get the message, we transform the object
	 * into an array, and just pick the first message of the first error.
	 *
	 * @see https://developer.wordpress.org/reference/classes/wp_error/
	 */
	const wpError = response?.errors && Object.values( response.errors )?.[ 0 ]?.[ 0 ];
	if ( wpError ) {
		throw new Error( wpError );
	}

	return response;
};

export const fetchNewsletterCategoriesSubscriptionsCount = async termIds => {
	const response = await apiFetch( {
		path: `/wpcom/v2/newsletter-categories/count?term_ids=${ termIds.join( ',' ) }`,
		method: 'GET',
	} );

	if ( ! response || typeof response !== 'object' ) {
		throw new Error( 'Unexpected API response' );
	}

	/**
	 * WP_Error returns a list of errors with custom names:
	 * `errors: { foo: [ 'message' ], bar: [ 'message' ] }`
	 * Since we don't know their names, to get the message, we transform the object
	 * into an array, and just pick the first message of the first error.
	 *
	 * @see https://developer.wordpress.org/reference/classes/wp_error/
	 */
	const wpError = response?.errors && Object.values( response.errors )?.[ 0 ]?.[ 0 ];
	if ( wpError ) {
		throw new Error( wpError );
	}

	return response;
};

const createDefaultProduct = async (
	productType,
	setSelectedProductIds,
	dispatch,
	shouldDisplayProductCreationNotice
) => {
	await dispatch(
		saveProduct(
			{
				title: getMessageByProductType( 'default new product title', productType ),
				currency: 'USD',
				price: 5,
				interval: '1 month',
			},
			productType,
			setSelectedProductIds,
			() => {},
			shouldDisplayProductCreationNotice
		)
	);
};

const shouldCreateDefaultProduct = response =>
	! response.products.length && response.connected_account_id;

const setDefaultProductIfNeeded = ( selectedProductIds, setSelectedProductIds, select ) => {
	if ( selectedProductIds.length > 0 ) {
		return;
	}
	const defaultProductId = select.getProductsNoResolver()[ 0 ]?.id;
	if ( defaultProductId ) {
		setSelectedProductIds( [ defaultProductId ] );
	}
};

export const getNewsletterTierProducts = (
	productType = PRODUCT_TYPE_PAYMENT_PLAN,
	selectedProductIds = [],
	setSelectedProductIds = () => {}
) => getProducts( productType, selectedProductIds, setSelectedProductIds, false );

export const getProducts =
	(
		productType = PRODUCT_TYPE_PAYMENT_PLAN,
		selectedProductIds = [],
		setSelectedProductIds = () => {},
		shouldDisplayProductCreationNotice = true
	) =>
	async ( { dispatch, registry, select } ) => {
		await executionLock.blockExecution( EXECUTION_KEY );
		if ( hydratedFromAPI ) {
			setDefaultProductIfNeeded( selectedProductIds, setSelectedProductIds, select );
			return;
		}

		const lock = executionLock.acquire( EXECUTION_KEY );
		try {
			const response = await fetchMemberships();
			mapAPIResponseToMembershipProductsStoreData( response, registry, dispatch );

			if ( shouldCreateDefaultProduct( response ) ) {
				// Is ready to use and has no product set up yet. Let's create one!
				await createDefaultProduct(
					productType,
					setSelectedProductIds,
					dispatch,
					shouldDisplayProductCreationNotice
				);
			}

			setDefaultProductIfNeeded( selectedProductIds, setSelectedProductIds, select );

			hydratedFromAPI = true;
		} catch ( error ) {
			dispatch( setConnectUrl( null ) );
			dispatch( setApiState( API_STATE_NOTCONNECTED ) );
			onError( error.message, registry );
		} finally {
			executionLock.release( lock );
		}
	};

export const getSubscriberCounts =
	() =>
	async ( { dispatch, registry } ) => {
		await executionLock.blockExecution( SUBSCRIBER_COUNT_EXECUTION_KEY );

		const lock = executionLock.acquire( SUBSCRIBER_COUNT_EXECUTION_KEY );
		try {
			const response = await fetchSubscriberCounts();
			dispatch(
				setSubscriberCounts( {
					totalSubscribers: response.counts.total_subscribers,
					socialFollowers: response.counts.social_followers,
					emailSubscribers: response.counts.email_subscribers,
					paidSubscribers: response.counts.paid_subscribers,
				} )
			);
		} catch ( error ) {
			dispatch( setApiState( API_STATE_NOTCONNECTED ) );
			onError( error.message, registry );
		} finally {
			executionLock.release( lock );
		}
	};

export const getTotalEmailsSentCount =
	( blogId, postId ) =>
	async ( { dispatch, registry } ) => {
		await executionLock.blockExecution( TOTAL_EMAILS_SENT_COUNT_EXECUTION_KEY );

		const lock = executionLock.acquire( TOTAL_EMAILS_SENT_COUNT_EXECUTION_KEY );
		try {
			const response = await fetchTotalEmailsSentCount( blogId, postId );
			dispatch( setTotalEmailsSentCount( response?.total_sends ) );
		} catch ( error ) {
			dispatch( setApiState( API_STATE_NOTCONNECTED ) );
			onError( error.message, registry );
		} finally {
			executionLock.release( lock );
		}
	};

export const getNewsletterCategories =
	() =>
	async ( { dispatch, registry } ) => {
		await executionLock.blockExecution( GET_NEWSLETTER_CATEGORIES_EXECUTION_KEY );

		const lock = executionLock.acquire( GET_NEWSLETTER_CATEGORIES_EXECUTION_KEY );

		try {
			const response = await fetchNewsletterCategories();
			dispatch(
				setNewsletterCategories( {
					enabled: response.enabled,
					categories: response.newsletter_categories,
				} )
			);
		} catch ( error ) {
			dispatch( setApiState( API_STATE_NOTCONNECTED ) );
			onError( error.message, registry );
		} finally {
			executionLock.release( lock );
		}
	};

export const getNewsletterCategoriesSubscriptionsCount =
	( termIds = [] ) =>
	async ( { dispatch, registry } ) => {
		await executionLock.blockExecution(
			GET_NEWSLETTER_CATEGORIES_SUBSCRIPTIONS_COUNT_EXECUTION_KEY
		);

		const lock = executionLock.acquire(
			GET_NEWSLETTER_CATEGORIES_SUBSCRIPTIONS_COUNT_EXECUTION_KEY
		);

		try {
			const response = await fetchNewsletterCategoriesSubscriptionsCount( termIds );
			dispatch( setNewsletterCategoriesSubscriptionsCount( response.subscriptions_count ) );
		} catch ( error ) {
			dispatch( setApiState( API_STATE_NOTCONNECTED ) );
			onError( error.message, registry );
		} finally {
			executionLock.release( lock );
		}
	};
