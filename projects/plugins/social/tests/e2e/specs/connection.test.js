import { prerequisitesBuilder } from '_jetpack-e2e-commons/env/prerequisites.js';
import { test, expect } from '_jetpack-e2e-commons/fixtures/base-test.js';
import { connect } from '../flows/index.js';
import { JetpackSocialPage } from '../pages/index.js';

test.beforeEach( async ( { page } ) => {
	await prerequisitesBuilder( page )
		.withCleanEnv()
		.withActivePlugins( [ 'jetpack-social' ] )
		.withLoggedIn( true )
		.withWpComLoggedIn( true )
		.build();
} );

test( 'Jetpack Social connection', async ( { page } ) => {
	await test.step( 'Can connect wordpress.com account to Jetpack Social', async () => {
		await connect( page );
		const socialPage = await JetpackSocialPage.init( page );
		expect( await socialPage.isConnected(), 'Jetpack Social should be connected' ).toBeTruthy();
	} );
} );
