<?php
/**
 * Show links back to WordPress.com for them to manage their WordPress.com profile.
 *
 * @package automattic/jetpack-mu-wpcom
 */

use Automattic\Jetpack\Jetpack_Mu_Wpcom;

require_once __DIR__ . '/../../utils.php';

/**
 * Adds a link to the WordPress.com profile settings page.
 */
function wpcom_profile_settings_add_links_to_wpcom() {
	$asset_file = include Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-profile-settings-link-to-wpcom/wpcom-profile-settings-link-to-wpcom.asset.php';
	wp_enqueue_script(
		'wpcom-profile-settings-link-to-wpcom',
		plugins_url( 'build/wpcom-profile-settings-link-to-wpcom/wpcom-profile-settings-link-to-wpcom.js', Jetpack_Mu_Wpcom::BASE_FILE ),
		$asset_file['dependencies'] ?? array(),
		$asset_file['version'] ?? filemtime( Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-profile-settings-link-to-wpcom/wpcom-profile-settings-link-to-wpcom.js' ),
		true
	);

	$is_wpcom_atomic = is_woa_site();

	wp_localize_script(
		'wpcom-profile-settings-link-to-wpcom',
		'wpcomProfileSettingsLinkToWpcom',
		array(
			'language'      => array(
				'link' => esc_url( 'https://wordpress.com/me/account' ),
				'text' => __( 'Manage on WP.com ↗', 'jetpack-mu-wpcom' ),
			),
			'name'          => array(
				'link' => esc_url( 'https://wordpress.com/me' ),
				'text' => __( 'Manage on WP.com ↗', 'jetpack-mu-wpcom' ),
			),
			'website'       => array(
				'link' => esc_url( 'https://wordpress.com/me' ),
				'text' => __( 'Manage on WP.com ↗', 'jetpack-mu-wpcom' ),
			),
			'bio'           => array(
				'link' => esc_url( 'https://wordpress.com/me' ),
				'text' => __( 'Manage on WP.com ↗', 'jetpack-mu-wpcom' ),
			),
			'email'         => array(
				'link' => esc_url( 'https://wordpress.com/me/account' ),
				'text' => $is_wpcom_atomic ? __( 'Or manage your WP.com account email ↗', 'jetpack-mu-wpcom' ) : __( 'Manage on WP.com ↗', 'jetpack-mu-wpcom' ),
			),
			'password'      => array(
				'link' => esc_url( 'https://wordpress.com/me/security' ),
				'text' => $is_wpcom_atomic ? __( 'Or manage your WP.com account password ↗', 'jetpack-mu-wpcom' ) : __( 'Manage on WP.com ↗', 'jetpack-mu-wpcom' ),
			),
			'isWpcomAtomic' => $is_wpcom_atomic,
		)
	);
}
add_action( 'profile_personal_options', 'wpcom_profile_settings_add_links_to_wpcom' );
