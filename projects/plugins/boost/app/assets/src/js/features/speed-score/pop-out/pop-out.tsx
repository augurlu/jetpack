import { animated, useSpring } from '@react-spring/web';
import CloseButton from '$features/ui/close-button/close-button';
import styles from './pop-out.module.scss';
import { __ } from '@wordpress/i18n';
import { ReactNode, useState, useEffect } from 'react';
import { Button, getRedirectUrl } from '@automattic/jetpack-components';
import { useDismissibleAlertState } from '$features/performance-history/lib/hooks';
import { recordBoostEvent } from '$lib/utils/analytics';

type Props = {
	scoreChange: number | false; // Speed score shift to show, or false if none.
};

/**
 * Messages which can be shown to the user based on direction of score change.
 */
type ScoreChangeMessage = {
	id: 'score_increase' | 'score_decrease';
	title: string;
	body: string | ReactNode;
	cta: string;
	ctaLink: string;
};

const fasterMessage: ScoreChangeMessage = {
	id: 'score_increase',
	title: __( 'Your site got faster', 'jetpack-boost' ),
	body: <p>{ __( `That's great! If you’re happy, why not rate Boost?`, 'jetpack-boost' ) }</p>,
	cta: __( 'Rate the Plugin', 'jetpack-boost' ),
	ctaLink: getRedirectUrl( 'boost-rate-plugin' ),
};

const slowerMessage: ScoreChangeMessage = {
	id: 'score_decrease',
	title: __( 'Speed score has fallen', 'jetpack-boost' ),
	body: (
		<>
			<p>
				{ __(
					'Most of the time Jetpack Boost will increase your site speed, but there may be cases where your score does not increase.',
					'jetpack-boost'
				) }
			</p>
			<p>
				{ __(
					'Try refreshing your score, and if it doesn’t help, check our guide on improving your site speed score:',
					'jetpack-boost'
				) }
			</p>
		</>
	),
	cta: __( 'Read the guide', 'jetpack-boost' ),
	ctaLink: getRedirectUrl( 'boost-improve-site-speed-score' ),
};

type VanillaPopOutProps = {
	message: ScoreChangeMessage;
	onClose: () => void;
	onDismiss: () => void;
	isVisible: boolean;
};

/**
 * The basic pop out excluding all external dependencies.
 *
 * @param {VanillaPopOutProps} props
 * @return {ReactNode} Vanilla PopOut component.
 */
export const VanillaPopOut = ( { message, onClose, onDismiss, isVisible }: VanillaPopOutProps ) => {
	const animationStyles = useSpring( {
		from: {
			right: '-100%',
		},
		to: {
			right: isVisible ? '0%' : '-100%',
		},
	} );

	return (
		<div id="parent" className={ styles.wrapper }>
			<animated.div
				className={ styles.card }
				style={ {
					...animationStyles,
				} }
			>
				<CloseButton onClick={ onClose } />

				<h3 className={ styles.headline }>{ message.title }</h3>

				<>{ message.body }</>

				<Button
					variant="primary"
					href={ message?.ctaLink }
					isExternalLink={ true }
					onClick={ onDismiss }
				>
					{ message.cta }
				</Button>

				<Button
					variant="link"
					size="small"
					className={ styles[ 'dismiss-button' ] }
					onClick={ onDismiss }
				>
					{ __( 'Do not show me again', 'jetpack-boost' ) }
				</Button>
			</animated.div>
		</div>
	);
};

function PopOut( { scoreChange }: Props ) {
	/*
	 * Determine if the score has changed enough to show the alert.
	 */
	const hasScoreChanged = scoreChange !== false && Math.abs( scoreChange ) > 5;

	/*
	 * Determine which message to show based on the direction of score change.
	 */
	const message = scoreChange && scoreChange < 0 ? slowerMessage : fasterMessage;

	/*
	 * Use datasync to track which score alerts have been dismissed.
	 * Dismissed means that the user asked to never show us this alert again.
	 */
	const [ isDismissed, dismissAlert ] = useDismissibleAlertState( message.id );
	/*
	 * Hide the alert for now. The alert will show up again if the user refreshes the page.
	 */
	const [ isClosed, setClose ] = useState( false );

	const hideAlert = () => setClose( true );

	const scoreDirection = scoreChange && scoreChange > 0 ? 'up' : 'down';

	useEffect( () => {
		if ( hasScoreChanged && ! isDismissed && ! isClosed ) {
			recordBoostEvent( 'speed_score_alert_shown', {
				score_direction: scoreDirection,
			} );
		}
	}, [ hasScoreChanged, isDismissed, isClosed, scoreDirection ] );

	const handleCtaClick = () => {
		recordBoostEvent( 'speed_score_alert_cta_clicked', {
			score_direction: scoreDirection,
		} );

		dismissAlert();
	};

	return (
		<VanillaPopOut
			message={ message }
			onClose={ hideAlert }
			onDismiss={ handleCtaClick }
			isVisible={ hasScoreChanged && ! isDismissed && ! isClosed }
		/>
	);
}

export default PopOut;
