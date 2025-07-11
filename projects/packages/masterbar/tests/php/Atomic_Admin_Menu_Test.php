<?php
/**
 * Tests for Atomic_Admin_Menu class.
 *
 * @package automattic/jetpack-masterbar
 */

namespace Automattic\Jetpack\Masterbar;

use Automattic\Jetpack\Status;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use WorDBless\Options as WorDBless_Options;
use WorDBless\Users as WorDBless_Users;

require_once __DIR__ . '/data/admin-menu.php';

/**
 * Class Atomic_Admin_Menu_Test.
 *
 * @covers Automattic\Jetpack\Masterbar\Atomic_Admin_Menu
 */
#[CoversClass( Atomic_Admin_Menu::class )]
class Atomic_Admin_Menu_Test extends TestCase {

	/**
	 * Menu data fixture.
	 *
	 * @var array
	 */
	public static $menu_data;

	/**
	 * Submenu data fixture.
	 *
	 * @var array
	 */
	public static $submenu_data;

	/**
	 * Test domain.
	 *
	 * @var string
	 */
	public static $domain;

	/**
	 * Whether this testsuite is run on WP.com.
	 *
	 * @var bool
	 */
	public static $is_wpcom;

	/**
	 * Admin menu instance.
	 *
	 * @var Atomic_Admin_Menu
	 */
	public static $admin_menu;

	/**
	 * Mock user ID.
	 *
	 * @var int
	 */
	private static $user_id = 0;

	/**
	 * Set up each test.
	 */
	public function setUp(): void {
		parent::setUp();
		global $menu, $submenu;

		static::$domain       = ( new Status() )->get_site_suffix();
		static::$menu_data    = get_menu_fixture();
		static::$submenu_data = get_submenu_fixture();

		static::$user_id = wp_insert_user(
			array(
				'user_login' => 'test_admin',
				'user_pass'  => '123',
				'role'       => 'administrator',
			)
		);

		wp_set_current_user( static::$user_id );

		// Initialize in set_up so it registers hooks for every test.
		static::$admin_menu = Atomic_Admin_Menu::get_instance();
		$menu               = static::$menu_data;
		$submenu            = static::$submenu_data;
	}

	/**
	 * Returning the environment into its initial state.
	 */
	public function tearDown(): void {
		parent::tearDown();
		WorDBless_Options::init()->clear_options();
		WorDBless_Users::init()->clear_all_users();
	}

	/**
	 * Tests add_new_site_link.
	 */
	public function test_add_new_site_link() {
		global $menu;

		// Set jetpack user data.
		update_user_option( static::$user_id, 'wpcom_site_count', 1 );

		static::$admin_menu->add_new_site_link();

		$new_site_menu_item = array(
			'Add New Site',
			'read',
			'https://wordpress.com/start?ref=calypso-sidebar',
			'Add New Site',
			'menu-top toplevel_page_https://wordpress.com/start?ref=calypso-sidebar',
			'toplevel_page_https://wordpress.com/start?ref=calypso-sidebar',
			'dashicons-plus-alt',
		);
		$this->assertSame( array_pop( $menu ), $new_site_menu_item );

		delete_user_option( static::$user_id, 'wpcom_site_count' );
	}

	/**
	 * Tests get_preferred_view
	 */
	public function test_get_preferred_view() {
		$this->assertSame( 'classic', static::$admin_menu->get_preferred_view( 'export.php' ) );
	}

	/**
	 * Tests add_upgrades_menu
	 */
	public function test_add_upgrades_menu() {
		global $submenu;

		static::$admin_menu->add_upgrades_menu();

		$this->assertSame( 'https://wordpress.com/plans/' . static::$domain, $submenu['paid-upgrades.php'][1][2] );
		$this->assertSame( 'https://wordpress.com/domains/manage/' . static::$domain, $submenu['paid-upgrades.php'][2][2] );

		/** This filter is already documented in modules/masterbar/admin-menu/class-atomic-admin-menu.php */
		if ( apply_filters( 'jetpack_show_wpcom_upgrades_email_menu', false ) ) {
			$this->assertSame( 'https://wordpress.com/email/' . static::$domain, $submenu['paid-upgrades.php'][3][2] );
			$this->assertSame( 'https://wordpress.com/purchases/subscriptions/' . static::$domain, $submenu['paid-upgrades.php'][4][2] );
		} else {
			$this->assertSame( 'https://wordpress.com/purchases/subscriptions/' . static::$domain, $submenu['paid-upgrades.php'][3][2] );
		}
	}

	/**
	 * Tests add_options_menu
	 */
	public function test_add_options_menu() {
		global $submenu;

		static::$admin_menu->add_options_menu();

		if ( function_exists( 'wpcom_site_has_feature' ) && wpcom_site_has_feature( \WPCOM_Features::ATOMIC ) ) {
			$this->assertSame( 'https://wordpress.com/hosting-config/' . static::$domain, $submenu['options-general.php'][11][2] );
		} else {
			$this->assertSame( 'https://wordpress.com/hosting-features/' . static::$domain, $submenu['options-general.php'][11][2] );
		}
	}

	/**
	 * Tests add_users_menu
	 */
	public function test_add_users_menu() {
		global $submenu;

		static::$admin_menu->add_users_menu();
		$this->assertSame( 'https://wordpress.com/people/team/' . static::$domain, $submenu['users.php'][0][2] );
		$this->assertSame( 'user-new.php', $submenu['users.php'][2][2] );
		$this->assertSame( 'profile.php', $submenu['users.php'][3][2] );
		$this->assertSame( 'https://wordpress.com/subscribers/' . static::$domain, $submenu['users.php'][4][2] );
		$this->assertSame( 'https://wordpress.com/me/account', $submenu['users.php'][5][2] );
	}

	/**
	 * Tests remove_gutenberg_menu
	 */
	public function test_remove_gutenberg_menu() {
		global $menu;
		static::$admin_menu->remove_gutenberg_menu();

		// Gutenberg plugin menu should not be visible.
		$this->assertArrayNotHasKey( 101, $menu );
	}

	/**
	 * Tests add_plugins_menu
	 */
	public function test_add_plugins_menu() {
		global $submenu;
		'@phan-var non-empty-array $submenu';
		$this->assertSame( 'plugin-install.php', $submenu['plugins.php'][10][2] );

		if ( ! is_multisite() ) {
			static::$admin_menu->add_plugins_menu();

			// Make sure that initial menu item is hidden.
			$this->assertSame( 'hide-if-js', $submenu['plugins.php'][1][4] );
			// Make sure that the new menu item is inserted.
			$this->assertSame( 'https://wordpress.com/plugins/' . static::$domain, $submenu['plugins.php'][0][2] );
			// Make sure that Installed Plugins menu item is still in place.
			$this->assertSame( 'plugins.php', $submenu['plugins.php'][2][2] );
		}
	}

	/**
	 * Tests add_tools_menu
	 */
	public function test_add_site_monitoring_menu() {
		global $submenu;

		static::$admin_menu->add_tools_menu();
		$menu_position = 7;

		$this->assertSame( 'https://wordpress.com/site-monitoring/' . static::$domain, $submenu['tools.php'][ $menu_position ][2] );
	}

	/**
	 * Tests add_github_deployments_menu
	 */
	public function test_add_github_deployments_menu() {
		global $submenu;

		static::$admin_menu->add_tools_menu();
		$links = wp_list_pluck( array_values( $submenu['tools.php'] ), 2 );

		$this->assertContains( 'https://wordpress.com/github-deployments/' . static::$domain, $links );
	}
}
