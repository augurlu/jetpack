<?php
/**
 * Register the Social note custom post type.
 *
 * @package automattic/jetpack-social-plugin
 */

namespace Automattic\Jetpack\Social;

use Automattic\Jetpack\Constants;

/**
 * Register the Jetpack Social Note custom post type.
 */
class Note {
	const JETPACK_SOCIAL_NOTE_CPT     = 'jetpack-social-note';
	const JETPACK_SOCIAL_NOTES_CONFIG = 'jetpack_social_notes_config';
	const FLUSH_REWRITE_RULES_FLUSHED = 'jetpack_social_rewrite_rules_flushed';

	/**
	 * Check if the feature is enabled.
	 */
	public function enabled() {
		return (bool) get_option( self::JETPACK_SOCIAL_NOTE_CPT );
	}

	/**
	 * Initialize the Jetpack Social Note custom post type.
	 */
	public function init() {
		if ( ! self::enabled() ) {
			return;
		}
		add_filter( 'allowed_block_types_all', array( $this, 'restrict_blocks_for_social_note' ), 10, 2 );

		/*
		 * The ActivityPub plugin has a block to set a Fediverse post that a new post is in reply to. This is perfect for Social Notes.
		 */
		if ( Constants::get_constant( 'ACTIVITYPUB_PLUGIN_VERSION' ) ) {
			add_filter(
				'jetpack_social_allowed_blocks',
				function ( $allowed_blocks ) {
					$allowed_blocks[] = 'activitypub/reply';
					return $allowed_blocks;
				}
			);
		}

		self::register_cpt();
		add_action( 'wp_insert_post_data', array( $this, 'set_empty_title' ), 10, 2 );
		add_action( 'admin_init', array( $this, 'admin_init_actions' ) );

		if (
			/**
			 * Filters whether to override the empty title for Social Notes on the frontend.
			 *
			 * @since $$next-version$$
			 *
			 * @param bool $override_empty_title Whether to override the empty title for Social Notes on the frontend.
			 */
			apply_filters( 'jetpack_social_notes_override_empty_title', false )
		) {
			add_filter( 'the_title', array( $this, 'override_empty_title' ), 10, 2 );
		}
	}

	/**
	 * Things to do on admin_init.
	 */
	public function admin_init_actions() {
		\Automattic\Jetpack\Post_List\Post_List::setup();
		add_action( 'current_screen', array( $this, 'add_filters_and_actions_for_screen' ), 5 );
	}

	/**
	 * If the current_screen has 'edit' as the base, add filter to change the post list tables.
	 *
	 * @param object $current_screen The current screen.
	 */
	public function add_filters_and_actions_for_screen( $current_screen ) {
		if ( 'edit' !== $current_screen->base ) {
			return;
		}

		add_filter( 'the_title', array( $this, 'override_empty_title' ), 10, 2 );
		add_filter( 'jetpack_post_list_display_share_action', array( $this, 'show_share_action' ), 10, 2 );
	}

	/**
	 * Used as a filter to determine if we should show the share action on the post list screen.
	 *
	 * @param bool   $show_share The current filter value.
	 * @param string $post_type The current post type on the post list screen.
	 * @return bool Whether to show the share action.
	 */
	public function show_share_action( $show_share, $post_type ) {
		return self::JETPACK_SOCIAL_NOTE_CPT === $post_type || $show_share;
	}

	/**
	 * Set the title to empty string.
	 *
	 * @param array $data The Post Data.
	 * @param array $post The Post.
	 */
	public function set_empty_title( $data, $post ) {
		if ( self::JETPACK_SOCIAL_NOTE_CPT === $post['post_type'] && 'auto-draft' === $post['post_status'] ) {
			$data['post_title'] = '';
		}
		return $data;
	}

	/**
	 * Register the Jetpack Social Note custom post type.
	 */
	public function register_cpt() {
		$args = array(
			'public'       => true,
			'labels'       => array(
				'name'                  => esc_html__( 'Social Notes', 'jetpack-social' ),
				'singular_name'         => esc_html__( 'Social Note', 'jetpack-social' ),
				'menu_name'             => esc_html__( 'Social Notes', 'jetpack-social' ),
				'name_admin_bar'        => esc_html__( 'Social Note', 'jetpack-social' ),
				'add_new'               => esc_html__( 'Add New', 'jetpack-social' ),
				'add_new_item'          => esc_html__( 'Add New Note', 'jetpack-social' ),
				'new_item'              => esc_html__( 'New Note', 'jetpack-social' ),
				'edit_item'             => esc_html__( 'Edit Note', 'jetpack-social' ),
				'view_item'             => esc_html__( 'View Note', 'jetpack-social' ),
				'all_items'             => esc_html__( 'All Notes', 'jetpack-social' ),
				'search_items'          => esc_html__( 'Search Notes', 'jetpack-social' ),
				'parent_item_colon'     => esc_html__( 'Parent Notes:', 'jetpack-social' ),
				'not_found'             => esc_html__( 'No Notes found.', 'jetpack-social' ),
				'not_found_in_trash'    => esc_html__( 'No Notes found in Trash.', 'jetpack-social' ),
				'archives'              => esc_html__( 'Notes archives', 'jetpack-social' ),
				'insert_into_item'      => esc_html__( 'Insert into Note', 'jetpack-social' ),
				'uploaded_to_this_item' => esc_html__( 'Uploaded to this Note', 'jetpack-social' ),
				'filter_items_list'     => esc_html__( 'Filter Notes list', 'jetpack-social' ),
				'items_list_navigation' => esc_html__( 'Notes list navigation', 'jetpack-social' ),
				'items_list'            => esc_html__( 'Notes list', 'jetpack-social' ),
			),
			'show_in_rest' => true,
			'has_archive'  => true,
			'supports'     => array( 'editor', 'comments', 'thumbnail', 'publicize', 'enhanced_post_list', 'activitypub' ),
			'menu_icon'    => 'dashicons-welcome-write-blog',
			'rewrite'      => array( 'slug' => 'sn' ),
			'template'     => array(
				array(
					'core/paragraph',
					array(
						'placeholder' => __( "What's on your mind?", 'jetpack-social' ),
					),
				),
				// We should add this back when the double featured image issue is fixed.
				// array(
				// 'core/post-featured-image',
				// ),
			),
		);
		register_post_type( self::JETPACK_SOCIAL_NOTE_CPT, $args );
		self::maybe_flush_rewrite_rules();
	}

	/**
	 * Restrict the blocks for the Social Note CPT.
	 *
	 * @param array                    $allowed_blocks The allowed blocks.
	 * @param \WP_Block_Editor_Context $block_editor_context The current block editor context.
	 * @return array The allowed blocks.
	 */
	public function restrict_blocks_for_social_note( $allowed_blocks, $block_editor_context ) {
		if (
			! isset( $block_editor_context->post )
			|| ! $block_editor_context->post instanceof \WP_Post
			|| 'jetpack-social-note' !== $block_editor_context->post->post_type
		) {
			return $allowed_blocks;
		}

		// Only allow the paragraph block and the featured image block.
		$allowed_blocks = array(
			'core/paragraph',
			'core/post-featured-image',
		);

		/**
		 * Filters the blocks available to the Social Notes CPT.
		 *
		 * Default is ['core/paragraph', 'core/post-featured-image']
		 *
		 * @since 5.5.0
		 *
		 * @param array $allowed_blocks A linear array of blocks allowed by the CPT.
		 */
		return apply_filters( 'jetpack_social_allowed_blocks', $allowed_blocks );
	}

	/**
	 * Flush rewrite rules so the post permalink works correctly for the Social Note CPT. Flushing is an expensive operation, so do only when necessary.
	 *
	 * @param boolean $force Force flush the rewrite rules.
	 */
	public function maybe_flush_rewrite_rules( $force = false ) {
		if ( empty( get_option( self::FLUSH_REWRITE_RULES_FLUSHED ) ) || $force ) {
			flush_rewrite_rules( false );
			update_option( self::FLUSH_REWRITE_RULES_FLUSHED, true );
		}
	}

	/**
	 * Use the_title hook so we show the social note's exceprt in the post list view.
	 *
	 * @param array $title The title of the post, which we have set to be an empty string for Social Notes.
	 * @param array $post_id The Post ID.
	 */
	public function override_empty_title( $title, $post_id ) {
		$post = get_post( $post_id );

		if (
			$post instanceof \WP_Post &&
			self::JETPACK_SOCIAL_NOTE_CPT === $post->post_type
		) {
			$publishing_date = new \DateTimeImmutable(
				$post->post_date,
				wp_timezone()
			);

			$datetime_format = sprintf(
				/* Translators: %1$s is a formatted date, e.g. June 18, 2025. %2$s is a formatted time, e.g. 8:24 am. All other words/letters need to be escaped. */
				__( '%1$s \a\t %2$s', 'jetpack-social' ),
				get_option( 'date_format' ),
				get_option( 'time_format' )
			);

			$title = sprintf(
				/* Translators: placeholder is a fully-formatted date. */
				__( 'Social note, %1$s', 'jetpack-social' ),
				wp_date(
					$datetime_format,
					$publishing_date->getTimestamp()
				)
			);

			/**
			 * Filters the default title for a Social Note.
			 *
			 * @since $$next-version$$
			 *
			 * @param string $title The default title.
			 * @param \WP_Post $post The post.
			 */
			$title = apply_filters( 'jetpack_social_notes_default_title', $title, $post );
		}

		return $title;
	}
}
