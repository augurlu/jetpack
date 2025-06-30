import ChevronDown from '$svg/chevron-down';
import ChevronUp from '$svg/chevron-up';
import { Button } from '@automattic/jetpack-components';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import { useState } from 'react';
import useMeasure from 'react-use-measure';
import styles from './folding-element.module.scss';
import type { FC, ReactNode } from 'react';

type PropTypes = {
	labelExpandedText: string;
	labelCollapsedText: string;
	isExpanded?: boolean;
	children?: ReactNode;
	onExpand?: ( isExpanded: boolean ) => void;
};

const FoldingElement: FC< PropTypes > = ( {
	labelExpandedText,
	labelCollapsedText,
	isExpanded = false,
	children = [],
	onExpand,
} ) => {
	const [ expanded, setExpanded ] = useState( isExpanded );
	const label = expanded ? labelCollapsedText : labelExpandedText;

	const [ ref, { height } ] = useMeasure();
	const animationStyles = useSpring( {
		height: expanded ? height : 0,
	} );

	const handleOnExpand = () => {
		const newValue = ! expanded;
		setExpanded( newValue );
		if ( onExpand ) {
			onExpand( newValue );
		}
	};

	return (
		<>
			<Button
				variant="link"
				className={ clsx( styles[ 'foldable-element-control' ], {
					visible: expanded,
				} ) }
				onClick={ handleOnExpand }
			>
				{ label }
				{ expanded ? <ChevronUp /> : <ChevronDown /> }
			</Button>

			<animated.div
				className={ expanded ? styles.expanded : '' }
				style={ {
					overflow: 'hidden',
					...animationStyles,
				} }
			>
				<div ref={ ref } className={ styles[ 'fade-in' ] }>
					{ children }
				</div>
			</animated.div>
		</>
	);
};

export default FoldingElement;
