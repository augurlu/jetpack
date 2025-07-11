import { __, sprintf } from '@wordpress/i18n';
import { Icon, check, closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import {
	createContext,
	useContext,
	Children,
	cloneElement,
	PropsWithChildren,
	ReactElement,
	CSSProperties,
} from 'react';
import IconTooltip from '../icon-tooltip/index.tsx';
import useBreakpointMatch from '../layout/use-breakpoint-match/index.ts';
import TermsOfService from '../terms-of-service/index.tsx';
import Text from '../text/index.tsx';
import styles from './styles.module.scss';
import {
	PricingTableProps,
	PricingTableColumnProps,
	PricingTableHeaderProps,
	PricingTableItemProps,
} from './types.ts';
import type { FC } from 'react';

const INCLUDED_TEXT = __( 'Included', 'jetpack-components' );
const NOT_INCLUDED_TEXT = __( 'Not included', 'jetpack-components' );
const COMING_SOON_TEXT = __( 'Coming soon', 'jetpack-components' );

const PricingTableContext = createContext( undefined );

const getItemLabels = ( isComingSoon, isIncluded, featureNameLabel ) => {
	if ( isComingSoon ) {
		return {
			lg: COMING_SOON_TEXT,
			// translators: Name of the current feature
			default: sprintf( __( '%s coming soon', 'jetpack-components' ), featureNameLabel ),
		};
	}

	return {
		lg: isIncluded ? INCLUDED_TEXT : NOT_INCLUDED_TEXT,
		default: isIncluded
			? featureNameLabel
			: sprintf(
					/* translators: Name of the current feature */
					__( '%s not included', 'jetpack-components' ),
					featureNameLabel
			  ),
	};
};

export const PricingTableItem: FC< PricingTableItemProps > = ( {
	isIncluded = false,
	isComingSoon = false,
	index = 0,
	label = null,
	tooltipInfo,
	tooltipTitle,
	tooltipClassName = '',
} ) => {
	const [ isLg ] = useBreakpointMatch( 'lg' );
	const item = useContext( PricingTableContext )[ index ];
	const showTick = isComingSoon || isIncluded;

	const featureNameLabel = item.name;

	const defaultTooltipInfo = item.tooltipInfo;
	const defaultTooltipTitle = item.tooltipTitle;
	const showTooltip = tooltipInfo || ( ! isLg && defaultTooltipInfo );

	const labels = getItemLabels( isComingSoon, isIncluded, featureNameLabel );

	const defaultLabel = isLg ? labels.lg : labels.default;

	return (
		<div className={ clsx( styles.item, styles.value ) }>
			<Icon
				className={ clsx(
					styles.icon,
					showTick ? styles[ 'icon-check' ] : styles[ 'icon-cross' ]
				) }
				size={ 32 }
				icon={ showTick ? check : closeSmall }
			/>
			<Text variant="body-small">{ label || defaultLabel }</Text>
			{ showTooltip && (
				<IconTooltip
					title={ tooltipTitle ? tooltipTitle : defaultTooltipTitle }
					iconClassName={ styles[ 'popover-icon' ] }
					className={ clsx( styles.popover, tooltipClassName ) }
					placement={ 'bottom-end' }
					iconSize={ 14 }
					offset={ 4 }
					wide={ Boolean( tooltipTitle && tooltipInfo ) }
				>
					<Text variant="body-small" component="div">
						{ tooltipInfo || defaultTooltipInfo }
					</Text>
				</IconTooltip>
			) }
		</div>
	);
};

export const PricingTableHeader: FC< PricingTableHeaderProps > = ( { children } ) => (
	<div className={ styles.header }>{ children }</div>
);

export const PricingTableColumn: FC< PricingTableColumnProps > = ( {
	primary = false,
	children,
} ) => {
	let index = 0;

	return (
		<div className={ clsx( styles.card, { [ styles[ 'is-primary' ] ]: primary } ) }>
			{ Children.map( children, child => {
				const item = child as ReactElement<
					PropsWithChildren< PricingTableHeaderProps | PricingTableItemProps >
				>;

				if ( item.type === PricingTableItem ) {
					index++;
					return cloneElement( item, { index: index - 1 } );
				}

				return item;
			} ) }
		</div>
	);
};

const PricingTable: FC< PricingTableProps > = ( {
	title,
	items,
	children,
	showIntroOfferDisclaimer = false,
} ) => {
	const [ isLg ] = useBreakpointMatch( 'lg' );

	return (
		<PricingTableContext.Provider value={ items }>
			<div
				className={ clsx( styles.container, { [ styles[ 'is-viewport-large' ] ]: isLg } ) }
				style={
					{
						'--rows': items.length + 1,
						'--columns': Children.toArray( children ).length + 1,
					} as CSSProperties
				}
			>
				<div className={ styles.table }>
					<Text variant="headline-small">{ title }</Text>
					{ isLg &&
						items.map( ( item, i ) => (
							<div
								className={ clsx( styles.item, {
									[ styles[ 'last-feature' ] ]: i === items.length - 1,
								} ) }
								key={ i }
							>
								<Text variant="body-small">
									<strong>{ item.name }</strong>
								</Text>
								{ item.tooltipInfo && (
									<IconTooltip
										title={ item.tooltipTitle }
										iconClassName={ styles[ 'popover-icon' ] }
										className={ styles.popover }
										placement={ item.tooltipPlacement ? item.tooltipPlacement : 'bottom-end' }
										iconSize={ 14 }
										offset={ 4 }
										wide={ Boolean( item.tooltipTitle && item.tooltipInfo ) }
									>
										<Text variant="body-small">{ item.tooltipInfo }</Text>
									</IconTooltip>
								) }
							</div>
						) ) }
					{ children }
				</div>
			</div>
			<div className={ styles[ 'tos-container' ] }>
				<div className={ styles.tos }>
					{ showIntroOfferDisclaimer && (
						<Text variant="body-small">
							{ __(
								'Reduced pricing is a limited offer for the first year and renews at regular price.',
								'jetpack-components'
							) }
						</Text>
					) }
					<TermsOfService multipleButtons />
				</div>
			</div>
		</PricingTableContext.Provider>
	);
};

export default PricingTable;
