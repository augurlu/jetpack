<?php
/**
 * Limit Global Styles on WP.com to paid plans.
 *
 * @package automattic/jetpack-mu-wpcom
 */

use Automattic\Jetpack\Jetpack_Mu_Wpcom;
use Automattic\Jetpack\Jetpack_Mu_Wpcom\Common;
use Automattic\Jetpack\Plans;

/**
 * Checks if Global Styles on personal are available on the current site either by A/B test assign or feature flag.
 *
 * @return bool Whether Global Styles are available.
 */
function is_global_styles_on_personal_plan() {
	return wpcom_site_has_global_styles_in_personal_plan()
		|| ( class_exists( 'WPCOM_Feature_Flags' ) && WPCOM_Feature_Flags::is_enabled( WPCOM_Feature_Flags::GLOBAL_STYLES_ON_PERSONAL_PLAN ) );
}

/**
 * Checks if Global Styles should be limited on the given site.
 *
 * @param  int $blog_id Blog ID.
 * @return bool Whether Global Styles are limited.
 */
function wpcom_should_limit_global_styles( $blog_id = 0 ) {
	/**
	 * Filter to force a limited Global Styles scenario. Useful for unit testing.
	 *
	 * @param bool $force_limit_global_styles Whether Global Styles are forced to be limited.
	 */
	$force_limit_global_styles = apply_filters( 'wpcom_force_limit_global_styles', false );
	if ( $force_limit_global_styles ) {
		return true;
	}

	if ( ! $blog_id ) {
		if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
			$blog_id = get_current_blog_id();
		} elseif ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			/*
			 * Atomic sites have the WP.com blog ID stored as a Jetpack option. This code deliberately
			 * doesn't use `Jetpack_Options::get_option` so it works even when Jetpack has not been loaded.
			 */
			$jetpack_options = get_option( 'jetpack_options' );
			if ( is_array( $jetpack_options ) && isset( $jetpack_options['id'] ) ) {
				$blog_id = (int) $jetpack_options['id'];
			} else {
				$blog_id = get_current_blog_id();
			}
		} else {
			return false;
		}
	}

	// Do not limit Global Styles on theme demo sites.
	if ( wpcom_global_styles_has_blog_sticker( 'theme-demo-site', $blog_id ) ) {
		return false;
	}

	// Do not limit Global Styles on Big Sky free trial sites. Those sites will
	// have their own paywall to go through.
	if ( wpcom_global_styles_has_blog_sticker( 'big-sky-free-trial', $blog_id ) ) {
		return false;
	}

	// Do not limit Global Styles if the site paid for it.
	if ( wpcom_site_has_global_styles_feature( $blog_id ) ) {
		return false;
	}

	// Do not limit Global Styles on sites created before we made it a paid feature (2022-12-15),
	// that had already used Global Styles.
	if ( wpcom_premium_global_styles_is_site_exempt( $blog_id ) ) {
		return false;
	}

	// Do not limit Global Styles on self-hosted Jetpack sites.
	if ( wpcom_global_styles_is_self_hosted_site( $blog_id ) ) {
		return false;
	}

	// Do not limit Global Styles when live previewing a Premium theme without a Premium plan or higher
	// because the live preview already shows an upgrade notice, and we avoid duplication.
	if ( wpcom_global_styles_is_previewing_premium_theme_without_premium_plan( $blog_id ) ) {
		return false;
	}

	return true;
}

/**
 * Get the WPCOM blog id of the current site for tracking purposes.
 */
function wpcom_global_styles_get_wpcom_current_blog_id() {
	if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
		return get_current_blog_id();
	} elseif ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
		/*
		 * Atomic sites have the WP.com blog ID stored as a Jetpack option. This code deliberately
		 * doesn't use `Jetpack_Options::get_option` so it works even when Jetpack has not been loaded.
		 */
		$jetpack_options = get_option( 'jetpack_options' );
		if ( is_array( $jetpack_options ) && isset( $jetpack_options['id'] ) ) {
			return (int) $jetpack_options['id'];
		}
	}

	return null;
}

/**
 * Wrapper to test a blog sticker on both Simple and Atomic sites at once.
 *
 * @param string $blog_sticker The blog sticker.
 * @param int    $blog_id The WPCOM blog ID.
 * @return bool Whether the site has the blog sticker.
 */
function wpcom_global_styles_has_blog_sticker( $blog_sticker, $blog_id ) {
	if ( function_exists( 'has_blog_sticker' ) && has_blog_sticker( $blog_sticker, $blog_id ) ) {
		return true;
	}
	if ( function_exists( 'wpcomsh_is_site_sticker_active' ) && wpcomsh_is_site_sticker_active( $blog_sticker ) ) {
		return true;
	}
	return false;
}

/**
 * Wrapper to test whether a blog is a self-hosted site
 *
 * @param int $blog_id The WPCOM blog ID.
 * @return bool Whether the site has the blog sticker.
 */
function wpcom_global_styles_is_self_hosted_site( $blog_id ) {
	if ( ! function_exists( 'is_jetpack_site' ) || ! function_exists( 'is_blog_atomic' ) ) {
		return true;
	}

	return is_jetpack_site( $blog_id ) && ! is_blog_atomic( get_blog_details( $blog_id ) );
}

/**
 * Enqueues the WP.com Global Styles scripts and styles for the block editor.
 *
 * @return void
 */
function wpcom_global_styles_enqueue_block_editor_assets() {
	if ( ! wpcom_should_limit_global_styles() ) {
		return;
	}

	$calypso_domain = 'https://wordpress.com';
	if (
		! empty( $_GET['origin'] ) && // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		in_array(
			$_GET['origin'], // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			array(
				'http://calypso.localhost:3000',
				'https://wpcalypso.wordpress.com',
				'https://horizon.wordpress.com',
			),
			true
		)
	) {
		$calypso_domain = sanitize_text_field( wp_unslash( $_GET['origin'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}

	$site_slug = method_exists( '\WPCOM_Masterbar', 'get_calypso_site_slug' )
		? \WPCOM_Masterbar::get_calypso_site_slug( get_current_blog_id() )
		: wp_parse_url( home_url( '/' ), PHP_URL_HOST );

	$asset_file = include Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-global-styles-editor/wpcom-global-styles-editor.asset.php';

	wp_enqueue_script(
		'wpcom-global-styles-editor',
		plugins_url( 'build/wpcom-global-styles-editor/wpcom-global-styles-editor.js', Jetpack_Mu_Wpcom::BASE_FILE ),
		$asset_file['dependencies'] ?? array(),
		$asset_file['version'] ?? filemtime( Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-global-styles-editor/wpcom-global-styles-editor.js' ),
		true
	);
	wp_set_script_translations( 'wpcom-global-styles-editor', 'jetpack-mu-wpcom' );

	Common\wpcom_enqueue_tracking_scripts( 'wpcom-global-styles-editor' );

	$learn_more_about_styles_support_url = 'https://wordpress.com/support/using-styles/#access-to-styles';
	$learn_more_about_styles_post_id     = 192200;
	if ( class_exists( 'WPCom_Languages' ) ) {
		$learn_more_about_styles_post_id = WPCom_Languages::localize_url( $learn_more_about_styles_post_id );
	}

	// @TODO Remove this once the global styles are available for all users on the Personal Plan.
	if ( is_global_styles_on_personal_plan() ) {
		$plan_name   = Plans::get_plan_short_name( 'personal-bundle' );
		$upgrade_url = "$calypso_domain/plans/$site_slug?plan=personal-bundle&feature=style-customization";
	} else {
		$plan_name   = Plans::get_plan_short_name( 'value_bundle' );
		$upgrade_url = "$calypso_domain/plans/$site_slug?plan=value_bundle&feature=style-customization";
	}

	wp_localize_script(
		'wpcom-global-styles-editor',
		'wpcomGlobalStyles',
		array(
			'upgradeUrl'                 => $upgrade_url,
			'wpcomBlogId'                => wpcom_global_styles_get_wpcom_current_blog_id(),
			'planName'                   => $plan_name,
			'learnMoreAboutStylesUrl'    => $learn_more_about_styles_support_url,
			'learnMoreAboutStylesPostId' => $learn_more_about_styles_post_id,
			'hasCustomDesign'            => wpcom_site_has_feature( WPCOM_Features::CUSTOM_DESIGN ),
		)
	);
	wp_enqueue_style(
		'wpcom-global-styles-editor',
		plugins_url( 'build/wpcom-global-styles-editor/wpcom-global-styles-editor.css', Jetpack_Mu_Wpcom::BASE_FILE ),
		array(),
		filemtime( Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-global-styles-editor/wpcom-global-styles-editor.css' )
	);
}
add_action( 'enqueue_block_editor_assets', 'wpcom_global_styles_enqueue_block_editor_assets' );

/**
 * Enqueues the WP.com Global Styles scripts and styles for the front end.
 *
 * @return void
 */
function wpcom_global_styles_enqueue_assets() {
	$asset_file = include Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-global-styles-frontend/wpcom-global-styles-frontend.asset.php';
	wp_enqueue_script(
		'wpcom-global-styles-frontend',
		plugins_url( 'build/wpcom-global-styles-frontend/wpcom-global-styles-frontend.js', Jetpack_Mu_Wpcom::BASE_FILE ),
		$asset_file['dependencies'] ?? array(),
		$asset_file['version'] ?? filemtime( Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-global-styles-frontend/wpcom-global-styles-frontend.js' ),
		true
	);
	wp_add_inline_script(
		'wpcom-global-styles-frontend',
		'const launchBarUserData = ' . wp_json_encode(
			array(
				'blogId' => get_current_blog_id(),
			)
		),
		'before'
	);
	Common\wpcom_enqueue_tracking_scripts( 'wpcom-global-styles-frontend' );

	wp_enqueue_style(
		'wpcom-global-styles-frontend',
		plugins_url( 'build/wpcom-global-styles-frontend/wpcom-global-styles-frontend.css', Jetpack_Mu_Wpcom::BASE_FILE ),
		array(),
		filemtime( Jetpack_Mu_Wpcom::BASE_DIR . 'build/wpcom-global-styles-frontend/wpcom-global-styles-frontend.css' )
	);
}

/**
 * Removes the user styles from a site with limited global styles.
 *
 * @param WP_Theme_JSON_Data $theme_json Class to access and update the underlying data.
 * @return WP_Theme_JSON_Data Filtered data.
 */
function wpcom_block_global_styles_frontend( $theme_json ) {
	if ( ! wpcom_should_limit_global_styles() || wpcom_is_previewing_global_styles() ) {
		return $theme_json;
	}

	$limited_theme_json = array();

	$theme_json_data = $theme_json->get_data();

	/**
	 * If the site has Custom Design paid addon, we only want to return the CSS part of the styles.
	 */
	if ( isset( $theme_json_data['styles']['css'] ) && wpcom_site_has_feature( WPCOM_Features::CUSTOM_DESIGN ) ) {
		$limited_theme_json['styles']['css'] = $theme_json_data['styles']['css'];
		$limited_theme_json['version']       = $theme_json_data['version'] ?? WP_Theme_JSON::LATEST_SCHEMA;
	}

	if ( class_exists( 'WP_Theme_JSON_Data' ) ) {
		return new WP_Theme_JSON_Data( $limited_theme_json, 'custom' );
	}

	/*
	 * If `WP_Theme_JSON_Data` is missing, then the site is running an old
	 * version of WordPress we cannot block the user styles properly.
	 */
	return $theme_json;
}
add_filter( 'wp_theme_json_data_user', 'wpcom_block_global_styles_frontend' );

/**
 * Tracks when global styles are updated or reset after the post has actually been saved.
 *
 * @param int     $blog_id Blog ID.
 * @param WP_Post $post    Post data.
 * @param bool    $updated This value is true if the post existed and was updated.
 */
function wpcom_track_global_styles( $blog_id, $post, $updated ) {
	// If the post isn't updated then we know the gs cpt is being created.
	$event_name = 'wpcom_core_global_styles_create';

	// These properties are for debugging purposes and should be eventually edited or removed.
	$event_props = array(
		'should_limit' => (bool) wpcom_should_limit_global_styles(),
		'is_simple'    => ! function_exists( 'wpcomsh_record_tracks_event' ),
		'theme'        => get_stylesheet(),
	);

	if ( $updated ) {
		// This is a fragile way of checking if the global styles cpt is being reset, we might need to update this condition in the future.
		$global_style_keys      = array_keys( json_decode( $post->post_content, true ) ?? array() );
		$is_empty_global_styles = count( array_diff( $global_style_keys, array( 'version', 'isGlobalStylesUserThemeJSON' ) ) ) === 0;

		// By default, we know that we are at least updating.
		$event_name = 'wpcom_core_global_styles_customize';

		// If we are updating to empty contents then we know for sure we are resetting the contents.
		if ( $is_empty_global_styles ) {
			$event_name = 'wpcom_core_global_styles_reset';
		}
	}

	// Invoke the correct function based on the underlying infrastructure.
	if ( function_exists( 'wpcomsh_record_tracks_event' ) ) {
		wpcomsh_record_tracks_event( $event_name, $event_props );
	} elseif ( function_exists( 'require_lib' ) && function_exists( 'tracks_record_event' ) ) {
		require_lib( 'tracks/client' );
		tracks_record_event( get_current_user_id(), $event_name, $event_props );
	}

	// Delegate logging to the underlying infrastructure.
	do_action( 'global_styles_log', $event_name );
}
add_action( 'save_post_wp_global_styles', 'wpcom_track_global_styles', 10, 3 );

/**
 * Check if a `wp_global_styles` post contains custom Global Styles.
 *
 * @param array $wp_global_styles_post The `wp_global_styles` post.
 * @return bool Whether the post contains custom Global Styles.
 */
function wpcom_global_styles_in_use_by_wp_global_styles_post( array $wp_global_styles_post = array() ) {
	if ( ! isset( $wp_global_styles_post['post_content'] ) ) {
		return false;
	}

	$global_styles_content = json_decode( $wp_global_styles_post['post_content'], true ) ?? array();

	// Some keys are ignored because they are not relevant to a custom style
	// behaviours are not relevant if blank - as they where when included during GB16.4 and later removed.
	$ignored_keys = array( 'version', 'isGlobalStylesUserThemeJSON' );

	if ( wpcom_site_has_feature( WPCOM_Features::CUSTOM_DESIGN ) ) {
		unset( $global_styles_content['styles']['css'] );
	}

	$theme_base_css = WP_Theme_JSON_Resolver::get_theme_data()->get_stylesheet( array( 'custom-css' ) ) ?? '';

	$theme_base_css = preg_replace( '/\s+/', '', $theme_base_css );
	$custom_css     = preg_replace( '/\s+/', '', $global_styles_content['styles']['css'] ?? '' );

	if ( $theme_base_css === $custom_css || empty( $global_styles_content['styles']['css'] ) ) {
		unset( $global_styles_content['styles']['css'] );
	}

	if ( empty( $global_styles_content['styles'] ) ) {
		unset( $global_styles_content['styles'] );
	}

	if ( isset( $global_styles_content['behaviors'] ) && empty( $global_styles_content['behaviors'] ) ) {
		$ignored_keys[] = 'behaviors';
	}

	$global_style_keys    = array_keys( $global_styles_content );
	$global_styles_in_use = count( array_diff( $global_style_keys, $ignored_keys ) ) > 0;

	return $global_styles_in_use;
}

/**
 * Checks if the current user can edit the `wp_global_styles` post type.
 *
 * @param int $blog_id Blog ID.
 * @return bool Whether the current user can edit the `wp_global_styles` post type.
 */
function wpcom_global_styles_current_user_can_edit_wp_global_styles( $blog_id = 0 ) {
	// Non-Simple sites on a lower plan are temporary edge cases.
	// We skip this check to prevent fatals on non-multisite installations.
	if ( ! defined( 'IS_WPCOM' ) || ! IS_WPCOM ) {
		return true;
	}

	if ( ! $blog_id ) {
		$blog_id = get_current_blog_id();
	}
	switch_to_blog( $blog_id );
	$wp_global_styles_cpt = get_post_type_object( 'wp_global_styles' );
	restore_current_blog();
	return current_user_can( $wp_global_styles_cpt->cap->publish_posts );
}

/**
 * Checks if the current blog has custom styles in use.
 *
 * @return bool Returns true if custom styles are in use.
 */
function wpcom_global_styles_in_use() {
	/*
	 * If `WP_Theme_JSON_Resolver` is missing, then the site is running an old version
	 * of WordPress, so we cannot determine whether the site has custom styles.
	 */
	if ( ! class_exists( 'WP_Theme_JSON_Resolver' ) ) {
		return false;
	}

	$user_cpt = WP_Theme_JSON_Resolver::get_user_data_from_wp_global_styles( wp_get_theme() );

	$global_styles_in_use = wpcom_global_styles_in_use_by_wp_global_styles_post( $user_cpt );

	if ( $global_styles_in_use ) {
		do_action( 'global_styles_log', 'global_styles_in_use' );
	} else {
		do_action( 'global_styles_log', 'global_styles_not_in_use' );
	}

	return $global_styles_in_use;
}

/**
 * Checks whether the site is exempt from Premium Global Styles because
 * it was created before the Premium Global Styles launch date (2022-12-15)
 * and had already customized its Global Styles.
 *
 * We use blog stickers and other strategies to only perform the intensive check
 * when strictly needed.
 *
 * @param  int $blog_id Blog ID.
 * @return bool Whether the site is exempt from Premium Global Styles.
 */
function wpcom_premium_global_styles_is_site_exempt( $blog_id = 0 ) {
	// Sites created after we made GS a paid feature (2022-12-15) are never exempt.
	if ( $blog_id >= 213403000 ) {
		return false;
	}

	// If the exemption check has already been performed, just return if the site is exempt.
	if ( wpcom_global_styles_has_blog_sticker( 'wpcom-premium-global-styles-exemption-checked', $blog_id ) ) {
		return wpcom_global_styles_has_blog_sticker( 'wpcom-premium-global-styles-exempt', $blog_id );
	}

	// If the current user cannot modify the `wp_global_styles` CPT, the exemption check is not needed;
	// other conditions will determine whether they can use GS.
	if ( ! wpcom_global_styles_current_user_can_edit_wp_global_styles( $blog_id ) ) {
		return false;
	}

	switch_to_blog( $blog_id );

	$note = 'Automated sticker. See https://wp.me/p7DVsv-fY6#comment-44778';
	$user = 'a8c'; // A non-empty string avoids storing the current user as author of the sticker change.

	add_blog_sticker( 'wpcom-premium-global-styles-exemption-checked', $note, $user, $blog_id );

	$global_styles_used = false;

	$wp_global_styles_posts = get_posts(
		array(
			'post_type'   => 'wp_global_styles',
			'numberposts' => 100,
		)
	);
	foreach ( $wp_global_styles_posts as $wp_global_styles_post ) {
		if ( wpcom_global_styles_in_use_by_wp_global_styles_post( $wp_global_styles_post->to_array() ) ) {
			$global_styles_used = true;
			break;
		}
	}

	if ( $global_styles_used ) {
		add_blog_sticker( 'wpcom-premium-global-styles-exempt', $note, $user, $blog_id );
	}

	restore_current_blog();

	return $global_styles_used;
}

/**
 * Returns whether the global style banner should be shown or not.
 *
 * @return bool Whether the global styles upgrade banner should be rendered.
 */
function wpcom_should_show_global_styles_launch_bar() {
	$current_user_id = get_current_user_id();

	if ( ! $current_user_id ) {
		return false;
	}

	$current_blog_id = get_current_blog_id();

	if ( ! (
		is_user_member_of_blog( $current_user_id, $current_blog_id ) &&
		current_user_can( 'manage_options' )
	) ) {
		return false;
	}

	if ( has_blog_sticker( 'difm-lite-in-progress' ) ) {
		return false;
	}

	// The site is being previewed in Calypso or Gutenberg.
	if (
		isset( $_GET['iframe'] ) && 'true' === $_GET['iframe'] && ( // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Not a form action
			( isset( $_GET['theme_preview'] ) && 'true' === $_GET['theme_preview'] ) || // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Not a form action
			( isset( $_GET['preview'] ) && 'true' === $_GET['preview'] ) // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Not a form action
		) ||
		isset( $_GET['widgetPreview'] ) || // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Not a form action (Gutenberg < 9.2)
		isset( $_GET['widget-preview'] ) || // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Not a form action (Gutenberg >= 9.2)
		( isset( $_GET['hide_banners'] ) && $_GET['hide_banners'] === 'true' )  // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Not a form action
	) {
		return false;
	}

	// Do not show the lanuch banner when previewed in the customizer
	if ( is_customize_preview() ) {
		return false;
	}

	// No banner for agency-managed sites.
	if ( ! empty( get_option( 'is_fully_managed_agency_site' ) ) ) {
		return false;
	}

	if ( ! wpcom_should_limit_global_styles() || ! wpcom_global_styles_in_use() ) {
		return false;
	}

	return true;
}

/**
 * Renders the global style notice banner to the launch bar.
 */
function wpcom_display_global_styles_launch_bar() {
	if ( method_exists( '\WPCOM_Masterbar', 'get_calypso_site_slug' ) ) {
		$site_slug = WPCOM_Masterbar::get_calypso_site_slug( get_current_blog_id() );
	} else {
		$home_url  = home_url( '/' );
		$site_slug = wp_parse_url( $home_url, PHP_URL_HOST );
	}

	// @TODO Remove this once the global styles are available for all users on the Personal Plan.
	$gs_upgrade_plan = WPCOM_VALUE_BUNDLE;
	$upgrade_url     = "https://wordpress.com/plans/$site_slug?plan=value_bundle&feature=style-customization";
	if ( is_global_styles_on_personal_plan() ) {
		$gs_upgrade_plan = WPCOM_PERSONAL_BUNDLE;
		$upgrade_url     = "https://wordpress.com/plans/$site_slug?plan=personal-bundle&feature=style-customization";
	}

	if ( wpcom_is_previewing_global_styles() ) {
		$preview_location = add_query_arg( 'hide-global-styles', '' );
	} else {
		$preview_location = remove_query_arg( 'hide-global-styles' );
	}

	?>

	<div class="launch-banner" id="launch-banner" style="display:none;">
		<div class="launch-banner-content">
			<div class="launch-banner-section bar-controls">
				<div class="launch-bar-global-styles-button">
					<?php if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) : // Workaround for the shadow DOM used on Atomic sites. ?>
						<style id="wpcom-launch-bar-global-styles-button-style">
							<?php include __DIR__ . '/dist/wpcom-global-styles-view.css'; ?>
							.hidden { display: none; }
						</style>
						<script id="wpcom-launch-bar-global-styles-button-script">
							const launchBarUserData = {
								blogId: <?php echo method_exists( '\Jetpack_Options', 'get_option' ) ? (int) \Jetpack_Options::get_option( 'id' ) : get_current_blog_id(); ?>,
								isAtomic: true,
							};
							<?php
							include __DIR__ . '/dist/wpcom-global-styles-view.min.js';
							$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles-view.asset.php';
							$asset        = file_exists( $asset_file ) ? require $asset_file : null;
							$dependencies = $asset['dependencies'] ?? array();
							foreach ( $dependencies as $dep ) {
								$dep_script = wp_scripts()->registered[ $dep ];
								if ( ! $dep_script ) {
									continue;
								}
								include ABSPATH . $dep_script->src;
							}
							?>
						</script>
					<?php endif; ?>
					<div class="launch-bar-global-styles-popover hidden">
						<div class="launch-bar-global-styles-close">
							<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>
						</div>
						<div class="launch-bar-global-styles-message">
							<?php
							$support_url = function_exists( 'localized_wpcom_url' )
								? localized_wpcom_url( 'https://wordpress.com/support/using-styles/' )
								// phpcs:ignore WPCOM.I18nRules.LocalizedUrl.UnlocalizedUrl
								: 'https://wordpress.com/support/using-styles/';

							$message = sprintf(
								/* translators: %1$s - documentation URL, %2$s - the name of the required plan */
								__(
									'Your site includes <a href="%1$s" target="_blank">premium styles</a> that are only visible to visitors after upgrading to the %2$s plan or higher.',
									'jetpack-mu-wpcom'
								),
								$support_url,
								get_store_product( $gs_upgrade_plan )->product_name
							);
							printf(
								wp_kses(
									$message,
									array(
										'a' => array(
											'href'   => array(),
											'target' => array(),
										),
									)
								)
							);
							?>
						</div>
						<a
							class="launch-bar-global-styles-upgrade"
							href="<?php echo esc_url( $upgrade_url ); ?>"
						>
							<?php echo esc_html__( 'Upgrade now', 'jetpack-mu-wpcom' ); ?>
						</a>
						<a
							class="launch-bar-global-styles-reset"
							href="https://wordpress.com/support/using-styles/#reset-all-styles"
							target="_blank"
						>
							<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M5.8125 5.6875C5.8125 4.75552 6.56802 4 7.5 4C8.43198 4 9.1875 4.75552 9.1875 5.6875C9.1875 6.55621 8.53108 7.2716 7.6872 7.36473C7.58427 7.37609 7.5 7.45895 7.5 7.5625V8.5M7.5 9.25V10.375M13.5 7C13.5 10.3137 10.8137 13 7.5 13C4.18629 13 1.5 10.3137 1.5 7C1.5 3.68629 4.18629 1 7.5 1C10.8137 1 13.5 3.68629 13.5 7Z" stroke="#1E1E1E" stroke-width="1.5"/>
							</svg>
							<?php echo esc_html__( 'Remove premium styles', 'jetpack-mu-wpcom' ); ?>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false"><path d="M18.2 17c0 .7-.6 1.2-1.2 1.2H7c-.7 0-1.2-.6-1.2-1.2V7c0-.7.6-1.2 1.2-1.2h3.2V4.2H7C5.5 4.2 4.2 5.5 4.2 7v10c0 1.5 1.2 2.8 2.8 2.8h10c1.5 0 2.8-1.2 2.8-2.8v-3.6h-1.5V17zM14.9 3v1.5h3.7l-6.4 6.4 1.1 1.1 6.4-6.4v3.7h1.5V3h-6.3z"></path></svg>
						</a>
						<a class="launch-bar-global-styles-preview" href="<?php echo esc_url( $preview_location ); ?>">
							<label><input type="checkbox" <?php echo wpcom_is_previewing_global_styles() ? 'checked' : ''; ?>><span></span></label>
							<?php echo esc_html__( 'Preview premium styles', 'jetpack-mu-wpcom' ); ?>
						</a>
					</div>
					<a class="launch-bar-global-styles-toggle" href="#">
						<svg width="25" height="25" viewBox="0 96 960 960" xmlns="http://www.w3.org/2000/svg">
							<path d="M479.982 776q14.018 0 23.518-9.482 9.5-9.483 9.5-23.5 0-14.018-9.482-23.518-9.483-9.5-23.5-9.5-14.018 0-23.518 9.482-9.5 9.483-9.5 23.5 0 14.018 9.482 23.518 9.483 9.5 23.5 9.5ZM453 623h60V370h-60v253Zm27.266 353q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80 658.319 80 575.5q0-82.819 31.5-155.659Q143 347 197.5 293t127.341-85.5Q397.681 176 480.5 176q82.819 0 155.659 31.5Q709 239 763 293t85.5 127Q880 493 880 575.734q0 82.734-31.5 155.5T763 858.316q-54 54.316-127 86Q563 976 480.266 976Zm.234-60Q622 916 721 816.5t99-241Q820 434 721.188 335 622.375 236 480 236q-141 0-240.5 98.812Q140 433.625 140 576q0 141 99.5 240.5t241 99.5Zm-.5-340Z" style="fill: orange"/>
						</svg>
						<span class="is-mobile">
							<?php echo esc_html__( 'Upgrade', 'jetpack-mu-wpcom' ); ?>
						</span>
						<span class="is-desktop">
							<?php echo esc_html__( 'Upgrade required', 'jetpack-mu-wpcom' ); ?>
						</span>
					</a>
				</div>
			</div>
		</div>
	</div>
	<?php
}

/**
 * Maybe registers the global styles banner.
 *
 * @param array $banners Banners.
 *
 * @return array
 */
function wpcom_register_global_styles_launch_bar( $banners ) {
	// If the banner shouldn't display, don't inject it.
	if ( ! wpcom_should_show_global_styles_launch_bar() ) {
		return $banners;
	}

	return array_merge( $banners, array( 'wpcom_launch_banner' => 'wpcom_init_global_styles_launch_bar' ) );
}

/**
 * Show the global styles banner for the current site.
 */
function wpcom_init_global_styles_launch_bar() {
	add_action( 'wp_head', 'wpcom_global_styles_enqueue_assets' );
	add_filter( 'wp_footer', 'wpcom_display_global_styles_launch_bar' );
}

add_filter( 'wpcom_register_banners', 'wpcom_register_global_styles_launch_bar' );

/**
 * Include the Rest API that returns the global style information for a give WordPress site.
 */
require_once __DIR__ . '/api/class-global-styles-status-rest-api.php';

/**
 * Checks if the necessary conditions are met in order to establish that the supplied user should be considered as previewing Global Styles.
 *
 * @param int|null $user_id User id to check.
 *
 * @return bool
 */
function wpcom_is_previewing_global_styles( ?int $user_id = null ) {
	if ( null === $user_id ) {
		$user_id = get_current_user_id();
	}

	if ( 0 === $user_id ) {
		return false;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	return ! isset( $_GET['hide-global-styles'] ) && user_can( $user_id, 'manage_options' );
}

/**
 * Checks whether the site has a Personal plan.
 *
 * @param  int $blog_id Blog ID.
 * @return bool Whether the site has a Personal plan.
 */
function wpcom_site_has_personal_plan( $blog_id ) {
	$personal_plans = array_filter(
		wpcom_get_site_purchases( $blog_id ),
		function ( $purchase ) {
			return strpos( $purchase->product_slug, 'personal-bundle' ) === 0;
		}
	);

	return ! empty( $personal_plans );
}

/**
 * Checks whether the site has a plan that grants access to the Global Styles feature.
 *
 * @param  int $blog_id Blog ID.
 * @return bool Whether the site has access to Global Styles.
 */
function wpcom_site_has_global_styles_feature( $blog_id = 0 ) {
	/*
	 * Non-Simple sites on a lower plan are temporary edge cases. We grant them access
	 * to Global Styles to prevent unexpected temporary changes in their styles.
	 */
	if ( ! defined( 'IS_WPCOM' ) || ! IS_WPCOM ) {
		return true;
	}

	if ( wpcom_site_has_feature( WPCOM_Features::GLOBAL_STYLES, $blog_id ) ) {
		return true;
	}

	// Users who bought a Personal plan during the GS on Personal experiment should
	// retain access to Global Styles.
	if ( wpcom_global_styles_has_blog_sticker( 'wpcom-global-styles-personal-plan', $blog_id ) ) {
		if ( wpcom_site_has_personal_plan( $blog_id ) ) {
			return true;
		} else {
			$note = 'Automated sticker. See https://wp.me/paYJgx-3yE';
			$user = 'a8c'; // A non-empty string avoids storing the current user as author of the sticker change.
			remove_blog_sticker( 'wpcom-global-styles-personal-plan', $note, $user, $blog_id );
			return false;
		}
	}

	// If the GLOBAL_STYLES_ON_PERSONAL_PLAN feature is enabled, we need to check if the site has a Personal plan and add the sticker.
	if ( is_global_styles_on_personal_plan() ) {
		if ( wpcom_site_has_personal_plan( $blog_id ) ) {
			$note = 'Automated sticker. See paYJgx-5w2-p2';
			$user = 'a8c'; // A non-empty string avoids storing the current user as author of the sticker change.
			add_blog_sticker( 'wpcom-global-styles-personal-plan', $note, $user, $blog_id );
			return true;
		}
	}

	return false;
}

/**
 * Checks whether the site has access to the Global Styles feature when the editor is live previewing a Premium theme without a Premium plan or higher.
 *
 * @param int $blog_id The WPCOM blog ID.
 * @return bool Whether the site has access to Global Styles when live previewing.
 */
function wpcom_global_styles_is_previewing_premium_theme_without_premium_plan( $blog_id ) {
	if ( ! isset( $_GET['wp_theme_preview'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		// Not live previewing.
		return false;
	}
	$wp_theme_preview = sanitize_text_field( wp_unslash( $_GET['wp_theme_preview'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	$is_previewing_premium_theme = str_starts_with( $wp_theme_preview, 'premium/' );
	if ( ! $is_previewing_premium_theme ) {
		// Not a premium theme.
		return false;
	}

	// Check for a Premium plan or higher by checking if can use global styles.
	$has_premium_plan_or_higher = wpcom_site_has_feature( WPCOM_Features::GLOBAL_STYLES, $blog_id );

	return ! $has_premium_plan_or_higher;
}

/**
 * Checks whether the site has access to Global Styles with a Personal plan as part of an A/B test.
 *
 * @param  int $blog_id Blog ID.
 * @return bool Whether the site has access to Global Styles with a Personal plan.
 */
function wpcom_site_has_global_styles_in_personal_plan( $blog_id = 0 ) {
	if ( ! defined( 'IS_WPCOM' ) || ! IS_WPCOM ) {
		return false;
	}

	if ( ! function_exists( '\ExPlat\assign_given_user' ) ) {
		return false;
	}

	if ( ! $blog_id ) {
		$blog_id = get_current_blog_id();
	}

	$cache_key                          = "global-styles-on-personal-03-2025-$blog_id";
	$found_in_cache                     = false;
	$has_global_styles_in_personal_plan = wp_cache_get( $cache_key, 'a8c_experiments', false, $found_in_cache );
	if ( $found_in_cache ) {
		return $has_global_styles_in_personal_plan;
	}

	$owner_id = wpcom_get_blog_owner( $blog_id );
	if ( ! $owner_id ) {
		return false;
	}

	$owner = get_userdata( $owner_id );
	if ( ! $owner ) {
		return false;
	}

	$experiment_assignment              = \ExPlat\assign_given_user( 'calypso_plans_global_styles_personal_v2_20240225', $owner );
	$has_global_styles_in_personal_plan = null !== $experiment_assignment;
	// Cache the experiment assignment to prevent duplicate DB queries in the frontend.
	wp_cache_set( $cache_key, $has_global_styles_in_personal_plan, 'a8c_experiments', MONTH_IN_SECONDS );
	return $has_global_styles_in_personal_plan;
}

/**
 * We return the upsell plan required for the current Global Styles plan requirement.
 *
 * @return string
 */
function wpcom_get_global_styles_upsell_plan_slug() {
	if ( wpcom_site_has_global_styles_in_personal_plan() ) {
		return 'personal-bundle';
	}

	return 'value_bundle';
}
add_filter( 'wpcom_customize_css_plan_slug', 'wpcom_get_global_styles_upsell_plan_slug' );
