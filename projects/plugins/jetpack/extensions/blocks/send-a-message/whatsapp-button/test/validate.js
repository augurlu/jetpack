import { settings } from '../';
import runBlockFixtureTests from '../../../../shared/test/block-fixtures';
import parentMetadata from '../../block.json';
import edit from '../../edit';
import save from '../../save';

// Mock @automattic/jetpack-script-data functions to allow isWpcomPlatformSite to be correctly used.
jest.mock( '@automattic/jetpack-script-data', () => {
	const isWpcomPlatformSite = jest.fn().mockReturnValue( false );
	return {
		isWpcomPlatformSite,
	};
} );

// Need to include all the blocks involved in rendering this block.
// The main block should be the first in the array.
const blocks = [
	{ name: 'jetpack/whatsapp-button', settings },
	{
		name: 'jetpack/send-a-message',
		settings: {
			...parentMetadata,
			save,
			edit,
		},
	},
];

runBlockFixtureTests( 'jetpack/whatsapp-button', blocks, __dirname );
