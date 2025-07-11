import { Button } from '@automattic/jetpack-components';
import ButtonGroup from '../index.jsx';

export default {
	title: 'Plugins/Protect/Button Group',
	component: ButtonGroup,
	argTypes: {},
};

const Template = args => (
	<ButtonGroup { ...args }>
		<Button>Button 1</Button>
		<Button>Button 2</Button>
	</ButtonGroup>
);
export const Default = Template.bind( {} );
