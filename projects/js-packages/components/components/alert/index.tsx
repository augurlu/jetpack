import { Icon, warning, info, check } from '@wordpress/icons';
import clsx from 'clsx';
import styles from './style.module.scss';
import type { ReactNode, Component, ReactElement, FC } from 'react';

type AlertProps = {
	/** The severity of the alert. */
	level: 'error' | 'warning' | 'info' | 'success';

	/** Show/Hide icon */
	showIcon?: boolean;

	/** Children to be rendered inside the alert. */
	children: ReactNode;

	/** Wrapper class name */
	className?: string;
};

const getIconByLevel = ( level: AlertProps[ 'level' ] ) => {
	switch ( level ) {
		case 'error':
			return warning;
		case 'warning':
			return warning;
		case 'info':
			return info;
		case 'success':
			return check;
		default:
			return warning;
	}
};

/**
 * Alert component
 *
 * @param {object}    props           - The component properties.
 * @param {string}    props.level     - The alert level: error, warning, info, success.
 * @param {boolean}   props.showIcon  - Whether to show the alert icon.
 * @param {string}    props.className - The wrapper class name.
 * @param {Component} props.children  - The alert content.
 * @return {ReactElement}             The `Alert` component.
 */
const Alert: FC< AlertProps > = ( { level = 'warning', children, showIcon = true, className } ) => {
	const classes = clsx( styles.container, styles[ `is-${ level }` ], className );

	return (
		<div className={ classes }>
			{ showIcon && (
				<div className={ styles[ 'icon-wrapper' ] }>
					<Icon icon={ getIconByLevel( level ) } className={ styles.icon } />
				</div>
			) }
			<div>{ children }</div>
		</div>
	);
};

export default Alert;
