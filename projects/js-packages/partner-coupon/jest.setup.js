import { toHaveBeenCalledAfter } from 'jest-extended';

expect.extend( { toHaveBeenCalledAfter } );

window.JP_CONNECTION_INITIAL_STATE = {
	userConnectionData: {
		currentUser: {
			wpcomUser: { Id: 99999, login: 'bobsacramento', display_name: 'Bob Sacrmaneto' },
		},
	},
};
