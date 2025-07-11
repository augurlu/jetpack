import type { DecorativeCardProps } from './types.ts';
import type { FC, ReactNode } from 'react';
import './style.scss';

/**
 * A decorative card used in the disconnection flow.
 *
 * @param {DecorativeCardProps} props - The properties.
 * @return {ReactNode} - The DecorativeCard component.
 */

const DecorativeCard: FC< DecorativeCardProps > = ( { format = 'horizontal', icon, imageUrl } ) => {
	return (
		<div
			className={
				'jp-components__decorative-card ' +
				( format ? 'jp-components__decorative-card--' + format : '' )
			}
		>
			<div
				className="jp-components__decorative-card__image"
				style={ { backgroundImage: imageUrl ? `url( ${ imageUrl } )` : '' } }
			></div>
			<div className="jp-components__decorative-card__content">
				<div className="jp-components__decorative-card__lines"></div>
			</div>
			{ icon ? (
				<div className="jp-components__decorative-card__icon-container">
					<span
						className={
							'jp-components__decorative-card__icon jp-components__decorative-card__icon--' + icon
						}
					></span>
				</div>
			) : null }
		</div>
	);
};

export default DecorativeCard;
