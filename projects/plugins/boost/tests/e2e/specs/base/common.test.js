import { test, expect } from '_jetpack-e2e-commons/fixtures/base-test.js';
import { execWpCommand } from '_jetpack-e2e-commons/helpers/utils-helper.js';
import { DashboardPage, PluginsPage, Sidebar } from '_jetpack-e2e-commons/pages/wp-admin/index.js';
import playwrightConfig from '_jetpack-e2e-commons/playwright.config.mjs';
import { boostPrerequisitesBuilder } from '../../lib/env/prerequisites.js';
import { JetpackBoostPage } from '../../lib/pages/index.js';

test.describe( 'Common tests', () => {
	let page;

	test.beforeAll( async ( { browser } ) => {
		page = await browser.newPage( playwrightConfig.use );
		await boostPrerequisitesBuilder( page ).withCleanEnv().withConnection( true ).build();
	} );

	test.afterAll( async () => {
		await page.close();
	} );

	test( 'Click on the plugins page should navigate to Boost settings page', async () => {
		await DashboardPage.visit( page );
		await ( await Sidebar.init( page ) ).selectInstalledPlugins();
		await ( await PluginsPage.init( page ) ).clickOnJetpackBoostSettingsLink();
		expect( page.url(), "URL should contain 'page=jetpack-boost" ).toContain(
			'page=jetpack-boost'
		);
	} );

	test( 'Click on the sidebar Boost Jetpack submenu should navigate to Boost settings page', async () => {
		await DashboardPage.visit( page );
		await ( await Sidebar.init( page ) ).selectJetpackBoost();
		expect( page.url(), "URL should contain 'page=jetpack-boost" ).toContain(
			'page=jetpack-boost'
		);
	} );

	test( 'Deactivating the plugin should clear Critical CSS and Dismissed Recommendation notice option', async () => {
		// Generate Critical CSS to ensure that on plugin deactivation it is cleared.
		// TODO: Also should make sure that a Critical CSS recommendation is dismissed to check that the options does not exist after deactivation of the plugin.
		await boostPrerequisitesBuilder( page )
			.withCleanEnv( true )
			.withActiveModules( [ 'critical_css' ] )
			.build();
		const jetpackBoostPage = await JetpackBoostPage.visit( page );

		// Wait for generation progress UI first
		expect(
			await jetpackBoostPage.waitForCriticalCssGenerationProgressUIVisibility(),
			'Critical CSS generation progress indicator should be visible'
		).toBeTruthy();

		// Then wait for meta info to be visible
		expect(
			await jetpackBoostPage.waitForCriticalCssMetaInfoVisibility(),
			'Critical CSS meta info should be visible'
		).toBeTruthy();

		await DashboardPage.visit( page );
		await ( await Sidebar.init( page ) ).selectInstalledPlugins();

		// Deactivate boost
		const pluginsPage = await PluginsPage.init( page );
		await pluginsPage.deactivatePlugin( 'jetpack-boost' );
		await pluginsPage.click( 'text=Just Deactivate' );

		let result;
		result = await execWpCommand(
			'db query \'SELECT ID FROM wp_posts WHERE post_type LIKE "%jb_store_%"\' --skip-column-names'
		);
		expect( result.length, 'No DB records are found' ).toBe( 0 );
		result = await execWpCommand(
			'db query \'SELECT option_id FROM wp_options WHERE option_name = "jb-critical-css-dismissed-recommendations"\' --skip-column-names'
		);
		expect( result.length, 'No DB records are found' ).toBe( 0 );

		// Ensure the plugin is activated again so future tests can run reset commands via withCleanEnv.
		await execWpCommand( 'plugin activate jetpack-boost' );
	} );
} );
