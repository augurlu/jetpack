import {
	CheckmarkIcon,
	getIconBySlug,
	StarIcon,
	Text,
	H3,
	Alert,
	TermsOfService,
} from '@automattic/jetpack-components';
import { useProductCheckoutWorkflow } from '@automattic/jetpack-connection';
import { getCurrencyObject } from '@automattic/number-formatters';
import { ExternalLink } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, check, plus } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useState, useEffect } from 'react';
import useProduct from '../../data/products/use-product';
import { getMyJetpackWindowInitialState } from '../../data/utils/get-my-jetpack-window-state';
import useAnalytics from '../../hooks/use-analytics';
import { useRedirectToReferrer } from '../../hooks/use-redirect-to-referrer';
import LoadingBlock from '../loading-block';
import ProductDetailButton from '../product-detail-button';
import styles from './style.module.scss';

/**
 * React component to render the price.
 *
 * @param {object} props          - Component props.
 * @param {string} props.value    - Product price
 * @param {string} props.currency - Product current code
 * @param {string} props.isOld    - True when the product price is old
 * @return {object}                Price react component.
 */
function Price( { value, currency, isOld } ) {
	if ( ! value || ! currency ) {
		return null;
	}

	const priceObject = getCurrencyObject( value, currency );

	const classNames = clsx( styles.price, {
		[ styles[ 'is-old' ] ]: isOld,
	} );

	return (
		<Text className={ classNames } variant="headline-medium" component="p">
			<Text component="sup" variant="title-medium">
				{ priceObject.symbol }
			</Text>
			{ priceObject.integer }
			<Text component="sup" variant="title-medium">
				{ priceObject.fraction }
			</Text>
		</Text>
	);
}

/**
 * Product Detail component.
 *
 * @param {object}                    props                        - Component props.
 * @param {string}                    props.slug                   - Product slug
 * @param {Function}                  props.onClick                - Callback for Call To Action button click
 * @param {Function}                  props.trackButtonClick       - Function to call for tracking clicks on Call To Action button
 * @param {string}                    props.className              - A className to be concat with default ones
 * @param {boolean}                   props.preferProductName      - Use product name instead of title
 * @param {import('react').ReactNode} props.supportingInfo         - Complementary links or support/legal text
 * @param {string}                    [props.ctaButtonLabel]       - The label for the Call To Action button
 * @param {boolean}                   [props.hideTOS]              - Whether to hide the Terms of Service text
 * @param {number}                    [props.quantity]             - The quantity of the product to purchase
 * @param {boolean}                   [props.highlightLastFeature] - Whether to highlight the last feature of the list of features
 * @param {boolean}                   [props.isFetching]           - Whether the product is being activated
 * @param {boolean}                   [props.isFetchingSuccess]    - Whether the product was activated successfully
 * @param {boolean}                   [props.isUpsell]             - Whether the product is an upsell
 * @return {object}                               ProductDetailCard react component.
 */
const ProductDetailCard = ( {
	slug,
	onClick,
	trackButtonClick = () => {},
	className,
	preferProductName,
	supportingInfo,
	ctaButtonLabel = null,
	hideTOS = false,
	quantity = null,
	highlightLastFeature = false,
	isFetching = false,
	isFetchingSuccess = false,
	isUpsell = false,
} ) => {
	const {
		fileSystemWriteAccess = 'no',
		siteSuffix = '',
		adminUrl = '',
		myJetpackCheckoutUri = '',
	} = getMyJetpackWindowInitialState();

	const { detail, isLoading: isProductLoading } = useProduct( slug );

	const {
		name,
		title,
		longDescription,
		features,
		disclaimers,
		pricingForUi,
		isBundle,
		supportedProducts,
		hasPaidPlanForProduct,
		status,
		pluginSlug,
		postCheckoutUrl,
	} = detail;

	const isBundleUpsell = isBundle && isUpsell;
	const cantInstallPlugin = status === 'plugin_absent' && 'no' === fileSystemWriteAccess;

	const {
		isFree,
		trialAvailable,
		fullPricePerMonth: price,
		currencyCode,
		discountPricePerMonth: discountPrice,
		wpcomProductSlug,
		wpcomFreeProductSlug,
		introductoryOffer,
		productTerm,
	} = pricingForUi || {};

	const { recordEvent } = useAnalytics();

	/*
	 * Product needs purchase when:
	 * - it's not free
	 * - it does not have a required plan
	 *
	 * Or when:
	 * - it's a quantity-based product
	 */
	const needsPurchase = ( ! isFree && ! hasPaidPlanForProduct ) || quantity != null;

	// Redirect to the referrer URL when the `redirect_to_referrer` query param is present.
	const referrerURL = useRedirectToReferrer();

	/*
	 * Function to handle the redirect URL selection.
	 * - postCheckoutUrl is the URL provided by the product API and is the preferred URL
	 * - referrerURL is the referrer URL, in case the redirect_to_referrer flag was provided
	 * - myJetpackCheckoutUri is the default URL
	 */
	const getCheckoutRedirectUrl = useCallback( () => {
		if ( postCheckoutUrl ) {
			return postCheckoutUrl;
		}

		if ( referrerURL ) {
			return referrerURL;
		}

		return myJetpackCheckoutUri;
	}, [ postCheckoutUrl, referrerURL, myJetpackCheckoutUri ] );

	const checkoutRedirectUrl = getCheckoutRedirectUrl();

	const { run: mainCheckoutRedirect, hasCheckoutStarted: hasMainCheckoutStarted } =
		useProductCheckoutWorkflow( {
			productSlug: wpcomProductSlug,
			redirectUrl: checkoutRedirectUrl,
			siteSuffix,
			adminUrl,
			connectAfterCheckout: true,
			from: 'my-jetpack',
			quantity,
			useBlogIdSuffix: true,
		} );

	const { run: trialCheckoutRedirect, hasCheckoutStarted: hasTrialCheckoutStarted } =
		useProductCheckoutWorkflow( {
			productSlug: wpcomFreeProductSlug,
			redirectUrl: checkoutRedirectUrl,
			siteSuffix,
			adminUrl,
			connectAfterCheckout: true,
			from: 'my-jetpack',
			quantity,
			useBlogIdSuffix: true,
		} );

	// Suppported products icons.
	const icons = isBundleUpsell
		? supportedProducts
				.join( '_plus_' )
				.split( '_' )
				.map( ( iconSlug, i ) => {
					if ( iconSlug === 'plus' ) {
						return (
							<Icon
								className={ styles[ 'plus-icon' ] }
								key={ `icon-plugs${ i }` }
								icon={ plus }
								size={ 14 }
							/>
						);
					}

					const SupportedProductIcon = getIconBySlug( iconSlug );
					return <SupportedProductIcon key={ iconSlug } size={ 24 } />;
				} )
		: null;

	let priceDescription;
	if ( introductoryOffer?.intervalUnit === 'month' && introductoryOffer?.intervalCount === 1 ) {
		priceDescription = sprintf(
			// translators: %s is the monthly price for a product
			__( 'trial for the first month, then $%s /month, billed yearly', 'jetpack-my-jetpack' ),
			price
		);
	} else if ( productTerm === 'year' ) {
		priceDescription = __( '/month, paid yearly', 'jetpack-my-jetpack' );
	} else {
		priceDescription = __(
			'/month',
			'jetpack-my-jetpack',
			/* dummy arg to avoid bad minification */ 0
		);
	}

	const disclaimerClickHandler = useCallback(
		id => {
			recordEvent( 'jetpack_myjetpack_product_card_disclaimer_click', {
				id: id,
				product: slug,
			} );
		},
		[ slug, recordEvent ]
	);

	/**
	 * Temporary ProductIcon component.
	 * Todo: Fix in product-icons component.
	 * https://github.com/Automattic/jetpack/issues/23640
	 *
	 * @param {object} props      - Component props.
	 * @param {string} props.slug - Product icon slug
	 * @return {object}            Icon Product component.
	 */
	function ProductIcon( { slug: iconSlug } ) {
		const ProIcon = getIconBySlug( iconSlug );
		if ( ! ProIcon ) {
			return null;
		}

		return (
			<div className={ styles[ 'product-icon' ] }>
				<ProIcon />
			</div>
		);
	}

	const hasTrialButton =
		( ! isBundleUpsell || ( isBundleUpsell && ! hasPaidPlanForProduct ) ) && trialAvailable;

	// If we prefer the product name, use that everywhere instead of the title
	const productMoniker = name && preferProductName ? name : title;
	const defaultCtaLabel =
		! isBundleUpsell && hasPaidPlanForProduct
			? sprintf(
					/* translators: placeholder is product name. */
					__( 'Install %s', 'jetpack-my-jetpack' ),
					productMoniker
			  )
			: sprintf(
					/* translators: placeholder is product name. */
					__( 'Get %s', 'jetpack-my-jetpack' ),
					productMoniker
			  );
	const ctaLabel = ctaButtonLabel || defaultCtaLabel;

	const clickHandler = useCallback( () => {
		trackButtonClick( { cta_text: ctaLabel } );
		onClick?.( mainCheckoutRedirect, detail );
	}, [ onClick, trackButtonClick, mainCheckoutRedirect, detail, ctaLabel ] );

	const trialClickHandler = useCallback( () => {
		trackButtonClick( { custom_slug: wpcomFreeProductSlug, cta_text: 'Start for free' } );
		onClick?.( trialCheckoutRedirect, detail );
	}, [ onClick, trackButtonClick, trialCheckoutRedirect, wpcomFreeProductSlug, detail ] );

	const productPrice = introductoryOffer?.reason ? price : discountPrice;

	return (
		<div
			className={ clsx( styles.card, className, {
				[ styles[ 'is-bundle-card' ] ]: isBundleUpsell,
			} ) }
		>
			{ isBundleUpsell && (
				<div className={ styles[ 'card-header' ] }>
					<StarIcon className={ styles[ 'product-bundle-icon' ] } size={ 16 } />
					<Text variant="label">{ __( 'Popular upgrade', 'jetpack-my-jetpack' ) }</Text>
				</div>
			) }

			<div className={ styles.container }>
				{ isBundleUpsell && <div className={ styles[ 'product-bundle-icons' ] }>{ icons }</div> }
				<ProductIcon slug={ slug } />

				<H3>{ productMoniker }</H3>
				{ isProductLoading ? (
					<LoadingBlock width="100%" height="75px" spaceBelow />
				) : (
					<Text mb={ 3 }>{ longDescription }</Text>
				) }

				{ isProductLoading ? (
					<LoadingBlock width="100%" height="250px" spaceBelow />
				) : (
					<ul
						className={ clsx( styles.features, {
							[ styles[ 'highlight-last-feature' ] ]: highlightLastFeature,
						} ) }
					>
						{ features.map( ( feature, id ) => (
							<Text component="li" key={ `feature-${ id }` } variant="body">
								<Icon icon={ check } size={ 24 } />
								{ feature }
							</Text>
						) ) }
					</ul>
				) }

				{ isProductLoading && <LoadingBlock width="100%" height="70px" spaceBelow /> }

				{ needsPurchase && productPrice && (
					<>
						<div className={ styles[ 'price-container' ] }>
							<Price value={ productPrice } currency={ currencyCode } isOld={ false } />
							{ productPrice < price && (
								<Price value={ price } currency={ currencyCode } isOld={ true } />
							) }
						</div>
						<Text className={ styles[ 'price-description' ] }>{ priceDescription }</Text>
					</>
				) }

				{ isFree && <H3>{ __( 'Free', 'jetpack-my-jetpack' ) }</H3> }

				{ cantInstallPlugin && (
					<Alert>
						<Text>
							{ sprintf(
								// translators: %s is the plugin name.
								__(
									"Due to your server settings, we can't automatically install the plugin for you. Please manually install the %s plugin.",
									'jetpack-my-jetpack'
								),
								productMoniker
							) }
							&nbsp;
							<ExternalLink href={ `https://wordpress.org/plugins/${ pluginSlug }` }>
								{ __( 'Get plugin', 'jetpack-my-jetpack' ) }
							</ExternalLink>
						</Text>
					</Alert>
				) }

				{ ! hideTOS && (
					<div className={ styles[ 'tos-container' ] }>
						<TermsOfService
							agreeButtonLabel={
								hasTrialButton
									? sprintf(
											/* translators: placeholder is cta label. */
											__( '%s or Start for free', 'jetpack-my-jetpack' ),
											ctaLabel
									  )
									: ctaLabel
							}
						/>
					</div>
				) }

				{ ( ! isBundleUpsell || ( isBundleUpsell && ! hasPaidPlanForProduct ) ) && (
					<ProductDetailCardButton
						component={ ProductDetailButton }
						onClick={ clickHandler }
						hasMainCheckoutStarted={ hasMainCheckoutStarted }
						isFetching={ isFetching }
						isFetchingSuccess={ isFetchingSuccess }
						cantInstallPlugin={ cantInstallPlugin }
						isPrimary={ ! isBundleUpsell }
						className={ styles[ 'checkout-button' ] }
						label={ ctaLabel }
					/>
				) }

				{ ! isBundleUpsell && trialAvailable && ! hasPaidPlanForProduct && (
					<ProductDetailCardButton
						component={ ProductDetailButton }
						onClick={ trialClickHandler }
						hasMainCheckoutStarted={ hasTrialCheckoutStarted }
						isFetching={ isFetching }
						isFetchingSuccess={ isFetchingSuccess }
						cantInstallPlugin={ cantInstallPlugin }
						isPrimary={ false }
						className={ [ styles[ 'checkout-button' ], styles[ 'free-product-checkout-button' ] ] }
						label={ __( 'Start for free', 'jetpack-my-jetpack' ) }
					/>
				) }

				{ disclaimers.length > 0 && (
					<div className={ styles.disclaimers }>
						{ disclaimers.map( ( disclaimer, id ) => {
							const { text, link_text = null, url = null } = disclaimer;

							return (
								<Text key={ `disclaimer-${ id }` } component="p" variant="body-small">
									{ `${ text } ` }
									{ url && link_text && (
										<ExternalLink
											// Ignoring rule so I can pass ID to analytics in order to tell which disclaimer was clicked if there is more than one
											/* eslint-disable react/jsx-no-bind */
											onClick={ () => disclaimerClickHandler( id ) }
											href={ url }
											target="_blank"
											rel="noopener noreferrer"
										>
											{ link_text }
										</ExternalLink>
									) }
								</Text>
							);
						} ) }
					</div>
				) }

				{ isBundleUpsell && hasPaidPlanForProduct && (
					<div className={ styles[ 'product-has-required-plan' ] }>
						<CheckmarkIcon size={ 36 } />
						<Text>{ __( 'Active on your site', 'jetpack-my-jetpack' ) }</Text>
					</div>
				) }

				{ supportingInfo && (
					<Text className={ styles[ 'supporting-info' ] } variant="body-extra-small">
						{ supportingInfo }
					</Text>
				) }
			</div>
		</div>
	);
};

const ProductDetailCardButton = ( {
	component,
	onClick,
	hasMainCheckoutStarted,
	isFetching,
	isFetchingSuccess,
	cantInstallPlugin,
	isPrimary,
	className,
	label,
} ) => {
	const [ isButtonLoading, setIsButtonLoading ] = useState( false );

	useEffect( () => {
		// If activation was successful, we will be redirecting the user
		// so we don't want them to be able to click the button again.
		if ( ! isFetching && ! isFetchingSuccess ) {
			setIsButtonLoading( false );
		}
	}, [ isFetching, isFetchingSuccess ] );

	// If a button was clicked, we should only show the loading state for that button.
	const shouldShowLoadingState = hasMainCheckoutStarted || isButtonLoading;
	// If the any buttons are loading, or we are in the process
	// of rediredcting the user, we should disable all buttons.
	const shouldDisableButton =
		hasMainCheckoutStarted || cantInstallPlugin || isFetching || isFetchingSuccess;

	const handleClick = () => {
		setIsButtonLoading( true );
		onClick();
	};

	return (
		<Text
			component={ component }
			onClick={ handleClick }
			isLoading={ shouldShowLoadingState }
			disabled={ shouldDisableButton }
			isPrimary={ isPrimary }
			className={ className }
			variant="body"
		>
			{ label }
		</Text>
	);
};

export default ProductDetailCard;
