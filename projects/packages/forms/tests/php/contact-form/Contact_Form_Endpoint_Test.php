<?php

namespace Automattic\Jetpack\Forms\ContactForm;

use PHPUnit\Framework\TestCase;
use WorDBless\Options as WorDBless_Options;
use WorDBless\Users as WorDBless_Users;
use WP_REST_Request;
use WP_REST_Server;

/**
 * Unit tests for the REST API endpoints.
 *
 * To run this test, you can use the following command: (from the projects/packages/forms directory)
 *
 * composer test-php tests/php/contact-form/Contact_Form_Endpoint_Test.php
 */
class Contact_Form_Endpoint_Test extends TestCase {

	/**
	 * REST Server object.
	 *
	 * @var WP_REST_Server
	 */
	private $server;

	/**
	 * The current user id.
	 *
	 * @var int
	 */
	private static $user_id;

	/**
	 * The plugin instance.
	 *
	 * @var Contact_Form_Plugin
	 */
	private $plugin;

	/**
	 * Setting up the test.
	 */
	public function setUp(): void {
		parent::setUp();
		global $wp_rest_server;

		$this->plugin = Contact_Form_Plugin::init();

		$wp_rest_server = new WP_REST_Server();
		$this->server   = $wp_rest_server;

		do_action( 'rest_api_init' );

		self::$user_id = wp_insert_user(
			array(
				'user_login' => 'test_admin',
				'user_pass'  => '123',
				'role'       => 'administrator',
			)
		);
		wp_set_current_user( self::$user_id );
	}

	/**
	 * Returning the environment into its initial state.
	 */
	public function tearDown(): void {
		parent::tearDown();
		WorDBless_Options::init()->clear_options();
		WorDBless_Users::init()->clear_all_users();

		unset( $_SERVER['REQUEST_METHOD'] );
		$_GET = array();
	}

	/**
	 * Test GET feedback/filters
	 */
	public function test_get_feedbacks_filters_returns_200() {
		$request  = new WP_REST_Request( 'GET', '/wp/v2/feedback/filters' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertArrayHasKey( 'date', $data );
		$this->assertArrayHasKey( 'source', $data );
	}

	/**
	 * Test GET feedback/filters unautorized.
	 */
	public function test_get_feedbacks_filters_returns_401() {
		wp_set_current_user( 0 );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/feedback/filters' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 401, $response->get_status() );
	}

	/**
	 * Test item schema.
	 */
	public function test_item_schema() {
		$request  = new WP_REST_Request( 'OPTIONS', '/wp/v2/feedback' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$schema_properties = $data['schema']['properties'];
		$this->assertArrayHasKey( 'uid', $schema_properties );
		$this->assertArrayHasKey( 'author_name', $schema_properties );
		$this->assertArrayHasKey( 'author_email', $schema_properties );
		$this->assertArrayHasKey( 'author_url', $schema_properties );
		$this->assertArrayHasKey( 'author_avatar', $schema_properties );
		$this->assertArrayHasKey( 'email_marketing_consent', $schema_properties );
		$this->assertArrayHasKey( 'ip', $schema_properties );
		$this->assertArrayHasKey( 'entry_title', $schema_properties );
		$this->assertArrayHasKey( 'entry_permalink', $schema_properties );
		$this->assertArrayHasKey( 'subject', $schema_properties );
		$this->assertArrayHasKey( 'fields', $schema_properties );
	}

	/**
	 * Test GET feedback/integrations with version 1 format
	 */
	public function test_get_integrations_v1_returns_200() {
		$request = new WP_REST_Request( 'GET', '/wp/v2/feedback/integrations' );
		$request->set_param( 'version', 1 );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		// Verify response code
		$this->assertEquals( 200, $response->get_status() );

		// Verify basic structure (object format for v1)
		$this->assertIsArray( $data );

		// Verify required integrations exist
		$this->assertArrayHasKey( 'akismet', $data );
		$this->assertArrayHasKey( 'creative-mail-by-constant-contact', $data );
		$this->assertArrayHasKey( 'zero-bs-crm', $data );
		$this->assertArrayHasKey( 'google-drive', $data );
		$this->assertArrayHasKey( 'mailpoet', $data );

		// Verify structure of one integration
		$this->assertArrayHasKey( 'type', $data['akismet'] );
		$this->assertArrayHasKey( 'isInstalled', $data['akismet'] );
		$this->assertArrayHasKey( 'isActive', $data['akismet'] );
		$this->assertArrayHasKey( 'isConnected', $data['akismet'] );
		$this->assertArrayHasKey( 'needsConnection', $data['akismet'] );

		// Verify structure of google-drive
		$this->assertArrayHasKey( 'type', $data['google-drive'] );
		$this->assertArrayHasKey( 'isInstalled', $data['google-drive'] );
		$this->assertArrayHasKey( 'isActive', $data['google-drive'] );
		$this->assertArrayHasKey( 'isConnected', $data['google-drive'] );
		$this->assertArrayHasKey( 'needsConnection', $data['google-drive'] );
	}

	/**
	 * Test GET feedback/integrations with version 2 format
	 */
	public function test_get_integrations_v2_returns_200() {
		$request = new WP_REST_Request( 'GET', '/wp/v2/feedback/integrations' );
		$request->set_param( 'version', 2 );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		// Verify response code
		$this->assertEquals( 200, $response->get_status() );

		// Verify basic structure (array format for v2)
		$this->assertIsArray( $data );
		$this->assertNotEmpty( $data, 'Should have at least one integration' );

		// Verify core integrations are present (by id)
		$integration_ids = array_column( $data, 'id' );
		$this->assertContains( 'akismet', $integration_ids );
		$this->assertContains( 'creative-mail-by-constant-contact', $integration_ids );
		$this->assertContains( 'zero-bs-crm', $integration_ids );
		$this->assertContains( 'google-drive', $integration_ids );
		$this->assertContains( 'mailpoet', $integration_ids );

		// Verify structure of each integration
		foreach ( $data as $integration ) {
			$this->assertArrayHasKey( 'id', $integration );
			$this->assertArrayHasKey( 'type', $integration );
			$this->assertArrayHasKey( 'slug', $integration );
			$this->assertArrayHasKey( 'isInstalled', $integration );
			$this->assertArrayHasKey( 'isActive', $integration );
			$this->assertArrayHasKey( 'isConnected', $integration );
			$this->assertArrayHasKey( 'settingsUrl', $integration );
			$this->assertArrayHasKey( 'pluginFile', $integration );
			$this->assertArrayHasKey( 'version', $integration );
			$this->assertArrayHasKey( 'details', $integration );
			$this->assertArrayHasKey( 'needsConnection', $integration );

			// Verify expected data types
			$this->assertIsString( $integration['id'] );
			$this->assertIsString( $integration['type'] );
			$this->assertIsString( $integration['slug'] );
			$this->assertIsBool( $integration['isInstalled'] );
			$this->assertIsBool( $integration['isActive'] );
			$this->assertIsBool( $integration['needsConnection'] );
			$this->assertIsBool( $integration['isConnected'] );
			$this->assertTrue( $integration['settingsUrl'] === null || is_string( $integration['settingsUrl'] ) );
			$this->assertTrue( $integration['pluginFile'] === null || is_string( $integration['pluginFile'] ) );
			$this->assertTrue( $integration['version'] === null || is_string( $integration['version'] ) );
			$this->assertIsArray( $integration['details'] );
		}
	}

	/**
	 * Test GET feedback/integrations unauthorized access
	 */
	public function test_get_integrations_returns_401() {
		wp_set_current_user( 0 );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/feedback/integrations' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 401, $response->get_status() );
	}

	/**
	 * Test GET feedback/integrations/{slug} with a valid integration
	 */
	public function test_get_single_integration_returns_200_and_structure() {
		$request  = new WP_REST_Request( 'GET', '/wp/v2/feedback/integrations/google-drive' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertArrayHasKey( 'type', $data );
		$this->assertArrayHasKey( 'slug', $data );
		$this->assertArrayHasKey( 'isInstalled', $data );
		$this->assertArrayHasKey( 'isActive', $data );
		$this->assertArrayHasKey( 'isConnected', $data );
		$this->assertArrayHasKey( 'settingsUrl', $data );
		$this->assertArrayHasKey( 'pluginFile', $data );
		$this->assertArrayHasKey( 'version', $data );
		$this->assertArrayHasKey( 'details', $data );
		$this->assertArrayHasKey( 'needsConnection', $data );
	}

	/**
	 * Test GET feedback/integrations/{slug} with an invalid integration
	 */
	public function test_get_single_integration_returns_400_for_invalid_slug() {
		$request  = new WP_REST_Request( 'GET', '/wp/v2/feedback/integrations/not-a-real-integration' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 400, $response->get_status() );
	}

	/**
	 * Test GET feedback/integrations/{slug} unauthorized access
	 */
	public function test_get_single_integration_returns_401_for_unauthorized() {
		wp_set_current_user( 0 );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/feedback/integrations/google-drive' );
		$response = $this->server->dispatch( $request );
		$this->assertEquals( 401, $response->get_status() );
	}
}
