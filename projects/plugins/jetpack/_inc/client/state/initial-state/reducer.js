import { getRedirectUrl } from '@automattic/jetpack-components';
import { assign, get, merge } from 'lodash';
import { JETPACK_SET_INITIAL_STATE, MOCK_SWITCH_USER_PERMISSIONS } from 'state/action-types';
import { isCurrentUserLinked } from 'state/connection';
import { getPlanDuration } from 'state/plans/reducer';
import { getSiteProducts } from 'state/site-products';

export const initialState = ( state = window.Initial_State, action ) => {
	switch ( action.type ) {
		case JETPACK_SET_INITIAL_STATE:
			return assign( {}, state, action.initialState );

		case MOCK_SWITCH_USER_PERMISSIONS:
			return merge( {}, state, { userData: action.initialState } );

		default:
			return state;
	}
};

/**
 * Returns bool if current version is Dev version
 * Which means -alpha, -beta, etc...
 *
 * @param {object} state - Global state tree
 * @return {boolean} true if dev version
 */
export function isDevVersion( state ) {
	return !! state.jetpack.initialState.isDevVersion;
}

/**
 * Returns a string of the current Jetpack version defined
 * by JETPACK__VERSION
 *
 * @param {object} state - Global state tree
 * @return {string}         Version number. Empty string if the data is not yet available.
 */
export function getCurrentVersion( state ) {
	return get( state.jetpack.initialState, 'currentVersion', '' );
}

/**
 * Returns an object of the current site roles.
 *
 * @param {object} state - Global state tree
 * @return {object} Site roles
 */
export function getSiteRoles( state ) {
	return get( state.jetpack.initialState.stats, 'roles', {} );
}

/**
 * Returns the initial state of the stats data.
 *
 * @param {object} state - Global state tree
 * @return {object} The initial state of the stats data.
 */
export function getInitialStateStatsData( state ) {
	return get( state.jetpack.initialState.stats, 'data' );
}

/**
 * Returns an object of plugins that are using the Jetpack connection.
 *
 * @param {object} state - Global state tree
 * @return {object}         Plugins that are using the Jetpack connection.
 */
export function getInitialStateConnectedPlugins( state ) {
	return get( state.jetpack.initialState, 'connectedPlugins', {} );
}

/**
 * Returns the email address of the connected user if they are the current user.
 *
 * @param {object} state - Global state tree
 * @return {string}  The email address of the current user.       .
 */
export function getAdminEmailAddress( state ) {
	return get( state.jetpack.initialState, [ 'userData', 'currentUser', 'wpcomUser', 'email' ] );
}

/**
 * Returns the current users email address.
 *
 * @param {object} state - Global state tree
 * @return {string}  The email address of the current user.       .
 */
export function getCurrenUserEmailAddress( state ) {
	return get( state.jetpack.initialState, [ 'userData', 'currentUser', 'email' ] );
}

/**
 * Returns the site's raw url.
 *
 * @param {object} state - Global state tree
 * @return {object} The site's raw url.
 */
export function getSiteRawUrl( state ) {
	return get( state.jetpack.initialState, 'rawUrl', {} );
}

/**
 * Returns the site's admin url.
 *
 * @param {object} state - Global state tree
 * @return {object} The site's admin url.
 */
export function getSiteAdminUrl( state ) {
	return get( state.jetpack.initialState, 'adminUrl', {} );
}

/**
 * Returns the site title.
 *
 * @param {object} state - Global state tree
 * @return {string} The site's title.
 */
export function getSiteTitle( state ) {
	return get( state.jetpack.initialState, 'siteTitle', '' );
}

/**
 * Return whether or not the site is public.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether the site is public.
 */
export function isSitePublic( state ) {
	return get( state.jetpack.initialState, [ 'connectionStatus', 'isPublic' ] );
}

/**
 * Return whether or not Gutenberg is available.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether Gutenberg is available.
 */
export function isGutenbergAvailable( state ) {
	return get( state.jetpack.initialState, 'is_gutenberg_available', false );
}

/**
 * Return whether or not the current user is a subscriber on the site.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether the current user is a subscriber.
 */
export function userIsSubscriber( state ) {
	return ! get( state.jetpack.initialState.userData.currentUser.permissions, 'edit_posts', false );
}

/**
 * Return whether or not the user can publish posts.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether the user can publish posts.
 */
export function userCanPublish( state ) {
	return get( state.jetpack.initialState.userData.currentUser.permissions, 'publish_posts', false );
}

/**
 * Return whether or not the user can manage modules.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether the user can manage modules.
 */
export function userCanManageModules( state ) {
	return get(
		state.jetpack.initialState.userData.currentUser.permissions,
		'manage_modules',
		false
	);
}

/**
 * Return whether or not the user can manage options.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether the user can manage options.
 */
export function userCanManageOptions( state ) {
	return get(
		state.jetpack.initialState.userData.currentUser.permissions,
		'manage_options',
		false
	);
}

/**
 * Return true if user can edit posts, usually admins, editors, authors and contributors.
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} Whether user can edit posts.
 */
export function userCanEditPosts( state ) {
	return get( state.jetpack.initialState.userData.currentUser.permissions, 'edit_posts', false );
}

/**
 * Return true if user can manage plugins, which means being able to install, activate, update and delete plugins.
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} Whether user can manage plugins.
 */
export function userCanManagePlugins( state ) {
	return get(
		state.jetpack.initialState.userData.currentUser.permissions,
		'manage_plugins',
		false
	);
}

/**
 * Returns true if the user has permission to disconnect the site.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether the user can disconnect the site.
 */
export function userCanDisconnectSite( state ) {
	return get( state.jetpack.initialState.userData.currentUser.permissions, 'disconnect', false );
}

/**
 * Returns true if the user has permission to connect the site.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether the user can connect the site.
 */
export function userCanConnectSite( state ) {
	return get( state.jetpack.initialState.userData.currentUser.permissions, 'connect', false );
}

/**
 * Returns true if current user can connect their WordPress.com account.
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} Whether current user can connect their WordPress.com account.
 */
export function userCanConnectAccount( state ) {
	return get( state.jetpack.initialState.userData.currentUser.permissions, 'connect_user', false );
}

/**
 * Returns true if current user is connection owner.
 *
 * @param {object} state - Global state tree
 * @return {boolean} true if the current user is connection owner, false otherwise
 *
 * @deprecated 9.3.0
 */
export function userIsMaster( state ) {
	return get( state.jetpack.initialState.userData.currentUser, 'isMaster', false );
}

/**
 * Return the current user's WordPress.com login.
 *
 * @param {object} state - Global state tree
 * @return {string} The WordPress.com login of the current user.
 */
export function getUserWpComLogin( state ) {
	return get( state.jetpack.initialState.userData.currentUser, [ 'wpcomUser', 'login' ], '' );
}

/**
 * Returns the WPCOM ID of the connected user.
 *
 * @param {object} state - Global state tree
 * @return {number}        the ID of the user
 */
export function getUserWpComId( state ) {
	return get( state.jetpack.initialState.userData.currentUser, [ 'wpcomUser', 'ID' ], '' );
}

/**
 * Return the current user's WordPress.com email.
 *
 * @param {object} state - Global state tree
 * @return {string} The WordPress.com email of the current user.
 */
export function getUserWpComEmail( state ) {
	return get( state.jetpack.initialState.userData.currentUser, [ 'wpcomUser', 'email' ], '' );
}

/**
 * Return the current user's WordPress.com avatar URL.
 *
 * @param {object} state - Global state tree
 * @return {string} The WordPress.com avatar URL of the current user.
 */
export function getUserWpComAvatar( state ) {
	return get( state.jetpack.initialState.userData.currentUser, [ 'wpcomUser', 'avatar' ] );
}

/**
 * Return the current user's WordPress.com Gravatar.
 *
 * @param {object} state - Global state tree
 * @return {string} The WordPress.com Gravatar of the current user.
 */
export function getUserGravatar( state ) {
	return get( state.jetpack.initialState.userData.currentUser, [ 'gravatar' ] );
}

/**
 * Return the current user's username.
 *
 * @param {object} state - Global state tree
 * @return {string} The username of the current user.
 */
export function getUsername( state ) {
	return get( state.jetpack.initialState.userData.currentUser, [ 'username' ] );
}
/**
 * Gets the current user display name.
 * @param {object} state - Global state tree
 * @return {string} The user display name.
 */
export function getDisplayName( state ) {
	const displayName = get( state.jetpack.initialState.userData.currentUser, [ 'displayName' ] );
	if ( displayName === null ) {
		return getUsername( state );
	}
	return displayName;
}

/**
 * Gets the current wp-admin user id
 * @param {object} state - Global state tree
 * @return {number} The user id in wp-admin
 */
export function getUserId( state ) {
	return get( state.jetpack.initialState.userData.currentUser, 'id', '' );
}

/**
 * Return whether the current user can view stats.
 *
 * @param {object} state - Global state tree
 * @return {boolean} Whether the current user can view stats.
 */
export function userCanViewStats( state ) {
	return get( state.jetpack.initialState.userData.currentUser.permissions, 'view_stats', false );
}

/**
 * Returns the WPCOM ID of a connected site.
 *
 * @param {object} state - Global state tree
 * @return {number}        the ID of the site
 */
export function getSiteId( state ) {
	return get( state.jetpack.initialState.siteData, [ 'blog_id' ] );
}

/**
 * Returns the site icon as an image URL.
 *
 * @param {object} state - Global state tree
 *
 * @return {string}        the URL of the icon
 */
export function getSiteIcon( state ) {
	return get( state.jetpack.initialState.siteData, [ 'icon' ] );
}

/**
 * Check whether the site is accessible by search engines or not. It's true by default in an initial WP installation.
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} False if site is set to discourage search engines from indexing it. True otherwise.
 */
export function isSiteVisibleToSearchEngines( state ) {
	return get( state.jetpack.initialState.siteData, [ 'siteVisibleToSearchEngines' ], true );
}

/**
 * Returns the site's boost speed scores from the last time it was checked
 *
 * @param {object} state - Global state tree
 * @return {object}        the boost speed scores and timestamp
 */
export function getLatestBoostSpeedScores( state ) {
	return get( state.jetpack.initialState.siteData, [ 'latestBoostSpeedScores' ] );
}

/**
 * Return the WP API nonce.
 *
 * @param {object} state - Global state tree
 * @return {string} The WP API nonce.
 */
export function getApiNonce( state ) {
	return get( state.jetpack.initialState, 'WP_API_nonce' );
}

/**
 * Return the WP API root URL.
 *
 * @param {object} state - Global state tree
 * @return {string} The WP API root URL.
 */
export function getApiRootUrl( state ) {
	return get( state.jetpack.initialState, 'WP_API_root' );
}

/**
 * Returns the registration nonce.
 *
 * @deprecated since 14.5
 *
 * @return {string} The empty string for backward compatibility.
 */
export function getRegistrationNonce() {
	return '';
}

/**
 * Returns the plugin base URL.
 *
 * @param {object} state - Global state tree
 * @return {string} The registration nonce
 */
export function getPluginBaseUrl( state ) {
	return get( state.jetpack.initialState, 'pluginBaseUrl' );
}

/**
 * Returns a purchase token that is used for Jetpack logged out visitor checkout.
 *
 * @param {object} state - Global state tree
 *
 * @return {string|boolean} purchase token or false if not the connection owner.
 */
export function getPurchaseToken( state ) {
	return get( state.jetpack.initialState, 'purchaseToken' );
}

/**
 * Returns current Calypso environment.
 *
 * @param {object} state - Global state tree
 *
 * @return {string} Calypso environment name.
 */
export function getCalypsoEnv( state ) {
	return get( state.jetpack.initialState, 'calypsoEnv' );
}

/**
 * Returns the current user tracks data.
 *
 * @param { object } state - Global state tree
 * @return { object } The current user tracks data.
 */
export function getTracksUserData( state ) {
	return get( state.jetpack.initialState, 'tracksUserData' );
}

/**
 * Return the current IP address of the site.
 *
 * @param {object} state - Global state tree
 * @return {string} The current IP address of the site.
 */
export function getCurrentIp( state ) {
	return get( state.jetpack.initialState, 'currentIp' );
}

/**
 * Returns a permalink to the last published entry of 'post' type.
 *
 * @param {object} state - Global state tree
 *
 * @return {string} URL to last published post.
 */
export function getLastPostUrl( state ) {
	return get( state.jetpack.initialState, 'lastPostUrl' );
}

/**
 * Check if promotions like banners are visible or hidden.
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} True if promotions are active, false otherwise.
 */
export function arePromotionsActive( state ) {
	return get( state.jetpack.initialState.siteData, 'showPromotions', true );
}

/**
 * Get the current theme's stylesheet (slug).
 *
 * @param {object} state - Global state tree.
 * @return {string} theme stylesheet, e.g. twentytwentythree.
 */
export function currentThemeStylesheet( state ) {
	return get( state.jetpack.initialState.themeData, 'stylesheet' );
}

/**
 * Check that theme supports a certain feature
 *
 * @param {object} state   - Global state tree.
 * @param {string} feature - Feature to check if current theme supports. Can be 'infinite-scroll'.
 *
 * @return {boolean} URL to last published post.
 */
export function currentThemeSupports( state, feature ) {
	return get( state.jetpack.initialState.themeData, [ 'support', feature ], false );
}

/**
 * Check that the current theme is a block theme.
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True if the current theme is a block theme, false otherwise.
 */
export function currentThemeIsBlockTheme( state ) {
	return get( state.jetpack.initialState.themeData, [ 'isBlockTheme' ], false );
}

/**
 * Check if backups UI should be displayed.
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} True if backups UI should be displayed.
 */
export function showBackups( state ) {
	return get( state.jetpack.initialState.siteData, 'showBackups', true );
}

/**
 * Determines if the Jetpack Recommendations should be displayed
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} True if the Jetpack Recommendations should be displayed, false otherwise.
 */
export function showRecommendations( state ) {
	return get( state.jetpack.initialState.siteData, 'showRecommendations', false );
}

/**
 * Determines if My Jetpack should be referenced.
 *
 * @param {object} state - Global state tree
 * @return {boolean} True if the My Jetpack should be referenced, false otherwise.
 */
export function showMyJetpack( state ) {
	return get( state.jetpack.initialState.siteData, 'showMyJetpack', true );
}

/**
 * Get an array of new recommendations for this site
 *
 * @param {object} state - Global state tree
 * @return {Array} - Array of recommendation slugs
 */
export function getNewRecommendations( state ) {
	return get( state.jetpack.initialState, 'newRecommendations', [] );
}

/**
 * Get a count of new recommendations for this site
 *
 * @param {object} state - Global state tree
 * @return {number} - Count of recommendations
 */
export function getNewRecommendationsCount( state ) {
	return getNewRecommendations( state ).length;
}

/**
 * Determines if the Jetpack Licensing UI should be displayed
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} True if the Jetpack Licensing UI should be displayed, false otherwise.
 */
export function showLicensingUi( state ) {
	return get( state.jetpack.initialState.licensing, 'showLicensingUi', false );
}

/**
 * Check if the site is part of a Multisite network.
 *
 * @param {object} state - Global state tree
 *
 * @return {boolean} True if the site is part of a Multisite network.
 */
export function isMultisite( state ) {
	return get( state.jetpack.initialState.siteData, 'isMultisite', false );
}

/**
 * Get the site's date format, in format accepted by DateTimeInterface::format().
 *
 * @param {object} state - Global state tree
 *
 * @return {string} Date format of the site.
 */
export function getDateFormat( state ) {
	return get( state.jetpack.initialState.siteData, 'dateFormat', false );
}

/**
 * Returns the affiliate code, if it exists. Otherwise an empty string.
 *
 * @param {object} state - Global state tree
 *
 * @return {string} The affiliate code.
 */
export function getAffiliateCode( state ) {
	return get( state.jetpack.initialState, 'aff', '' );
}

/**
 * Returns the partner subsidiary id, if it exists. Otherwise an empty string.
 *
 * @param {object} state - Global state tree
 *
 * @return {string} The partner subsidiary id.
 */
export function getPartnerSubsidiaryId( state ) {
	return get( state.jetpack.initialState, 'partnerSubsidiaryId', '' );
}

/**
 * Returns the partner coupon associated with this site, if any.
 *
 * @param {object} state - Global state tree
 * @return {object|boolean} partner coupon if exists or false.
 */
export function getPartnerCoupon( state ) {
	return get( state.jetpack.initialState, 'partnerCoupon' );
}

/**
 * Return an upgrade URL
 *
 * @param {object}  state        - Global state tree
 * @param {string}  source       - Context where this URL is clicked.
 * @param {string}  userId       - Current user id.
 * @param {boolean} planDuration - Add plan duration to the URL.
 *
 * @return {string} Upgrade URL with source, site, and affiliate code added.
 */
export const getUpgradeUrl = ( state, source, userId = '', planDuration = false ) => {
	const affiliateCode = getAffiliateCode( state );
	const subsidiaryId = getPartnerSubsidiaryId( state );
	const uid = userId || getUserId( state );
	const purchaseToken = getPurchaseToken( state );
	const calypsoEnv = getCalypsoEnv( state );
	const blogID = getSiteId( state );

	if ( planDuration && 'monthly' === getPlanDuration( state ) ) {
		source += '-monthly';
	}

	const redirectArgs = {
		site: blogID ?? getSiteRawUrl( state ),
	};

	if ( affiliateCode ) {
		redirectArgs.aff = affiliateCode;
	}
	if ( uid ) {
		redirectArgs.u = uid;
	}
	if ( subsidiaryId ) {
		redirectArgs.subsidiaryId = subsidiaryId;
	}

	redirectArgs.query = '';

	if ( ! isCurrentUserLinked( state ) ) {
		redirectArgs.query += 'unlinked=1&';
	}
	if ( purchaseToken ) {
		redirectArgs.query += `purchasetoken=${ purchaseToken }`;
	}
	if ( calypsoEnv ) {
		redirectArgs.calypso_env = calypsoEnv;
	}

	return getRedirectUrl( source, redirectArgs );
};

/**
 * Returns the list of products that are available for purchase in the initial state.
 *
 * @param {object} state - Global state tree
 * @return {Array} - Array of Products that you can purchase.
 */
export function getStaticProductsForPurchase( state ) {
	return get( state.jetpack.initialState, 'products', {} );
}

/**
 * Returns the list of products that are available for purchase.
 *
 * @param {object} state - Global state tree
 * @return {Array} of Products that you can purchase.
 */
export function getProductsForPurchase( state ) {
	const staticProducts = get( state.jetpack.initialState, 'products', {} );
	const wpcomUser = get( state.jetpack.initialState?.userData?.currentUser, 'wpcomUser', {} );
	const currencyCode = wpcomUser?.user_currency || null;
	const jetpackProducts = getSiteProducts( state );
	const products = {};

	for ( const [ key, product ] of Object.entries( staticProducts ) ) {
		products[ key ] = {
			title: product.title,
			slug: product.slug,
			key: key,
			description: product.description,
			features: product.features,
			disclaimer: product.disclaimer,
			available: get( jetpackProducts, [ product.slug, 'available' ], false ),
			currencyCode: currencyCode ?? get( jetpackProducts, [ product.slug, 'currency_code' ], '' ),
			showPromotion: product.show_promotion,
			promotionPercentage: product.discount_percent,
			includedInPlans: product.included_in_plans,
			fullPrice: get( jetpackProducts, [ product.slug, 'cost' ], '' ),
			saleCoupon: get( jetpackProducts, [ product.slug, 'sale_coupon' ], undefined ),
			upgradeUrl: getRedirectUrl( 'jetpack-product-description-checkout', {
				path: product.slug,
			} ),
		};
	}

	return products;
}

/**
 * The current step of the Recommendations.
 *
 * @param {*} state - Global state tree.
 *
 * @return {string} The current Recommendations step.
 */
export function getInitialRecommendationsStep( state ) {
	return get( state.jetpack.initialState, 'recommendationsStep', '' );
}

/**
 * Get the connection errors.
 *
 * @param {object} state - Global state tree.
 * @return {Array} Connection errors.
 */
export function getConnectionErrors( state ) {
	return get( state.jetpack.initialState, [ 'connectionStatus', 'errors' ], [] ).filter( error =>
		Object.hasOwn( error, 'action' )
	);
}

/**
 * Check if the user is on Safari browser.
 *
 * @param {object} state - Global state tree.
 *
 * @return {boolean} True the user is on Safari browser.
 */
export function isSafari( state ) {
	return !! state.jetpack.initialState.isSafari;
}

/**
 * Check if the `JETPACK_SHOULD_NOT_USE_CONNECTION_IFRAME` constant is true.
 *
 * @param {object} state - Global state tree.
 *
 * @return {boolean} True, the `JETPACK_SHOULD_NOT_USE_CONNECTION_IFRAME` constant is true.
 */
export function doNotUseConnectionIframe( state ) {
	return !! state.jetpack.initialState.doNotUseConnectionIframe;
}

/**
 * Check if WooCommerce is currently installed and active
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True, the plugin is installed and active
 */
export function isWooCommerceActive( state ) {
	return !! state.jetpack.initialState.isWooCommerceActive;
}

/**
 * Returns the Jetpack Cloud URL for the specified resource for the current site.
 *
 * @param {object} state - Global state tree.
 * @param {string} slug  - Jetpack Cloud resource slug.
 * @return {string} The valid Jetpack Cloud URL
 */
export function getJetpackCloudUrl( state, slug ) {
	return `https://cloud.jetpack.com/${ slug }/${ getSiteRawUrl( state ) }`;
}

/**
 * Returns if the new Stats experience is enabled.
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True if the new Stats experience is enabled.
 */
export function isOdysseyStatsEnabled( state ) {
	return !! state.jetpack.initialState.isOdysseyStatsEnabled;
}

/**
 * Returns true if Blaze can be used on the site.
 *
 * @param {object} state - Global state tree.
 * @return {object} A boolean indicating if Blaze can be used and a reason why if it cannot.
 */
export function shouldInitializeBlaze( state ) {
	return state.jetpack.initialState.shouldInitializeBlaze;
}

/**
 * Returns true if the wp-admin Blaze dashboard is enabled.
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True if the Blaze dashboard is enabled.
 */
export function isBlazeDashboardEnabled( state ) {
	return !! state.jetpack.initialState.isBlazeDashboardEnabled;
}

/**
 * Returns true if the wp-admin Subscriber dashboard is enabled.
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True if the Subscriber dashboard is enabled.
 */
export function isWpAdminSubscriberManagementEnabled( state ) {
	return !! state.jetpack.initialState.isWpAdminSubscriberManagementEnabled;
}

/**
 * Check if the Sharing block is available on the site.
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True if the Sharing block is available on the site.
 */
export function isSharingBlockAvailable( state ) {
	return !! state.jetpack.initialState.siteData.isSharingBlockAvailable;
}

/**
 * Get the Jetpack Manage info
 *
 * @param {object} state - Global state tree.
 * @return {object} Jetpack Manage info
 */
export function getJetpackManageInfo( state ) {
	return state.jetpack.initialState.jetpackManage;
}

/**
 * Returns true if Subscription Site feature is enabled on the site.
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True if Subscription Site feature is enabled on the site.
 */
export function isSubscriptionSiteEnabled( state ) {
	return !! state.jetpack.initialState.isSubscriptionSiteEnabled;
}

/**
 * returns the newletter date example.
 *
 * @param {object} state - Global state tree.
 * @return {string} Newsletter date example.
 */
export function getNewsletterDateExample( state ) {
	return state.jetpack.initialState.newsletterDateExample;
}

/**
 * Returns true if Subscription Site editing feature is supported.
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True if Subscription Site editing feature is supported.
 */
export function subscriptionSiteEditSupported( state ) {
	return !! state.jetpack.initialState.subscriptionSiteEditSupported;
}

/**
 * Returns true if the wp-admin SEO Enhancer setting/feature is available.
 *
 * @param {object} state - Global state tree.
 * @return {boolean} True if the SEO Enhancer is available.
 */
export function isSeoEnhancerAvailable( state ) {
	return 'ai_seo_enhancer_enabled' in state.jetpack.initialState.getModules[ 'seo-tools' ].options;
}
