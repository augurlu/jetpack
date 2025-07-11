import { GridRows, GridColumns } from '@visx/grid';
import styles from './grid-control.module.scss';
import type { GridProps } from '../../types';
import type { FC } from 'react';

const GridControl: FC< GridProps > = ( {
	width,
	height,
	xScale,
	yScale,
	gridVisibility = 'x',
	top = 0,
} ) => {
	return (
		<g transform={ `translate(0, ${ top })` } className={ styles[ 'grid-control' ] }>
			{ gridVisibility.includes( 'x' ) && (
				<GridRows scale={ xScale } width={ width } data-testid="x-grid" />
			) }
			{ gridVisibility.includes( 'y' ) && (
				<GridColumns scale={ yScale } height={ height } data-testid="y-grid" />
			) }
		</g>
	);
};

export default GridControl;
