/**
 * External dependencies
 */
import {
	AdminPage,
	Button,
	Col,
	Container,
	Text,
	TermsOfService,
} from '@automattic/jetpack-components';
import { shouldUseInternalLinks } from '@automattic/jetpack-shared-extension-utils';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useEffect } from 'react';
/**
 * Internal dependencies
 */
import { useParams } from 'react-router';
import { MyJetpackRoutes } from '../../constants';
import useActivatePlugins from '../../data/products/use-activate-plugins';
import useProduct from '../../data/products/use-product';
import { getMyJetpackWindowInitialState } from '../../data/utils/get-my-jetpack-window-state';
import useAnalytics from '../../hooks/use-analytics';
import { useGoBack } from '../../hooks/use-go-back';
import useMyJetpackConnection from '../../hooks/use-my-jetpack-connection';
import useMyJetpackNavigate from '../../hooks/use-my-jetpack-navigate';
import GoBackLink from '../go-back-link';
import ProductDetailCard from '../product-detail-card';
import ProductDetailTable from '../product-detail-table';
import boostImage from './boost.png';
import completeImage from './complete.png';
import crmImage from './crm.png';
import extrasImage from './extras.png';
import searchImage from './search.png';
import securityImage from './security.png';
import statsImage from './stats.png';
import styles from './style.module.scss';
import videoPressImage from './videopress.png';

/**
 * Product Interstitial component.
 *
 * @param {object}                    props                         - Component props.
 * @param {string}                    props.slug                    - Product slug
 * @param {string}                    props.bundle                  - Bundle including this product
 * @param {object}                    props.children                - Product additional content
 * @param {string}                    props.existingLicenseKeyUrl   - URL to enter an existing license key (e.g. Akismet)
 * @param {boolean}                   props.installsPlugin          - Whether the interstitial button installs a plugin*
 * @param {import('react').ReactNode} props.supportingInfo          - Complementary links or support/legal text
 * @param {boolean}                   props.preferProductName       - Use product name instead of title
 * @param {string}                    props.imageContainerClassName - Append a class to the image container
 * @param {string}                    [props.ctaButtonLabel]        - The label for the Call To Action button
 * @param {boolean}                   [props.hideTOS]               - Whether to hide the Terms of Service text
 * @param {number}                    [props.quantity]              - The quantity of the product to purchase
 * @param {number}                    [props.directCheckout]        - Whether to go straight to the checkout page, e.g. for products with usage tiers
 * @param {boolean}                   [props.highlightLastFeature]  - Whether to highlight the last feature in the list of features
 * @param {object}                    [props.ctaCallback]           - Callback when the product CTA is clicked. Triggered before any activation/checkout process occurs
 * @param {string}                    [props.feature]               - The feature to highlight in the product detail card
 * @return {object} ProductInterstitial react component.
 */
export default function ProductInterstitial( {
	bundle,
	existingLicenseKeyUrl = 'admin.php?page=my-jetpack#/add-license',
	installsPlugin = false,
	slug,
	supportingInfo,
	preferProductName = false,
	children = null,
	imageContainerClassName = '',
	ctaButtonLabel = null,
	hideTOS = false,
	quantity = null,
	directCheckout = false,
	highlightLastFeature = false,
	ctaCallback = null,
	feature = null,
} ) {
	const { detail } = useProduct( slug );
	const { detail: bundleDetail } = useProduct( bundle );
	const { activate, isPending: isActivating, isSuccess } = useActivatePlugins( slug );

	// Get the post activation URL for the product.
	let redirectUri = detail?.postActivationUrl || null;
	// If the interstitial is highlighting a specific feature, use the post checkout URL for that feature, if available.
	if ( feature && detail?.postActivationUrlsByFeature?.[ feature ] ) {
		redirectUri = detail.postActivationUrlsByFeature[ feature ];
	}

	const { isUpgradableByBundle, pricingForUi, isTieredPricing } = detail;
	const { recordEvent } = useAnalytics();
	const { onClickGoBack } = useGoBack( { slug } );
	const { myJetpackCheckoutUri = '' } = getMyJetpackWindowInitialState();
	const { siteIsRegistering, handleRegisterSite } = useMyJetpackConnection( {
		skipUserConnection: true,
		redirectUri,
	} );
	const showBundledTOS = ! hideTOS && !! bundle;
	const productName = detail?.title;
	const bundleName = bundleDetail?.title;
	const bundledTosLabels = [
		/* translators: %s is the product name  */
		sprintf( __( 'Get %s', 'jetpack-my-jetpack' ), productName ),
		/* translators: %s is the bundled product name */
		sprintf( __( 'Get %s', 'jetpack-my-jetpack' ), bundleName ),
	];

	useEffect( () => {
		recordEvent( 'jetpack_myjetpack_product_interstitial_view', { product: slug } );
	}, [ recordEvent, slug ] );

	const getProductSlugForTrackEvent = useCallback(
		( isFree = false ) => {
			if ( isFree ) {
				return '';
			}
			if ( slug === 'crm' ) {
				return 'jetpack-crm';
			}
			if ( pricingForUi?.tiers?.upgraded?.wpcomProductSlug ) {
				return pricingForUi.tiers.upgraded.wpcomProductSlug;
			}
			return pricingForUi?.wpcomProductSlug;
		},
		[ slug, pricingForUi ]
	);

	const trackProductOrBundleClick = useCallback(
		options => {
			const { customSlug = null, isFreePlan = false, ctaText = null } = options || {};
			const productSlug = customSlug ? customSlug : bundle ?? slug;
			recordEvent( 'jetpack_myjetpack_product_interstitial_add_link_click', {
				product: productSlug,
				product_slug: getProductSlugForTrackEvent( isFreePlan ),
				cta_text: ctaText,
			} );
		},
		[ recordEvent, slug, getProductSlugForTrackEvent, bundle ]
	);

	const navigateToMyJetpackOverviewPage = useMyJetpackNavigate( MyJetpackRoutes.Home );

	const clickHandler = useCallback(
		( checkout, product, tier ) => {
			ctaCallback?.( { slug, product, tier } );

			if ( product?.isBundle || directCheckout ) {
				// Get straight to the checkout page.
				checkout?.();
				return;
			}

			activate(
				{ productId: slug },
				{
					onSettled: activatedProduct => {
						let postCheckoutUrl = activatedProduct?.post_checkout_url || myJetpackCheckoutUri;

						// If the interstitial is highlighting a specific feature, use the post checkout URL for that feature, if available.
						if ( feature && activatedProduct?.post_checkout_urls_by_feature?.[ feature ] ) {
							postCheckoutUrl = activatedProduct.post_checkout_urls_by_feature[ feature ];
						}

						// there is a separate hasRequiredTier, but it is not implemented
						const hasPaidPlanForProduct = product?.hasPaidPlanForProduct;
						const isFree = tier
							? product?.pricingForUi?.tiers?.[ tier ]?.isFree
							: product?.pricingForUi?.isFree;
						const isUpgradeToHigherTier =
							tier && product?.pricingForUi?.tiers?.[ tier ] && ! isFree && product?.isUpgradable;
						const needsPurchase = ( ! isFree && ! hasPaidPlanForProduct ) || isUpgradeToHigherTier;

						// If the product is CRM, redirect the user to the Jetpack CRM pricing page.
						// This is done because CRM is not part of the WP billing system
						// and we can't send them to checkout like we can with the rest of the products
						if ( product.pluginSlug === 'zero-bs-crm' && ! hasPaidPlanForProduct ) {
							window.location.href = 'https://jetpackcrm.com/pricing/';
							return;
						}

						// If no purchase is needed, redirect the user to the product screen.
						if ( ! needsPurchase ) {
							// for free products, we still initiate the site connection
							handleRegisterSite().then( postRegisterRedirectUri => {
								if ( ! postRegisterRedirectUri ) {
									// Fall back to the My Jetpack overview page.
									return navigateToMyJetpackOverviewPage();
								}
							} );

							return;
						}

						// Redirect to the checkout page.
						checkout?.( null, postCheckoutUrl );
					},
				}
			);
		},
		[
			myJetpackCheckoutUri,
			feature,
			ctaCallback,
			slug,
			directCheckout,
			activate,
			handleRegisterSite,
			navigateToMyJetpackOverviewPage,
		]
	);

	return (
		<AdminPage
			showHeader={ false }
			showBackground={ false }
			useInternalLinks={ shouldUseInternalLinks() }
		>
			<Container horizontalSpacing={ 3 } horizontalGap={ 3 }>
				<Col className={ styles[ 'product-interstitial__header' ] }>
					<GoBackLink onClick={ onClickGoBack } />
					{ existingLicenseKeyUrl && (
						<Text variant="body-small">
							{ createInterpolateElement(
								__(
									'Already have an existing plan or license key? <a>Get started</a>.',
									'jetpack-my-jetpack'
								),
								{
									a: (
										<Button
											className={ styles[ 'product-interstitial__license-activation-link' ] }
											href={ existingLicenseKeyUrl }
											variant="link"
										/>
									),
								}
							) }
						</Text>
					) }
				</Col>
				<Col>
					{ isTieredPricing ? (
						<ProductDetailTable
							slug={ slug }
							clickHandler={ clickHandler }
							onProductButtonClick={ clickHandler }
							trackProductButtonClick={ trackProductOrBundleClick }
							preferProductName={ preferProductName }
							isFetching={ isActivating || siteIsRegistering }
							isFetchingSuccess={ isSuccess }
							feature={ feature }
						/>
					) : (
						<Container
							className={ ! isUpgradableByBundle ? styles.container : null }
							horizontalSpacing={ 0 }
							horizontalGap={ 0 }
							fluid
						>
							<Col sm={ 4 } md={ 4 } lg={ 7 }>
								<ProductDetailCard
									slug={ slug }
									trackButtonClick={ trackProductOrBundleClick }
									onClick={ installsPlugin ? clickHandler : undefined }
									className={ isUpgradableByBundle ? styles.container : null }
									supportingInfo={ supportingInfo }
									preferProductName={ preferProductName }
									ctaButtonLabel={ ctaButtonLabel }
									hideTOS={ hideTOS || showBundledTOS }
									quantity={ quantity }
									highlightLastFeature={ highlightLastFeature }
									isFetching={ isActivating || siteIsRegistering }
									isFetchingSuccess={ isSuccess }
								/>
							</Col>
							<Col
								sm={ 4 }
								md={ 4 }
								lg={ 5 }
								className={ clsx( styles.imageContainer, imageContainerClassName ) }
							>
								{ bundle ? (
									<ProductDetailCard
										slug={ bundle }
										trackButtonClick={ trackProductOrBundleClick }
										onClick={ clickHandler }
										className={ isUpgradableByBundle ? styles.container : null }
										hideTOS={ hideTOS || showBundledTOS }
										quantity={ quantity }
										highlightLastFeature={ highlightLastFeature }
										isFetching={ isActivating }
										isFetchingSuccess={ isSuccess }
										isUpsell={ true }
									/>
								) : (
									children
								) }
							</Col>
						</Container>
					) }
				</Col>
				<Col>
					{ showBundledTOS && (
						<div className={ styles[ 'tos-container' ] }>
							<TermsOfService multipleButtons={ bundledTosLabels } />
						</div>
					) }
				</Col>
			</Container>
		</AdminPage>
	);
}

/**
 * AntiSpamInterstitial component
 *
 * @return {object} AntiSpamInterstitial react component.
 */
export function AntiSpamInterstitial() {
	const slug = 'anti-spam';
	const { detail } = useProduct( slug );
	const { isPluginActive } = detail;

	return (
		<ProductInterstitial
			slug={ slug }
			installsPlugin={ true }
			bundle="security"
			existingLicenseKeyUrl={ isPluginActive ? 'admin.php?page=akismet-key-config' : null }
			preferProductName={ true }
		/>
	);
}

/**
 * BackupInterstitial component
 *
 * @return {object} BackupInterstitial react component.
 */
export function BackupInterstitial() {
	return <ProductInterstitial slug="backup" installsPlugin={ true } bundle="security" />;
}

/**
 * BoostInterstitial component
 *
 * @return {object} BoostInterstitial react component.
 */
export function BoostInterstitial() {
	return (
		<ProductInterstitial slug="boost" installsPlugin={ true }>
			<img src={ boostImage } alt="Boost" />
		</ProductInterstitial>
	);
}

/**
 * CRMInterstitial component
 *
 * @return {object} CRMInterstitial react component.
 */
export function CRMInterstitial() {
	return (
		<ProductInterstitial slug="crm" installsPlugin={ true }>
			<img src={ crmImage } alt="CRM" />
		</ProductInterstitial>
	);
}

/**
 * ExtrasInterstitial component
 *
 * @return {object} ExtrasInterstitial react component.
 */
export function ExtrasInterstitial() {
	return (
		<ProductInterstitial slug="extras" installsPlugin={ true }>
			<img src={ extrasImage } alt="Extras" />
		</ProductInterstitial>
	);
}

/**
 * JetpackAiInterstitial component
 *
 * @return {object} JetpackAiInterstitial react component.
 */
export { default as JetpackAiInterstitial } from './jetpack-ai';

/**
 * ProtectInterstitial component
 *
 * @return {object} ProtectInterstitial react component.
 */
export function ProtectInterstitial() {
	// Get the feature query parameter from the URL.
	const { feature } = useParams();

	return <ProductInterstitial slug="protect" feature={ feature } installsPlugin={ true } />;
}

/**
 * ScanInterstitial component
 *
 * @return {object} ScanInterstitial react component.
 */
export function ScanInterstitial() {
	return <ProductInterstitial slug="scan" installsPlugin={ true } bundle="security" />;
}

/**
 * SocialInterstitial component
 *
 * @return {object} SocialInterstitial react component.
 */
export function SocialInterstitial() {
	return <ProductInterstitial slug="social" installsPlugin={ true } bundle="growth" />;
}

/**
 * SearchInterstitial component
 *
 * @return {object} SearchInterstitial react component.
 */
export function SearchInterstitial() {
	const { detail } = useProduct( 'search' );
	return (
		<ProductInterstitial
			slug="search"
			installsPlugin={ true }
			supportingInfo={
				( detail?.pricingForUi?.trialAvailable
					? __(
							'Jetpack Search Free supports up to 5,000 records and 500 search requests per month for free. You will be asked to upgrade to a paid plan if you exceed these limits for three continuous months.',
							'jetpack-my-jetpack'
					  )
					: '' ) +
				__(
					"For the paid plan, pricing will automatically adjust based on the number of records in your search index. If you grow into a new pricing tier, we'll let you know before your next billing cycle.",
					'jetpack-my-jetpack'
				)
			}
		>
			<img src={ searchImage } alt="Search" />
		</ProductInterstitial>
	);
}

/**
 * StatsInterstitial component
 *
 * @return {object} StatsInterstitial react component.
 */
export function StatsInterstitial() {
	return (
		<ProductInterstitial
			slug="stats"
			directCheckout={ true }
			installsPlugin={ true }
			ctaButtonLabel={ __( 'Get Stats', 'jetpack-my-jetpack' ) }
			bundle="growth"
		/>
	);
}

/**
 * VideoPressInterstitial component
 *
 * @return {object} VideoPressInterstitial react component.
 */
export function VideoPressInterstitial() {
	return (
		<ProductInterstitial slug="videopress" installsPlugin={ true }>
			<img src={ videoPressImage } alt="VideoPress" />
		</ProductInterstitial>
	);
}

/**
 * SecurityInterstitial component
 *
 * @return {object} SecurityInterstitial react component.
 */
export function SecurityInterstitial() {
	return (
		<ProductInterstitial slug="security" installsPlugin={ true }>
			<img src={ securityImage } alt="Security" />
		</ProductInterstitial>
	);
}

/**
 * GrowthInterstitial component
 *
 * @return {object} GrowthInterstitial react component.
 */
export function GrowthInterstitial() {
	return (
		<ProductInterstitial slug="growth" installsPlugin={ true }>
			<img src={ statsImage } alt="Growth" />
		</ProductInterstitial>
	);
}

/**
 * CompleteInterstitial component
 *
 * @return {object} CompleteInterstitial react component.
 */
export function CompleteInterstitial() {
	return (
		<ProductInterstitial slug="complete" installsPlugin={ true }>
			<img src={ completeImage } alt="Complete" />
		</ProductInterstitial>
	);
}
