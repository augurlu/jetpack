<?php
/**
 * WordPress.com admin bar
 *
 * Modifies the WordPress admin bar with WordPress.com-specific stuff.
 *
 * @package automattic/jetpack-mu-wpcom
 */

use Automattic\Jetpack\Connection\Manager as Connection_Manager;
use Automattic\Jetpack\Jetpack_Mu_Wpcom;

// The $icon-color variable for admin color schemes.
// See: https://github.com/WordPress/wordpress-develop/blob/679cc0c4a261a77bd8fdb140cd9b0b2ff80ebf37/src/wp-admin/css/colors/_variables.scss#L9
// Only Core schemes are listed here. Calypso schemes all use #ffffff.
const WPCOM_ADMIN_ICON_COLORS = array(
	'blue'      => '#e5f8ff',
	'coffee'    => '#f3f2f1',
	'ectoplasm' => '#ece6f6',
	'midnight'  => '#f3f2f1',
	'fresh'     => '#a7aaad',
	'ocean'     => '#f2fcff',
	'light'     => '#999',
	'modern'    => '#f3f1f1',
	'sunrise'   => '#f3f1f1',
);

/**
 * Adds the origin_site_id query parameter to a URL.
 *
 * @param string $url The URL to add the query param to.
 * @return string The URL with the origin_site_id query parameter mey be added.
 */
function maybe_add_origin_site_id_to_url( $url ) {
	$site_id = Connection_Manager::get_site_id();
	if ( is_wp_error( $site_id ) ) {
		return $url;
	}

	// Add query param to URL only for users who can access wp-admin.
	if ( ! is_user_member_of_blog() ) {
		return $url;
	}

	return add_query_arg( 'origin_site_id', $site_id, $url );
}

/**
 * Enqueue assets needed by the WordPress.com admin bar.
 */
function wpcom_enqueue_admin_bar_assets() {
	wp_enqueue_style(
		'wpcom-admin-bar',
		plugins_url( 'build/wpcom-admin-bar/wpcom-admin-bar.css', Jetpack_Mu_Wpcom::BASE_FILE ),
		array(),
		Jetpack_Mu_Wpcom::PACKAGE_VERSION
	);

	/**
	 * Force the Atomic debug bar menu to be the first menu at the top-right.
	 */
	if ( defined( 'AT_PROXIED_REQUEST' ) && AT_PROXIED_REQUEST ) {
		wp_add_inline_style(
			'wpcom-admin-bar',
			<<<CSS
				#wpadminbar .quicklinks #wp-admin-bar-top-secondary {
					display: flex;
				}

				#wpadminbar .quicklinks #wp-admin-bar-top-secondary #wp-admin-bar-debug-bar {
					order: -1;
				}
CSS
		);
	}

	$admin_color      = is_admin() ? get_user_option( 'admin_color' ) : 'fresh';
	$admin_icon_color = WPCOM_ADMIN_ICON_COLORS[ $admin_color ] ?? '#ffffff';

	// Force the icon colors to have desktop color even on mobile viewport.
	wp_add_inline_style(
		'wpcom-admin-bar',
		<<<CSS
			#wpadminbar.mobile .quicklinks li:not(#wpwrap.wp-responsive-open #wp-admin-bar-menu-toggle) .ab-icon:before,
			#wpadminbar.mobile .quicklinks li:not(#wpwrap.wp-responsive-open #wp-admin-bar-menu-toggle) .ab-item:before {
				color: $admin_icon_color !important;
			}
CSS
	);

	// Force wpcom icons to have consistent color.
	wp_add_inline_style(
		'wpcom-admin-bar',
		<<<CSS
			:where(#wpadminbar .ab-icon) {
				color: $admin_icon_color;
			}
CSS
	);
}
add_action( 'wp_enqueue_scripts', 'wpcom_enqueue_admin_bar_assets' );
add_action( 'admin_enqueue_scripts', 'wpcom_enqueue_admin_bar_assets' );

/**
 * Render the admin bar in user locale even on frontend screens.
 */
function wpcom_always_use_user_locale() {
	if ( is_admin() || ! is_admin_bar_showing() ) {
		return;
	}

	$site_locale = get_locale();
	$user_locale = get_user_locale();

	if ( $site_locale !== $user_locale ) {
		switch_to_locale( $user_locale );
		add_action(
			'wp_after_admin_bar_render',
			function () use ( $site_locale ) {
				switch_to_locale( $site_locale );
			}
		);
	}
}
add_action( 'admin_bar_menu', 'wpcom_always_use_user_locale', -1 );

/**
 * Replaces the WP logo with WP.com logo.
 *
 * @param WP_Admin_Bar $wp_admin_bar The WP_Admin_Bar core object.
 */
function wpcom_replace_wp_logo_with_wpcom_logo_menu( $wp_admin_bar ) {
	$about_node      = $wp_admin_bar->get_node( 'about' );
	$contribute_node = $wp_admin_bar->get_node( 'contribute' );

	foreach ( $wp_admin_bar->get_nodes() as $node ) {
		if ( $node->parent === 'wp-logo' || $node->parent === 'wp-logo-external' ) {
			$wp_admin_bar->remove_node( $node->id );
		}
	}
	$wp_admin_bar->remove_node( 'wp-logo' );
	$wp_admin_bar->add_node(
		array(
			'id'    => 'wpcom-logo',
			'title' => '<span class="ab-icon" aria-hidden="true"></span><span class="screen-reader-text">' .
						/* translators: Hidden accessibility text. */
						__( 'All Sites', 'jetpack-mu-wpcom' ) .
						'</span>',
			'href'  => maybe_add_origin_site_id_to_url( 'https://wordpress.com/sites' ),
			'meta'  => array(
				'menu_title' => __( 'All Sites', 'jetpack-mu-wpcom' ),
			),
		)
	);

	$wp_admin_bar->add_node(
		array(
			'parent' => 'wpcom-logo',
			'id'     => 'wpcom-sites',
			'title'  => __( 'Sites', 'jetpack-mu-wpcom' ),
			'href'   => maybe_add_origin_site_id_to_url( 'https://wordpress.com/sites' ),
		)
	);

	$wp_admin_bar->add_node(
		array(
			'parent' => 'wpcom-logo',
			'id'     => 'wpcom-domains',
			'title'  => __( 'Domains', 'jetpack-mu-wpcom' ),
			'href'   => maybe_add_origin_site_id_to_url( 'https://wordpress.com/domains/manage' ),
		)
	);

	if ( ! ( defined( 'IS_WPCOM' ) && IS_WPCOM ) ) {
		$wp_admin_bar->add_group(
			array(
				'parent' => 'wpcom-logo',
				'id'     => 'wpcom-logo-external',
				'meta'   => array(
					'class' => 'ab-sub-secondary',
				),
			)
		);

		if ( $about_node ) {
			$about_node->parent = 'wpcom-logo-external';
			$wp_admin_bar->add_node( (array) $about_node );
		}
		if ( $contribute_node ) {
			$contribute_node->parent = 'wpcom-logo-external';
			$wp_admin_bar->add_node( (array) $contribute_node );
		}
	}
}
add_action( 'admin_bar_menu', 'wpcom_replace_wp_logo_with_wpcom_logo_menu', 11 );

/**
 * Adds the Cart menu to the WordPress admin bar.
 *
 * @param WP_Admin_Bar $wp_admin_bar The WP_Admin_Bar core object.
 */
function wpcom_add_shopping_cart( $wp_admin_bar ) {
	// Return if the site isn't a simple site
	if ( ! defined( 'IS_WPCOM' ) || ! IS_WPCOM ) {
		return;
	}

	// Include the shopping cart functionality from the specified path.
	require_once WP_CONTENT_DIR . '/admin-plugins/wpcom-billing/shopping-cart.php';

	// Get the current blog ID.
	$blog_id = get_current_blog_id();

	$is_empty = \Store_Shopping_Cart::is_cart_empty(
		array(
			'blog_id' => $blog_id,
			'user_id' => get_current_user_id(),
		)
	);

	// If the cart is empty (no products), do not add the cart menu.
	if ( $is_empty ) {
		return;
	}

	// Get the Calypso site slug for the current blog.
	$calypso_site_slug = \WPCOM_Masterbar::get_calypso_site_slug( $blog_id );

	// If no Calypso site slug is found, return early.
	if ( ! $calypso_site_slug ) {
		return;
	}

	// Add the cart menu item to the WordPress admin bar.
	$wp_admin_bar->add_menu(
		array(
			'id'     => 'cart', // Unique ID for the cart menu item.
			'title'  => '<span class="ab-item cart-icon" aria-hidden="true"></span>' .
						'<div class="cart-icon__dot"></div>' .
						'<span class="screen-reader-text">' .
						/* translators: Hidden accessibility text. */
						__( 'Cart', 'jetpack-mu-wpcom' ) .
						'</span>',
			'href'   => 'https://wordpress.com/checkout/' . esc_attr( $calypso_site_slug ), // Link to the checkout page.
			'meta'   => array(
				'class' => 'wp-admin-bar-cart', // Custom class for styling the cart menu item.
			),
			'parent' => 'top-secondary', // Position the cart in the 'top-secondary' section of the admin bar.
		)
	);
}

// Hook the cart icon to the admin bar menu, placing it before the reader icon (same as Calypso).
add_action( 'admin_bar_menu', 'wpcom_add_shopping_cart', 11 );

/**
 * Adds the Reader menu.
 *
 * @param WP_Admin_Bar $wp_admin_bar The WP_Admin_Bar core object.
 */
function wpcom_add_reader_menu( $wp_admin_bar ) {
	$wp_admin_bar->add_menu(
		array(
			'id'     => 'reader',
			'title'  => '<span class="ab-icon" title="' . __( 'Read the blogs and topics you follow', 'jetpack-mu-wpcom' ) . '" aria-hidden="true"></span>' .
						'<span class="ab-label">' . __( 'Reader', 'jetpack-mu-wpcom' ) . '</span>',
			'href'   => maybe_add_origin_site_id_to_url( 'https://wordpress.com/reader' ),
			'meta'   => array(
				'class' => 'wp-admin-bar-reader',
			),
			'parent' => 'top-secondary',
		)
	);
}
// Add the reader icon to the admin bar before the help center icon.
add_action( 'admin_bar_menu', 'wpcom_add_reader_menu', 11 );

/**
 * Points the "Edit Profile" and "Howdy,..." to /me if the user is not member of the blog.
 *
 * @param WP_Admin_Bar $wp_admin_bar The WP_Admin_Bar core object.
 */
function wpcom_replace_edit_profile_menu_to_me( $wp_admin_bar ) {
	if ( is_user_member_of_blog() ) {
		return;
	}

	$edit_profile_node = $wp_admin_bar->get_node( 'user-info' );
	if ( $edit_profile_node ) {
		$edit_profile_node->href  = maybe_add_origin_site_id_to_url( 'https://wordpress.com/me' );
		$edit_profile_node->title = preg_replace( "/(<span class='display-name edit-profile'>)(.*?)(<\/span>)/", '$1' . __( 'My Profile', 'jetpack-mu-wpcom' ) . '$3', $edit_profile_node->title );
		$wp_admin_bar->add_node( (array) $edit_profile_node );
	}
	$my_account_node = $wp_admin_bar->get_node( 'my-account' );
	if ( $my_account_node ) {
		$my_account_node->href = maybe_add_origin_site_id_to_url( 'https://wordpress.com/me' );
		$wp_admin_bar->add_node( (array) $my_account_node );
	}
}
// Run this function later than Core: https://github.com/WordPress/wordpress-develop/blob/5a30482419f1b0bcc713a7fdee3a14afd67a1bca/src/wp-includes/class-wp-admin-bar.php#L651
add_action( 'admin_bar_menu', 'wpcom_replace_edit_profile_menu_to_me', 9999 );

/**
 * Adds "Howdy,..." -> My WP.com Account submenu pointing to /me/account.
 *
 * @param WP_Admin_Bar $wp_admin_bar The WP_Admin_Bar core object.
 */
function wpcom_add_my_wpcom_account_submenu( $wp_admin_bar ) {
	$wp_admin_bar->add_group(
		array(
			'parent' => 'my-account',
			'id'     => 'wpcom-account',
			'meta'   => array(
				'class' => 'ab-sub-secondary',
			),
		)
	);

	/* translators: %s: WordPress.com logo */
	$button_text = sprintf( __( 'My %s WordPress.com Account', 'jetpack-mu-wpcom' ), '<span class="wpcom-logo"></span>' );

	$wp_admin_bar->add_node(
		array(
			'parent' => 'wpcom-account',
			'id'     => 'my-wpcom-account',
			'title'  => '<span class="button wpcom-button">' . $button_text . '</span>',
			'href'   => maybe_add_origin_site_id_to_url( 'https://wordpress.com/me/account' ),
		)
	);
}
add_action( 'admin_bar_menu', 'wpcom_add_my_wpcom_account_submenu' );

/**
 * Replaces the default admin bar class with our own.
 *
 * @param string $wp_admin_bar_class Admin bar class to use. Default 'WP_Admin_Bar'.
 * @return string Name of the admin bar class.
 */
function wpcom_custom_wpcom_admin_bar_class( $wp_admin_bar_class ) {
	remove_filter( 'pre_option_wpcom_admin_interface', 'wpcom_admin_interface_pre_get_option' );
	$is_wp_admin = get_option( 'wpcom_admin_interface' ) === 'wp-admin';
	add_filter( 'pre_option_wpcom_admin_interface', 'wpcom_admin_interface_pre_get_option', 10 );

	if ( $is_wp_admin ) {
		return $wp_admin_bar_class;
	}

	require_once __DIR__ . '/class-wpcom-admin-bar.php';
	return '\Automattic\Jetpack\Jetpack_Mu_Wpcom\WPCOM_Admin_Bar';
}
add_filter( 'wp_admin_bar_class', 'wpcom_custom_wpcom_admin_bar_class' );

/**
 * Changes the edit site menu to point to the top-level site editor.
 *
 * @param WP_Admin_Bar $wp_admin_bar The WP_Admin_Bar core object.
 */
function wpcom_edit_site_menu_override( $wp_admin_bar ) {
	if ( $wp_admin_bar->get_node( 'site-editor' ) ) {
		$args = array(
			'id'   => 'site-editor',
			'href' => admin_url( 'site-editor.php' ),
		);

		$wp_admin_bar->add_node( $args );
	}
}
add_action( 'admin_bar_menu', 'wpcom_edit_site_menu_override', 41 );
