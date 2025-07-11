import { Button, Card, CardBody, CardFooter, CardMedia } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import WpcomTourKitRating from './wpcom-tour-kit-rating';
import WpcomTourKitStepCardNavigation from './wpcom-tour-kit-step-card-navigation';
import WpcomTourKitStepCardOverlayControls from './wpcom-tour-kit-step-card-overlay-controls';
import type { WpcomTourStepRendererProps } from '../../../types';
import type { FunctionComponent } from 'react';

const WpcomTourKitStepCard: FunctionComponent< WpcomTourStepRendererProps > = ( {
	steps,
	currentStepIndex,
	onMinimize,
	onDismiss,
	onGoToStep,
	onNextStep,
	onPreviousStep,
	setInitialFocusedElement,
} ) => {
	const lastStepIndex = steps.length - 1;
	const { descriptions, heading, imgSrc, imgLink } = steps[ currentStepIndex ].meta;
	const isLastStep = currentStepIndex === lastStepIndex;
	const isMobile = useViewportMatch( 'mobile', '<' );
	const description = descriptions[ isMobile ? 'mobile' : 'desktop' ] ?? descriptions.desktop;

	return (
		<Card className="wpcom-tour-kit-step-card" elevation={ 2 }>
			<WpcomTourKitStepCardOverlayControls onDismiss={ onDismiss } onMinimize={ onMinimize } />
			{ imgSrc && (
				<CardMedia className="wpcom-tour-kit-step-card__media">
					<picture>
						{ imgSrc.mobile && (
							<source
								srcSet={ imgSrc.mobile.src }
								type={ imgSrc.mobile.type }
								media="(max-width: 480px)"
							/>
						) }
						<img alt={ __( 'Tour Media', 'jetpack-mu-wpcom' ) } src={ imgSrc.desktop?.src } />
					</picture>
					{ imgLink && (
						<a
							className={ clsx( 'wpcom-tour-kit-step-card__media-link', {
								'wpcom-tour-kit-step-card__media-link--playable': imgLink.playable,
							} ) }
							href={ imgLink.href }
							target="_blank"
							rel="noreferrer noopener"
							onClick={ imgLink.onClick }
						>
							<Icon
								icon={
									<svg
										width="27"
										height="32"
										viewBox="0 0 27 32"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M27 16L-1.4682e-06 31.5885L-1.05412e-07 0.411542L27 16Z"
											fill="white"
										/>
									</svg>
								}
								size={ 27 }
							/>
						</a>
					) }
				</CardMedia>
			) }
			<CardBody>
				<h2 className="wpcom-tour-kit-step-card__heading">{ heading }</h2>
				<p className="wpcom-tour-kit-step-card__description">
					{ description }
					{ isLastStep ? (
						<Button
							className="wpcom-tour-kit-step-card__description"
							variant="tertiary"
							onClick={ () => onGoToStep( 0 ) }
							ref={ setInitialFocusedElement }
						>
							{ __( 'Restart tour', 'jetpack-mu-wpcom' ) }
						</Button>
					) : null }
				</p>
			</CardBody>
			<CardFooter>
				{ isLastStep ? (
					<WpcomTourKitRating />
				) : (
					<WpcomTourKitStepCardNavigation
						currentStepIndex={ currentStepIndex }
						onDismiss={ onDismiss }
						onGoToStep={ onGoToStep }
						onNextStep={ onNextStep }
						onPreviousStep={ onPreviousStep }
						setInitialFocusedElement={ setInitialFocusedElement }
						steps={ steps }
					></WpcomTourKitStepCardNavigation>
				) }
			</CardFooter>
		</Card>
	);
};

export default WpcomTourKitStepCard;
