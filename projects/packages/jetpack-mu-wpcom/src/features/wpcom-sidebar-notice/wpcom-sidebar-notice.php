<?php
/**
 * WordPress.com sidebar notice
 *
 * Adds WordPress.com upsell notice to WordPress sidebar.
 *
 * @package automattic/jetpack-mu-wpcom
 */

use Automattic\Jetpack\Connection\Manager as Connection_Manager;
use Automattic\Jetpack\Jetpack_Mu_Wpcom;

remove_filter( 'pre_option_wpcom_admin_interface', 'wpcom_admin_interface_pre_get_option' );
$is_wp_admin = get_option( 'wpcom_admin_interface' ) === 'wp-admin';
add_filter( 'pre_option_wpcom_admin_interface', 'wpcom_admin_interface_pre_get_option', 10 );

if ( ! $is_wp_admin ) {
	return;
}

/**
 * Enqueue assets needed by the WordPress.com sidebar notice.
 */
function wpcom_enqueue_sidebar_notice_assets() {
	$data = wpcom_get_sidebar_notice_data();
	if ( ! $data ) {
		return;
	}

	$asset_file = include Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-sidebar-notice/wpcom-sidebar-notice.asset.php';

	wp_enqueue_script(
		'wpcom-sidebar-notice',
		plugins_url( 'build/wpcom-sidebar-notice/wpcom-sidebar-notice.js', Jetpack_Mu_Wpcom::BASE_FILE ),
		$asset_file['dependencies'] ?? array(),
		$asset_file['version'] ?? filemtime( Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-sidebar-notice/wpcom-sidebar-notice.js' ),
		array(
			'strategy'  => 'defer',
			'in_footer' => true,
		)
	);

	wp_enqueue_style(
		'wpcom-sidebar-notice',
		plugins_url( 'build/wpcom-sidebar-notice/wpcom-sidebar-notice.css', Jetpack_Mu_Wpcom::BASE_FILE ),
		array(),
		$asset_file['version'] ?? filemtime( Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-sidebar-notice/wpcom-sidebar-notice.css' )
	);

	$inline_script = 'const wpcomSidebarNoticeData = ' . wp_json_encode( $data ) . ';';
	wp_add_inline_script( 'wpcom-sidebar-notice', $inline_script, 'before' );
}
add_action( 'admin_enqueue_scripts', 'wpcom_enqueue_sidebar_notice_assets' );

/**
 * Returns the first available sidebar notice.
 *
 * @return array | null
 */
function wpcom_get_sidebar_notice() {
	static $cached_notice = null;
	static $cache_loaded  = false;

	if ( $cache_loaded ) {
		return $cached_notice;
	}

	$message_path = 'calypso:sites:sidebar_notice';

	if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
		require_lib( 'jetpack-jitm/jitm-engine' );
		$jitm_engine = new \JITM\Engine();

		$current_user = wp_get_current_user();
		$user_id      = $current_user->ID;
		$user_roles   = implode( ',', $current_user->roles );
		$query_string = array( 'message_path' => $message_path );

		$message = $jitm_engine->get_top_messages( $message_path, $user_id, $user_roles, $query_string );
	} else {
		$jitm    = \Automattic\Jetpack\JITMS\JITM::get_instance();
		$message = $jitm->get_messages( $message_path, wp_json_encode( array( 'message_path' => $message_path ) ), false );
	}

	$cache_loaded = true;

	if ( ! isset( $message[0] ) ) {
		$cached_notice = null;
		return null;
	}

	// Serialize message as object (on Simple sites we have an array, on Atomic sites we have an object).
	$message = json_decode( wp_json_encode( $message[0] ) );

	$cached_notice = array(
		'content'       => $message->content->message,
		'cta'           => $message->CTA->message, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		'link'          => $message->CTA->link, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		'dismissible'   => $message->is_dismissible,
		'feature_class' => $message->feature_class,
		'id'            => $message->id,
		'tracks'        => $message->tracks ?? null,
	);

	return $cached_notice;
}

/**
 * Get sidebar notice data.
 */
function wpcom_get_sidebar_notice_data() {
	$notice = wpcom_get_sidebar_notice();
	if ( ! $notice ) {
		return;
	}

	$link = ! empty( $notice['link'] ) ? $notice['link'] : '';
	if ( str_starts_with( $link, '/' ) ) {
		$link = 'https://wordpress.com' . $link;
	}

	$user_id    = null;
	$user_login = null;

	if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
		global $current_user;
		$user_id    = $current_user->ID;
		$user_login = $current_user->user_login;
	} else {
		$connection_manager = new Connection_Manager();
		$wpcom_user_data    = $connection_manager->get_connected_user_data();
		if ( $wpcom_user_data ) {
			$user_id    = $wpcom_user_data['ID'];
			$user_login = $wpcom_user_data['login'];
		}
	}

	return array(
		'dismissNonce' => wp_create_nonce( 'wpcom_dismiss_sidebar_notice' ),
		'tracks'       => $notice['tracks'] ?? null,
		'user'         => array(
			'ID'       => $user_id,
			'username' => $user_login,
		),
	);
}

/**
 * Add a menu page to the admin menu.
 */
function wpcom_add_sidebar_notice_menu_page() {
	$notice = wpcom_get_sidebar_notice();
	if ( ! $notice ) {
		return;
	}

	$link = ! empty( $notice['link'] ) ? $notice['link'] : '';
	if ( str_starts_with( $link, '/' ) ) {
		$link = 'https://wordpress.com' . $link;
	}

	echo '<li id="toplevel_page_site-notices" class="toplevel_page_site-notices" data-id="' . esc_attr( $notice['id'] ) . '" data-feature-class="' . esc_attr( $notice['feature_class'] ) . '">';
	echo '<div class="upsell_banner">';
	echo '<div class="upsell_banner__text">' . wp_kses( $notice['content'] ?? '', array() ) . '</div>';
	echo '<a href="' . esc_url( $link ) . '" class="upsell_banner__action button">' . wp_kses( $notice['cta'] ?? '', array() ) . '</a>';
	echo $notice['dismissible'] ? '<button type="button" class="upsell_banner__dismiss button button-link">' . esc_html__( 'Dismiss', 'jetpack-mu-wpcom' ) . '</button>' : '';
	echo '</div>';
	echo '</li>';
	echo '<script>(function(el){el.parentNode.prepend(el)})(document.getElementById( "toplevel_page_site-notices" ))</script>';
}
add_action( 'adminmenu', 'wpcom_add_sidebar_notice_menu_page' );

/**
 * Handle AJAX requests to dismiss a sidebar notice.
 */
function wpcom_dismiss_sidebar_notice() {
	check_ajax_referer( 'wpcom_dismiss_sidebar_notice' );
	if ( isset( $_REQUEST['id'] ) && isset( $_REQUEST['feature_class'] ) ) {
		$id            = sanitize_text_field( wp_unslash( $_REQUEST['id'] ) );
		$feature_class = sanitize_text_field( wp_unslash( $_REQUEST['feature_class'] ) );
		if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
			require_lib( 'jetpack-jitm/jitm-engine' );
			\JITM\Engine::dismiss( $id, $feature_class );
		} else {
			$jitm = \Automattic\Jetpack\JITMS\JITM::get_instance();
			$jitm->dismiss( $id, $feature_class );
		}
	}
	wp_die();
}
add_action( 'wp_ajax_wpcom_dismiss_sidebar_notice', 'wpcom_dismiss_sidebar_notice' );
