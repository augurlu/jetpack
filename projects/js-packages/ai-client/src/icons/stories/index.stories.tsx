/**
 * External dependencies
 */
import { Icon } from '@wordpress/components';
/**
 * Internal dependencies
 */
import * as allIcons from '../index.ts';
import styles from './style.module.scss';
/**
 * Types
 */
import type { Meta } from '@storybook/react';
import type { ComponentType } from 'react';

interface AIControlStoryMeta extends Meta< typeof allIcons > {
	title?: string;
	component?: ComponentType;
}

const meta: AIControlStoryMeta = {
	title: 'JS Packages/AI Client/Icons',
	component: allIcons as unknown as ComponentType,
	parameters: {},
} satisfies Meta< typeof allIcons >;

/**
 * Icons story components.
 *
 * @return {object} - story component
 */
function IconsStory() {
	return (
		<div className={ styles[ 'icons-container' ] }>
			{ Object.entries( allIcons ).map( ( [ name, icon ] ) => {
				return (
					<div key={ name } className={ styles[ 'icon-container' ] }>
						<Icon icon={ icon } size={ 32 } />
						<div className={ styles[ 'icon-name' ] }>{ name }</div>
					</div>
				);
			} ) }
		</div>
	);
}

const Template = args => <IconsStory { ...args } />;

const DefaultArgs = {};
export const Default = Template.bind( {} );
Default.args = DefaultArgs;

export default meta;
