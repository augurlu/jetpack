import { Text } from '@automattic/jetpack-components';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import styles from './style.module.scss';
import { ReviewRequestBaseProps } from './types';
import type { FC } from 'react';

const ReviewRequest: FC< ReviewRequestBaseProps > = ( {
	cta,
	href,
	onClick,
	requestReason,
	reviewText,
	dismissedReview,
	dismissMessage,
} ) => {
	if ( dismissedReview || requestReason === '' ) {
		return <></>;
	}

	return (
		<>
			<ExternalLink
				className={ `${ styles.rr } ${ styles.emojisPseudo }` }
				href={ href }
				onClick={ onClick }
			>
				<div>
					<Text>{ reviewText }</Text>
					<Text className={ styles.cta }>{ cta }</Text>
				</div>
			</ExternalLink>
			<a role="button" href="#" onClick={ dismissMessage } className={ styles.dismiss }>
				{ __( 'Maybe later', 'jetpack-backup-pkg' ) }
			</a>
		</>
	);
};

export default ReviewRequest;
