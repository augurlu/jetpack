import getRedirectUrl from '@automattic/jetpack-components/tools/jp-redirect';
import { ProductInterstitialMyJetpack } from '@automattic/jetpack-my-jetpack/components/product-interstitial-modal';
import boostImage from '@automattic/jetpack-my-jetpack/components/product-interstitial/boost.png';
import { __ } from '@wordpress/i18n';
import UpgradeCTA from '$features/upgrade-cta/upgrade-cta';
import type { ReactNode } from 'react';

type InterstitialModalCTAProps = {
	description?: string;
	identifier: string;
	customModalTrigger?: ReactNode;
};

const InterstitialModalCTA = ( {
	description = '',
	identifier,
	customModalTrigger,
}: InterstitialModalCTAProps ) => {
	const learnMoreUrl = getRedirectUrl( 'jetpack-boost-interstitial-modal-learn-more' );

	return (
		<ProductInterstitialMyJetpack
			slug="boost"
			customModalTrigger={
				customModalTrigger ?? <UpgradeCTA identifier={ identifier } description={ description } />
			}
			buttonLabel={ __( 'Upgrade now', 'jetpack-boost' ) }
			isWithVideo={ false }
			secondaryColumn={
				<div>
					<img src={ boostImage } alt="Boost" />
				</div>
			}
			secondaryButtonHref={ learnMoreUrl }
			description={ __(
				'Unlock the full potential of Jetpack Boost with automated performance optimization tools and more.',
				'jetpack-boost'
			) }
			features={ [
				__( 'Automated Critical CSS Generation', 'jetpack-boost' ),
				__( 'Automated Image Scanning', 'jetpack-boost' ),
				__( 'In-depth Performance Insights', 'jetpack-boost' ),
				__( 'Customizable Image Optimization', 'jetpack-boost' ),
				__( 'Expert Support With Personal Assistance Available', 'jetpack-boost' ),
			] }
		/>
	);
};

export default InterstitialModalCTA;
