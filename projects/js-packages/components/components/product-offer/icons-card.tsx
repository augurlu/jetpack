import { Icon, plus } from '@wordpress/icons';
import { Fragment } from 'react';
import { getIconBySlug } from '../icons/index.tsx';
import styles from './style.module.scss';
import { IconsCardProps } from './types.ts';
import type { FC, ReactNode } from 'react';

/**
 * Icons composition for a bundle product,
 * based on the list of supported products.
 *
 * @param {IconsCardProps} props - Component props.
 * @return {ReactNode}      Bundle product icons react component.
 */
export const IconsCard: FC< IconsCardProps > = ( { products, icon, size = 24 } ) => {
	if ( icon ) {
		const CustomIcon = getIconBySlug( icon );
		return (
			<div className={ styles[ 'product-bundle-icons' ] }>
				<CustomIcon size={ size } />
			</div>
		);
	}

	return (
		<div className={ styles[ 'product-bundle-icons' ] }>
			{ products.map( ( product, index ) => {
				const ProductIcon = getIconBySlug( product );
				const ProIcon = ProductIcon ? ProductIcon : () => null;

				return (
					<Fragment key={ index }>
						<ProIcon size={ size } />

						{ index !== products.length - 1 && (
							<Icon
								className={ styles[ 'plus-icon' ] }
								key={ `icon-plugs${ index * 2 + 1 }` }
								icon={ plus }
								size={ 16 }
							/>
						) }
					</Fragment>
				);
			} ) }
		</div>
	);
};
