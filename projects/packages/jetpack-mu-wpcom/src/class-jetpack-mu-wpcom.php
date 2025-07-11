<?php
/**
 * Enhances your site with features powered by WordPress.com
 * This package is intended for internal use on WordPress.com sites only (simple and Atomic).
 * Internal PT Reference: p9dueE-6jY-p2
 *
 * @package automattic/jetpack-mu-wpcom
 */

namespace Automattic\Jetpack;

define( 'WPCOM_ADMIN_BAR_UNIFICATION', true );
/**
 * Jetpack_Mu_Wpcom main class.
 */
class Jetpack_Mu_Wpcom {
	const PACKAGE_VERSION = '6.6.0';
	const PKG_DIR         = __DIR__ . '/../';
	const BASE_DIR        = __DIR__ . '/';
	const BASE_FILE       = __FILE__;

	/**
	 * Initialize the class.
	 */
	public static function init() {
		if ( did_action( 'jetpack_mu_wpcom_initialized' ) ) {
			return;
		}

		// Shared code for src/features.
		require_once self::PKG_DIR . 'src/common/index.php'; // phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.NotAbsolutePath
		require_once __DIR__ . '/utils.php';

		// Load features that don't need any special loading considerations.
		add_action( 'plugins_loaded', array( __CLASS__, 'load_features' ) );

		// Load features that only apply to WordPress.com-connected users.
		add_action( 'plugins_loaded', array( __CLASS__, 'load_wpcom_user_features' ) );
		add_action( 'plugins_loaded', array( __CLASS__, 'load_etk_features' ) );

		// Load ETK features flag to turn off the features in the ETK plugin.
		// It needs higher priority than the ETK plugin.
		add_action( 'plugins_loaded', array( __CLASS__, 'load_etk_features_flags' ), 0 );

		/*
		 * Please double-check whether you really need to load your feature separately.
		 * Chances are you can just add it to the `load_features` method.
		 */
		add_action( 'plugins_loaded', array( __CLASS__, 'load_launchpad' ), 0 );
		add_action( 'plugins_loaded', array( __CLASS__, 'load_coming_soon' ) );
		add_action( 'plugins_loaded', array( __CLASS__, 'load_wpcom_rest_api_endpoints' ) );

		// These features run only on simple sites.
		if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
			add_action( 'plugins_loaded', array( __CLASS__, 'load_verbum_comments' ) );
			add_action( 'plugins_loaded', array( __CLASS__, 'load_verbum_moderate' ) );
			add_action( 'wp_loaded', array( __CLASS__, 'load_verbum_comments_admin' ) );
			add_action( 'admin_menu', array( __CLASS__, 'load_wpcom_simple_odyssey_stats' ) );
			add_action( 'plugins_loaded', array( __CLASS__, 'load_wpcom_random_redirect' ) );
		}

		// These features run only on atomic sites.
		if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			add_action( 'plugins_loaded', array( __CLASS__, 'load_custom_css' ) );
			add_action( 'init', array( __CLASS__, 'schedule_translation_updates' ) );
		}

		// Unified navigation fix for changes in WordPress 6.2.
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'unbind_focusout_on_wp_admin_bar_menu_toggle' ) );

		// Load the Map block settings.
		add_action( 'enqueue_block_assets', array( __CLASS__, 'load_jetpack_mu_wpcom_settings' ), 999 );

		// Load the Map block settings.
		add_action( 'enqueue_block_assets', array( __CLASS__, 'load_map_block_settings' ), 999 );

		// Load the Newsletter category settings.
		add_action( 'enqueue_block_assets', array( __CLASS__, 'load_newsletter_categories_settings' ), 999 );

		// Load the Social Links feature.
		add_action( 'init', array( __CLASS__, 'load_social_links' ), 30 );

		/**
		 * Runs right after the Jetpack_Mu_Wpcom package is initialized.
		 *
		 * @since 0.1.2
		 */
		do_action( 'jetpack_mu_wpcom_initialized' );
	}

	/**
	 * Schedules translation updates for Jetpack MU WPCOM.
	 *
	 * This function sets up the necessary cron jobs to ensure that translation files
	 * are regularly updated.
	 *
	 * @return void
	 */
	public static function schedule_translation_updates() {
		add_action( 'wpcomsh_translation_update', array( __CLASS__, 'maybe_update_translations' ) );

		if ( ! wp_next_scheduled( 'wpcomsh_translation_update' ) ) {
			wp_schedule_event( time(), 'twicedaily', 'wpcomsh_translation_update' );
		}
	}

	/**
	 * Fetches and installs Jetpack-mu-wpcom package translations when needed.
	 */
	public static function maybe_update_translations() {
		global $wp_filesystem;
		if ( ! $wp_filesystem ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			WP_Filesystem();
		}

		$locales = self::get_all_active_locales();
		if ( empty( $locales ) ) {
			return;
		}

		$plugins_request_data              = array();
		$plugin_language_pack_destinations = array(
			'jetpack-mu-wpcom' => WP_LANG_DIR . '/mu-plugins/',
			'wpcomsh'          => WP_LANG_DIR . '/mu-plugins/',
		);

		foreach ( array_keys( $plugin_language_pack_destinations ) as $plugin_slug ) {
			$plugins_request_data[ $plugin_slug ] = array( 'version' => 'latest' );
		}

		$response = wp_remote_post(
			'https://translate.wordpress.com/api/translations-updates/wpcom/plugins',
			array(
				'body'    => wp_json_encode(
					array(
						'locales' => $locales,
						'plugins' => $plugins_request_data,
					)
				),
				'headers' => array( 'Content-Type' => 'application/json' ),
				'timeout' => 10,
			)
		);

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
			return;
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		// API error, api returned but something was wrong.
		if ( array_key_exists( 'success', $data ) && false === $data['success'] ) {
			return;
		}

		if ( ! is_array( $data ) || ! is_array( $data['data'] ) ) {
			return;
		}

		foreach ( $data['data'] as $plugin_name => $language_packs ) {
			if ( ! isset( $plugin_language_pack_destinations[ $plugin_name ] ) ) {
				continue;
			}

			$destination = $plugin_language_pack_destinations[ $plugin_name ];

			foreach ( $language_packs as $translation ) {
				$locale        = $translation['wp_locale'] ?? '';
				$package_url   = $translation['package'] ?? '';
				$last_modified = $translation['last_modified'] ?? '';

				if ( ! $locale || ! $package_url || ! $last_modified ) {
					continue;
				}

				$local_po_file = "{$destination}/$plugin_name-{$locale}.po";
				if ( file_exists( $local_po_file ) ) {
					$local_po_data                       = wp_get_pomo_file_data( $local_po_file );
					$installed_translation_revision_time = new \DateTime( $local_po_data['PO-Revision-Date'] );
					$new_translation_revision_time       = new \DateTime( $last_modified );

					// Skip if translation language pack is not newer than what is installed already.
					if ( $new_translation_revision_time <= $installed_translation_revision_time ) {
						continue;
					}
				}

				$translation_zip_file = download_url( $package_url );
				if ( is_wp_error( $translation_zip_file ) ) {
					continue;
				}

				static::clear_translation_destination( $destination, $plugin_name, $locale );

				$unzip_result = unzip_file( $translation_zip_file, $destination );
				if ( is_wp_error( $unzip_result ) ) {
					wp_delete_file( $translation_zip_file );
					continue;
				}

				wp_delete_file( $translation_zip_file );

			}
		}
	}

	/**
	 * Clears the translation destination by deleting existing translation files.
	 *
	 * @param string $local_destination The local destination path.
	 * @param string $plugin_slug The plugin slug.
	 * @param string $locale The locale.
	 */
	public static function clear_translation_destination( $local_destination, $plugin_slug, $locale ) {
		global $wp_filesystem;

		if ( ! $wp_filesystem ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			WP_Filesystem();
		}

		$files = array(
			"{$local_destination}{$plugin_slug}-{$locale}.po",
			"{$local_destination}{$plugin_slug}-{$locale}.mo",
			"{$local_destination}{$plugin_slug}-{$locale}.l10n.php",
		);

		$json_files = glob( "{$local_destination}{$plugin_slug}-{$locale}-*.json" );
		if ( $json_files ) {
			$files = array_merge( $files, $json_files );
		}

		foreach ( $files as $file ) {
			if ( $wp_filesystem->exists( $file ) ) {
				$wp_filesystem->delete( $file );
			}
		}
	}

	/**
	 * Retrieves all active locales for the site.
	 */
	public static function get_all_active_locales() {
		$locales = array( get_locale() );

		$available_languages = get_available_languages();
		if ( ! empty( $available_languages ) ) {
			$locales = array_merge( $locales, $available_languages );
		}
		return array_values( array_unique( $locales ) );
	}

	/**
	 * Load features that don't need any special loading considerations.
	 */
	public static function load_features() {
		// Please keep the features in alphabetical order.
		require_once __DIR__ . '/features/100-year-plan/enhanced-ownership.php';
		require_once __DIR__ . '/features/100-year-plan/locked-mode.php';
		require_once __DIR__ . '/features/admin-color-schemes/admin-color-schemes.php';
		require_once __DIR__ . '/features/block-patterns/block-patterns.php';
		require_once __DIR__ . '/features/blog-privacy/blog-privacy.php';
		require_once __DIR__ . '/features/cloudflare-analytics/cloudflare-analytics.php';
		require_once __DIR__ . '/features/css-monkey-patches/index.php';
		require_once __DIR__ . '/features/error-reporting/error-reporting.php';
		require_once __DIR__ . '/features/first-posts-stream/first-posts-stream-helpers.php';
		require_once __DIR__ . '/features/font-smoothing-antialiased/font-smoothing-antialiased.php';
		require_once __DIR__ . '/features/google-analytics/google-analytics.php';
		require_once __DIR__ . '/features/holiday-snow/class-holiday-snow.php';
		require_once __DIR__ . '/features/import-customizations/import-customizations.php';
		require_once __DIR__ . '/features/launch-button/index.php';
		require_once __DIR__ . '/features/logo-tool/logo-tool.php';
		require_once __DIR__ . '/features/marketplace-products-updater/class-marketplace-products-updater.php';
		require_once __DIR__ . '/features/media/heif-support.php';
		require_once __DIR__ . '/features/post-categories/quick-actions.php';
		require_once __DIR__ . '/features/site-editor-dashboard-link/site-editor-dashboard-link.php';
		require_once __DIR__ . '/features/wpcom-admin-dashboard/wpcom-admin-dashboard.php';
		require_once __DIR__ . '/features/wpcom-block-editor/class-jetpack-wpcom-block-editor.php';
		require_once __DIR__ . '/features/wpcom-block-editor/functions.editor-type.php';
		require_once __DIR__ . '/features/wpcom-hotfixes/wpcom-hotfixes.php';
		require_once __DIR__ . '/features/wpcom-logout/wpcom-logout.php';
		require_once __DIR__ . '/features/wpcom-themes/wpcom-theme-fixes.php';
		require_once __DIR__ . '/features/wpcom-post-list/wpcom-post-types-tracking.php';
		require_once __DIR__ . '/features/wpcom-widgets/wpcom-widgets.php';
		require_once __DIR__ . '/features/wpcom-wpadmin-page-view/wpcom-wpadmin-page-view.php';

		// Initializers, if needed.
		\Marketplace_Products_Updater::init();
		\Automattic\Jetpack\Classic_Theme_Helper\Main::init();
		\Automattic\Jetpack\Classic_Theme_Helper\Featured_Content::setup();

		\Automattic\Jetpack\Jetpack_Mu_Wpcom\Holiday_Snow::init();

		// Gets autoloaded from the Scheduled_Updates package.
		if ( class_exists( 'Automattic\Jetpack\Scheduled_Updates' ) ) {
			Scheduled_Updates::init();
		}
	}

	/**
	 * Load features that only apply to WordPress.com users.
	 */
	public static function load_wpcom_user_features() {
		if ( ! is_wpcom_user() ) {
			require_once __DIR__ . '/features/replace-site-visibility/hide-site-visibility.php';

			return;
		}

		// To avoid potential collisions with ETK.
		if ( ! class_exists( 'A8C\FSE\Help_Center' ) ) {
			require_once __DIR__ . '/features/help-center/class-help-center.php';
		}
		require_once __DIR__ . '/features/pages/pages.php';
		require_once __DIR__ . '/features/replace-site-visibility/replace-site-visibility.php';
		require_once __DIR__ . '/features/wpcom-admin-bar/wpcom-admin-bar.php';
		require_once __DIR__ . '/features/wpcom-admin-interface/wpcom-admin-interface.php';
		require_once __DIR__ . '/features/wpcom-admin-menu/wpcom-admin-menu.php';
		require_once __DIR__ . '/features/wpcom-command-palette/wpcom-command-palette.php';
		require_once __DIR__ . '/features/wpcom-comments/wpcom-comments.php';
		require_once __DIR__ . '/features/wpcom-dashboard-widgets/wpcom-dashboard-widgets.php';
		require_once __DIR__ . '/features/wpcom-locale/sync-locale-from-calypso-to-atomic.php';
		require_once __DIR__ . '/features/wpcom-media/wpcom-media-url-upload.php';
		require_once __DIR__ . '/features/wpcom-media/wpcom-export-media-files.php';
		require_once __DIR__ . '/features/wpcom-options-general/options-general.php';
		require_once __DIR__ . '/features/wpcom-plugins/wpcom-plugins.php';
		require_once __DIR__ . '/features/wpcom-profile-settings/profile-settings-link-to-wpcom.php';
		require_once __DIR__ . '/features/wpcom-profile-settings/profile-settings-notices.php';
		require_once __DIR__ . '/features/wpcom-sidebar-notice/wpcom-sidebar-notice.php';
		require_once __DIR__ . '/features/wpcom-themes/wpcom-themes.php';
		require_once __DIR__ . '/features/wpcom-user-edit/wpcom-user-edit.php';

		// Only load the Calypsoify and Masterbar features on WoA sites.
		if ( class_exists( '\Automattic\Jetpack\Status\Host' ) && ( new \Automattic\Jetpack\Status\Host() )->is_woa_site() ) {
			\Automattic\Jetpack\Calypsoify\Jetpack_Calypsoify::get_instance();
			// This is temporary. After we cleanup Masterbar on WPCOM we should load Masterbar for Simple sites too.
			\Automattic\Jetpack\Masterbar\Main::init();
		}
	}

	/**
	 * Define the flags to turn off features in the ETK plugin.
	 * Can be removed once the feature no longer exists in the ETK plugin.
	 */
	public static function load_etk_features_flags() {
		// Don't load on agency sites.
		if ( is_fully_managed_agency_site() ) {
			return;
		}

		// Don't load if the user is not a wpcom user on WP Admin.
		// The features is still required on the frontend page regardless of the user.
		if ( is_admin() && ! is_wpcom_user() ) {
			return;
		}

		define( 'MU_WPCOM_COBLOCKS_GALLERY', true );
		define( 'MU_WPCOM_CUSTOM_LINE_HEIGHT', true );
		define( 'MU_WPCOM_BLOCK_INSERTER_MODIFICATIONS', true );
		define( 'MU_WPCOM_HOMEPAGE_TITLE_HIDDEN', true );
		define( 'MU_WPCOM_JETPACK_GLOBAL_STYLES', true );
		define( 'A8C_USE_FONT_SMOOTHING_ANTIALIASED', false );
		define( 'MU_WPCOM_NEWSPACK_BLOCKS', true );
		define( 'MU_WPCOM_MAILERLITE_WIDGET', true );
		define( 'MU_WPCOM_OVERRIDE_PREVIEW_BUTTON_URL', true );
		define( 'MU_WPCOM_PARAGRAPH_BLOCK', true );
		define( 'MU_WPCOM_STARTER_PAGE_TEMPLATES', true );
		define( 'MU_WPCOM_TAGS_EDUCATION', true );
		define( 'MU_WPCOM_BLOCK_DESCRIPTION_LINKS', true );
		define( 'MU_WPCOM_BLOCK_EDITOR_NUX', true );
		define( 'MU_WPCOM_POSTS_LIST_BLOCK', true );
		define( 'MU_WPCOM_JETPACK_COUNTDOWN_BLOCK', true );
		define( 'MU_WPCOM_JETPACK_TIMELINE_BLOCK', true );
		define( 'MU_WPCOM_DOCUMENTATION_LINKS', true );
		define( 'MU_WPCOM_GLOBAL_STYLES', true );
		define( 'MU_WPCOM_FSE', true );
		define( 'MU_WPCOM_TEMPLATE_INSERTER', true );
		define( 'MU_WPCOM_WHATS_NEW', true );
	}

	/**
	 * Load ETK features.
	 * Can be moved back to load_features() once the feature no longer exists in the ETK plugin.
	 */
	public static function load_etk_features() {
		// Don't load on agency sites.
		if ( is_fully_managed_agency_site() ) {
			return;
		}

		// Don't load if the user is not a wpcom user on WP Admin.
		// The features is still required on the frontend page regardless of the user.
		if ( is_admin() && ! is_wpcom_user() ) {
			return;
		}

		require_once __DIR__ . '/features/jetpack-global-styles/class-global-styles.php';
		require_once __DIR__ . '/features/mailerlite/subscriber-popup.php';
		require_once __DIR__ . '/features/wpcom-fse/wpcom-fse.php';

		/**
		 * Load features for the editor and the frontend pages.
		 *
		 * This also avoid redeclaring the `Newspack_Blocks` class as follows
		 * - The `Newspack_Blocks` class is declared by jetpack-mu-wpcom plugin by the `plugin_loaded` hook.
		 * - When people try to activate the newspack blocks plugin, it will try to declare it again.
		 */
		global $pagenow;
		$allowed_pages = array( 'post.php', 'post-new.php', 'site-editor.php' );
		if ( ( isset( $pagenow ) && in_array( $pagenow, $allowed_pages, true ) ) || ! is_admin() ) {
			require_once __DIR__ . '/features/block-editor/custom-line-height.php';
			require_once __DIR__ . '/features/block-inserter-modifications/block-inserter-modifications.php';
			require_once __DIR__ . '/features/hide-homepage-title/hide-homepage-title.php';
			// To avoid potential collisions with newspack-blocks plugin.
			if ( ! class_exists( '\Newspack_Blocks', false ) ) {
				require_once __DIR__ . '/features/newspack-blocks/index.php';
			}
			require_once __DIR__ . '/features/override-preview-button-url/override-preview-button-url.php';
			require_once __DIR__ . '/features/paragraph-block-placeholder/paragraph-block-placeholder.php';
			require_once __DIR__ . '/features/tags-education/tags-education.php';
			require_once __DIR__ . '/features/wpcom-block-description-links/wpcom-block-description-links.php';
			require_once __DIR__ . '/features/wpcom-block-editor-nux/class-wpcom-block-editor-nux.php';
			require_once __DIR__ . '/features/wpcom-blocks/a8c-posts-list/a8c-posts-list.php';
			require_once __DIR__ . '/features/wpcom-blocks/event-countdown/event-countdown.php';
			require_once __DIR__ . '/features/wpcom-blocks/timeline/timeline.php';
			require_once __DIR__ . '/features/wpcom-documentation-links/wpcom-documentation-links.php';
			require_once __DIR__ . '/features/wpcom-global-styles/index.php';
			require_once __DIR__ . '/features/wpcom-legacy-fse/wpcom-legacy-fse.php';
		}
	}

	/**
	 * Load the Coming Soon feature.
	 */
	public static function load_coming_soon() {
		/**
		 * On WoA sites, users may be using non-symlinked older versions of the FSE plugin.
		 * If they are, check the active version to avoid redeclaration errors.
		 */
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		/**
		 * Explicitly pass $markup = false in get_plugin_data to avoid indirectly calling wptexturize that could cause unintended side effects.
		 * See: https://developer.wordpress.org/reference/functions/get_plugin_data/
		 */
		$fse_plugin                 = 'full-site-editing/full-site-editing-plugin.php';
		$fse_plugin_path            = WP_PLUGIN_DIR . '/' . $fse_plugin;
		$invalid_fse_version_active =
			file_exists( $fse_plugin_path ) &&
			is_file( $fse_plugin_path ) &&
			is_plugin_active( $fse_plugin ) &&
			version_compare( get_plugin_data( $fse_plugin_path, false )['Version'], '3.56084', '<' );

		if ( $invalid_fse_version_active ) {
			return;
		}

		if (
			( defined( 'WPCOM_PUBLIC_COMING_SOON' ) && WPCOM_PUBLIC_COMING_SOON ) ||
			apply_filters( 'a8c_enable_public_coming_soon', false )
		) {
			require_once __DIR__ . '/features/coming-soon/coming-soon.php';
		}
	}

	/**
	 * Load the Launchpad feature.
	 */
	public static function load_launchpad() {
		require_once __DIR__ . '/features/launchpad/launchpad.php';
	}

	/**
	 * Load WP REST API plugins for wpcom.
	 */
	public static function load_wpcom_rest_api_endpoints() {
		if ( ! function_exists( 'wpcom_rest_api_v2_load_plugin' ) ) {
			return;
		}

		// We don't use `wpcom_rest_api_v2_load_plugin_files` because it operates inconsisently.
		$plugins = glob( __DIR__ . '/features/wpcom-endpoints/*.php' );

		if ( ! is_array( $plugins ) ) {
			return;
		}

		foreach ( array_filter( $plugins, 'is_file' ) as $plugin ) {
			require_once $plugin;
		}
	}

	/**
	 * Adds a global variable containing the config of the plugin to the window object.
	 */
	public static function load_jetpack_mu_wpcom_settings() {
		$handle = 'jetpack-mu-wpcom-settings';

		// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.NotInFooter
		wp_register_script(
			$handle,
			false,
			array(),
			true
		);

		$data = wp_json_encode(
			array(
				'assetsUrl' => plugins_url( 'build/', self::BASE_FILE ),
			)
		);

		wp_add_inline_script(
			$handle,
			"var JETPACK_MU_WPCOM_SETTINGS = $data;",
			'before'
		);

		wp_enqueue_script( $handle );
	}

	/**
	 * Adds a global variable containing the map provider in a map_block_settings object to the window object.
	 */
	public static function load_map_block_settings() {
		if (
			! function_exists( 'get_current_screen' )
			|| \get_current_screen() === null
		) {
			return;
		}

		// Return early if we are not in the block editor.
		if ( ! wp_should_load_block_editor_scripts_and_styles() ) {
			return;
		}

		$map_provider = apply_filters( 'wpcom_map_block_map_provider', 'mapbox' );
		wp_localize_script( 'jetpack-blocks-editor', 'Jetpack_Maps', array( 'provider' => $map_provider ) );
	}

	/**
	 * Adds a global variable containing where the newsletter categories should be shown.
	 */
	public static function load_newsletter_categories_settings() {
		if (
			! function_exists( 'get_current_screen' )
			|| \get_current_screen() === null
		) {
			return;
		}

		// Return early if we are not in the block editor.
		if ( ! wp_should_load_block_editor_scripts_and_styles() ) {
			return;
		}

		$newsletter_categories_location = apply_filters( 'wpcom_newsletter_categories_location', 'block' );
		wp_localize_script( 'jetpack-blocks-editor', 'Jetpack_Subscriptions', array( 'newsletter_categories_location' => $newsletter_categories_location ) );
	}

	/**
	 * Unbinds focusout event handler on #wp-admin-bar-menu-toggle introduced in WordPress 6.2.
	 *
	 * The focusout event handler is preventing the unified navigation from being closed on mobile.
	 */
	public static function unbind_focusout_on_wp_admin_bar_menu_toggle() {
		wp_add_inline_script( 'common', '(function($){ $(document).on("wp-responsive-activate", function(){ $(".is-nav-unification #wp-admin-bar-menu-toggle, .is-nav-unification #adminmenumain").off("focusout"); } ); }(jQuery) );' );
	}

	/**
	 * Determine whether to disable the comment experience.
	 *
	 * @param int $blog_id The blog ID.
	 * @return boolean
	 */
	private static function should_disable_comment_experience( $blog_id ) {
		$path_wp_for_teams = WP_CONTENT_DIR . '/lib/wpforteams/functions.php';

		if ( file_exists( $path_wp_for_teams ) ) {
			require_once $path_wp_for_teams;
		}

		// This covers both P2 and P2020 themes.
		$is_p2     = str_contains( get_stylesheet(), 'pub/p2' ) || function_exists( '\WPForTeams\is_wpforteams_site' ) && is_wpforteams_site( $blog_id );
		$is_forums = str_contains( get_stylesheet(), 'a8c/supportforums' ); // Not in /forums.

		$verbum_option_enabled = get_blog_option( $blog_id, 'enable_verbum_commenting', true );

		if ( empty( $verbum_option_enabled ) ) {
			return true;
		}

		// Don't load any comment experience in the Reader, GlotPress, wp-admin, or P2.
		return ( 1 === $blog_id || TRANSLATE_BLOG_ID === $blog_id || is_admin() || $is_p2 || $is_forums );
	}

	/**
	 * Load Verbum Comments.
	 */
	public static function load_verbum_comments() {
		if ( class_exists( 'Verbum_Comments' ) ) {
			return;
		} else {
			$blog_id = get_current_blog_id();
			// Jetpack loads Verbum though an iframe from jetpack.wordpress.com.
			// So we need to check the GET request for the blogid.
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( isset( $_GET['blogid'] ) ) {
				$blog_id = intval( $_GET['blogid'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			}
			if ( self::should_disable_comment_experience( $blog_id ) ) {
				return;
			}
			require_once __DIR__ . '/features/verbum-comments/class-verbum-comments.php';
			new \Automattic\Jetpack\Verbum_Comments();
		}
	}

	/**
	 * Load Verbum Comments Settings.
	 */
	public static function load_verbum_comments_admin() {
		require_once __DIR__ . '/features/verbum-comments/assets/class-verbum-admin.php';
		new \Automattic\Jetpack\Verbum_Admin();
	}

	/**
	 * Load Verbum Moderate.
	 */
	public static function load_verbum_moderate() {
		require_once __DIR__ . '/features/verbum-comments/assets/class-verbum-moderate.php';
		new \Automattic\Jetpack\Verbum_Moderate();
	}

	/**
	 * Load Odyssey Stats in Simple sites.
	 */
	public static function load_wpcom_simple_odyssey_stats() {
		require_once __DIR__ . '/features/wpcom-simple-odyssey-stats/wpcom-simple-odyssey-stats.php';
	}

	/**
	 * Load the Jetpack Custom CSS feature.
	 */
	public static function load_custom_css() {
		require_once __DIR__ . '/features/custom-css/custom-css/preprocessors.php';
		require_once __DIR__ . '/features/custom-css/custom-css.php';
	}

	/**
	 * Load the Random Redirect feature.
	 */
	public static function load_wpcom_random_redirect() {
		require_once __DIR__ . '/features/random-redirect/random-redirect.php';
	}

	/**
	 * Load the Social Links feature.
	 */
	public static function load_social_links() {
		if ( class_exists( 'Automattic\Jetpack\Classic_Theme_Helper\Social_Links' ) ) {
			new \Automattic\Jetpack\Classic_Theme_Helper\Social_Links();
		}
	}
}
