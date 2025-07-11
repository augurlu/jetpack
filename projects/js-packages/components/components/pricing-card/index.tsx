import { getCurrencyObject } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { LoadingPlaceholder } from '@automattic/jetpack-components';
import TermsOfService from '../terms-of-service/index.tsx';
import type { PricingCardProps } from './types.ts';
import type { CurrencyObject } from '@automattic/number-formatters';
import type { FC, ReactNode } from 'react';

import './style.scss';

/**
 * Whether or not to display a price's decimal part in the UI.
 * Needed as `getCurrencyObject` will always return the decimal part populated even if it
 * doesn't exist.
 *
 * @param {CurrencyObject} currencyObject -- A currency object returned from `getCurrencyObject`.
 * @return {boolean} Whether or not to display the price decimal part.
 */
const showPriceDecimals = ( currencyObject: CurrencyObject ): boolean => {
	return currencyObject.fraction.indexOf( '00' ) === -1;
};

/**
 * The Pricing card component.
 *
 * @param {PricingCardProps} props -- The component props.
 * @return {ReactNode} The rendered component.
 */
const PricingCard: FC< PricingCardProps > = ( {
	currencyCode = 'USD',
	priceDetails = __( '/month, paid yearly', 'jetpack-components' ),
	...props
} ) => {
	const currencyObjectBefore = getCurrencyObject( props.priceBefore, currencyCode );
	const currencyObjectAfter = getCurrencyObject( props.priceAfter, currencyCode );

	return (
		<div className="jp-components__pricing-card">
			{ props.icon && (
				<div className="jp-components__pricing-card__icon">
					{ 'string' === typeof props.icon ? (
						<img
							src={ props.icon }
							alt={ sprintf(
								/* translators: placeholder is a product name */
								__( 'Icon for the product %s', 'jetpack-components' ),
								props.title
							) }
						/>
					) : (
						props.icon
					) }
				</div>
			) }
			<h1 className="jp-components__pricing-card__title">{ props.title }</h1>
			<div className="jp-components__pricing-card__pricing">
				{ props.priceAfter === 0 && <LoadingPlaceholder width="100%" height={ 48 } /> }
				{ props.priceBefore !== props.priceAfter && props.priceAfter > 0 && (
					<div className="jp-components__pricing-card__price-before">
						<span className="jp-components__pricing-card__currency">
							{ currencyObjectBefore.symbol }
						</span>
						<span className="jp-components__pricing-card__price">
							{ currencyObjectBefore.integer }
						</span>
						{ showPriceDecimals( currencyObjectBefore ) && (
							<span className="jp-components__pricing-card__price-decimal">
								{ ' ' }
								{ currencyObjectBefore.fraction }
							</span>
						) }
						<div className="jp-components__pricing-card__price-strikethrough"></div>
					</div>
				) }
				{ props.priceAfter > 0 && (
					<>
						<div className="jp-components__pricing-card__price-after">
							<span className="jp-components__pricing-card__currency">
								{ currencyObjectAfter.symbol }
							</span>
							<span className="jp-components__pricing-card__price">
								{ currencyObjectAfter.integer }
							</span>
							{ showPriceDecimals( currencyObjectAfter ) && (
								<span className="jp-components__pricing-card__price-decimal">
									{ currencyObjectAfter.fraction }
								</span>
							) }
						</div>
						<span className="jp-components__pricing-card__price-details">{ priceDetails }</span>
					</>
				) }
			</div>

			{ props.children && (
				<div className="jp-components__pricing-card__extra-content-wrapper">{ props.children }</div>
			) }

			{ /*
			 * Keep the option to pass custom terms of service text,
			 * but by default, use the shared `TermsOfService` component
			 * and pass the CTA button's text to it
			 */ }
			{ props.tosText && <div className="jp-components__pricing-card__tos">{ props.tosText }</div> }

			{ props.ctaText && (
				<>
					{ ! props.tosText && (
						<div className="jp-components__pricing-card__tos">
							<TermsOfService agreeButtonLabel={ props.ctaText } />
						</div>
					) }
					<div className="jp-components__pricing-card__cta">
						<Button
							className="jp-components__pricing-card__button"
							label={ props.ctaText }
							onClick={ props.onCtaClick }
						>
							{ props.ctaText }
						</Button>
					</div>
				</>
			) }

			{ props.infoText && (
				<div className="jp-components__pricing-card__info">{ props.infoText }</div>
			) }
		</div>
	);
};

export default PricingCard;
