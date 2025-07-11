<?php
/**
 * Plugin Name: WordPress.com Site Helper
 * Description: A helper for connecting WordPress.com sites to external host infrastructure.
 * Version: 7.0.0
 * Author: Automattic
 * Author URI: http://automattic.com/
 *
 * @package wpcomsh
 */

define( 'WPCOMSH_VERSION', '7.0.0' );

// If true, Typekit fonts will be available in addition to Google fonts
add_filter( 'jetpack_fonts_enable_typekit', '__return_true' );

// This exists only on the Atomic platform. Blank if migrated elsewhere, so it doesn't fatal.
if ( ! class_exists( 'Atomic_Persistent_Data' ) ) {
	require_once __DIR__ . '/class-atomic-persistent-data.php';
}

require_once __DIR__ . '/constants.php';
require_once __DIR__ . '/wpcom-features/functions-wpcom-features.php';
require_once __DIR__ . '/wpcom-marketplace/software/class-marketplace-software-manager.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/i18n.php';
require_once __DIR__ . '/lib/require-lib.php';

// Protected Owner functionality for Jetpack Connection
require_once __DIR__ . '/connection/protected-owner-handlers.php';

require_once __DIR__ . '/plugin-hotfixes.php';

require_once __DIR__ . '/footer-credit/footer-credit.php';
require_once __DIR__ . '/storefront/storefront.php';
require_once __DIR__ . '/custom-colors/colors.php';
require_once __DIR__ . '/storage/storage.php';
require_once __DIR__ . '/imports/class-backup-import-manager.php';

// Interoperability with the core WordPress data privacy functionality (See also "GDPR")
require_once __DIR__ . '/privacy/class-wp-privacy-participating-plugins.php';

// Functionality to make sites private and only accessible to members with appropriate capabilities
require_once __DIR__ . '/private-site/private-site.php';

// Updates customizer Save/Publish labels to avoid confusion on launching vs saving changes on a site.
require_once __DIR__ . '/customizer-fixes/customizer-fixes.php';

require_once __DIR__ . '/class-wpcomsh-log.php';
require_once __DIR__ . '/safeguard/plugins.php';
require_once __DIR__ . '/jetpack-token-error-header/class-atomic-record-jetpack-token-errors.php';

/**
 * WP.com Widgets (in alphabetical order)
 */
require_once __DIR__ . '/widgets/class-gravatar-widget.php';
require_once __DIR__ . '/widgets/class-jetpack-posts-i-like-widget.php';
require_once __DIR__ . '/widgets/class-music-player-widget.php';
require_once __DIR__ . '/widgets/class-widget-authors-grid.php';
require_once __DIR__ . '/widgets/class-wpcom-freshly-pressed-widget.php';
require_once __DIR__ . '/widgets/class-wpcom-widget-recent-comments.php';
require_once __DIR__ . '/widgets/class-wpcom-widget-reservations.php';

// WP.com Category Cloud widget
require_once __DIR__ . '/widgets/class-wpcom-category-cloud-widget.php';
// Override core tag cloud widget to add a settable `limit` parameter
require_once __DIR__ . '/widgets/class-wpcom-tag-cloud-widget.php';

require_once __DIR__ . '/widgets/tlkio/class-tlkio-widget.php';
require_once __DIR__ . '/widgets/class-widget-top-clicks.php';
require_once __DIR__ . '/widgets/class-pd-top-rated.php';
require_once __DIR__ . '/widgets/class-jetpack-widget-twitter.php';

// autoload composer sourced plugins
require_once __DIR__ . '/vendor/autoload_packages.php';
require_once __DIR__ . '/vendor/automattic/at-pressable-podcasting/podcasting.php';
require_once __DIR__ . '/vendor/automattic/custom-fonts/custom-fonts.php';
require_once __DIR__ . '/vendor/automattic/custom-fonts-typekit/custom-fonts-typekit.php';
require_once __DIR__ . '/vendor/automattic/text-media-widget-styles/text-media-widget-styles.php';

// REST API
require_once __DIR__ . '/endpoints/rest-api.php';

// Load feature plugins.
require_once __DIR__ . '/feature-plugins/additional-css.php';
require_once __DIR__ . '/feature-plugins/autosave-revision.php';
require_once __DIR__ . '/feature-plugins/blaze.php';
require_once __DIR__ . '/feature-plugins/coblocks-mods.php';
require_once __DIR__ . '/feature-plugins/full-site-editing.php';
require_once __DIR__ . '/feature-plugins/google-fonts.php';
require_once __DIR__ . '/feature-plugins/gutenberg-mods.php';
require_once __DIR__ . '/feature-plugins/headstart-util.php';
require_once __DIR__ . '/feature-plugins/headstart-woocommerce-terms.php';
require_once __DIR__ . '/feature-plugins/hooks.php';
require_once __DIR__ . '/feature-plugins/managed-plugins.php';
require_once __DIR__ . '/feature-plugins/managed-themes.php';
require_once __DIR__ . '/feature-plugins/marketplace.php';
require_once __DIR__ . '/feature-plugins/masterbar.php';
require_once __DIR__ . '/feature-plugins/migrate-guru-canary.php';
require_once __DIR__ . '/feature-plugins/nav-redesign.php';
require_once __DIR__ . '/feature-plugins/post-list.php';
require_once __DIR__ . '/feature-plugins/sensei-pro-mods.php';
require_once __DIR__ . '/feature-plugins/smtp-email-priority.php';
require_once __DIR__ . '/feature-plugins/staging-sites.php';
require_once __DIR__ . '/feature-plugins/stats.php';
require_once __DIR__ . '/feature-plugins/woocommerce.php';
require_once __DIR__ . '/feature-plugins/wordpress-mods.php';

/**
 * Conditionally load the jetpack-mu-wpcom package.
 *
 * JETPACK_MU_WPCOM_LOAD_VIA_BETA_PLUGIN=true will load the package via the Jetpack Beta Tester plugin, not wpcomsh.
 */
if ( ! defined( 'JETPACK_MU_WPCOM_LOAD_VIA_BETA_PLUGIN' ) || ! JETPACK_MU_WPCOM_LOAD_VIA_BETA_PLUGIN ) {
	if ( class_exists( 'Automattic\Jetpack\Jetpack_Mu_Wpcom' ) ) {
		Automattic\Jetpack\Jetpack_Mu_Wpcom::init();
	}
}

if ( ! class_exists( 'Jetpack_Data' ) ) {
	require_once __DIR__ . '/feature-plugins/class-jetpack-data.php';
}

// Front end notices.
require_once __DIR__ . '/frontend-notices/wpcomsh-frontend-notices.php';

// wp-admin Notices
require_once __DIR__ . '/notices/plan-notices.php';
require_once __DIR__ . '/notices/storage-notices.php';
require_once __DIR__ . '/notices/php-version-notices.php';
require_once __DIR__ . '/notices/media-library-private-site-cdn-notice.php';
require_once __DIR__ . '/notices/anyone-can-register-notice.php';
require_once __DIR__ . '/notices/feature-moved-to-jetpack-notices.php';

// Performance Profiler
require_once __DIR__ . '/performance-profiler/performance-profiler.php';

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once __DIR__ . '/class-wpcomsh-cli-commands.php';
	require_once __DIR__ . '/woa.php';
}

require_once __DIR__ . '/wpcom-migration-helpers/site-migration-helpers.php';

// We include WPCom Themes results and installation on non-WP_CLI context.
if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	require_once __DIR__ . '/wpcom-themes/themes.php';
}

require_once __DIR__ . '/class-jetpack-plugin-compatibility.php';
Jetpack_Plugin_Compatibility::get_instance();

require_once __DIR__ . '/support-session.php';

// Adds fallback behavior for non-Gutenframed sites to be able to use the 'Share Post' functionality from WPCOM Reader.
require_once __DIR__ . '/share-post/share-post.php';

// Jetpack Token Resilience.
require_once __DIR__ . '/jetpack-token-resilience/class-wpcomsh-blog-token-resilience.php';

// Require a Jetpack Connection Owner.
require_once __DIR__ . '/jetpack-require-connection-owner/class-wpcomsh-require-connection-owner.php';

// Enable MailPoet subscriber stats reports
require_once __DIR__ . '/mailpoet/class-wpcomsh-mailpoet-subscribers-stats-report.php';

// Force Jetpack to update plugins one-at-a-time to avoid a site-breaking core concurrent update bug
// https://core.trac.wordpress.org/ticket/53705
if (
	! defined( 'JETPACK_PLUGIN_AUTOUPDATE' ) &&
	0 === strncmp( $_SERVER['REQUEST_URI'], '/xmlrpc.php?', strlen( '/xmlrpc.php?' ) ) ) { //phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	define( 'JETPACK_PLUGIN_AUTOUPDATE', true );
}

/**
 * Filter attachment URLs if the 'wpcom_attachment_subdomain' option is present.
 * Local image files will be unaffected, as they will pass a file_exists check.
 * Files stored remotely will be filtered to have the correct URL.
 *
 * Once the files have been transferred, the 'wpcom_attachment_subdomain' will
 * be removed, preventing further stats.
 *
 * @param string $url The attachment URL.
 * @param int    $post_id The post id.
 * @return string The filtered attachment URL.
 */
function wpcomsh_get_attachment_url( $url, $post_id ) {
	$attachment_subdomain = get_option( 'wpcom_attachment_subdomain' );
	if ( $attachment_subdomain ) {
		$file = get_post_meta( $post_id, '_wp_attached_file', true );

		if ( $file ) {
			$local_file = WP_CONTENT_DIR . '/uploads/' . $file;
			if ( ! file_exists( $local_file ) ) {
				return esc_url( 'https://' . $attachment_subdomain . '/' . $file );
			}
		}
	}
	return $url;
}
add_filter( 'wp_get_attachment_url', 'wpcomsh_get_attachment_url', 11, 2 );

/**
 * When WordPress.com passes along an expiration for auth cookies and it is smaller
 * than the value set by Jetpack by default (YEAR_IN_SECONDS), use the smaller value.
 *
 * @param int $seconds The cookie expiration in seconds.
 * @return int The filtered cookie expiration in seconds
 */
function wpcomsh_jetpack_sso_auth_cookie_expiration( $seconds ) {
	if ( isset( $_GET['expires'] ) ) { //phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$expires = absint( $_GET['expires'] ); //phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( ! empty( $expires ) && $expires < $seconds ) {
			$seconds = $expires;
		}
	}
	return intval( $seconds );
}
add_filter( 'jetpack_sso_auth_cookie_expiration', 'wpcomsh_jetpack_sso_auth_cookie_expiration' );

/**
 * Determine if users should be enforced to log in with their WP.com account.
 *
 * Sites without local users:
 * - WP.com login, always.
 *
 * Sites with local users:
 * - If user comes from Calypso: WP.com login
 * - Otherwise: Jetpack SSO login, so they can decide whether to use a WP.com account or a local account.
 */
function wpcomsh_bypass_jetpack_sso_login() {
	$calypso_domains = array(
		'https://wordpress.com/',
		'https://horizon.wordpress.com/',
		'https://wpcalypso.wordpress.com/',
		'http://calypso.localhost:3000/',
		'http://127.0.0.1:41050/', // Desktop App.
	);
	if ( in_array( wp_get_referer(), $calypso_domains, true ) ) {
		return true;
	}

	if ( class_exists( '\Automattic\Jetpack\Connection\Manager' ) ) {
		$connection_manager = new \Automattic\Jetpack\Connection\Manager( 'jetpack' );
		$users              = get_users( array( 'fields' => array( 'ID' ) ) );
		foreach ( $users as $user ) {
			if ( ! $connection_manager->is_user_connected( $user->ID ) ) {
				return false;
			}
		}
	}

	return true;
}
add_filter( 'jetpack_sso_bypass_login_forward_wpcom', 'wpcomsh_bypass_jetpack_sso_login' );

/**
 * Add 'loggedout' to the list of actions that allow the wpcom login form to be used.
 *
 * This means that the login screen the user sees immediately after logging out is consistent
 * with the login screen the user sees when they are not logged in: the wpcom login form.
 *
 * @param array $allowed_actions The allowed actions.
 * @return array The modified allowed actions.
 */
function wpcomsh_modify_jetpack_sso_allowed_actions( $allowed_actions ) {
	$allowed_actions[] = 'loggedout';
	return $allowed_actions;
}
add_filter( 'jetpack_sso_allowed_actions', 'wpcomsh_modify_jetpack_sso_allowed_actions' );

/**
 * Overwrite the default value of SSO "Match by Email" setting.
 * p9o2xV-2zY-p2
 */
add_filter( 'default_option_jetpack_sso_match_by_email', '__return_true' );

/**
 * Admin enqueue style
 */
function wpcomsh_admin_enqueue_style() {
	wp_enqueue_style(
		'wpcomsh-admin-style',
		plugins_url( 'assets/admin-style.css', __FILE__ ),
		array(),
		WPCOMSH_VERSION
	);
}
add_action( 'admin_enqueue_scripts', 'wpcomsh_admin_enqueue_style', 999 );

/**
 * Allow custom wp options
 *
 * @param array $options The options.
 *
 * @return array
 */
function wpcomsh_allow_custom_wp_options( $options ) {
	// For storing AT options.
	$options[] = 'at_options';
	$options[] = 'at_options_logging_on';
	$options[] = 'at_wpcom_premium_theme';
	$options[] = 'jetpack_fonts';
	$options[] = 'site_logo';
	$options[] = 'footercredit';
	$options[] = 'wpcomsh_at_managed_plugins';

	return $options;
}
add_filter( 'jetpack_options_whitelist', 'wpcomsh_allow_custom_wp_options' );

add_filter( 'jetpack_site_automated_transfer', '__return_true' );

/**
 * Check site has pending automated transfer
 *
 * @return bool
 */
function check_site_has_pending_automated_transfer() {
	return get_option( 'has_pending_automated_transfer' );
}

add_filter( 'jetpack_site_pending_automated_transfer', 'check_site_has_pending_automated_transfer' );

/**
 * We have some instances where `track_number` of an audio attachment is `??0` and shows up as type string.
 * However the problem is, that if post has nested property attachments with this track_number, `json_serialize` fails silently.
 * Of course, this should be fixed during audio upload, but we need this fix until we can clean this up properly.
 * More detail here: https://github.com/Automattic/automated-transfer/issues/235
 *
 * @param array $exif_data The file exif data.
 *
 * @return array
 */
function wpcomsh_jetpack_api_fix_unserializable_track_number( $exif_data ) {
	if ( isset( $exif_data['track_number'] ) ) {
		$exif_data['track_number'] = intval( $exif_data['track_number'] );
	}
	return $exif_data;
}
add_filter( 'wp_get_attachment_metadata', 'wpcomsh_jetpack_api_fix_unserializable_track_number' );

// Jetpack for Atomic sites are always production version.
add_filter( 'jetpack_development_version', '__return_false' );

/**
 * Make User Agent consistent with the rest of WordPress.com.
 *
 * @param mixed $agent The agent.
 */
function wpcomsh_filter_outgoing_user_agent( $agent ) {
	global $wp_version;

	return str_replace( "WordPress/$wp_version", 'WordPress.com', $agent );
}
add_filter( 'http_headers_useragent', 'wpcomsh_filter_outgoing_user_agent', 999 );

/**
 * Allow redirects to WordPress.com from Customizer.
 *
 * @param array $hosts The hosts.
 */
function wpcomsh_allowed_redirect_hosts( $hosts ) {
	if ( is_array( $hosts ) ) {
		$hosts[] = 'wordpress.com';
		$hosts[] = 'calypso.localhost';
		$hosts   = array_unique( $hosts );
	}
	return $hosts;
}
add_filter( 'allowed_redirect_hosts', 'wpcomsh_allowed_redirect_hosts', 11 );

/**
 * WP.com make clickable
 *
 * Converts all plain-text HTTP URLs in post_content to links on display
 *
 * @param string $content The content.
 *
 * @uses make_clickable()
 * @since 20121125
 */
function wpcomsh_make_content_clickable( $content ) {
	// make_clickable() is expensive, check if plain-text URLs exist before running it
	// don't look inside HTML tags
	// don't look in <a></a>, <pre></pre>, <script></script> and <style></style>
	// use <div class="skip-make-clickable"> in support docs where linkifying
	// breaks shortcodes, etc.
	$_split  = preg_split( '/(<[^>]+>)/i', $content, -1, PREG_SPLIT_DELIM_CAPTURE );
	$end     = '';
	$out     = '';
	$combine = '';
	$split   = array();

	// Defines a set of rules for the wpcomsh_make_content_clickable() function to ignore matching html elements.
	$make_clickable_rules = array(
		array(
			'match' => array( '<a ' ),
			'end'   => '</a>',
		),
		array(
			'match' => array( '<pre ', '<pre>' ),
			'end'   => '</pre>',
		),
		array(
			'match' => array( '<code ', '<code>' ),
			'end'   => '</code>',
		),
		array(
			'match' => array( '<script ', '<script>' ),
			'end'   => '</script>',
		),
		array(
			'match' => array( '<style ', '<style>' ),
			'end'   => '</style>',
		),
		array(
			'match' => array( '<textarea ', '<textarea>' ),
			'end'   => '</textarea>',
		),
		array(
			'match' => array( '<div class="skip-make-clickable' ),
			'end'   => '</div>',
		),
	);

	// filter the array and combine <a></a>, <pre></pre>, <script></script> and <style></style> into one
	// (none of these tags can be nested so when we see the opening tag, we grab everything untill we reach the closing tag).
	foreach ( $_split as $chunk ) {
		if ( '' === $chunk ) {
			continue;
		}

		if ( $end ) {
			$combine .= $chunk;

			if ( $end === strtolower( str_replace( array( "\t", ' ', "\r", "\n" ), '', $chunk ) ) ) {
				$split[] = $combine;
				$end     = '';
				$combine = '';
			}
			continue;
		}

		$found = false;
		foreach ( $make_clickable_rules as $rule ) {
			foreach ( $rule['match'] as $match ) {
				if ( stripos( $chunk, $match ) === 0 ) {
					$combine .= $chunk;
					$end      = $rule['end'];
					$found    = true;

					break 2;
				}
			}
		}

		if ( ! $found ) {
			$split[] = $chunk;
		}
	}

	foreach ( $split as $chunk ) {
		// if $chunk is white space or a tag (or a combined tag), add it and continue.
		if ( preg_match( '/^\s+$/', $chunk ) || ( '<' === $chunk[0] && '>' === $chunk[ strlen( $chunk ) - 1 ] ) ) {
			$out .= $chunk;
			continue;
		}

		// three strpos() are faster than one preg_match() here. If we need to check for more protocols, preg_match() would probably be better.
		if ( strpos( $chunk, 'http://' ) !== false || strpos( $chunk, 'https://' ) !== false || strpos( $chunk, 'www.' ) !== false ) {
			// looks like there is a plain-text url.
			$out .= make_clickable( $chunk );
		} else {
			$out .= $chunk;
		}
	}

	return $out;
}
add_filter( 'the_content', 'wpcomsh_make_content_clickable', 120 );
add_filter( 'the_excerpt', 'wpcomsh_make_content_clickable', 120 );

/**
 * Hide scan threats from transients
 *
 * @param mixed $response The response.
 *
 * @return mixed
 */
function wpcomsh_hide_scan_threats_from_transients( $response ) {
	if ( ! empty( $response->threats ) ) {
		$response->threats = array();
	}
	return $response;
}
add_filter( 'transient_jetpack_scan_state', 'wpcomsh_hide_scan_threats_from_transients' );

/**
 * Unhook Jetpack Scan Admin Notice
 *
 * @return void
 */
function wpcomsh_remove_threats_from_toolbar() {
	global $wp_admin_bar;
	$wp_admin_bar->remove_node( 'jetpack-scan-notice' );
}
add_action( 'wp_before_admin_bar_render', 'wpcomsh_remove_threats_from_toolbar', 999999 );

/**
 * Hide scan threats from api
 *
 * @param mixed $response The reponse.
 *
 * @return mixed
 */
function wpcom_hide_scan_threats_from_api( $response ) {
	if (
		! ( $response instanceof WP_REST_Response )
		|| $response->get_matched_route() !== '/jetpack/v4/scan'
	) {
		return $response;
	}
	$response_data = $response->get_data();
	if ( empty( $response_data['data'] ) || ! is_string( $response_data['data'] ) ) {
		return $response;
	}

	$json_body = json_decode( $response_data['data'], true );
	if ( null === $json_body || empty( $json_body['threats'] ) ) {
		return $response;
	}

	$json_body['threats']  = array();
	$response_data['data'] = wp_json_encode( $json_body );
	$response->set_data( $response_data );

	return $response;
}
add_filter( 'rest_post_dispatch', 'wpcom_hide_scan_threats_from_api' );

/**
 * Returns a standardized timezone string.
 *
 * `wp_timezone_string()` sometimes returns offsets (e.g. "-07:00"), which are
 * a non-standard representation of a UTC offset that only works in PHP.
 * This function returns a standardized timezone string instead, of the form
 * "Etc/GMT+7" for integer hour offsets, or a matching "<Area>/<City>" form for
 * fractional hour offsets (used e.g. in India).
 */
function wpcomsh_stats_timezone_string() {
	$wp_tz = wp_timezone_string();

	// Did we get back an offset?
	if ( preg_match( '/^([+-])?(\d{1,2}):(\d{2})$/', $wp_tz, $matches ) ) {
		$sign    = $matches[1] === '-' ? -1 : 1;
		$hours   = intval( $matches[2], 10 );
		$minutes = intval( $matches[3], 10 );

		// For fractional hour offsets, use `timezone_name_from_abbr` to get a
		// matching "<Area>/<City>" timezone.
		if ( $minutes > 0 ) {
			$offset  = $sign * ( $hours * 3600 + $minutes * 60 );
			$city_tz = timezone_name_from_abbr( '', $offset, 0 );

			if ( ! empty( $city_tz ) ) {
				return $city_tz;
			}
		}

		// For integer hour offsets, use "Etc/GMT(+|-)<offset>".
		// The sign is flipped, to match how the `Etc` area is specced.
		//
		// This codepath is also followed if no city exists to match a
		// fractional offset, by simply discarding the fractional part.
		// This isn't ideal, but there's no standard way of describing
		// these offsets, and is likely to be an extreme edge case.
		return 'Etc/GMT' . ( $sign === -1 ? '+' : '-' ) . $hours;
	}

	// For anything that's not an offset, return the string we got from WP.
	return $wp_tz;
}

/**
 * Collect RUM performance data
 * p9o2xV-XY-p2
 */
function wpcomsh_footer_rum_js() {
	$service      = 'atomic';
	$allow_iframe = '';
	if ( 'admin_footer' === current_action() ) {
		$service = 'atomic-wpadmin';

		$block_editor = \Automattic\Jetpack\Jetpack_Mu_Wpcom\WPCOM_Block_Editor\Jetpack_WPCOM_Block_Editor::init();
		if ( $block_editor->is_iframed_block_editor() ) {
			$service      = 'atomic-gutenframe';
			$allow_iframe = 'data-allow-iframe="true"';
		}
	}

	$rum_kv = array();
	$rum_kv = wpcomsh_get_woo_rum_data( $rum_kv );
	// Add user login and theme info.
	$rum_kv['logged_in']        = is_user_logged_in() ? '1' : '0';
	$rum_kv['wptheme']          = get_stylesheet();
	$rum_kv['wptheme_is_block'] = wp_is_block_theme() ? '1' : '0';

	if ( count( $rum_kv ) > 0 ) {
		$rum_kv = wp_json_encode( $rum_kv, JSON_FORCE_OBJECT );
		if ( is_string( $rum_kv ) ) {
			$rum_kv = 'data-customproperties="' . esc_attr( $rum_kv ) . '"';
		} else {
			$rum_kv = '';
		}
	} else {
		$rum_kv = '';
	}

	$data_site_tz = 'data-site-tz="' . esc_attr( wpcomsh_stats_timezone_string() ) . '"';

	printf(
		'<meta id="bilmur" property="bilmur:data" content="" %1$s data-provider="wordpress.com" data-service="%2$s" %3$s %4$s >' . "\n",
		$rum_kv, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		esc_attr( $service ),
		wp_kses_post( $allow_iframe ),
		$data_site_tz // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	);
	printf(
		'<script defer src="%s"></script>' . "\n", //phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedScript
		esc_url( 'https://s0.wp.com/wp-content/js/bilmur.min.js?m=' . gmdate( 'YW' ) )
	);
}

/**
 * Adds WooCommerce-related data to the Real User Monitoring (RUM) array.
 *
 * This function checks if WooCommerce is active on the site and adds
 * this information to the provided RUM data array. It's designed to be
 * used as part of the RUM data collection process for Atomic sites.
 *
 * @param array $rum_kv An array of existing RUM key-value pairs.
 *                      If not provided, an empty array will be used.
 *
 * @return array The input array with added WooCommerce data.
 *               The 'woo_active' key will be added with a boolean value
 *               indicating whether WooCommerce is active.
 */
function wpcomsh_get_woo_rum_data( $rum_kv = array() ) {
	$woo_active           = class_exists( 'WooCommerce' ) ? '1' : '0';
	$rum_kv['woo_active'] = $woo_active;
	return $rum_kv;
}

add_action( 'wp_footer', 'wpcomsh_footer_rum_js' );
add_action( 'admin_footer', 'wpcomsh_footer_rum_js' );

/**
 * Adds Atomic site ID to WooCommerce tracker data.
 *
 * @param array $data The WooCommerce tracker data.
 *
 * @return array The WooCommerce tracker data with Atomic site ID added.
 */
function wpcomsh_woocommerce_tracker_data( $data ) {
	$data['atomic_site_id'] = wpcomsh_get_atomic_site_id();
	return $data;
}

add_filter( 'woocommerce_tracker_data', 'wpcomsh_woocommerce_tracker_data' );

add_filter( 'amp_dev_tools_user_default_enabled', '__return_false' );

/**
 * Tracks helper. Filters Jetpack TOS option if class exists.
 *
 * @param mixed $event The event.
 * @param mixed $event_properties The event property.
 *
 * @return void
 */
function wpcomsh_record_tracks_event( $event, $event_properties ) {
	if ( class_exists( '\Automattic\Jetpack\Tracking' ) ) {
		// User has to agree to ToS for tracking. Thing is, on initial Simple -> Atomic we never set the ToS option.
		// And since they agreed to WP.com ToS, we can track but in a roundabout way. :).
		add_filter( 'jetpack_options', 'wpcomsh_jetpack_filter_tos_for_tracking', 10, 2 );

		$jetpack_tracks = new \Automattic\Jetpack\Tracking( 'atomic' );
		$jetpack_tracks->tracks_record_event(
			wp_get_current_user(),
			$event,
			$event_properties
		);

		remove_filter( 'jetpack_options', 'wpcomsh_jetpack_filter_tos_for_tracking', 10 );
	}
}

/**
 * Helper for filtering tos_agreed for tracking purposes.
 * Explicit function so it can be removed afterwards.
 *
 * @param mixed $value The value.
 * @param mixed $name Name.
 *
 * @return mixed
 */
function wpcomsh_jetpack_filter_tos_for_tracking( $value, $name ) {
	if ( 'tos_agreed' === $name ) {
		return true;
	}

	return $value;
}

/**
 * Avoid proxied v2 banner
 *
 * @return void
 * @phan-suppress PhanUndeclaredFunctionInCallable -- No point in stubbing `atomic_proxy_bar` just for remove_action().
 */
function wpcomsh_avoid_proxied_v2_banner() {
	$priority = has_action( 'wp_footer', 'atomic_proxy_bar' );
	if ( false !== $priority ) {
		remove_action( 'wp_footer', 'atomic_proxy_bar', $priority );
	}

	$priority = has_action( 'admin_footer', 'atomic_proxy_bar' );
	if ( false !== $priority ) {
		remove_action( 'admin_footer', 'atomic_proxy_bar', $priority );
	}
}

// We don't want to show a "PROXIED V2" banner for legacy widget previews
// which are normally embedded within another page.
if (
	defined( 'AT_PROXIED_REQUEST' ) && AT_PROXIED_REQUEST &&
	isset( $_GET['legacy-widget-preview'] ) && //phpcs:ignore WordPress.Security.NonceVerification
	0 === strncmp( $_SERVER['REQUEST_URI'], '/wp-admin/widgets.php?', strlen( '/wp-admin/widgets.php?' ) ) ) { //phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	add_action( 'plugins_loaded', 'wpcomsh_avoid_proxied_v2_banner' );
}
