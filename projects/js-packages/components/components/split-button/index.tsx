import { Button, Flex, DropdownMenu } from '@wordpress/components';
import styles from './style.module.scss';
import { SplitButtonProps } from './types.ts';
import type { FC } from 'react';

const DownIcon = () => (
	<svg width="15" height="9" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="10 9 4 7">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="m18.004 10.555-6.005 5.459-6.004-5.459 1.009-1.11 4.995 4.542 4.996-4.542 1.009 1.11Z"
		/>
	</svg>
);

const SplitButton: FC< SplitButtonProps > = ( {
	variant,
	controls,
	popoverProps,
	toggleProps,
	label,
	...buttonProps
} ) => {
	return (
		<Flex className={ styles[ 'split-button' ] }>
			<div role="group" className="components-button-group">
				<Button variant={ variant } { ...buttonProps } className={ styles.button } />
				<DropdownMenu
					toggleProps={ { variant, className: styles.button, ...toggleProps } }
					popoverProps={ { noArrow: false, ...popoverProps } }
					icon={ <DownIcon /> }
					disableOpenOnArrowDown={ true }
					controls={ controls }
					label={ label }
				/>
			</div>
		</Flex>
	);
};

export default SplitButton;
