/**
 * External dependencies
 */
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import styles from './style.module.scss';
import { ProgressBarProps } from './types.ts';
import type { FC, ReactNode } from 'react';

/**
 * Progress Bar component
 *
 * @param {ProgressBarProps} props - Component props.
 * @return {ReactNode} - ProgressBar react component.
 */
const ProgressBar: FC< ProgressBarProps > = ( {
	className,
	progressClassName,
	progress,
	size = 'normal',
} ) => {
	if ( progress == null ) {
		return null;
	}

	const normalizedProgress = Math.max( Math.min( progress, 1 ), 0 );

	const style = {
		width: `${ normalizedProgress * 100 }%`,
	};

	return (
		<div className={ clsx( className, styles.wrapper, { [ styles.small ]: size === 'small' } ) }>
			<div className={ clsx( progressClassName, styles.progress ) } style={ style }></div>
		</div>
	);
};

export default ProgressBar;
