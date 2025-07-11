import { test, expect } from '_jetpack-e2e-commons/fixtures/base-test.js';
import playwrightConfig from '_jetpack-e2e-commons/playwright.config.mjs';
import { boostPrerequisitesBuilder } from '../../lib/env/prerequisites.js';
import { JetpackBoostPage } from '../../lib/pages/index.js';

const modules = [
	// ['MODULE_NAME', 'DEFAULT STATE'],
	[ 'critical_css', 'disabled' ],
	[ 'render_blocking_js', 'disabled' ],
];

test.describe.serial( 'Modules', () => {
	let page;
	let jetpackBoostPage;

	test.beforeAll( async ( { browser } ) => {
		page = await browser.newPage( playwrightConfig.use );

		await boostPrerequisitesBuilder( page )
			.withConnection( true )
			.withInactiveModules( [ 'critical_css', 'render_blocking_js' ] )
			.build();
		jetpackBoostPage = await JetpackBoostPage.visit( page );
	} );

	modules.forEach( ( [ moduleSlug, moduleState ] = module ) => {
		test( `The ${ moduleSlug } module should be ${ moduleState } by default`, async () => {
			expect(
				await jetpackBoostPage.isModuleEnabled( moduleSlug ),
				`${ moduleSlug } should be enabled`
			).toEqual( moduleState === 'enabled' );
		} );

		test( `The ${ moduleSlug } module state should toggle to an inverse state`, async () => {
			await jetpackBoostPage.toggleModule( moduleSlug );
			expect(
				await jetpackBoostPage.isModuleEnabled( moduleSlug ),
				`${ moduleSlug } should not be enabled`
			).toEqual( moduleState !== 'enabled' );
		} );

		test( `The ${ moduleSlug } module state should revert back to original state`, async () => {
			await jetpackBoostPage.toggleModule( moduleSlug );
			expect(
				await jetpackBoostPage.isModuleEnabled( moduleSlug ),
				`${ moduleSlug } should be enabled`
			).toEqual( moduleState === 'enabled' );
		} );
	} );
} );
