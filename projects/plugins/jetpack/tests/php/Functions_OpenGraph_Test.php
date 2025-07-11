<?php

use PHPUnit\Framework\Attributes\CoversFunction;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;

/**
 * Class with PHPUnit tests for Open Graph functions.
 *
 * @since 3.9.2
 * @covers ::jetpack_og_get_image
 * @covers ::jetpack_og_get_description
 * @covers ::jetpack_og_remove_query_blocks
 * @group jetpack-opengraph
 */
#[CoversFunction( 'jetpack_og_get_image' )]
#[CoversFunction( 'jetpack_og_get_description' )]
#[CoversFunction( 'jetpack_og_remove_query_blocks' )]
#[Group( 'jetpack-opengraph' )]
class Functions_OpenGraph_Test extends Jetpack_Attachment_TestCase {

	private $icon_id;

	/**
	 * Include Open Graph functions before each test.
	 *
	 * @since 3.9.2
	 */
	public function set_up() {
		parent::set_up();

		$this->icon_id = self::create_upload_object( __DIR__ . '/jetpack-icon.jpg', 0, true ); // 500 x 500
		require_once JETPACK__PLUGIN_DIR . 'functions.opengraph.php';
	}

	/**
	 * Include Open Graph functions after each test.
	 */
	public function tear_down() {
		parent::tear_down();

		// Restoring global variables.
		global $wp_the_query;
		$wp_the_query = new WP_Query();

		wp_delete_attachment( $this->icon_id );
	}

	/**
	 * @author automattic
	 * @since  3.9.2
	 */
	public function test_jetpack_og_get_image_default() {
		$image_url = jetpack_og_get_image();
		$this->assertIsArray( $image_url );
	}

	/**
	 * @author automattic
	 * @since  3.9.2
	 */
	public function test_jetpack_og_get_site_icon_and_logo_url() {
		$default_url = jetpack_og_get_image();

		// Test Jetpack's Site Logo
		update_option( 'site_logo', $this->icon_id );
		require_once JETPACK__PLUGIN_DIR . 'modules/theme-tools/site-logo/inc/functions.php';
		require_once JETPACK__PLUGIN_DIR . 'modules/theme-tools/site-logo/inc/class-site-logo.php';

		// Test Smaller/Invalid Jetpack's Site Logo
		$image_url = jetpack_og_get_image( 512, 512 );
		$this->assertNotEquals( jetpack_get_site_logo( 'url' ), $image_url['src'] );
		$this->assertEquals( $default_url['src'], $image_url['src'] );

		// Test Valid-sized Jetpack's Site Logo
		$image_url = jetpack_og_get_image( 200, 200 );
		$image_id  = jetpack_get_site_logo( 'id' );
		$logo      = wp_get_attachment_image_src( $image_id, 'full' );
		$this->assertEquals( $logo[0], $image_url['src'] );

		delete_option( 'site_logo' );
		update_option( 'site_icon', $this->icon_id );

		// Test Valid-sized core's Site Icon
		$image_url = jetpack_og_get_image( 200, 200 );
		$image_id  = get_option( 'site_icon' );
		$icon      = wp_get_attachment_image_src( $image_id, 'full' );
		$this->assertEquals( $icon[0], $image_url['src'] );

		delete_option( 'site_icon' );
	}

	/**
	 * Test potential descriptions given to OG description.
	 *
	 * @dataProvider jetpack_og_get_description_data_provider
	 *
	 * @param string $description Post description.
	 * @param string $cleaned_description Description cleaned up and ready to be used.
	 */
	#[DataProvider( 'jetpack_og_get_description_data_provider' )]
	public function test_jetpack_og_get_description_default( $description, $cleaned_description ) {
		// A test shortcode that should be removed from descriptions.
		add_shortcode(
			'foo',
			function () {
				return 'bar';
			}
		);

		$processed_description = jetpack_og_get_description( $description );

		$this->assertEquals(
			$cleaned_description,
			$processed_description
		);
	}

	/**
	 * Potential descriptions given to OG description.
	 */
	public static function jetpack_og_get_description_data_provider() {
		return array(
			'empty'                  => array(
				'',
				'Visit the post for more.',
			),
			'no_entities'            => array(
				"OpenGraph's test",
				'OpenGraph&#8217;s test',
			),
			'too_many_words'         => array(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam consectetur quam eget finibus consectetur. Donec sollicitudin finibus massa, ut cursus elit. Mauris dictum quam eu ullamcorper feugiat. Proin id ante purus. Aliquam lorem libero, tempus id dictum non, feugiat vel eros. Sed sed viverra libero. Praesent eu lacinia felis, et tempus turpis. Proin bibendum, ligula. These last sentence should be removed.',
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam consectetur quam eget finibus consectetur. Donec sollicitudin finibus massa, ut cursus elit. Mauris dictum quam eu ullamcorper feugiat. Proin id ante purus. Aliquam lorem libero, tempus id dictum non, feugiat vel eros. Sed sed viverra libero. Praesent eu lacinia felis, et tempus turpis. Proin bibendum, ligula.&hellip;',
			),
			'no_tags'                => array(
				'A post description<script>alert("hello");</script>',
				'A post description',
			),
			'no_shortcodes'          => array(
				'[foo test="true"]A post description',
				'A post description',
			),
			'no_links'               => array(
				'A post description https://jetpack.com',
				'A post description',
			),
			'no_html'                => array(
				'<strong>A post description</strong>',
				'A post description',
			),
			'image_then_text'        => array(
				'<img src="https://example.org/jetpack-icon.jpg" />A post description',
				'A post description',
			),
			'linked_image_then_text' => array(
				'<a href="https://jetpack.com"><img src="https://example.org/jetpack-icon.jpg" /></a>A post description',
				'A post description',
			),
		);
	}

	/**
	 * Create a post containing a few images attached to another post.
	 *
	 * @since 9.2.0
	 *
	 * @param int $number_of_images The number of image blocks to add to the post.
	 *
	 * @return array $post_info {
	 * An array of information about our post.
	 *  @type int   $post_id  Post ID.
	 *  @type array $img_urls Image URLs we'll look to extract.
	 * }
	 */
	protected function create_post_with_image_blocks( $number_of_images = 1 ) {
		$img_dimensions = array(
			'width'  => 250,
			'height' => 250,
		);

		$post_id = self::factory()->post->create();

		$image_urls = array();
		for ( $i = 1; $i <= $number_of_images; $i++ ) {
			$attachment_id = self::factory()->attachment->create_object(
				'image' . $i . '.jpg',
				$post_id,
				array(
					'post_mime_type' => 'image/jpeg',
					'post_type'      => 'attachment',
				)
			);
			wp_update_attachment_metadata( $attachment_id, $img_dimensions );
			$image_urls[ $attachment_id ] = wp_get_attachment_url( $attachment_id );
		}

		// Create another post with those images.
		$post_html = '';
		foreach ( $image_urls as $attachment_id => $image_url ) {
			$post_html .= sprintf(
				'<!-- wp:image {"id":%2$d} --><div class="wp-block-image"><figure class="wp-block-image"><img src="%1$s" alt="" class="wp-image-%2$d"/></figure></div><!-- /wp:image -->',
				$image_url,
				$attachment_id
			);
		}

		$second_post_id = self::factory()->post->create(
			array( 'post_content' => $post_html )
		);

		return array(
			'post_id'  => $second_post_id,
			'img_urls' => array_values( $image_urls ),
		);
	}

	/**
	 * Test if jetpack_og_get_image returns the correct image for a post with image blocks.
	 *
	 * @author automattic
	 * @since  9.2.0
	 */
	public function test_jetpack_og_get_image_from_post_order() {
		// Create a post containing two image blocks.
		$post_info = $this->create_post_with_image_blocks( 2 );

		$this->go_to( get_permalink( $post_info['post_id'] ) );

		// Extract an image from the current post.
		$chosen_image = jetpack_og_get_image();

		$this->assertIsArray( $chosen_image );
		// We expect jetpack_og_get_image to return the first of the images in the post.
		$first_image_url = $post_info['img_urls'][0];
		$this->assertEquals( $first_image_url, $chosen_image['src'] );
	}

	/**
	 * Helper function to get default alt text.
	 *
	 * @return string
	 */
	public function get_default_alt_text() {
		return 'Default alt text';
	}

	/**
	 * Test if jetpack_og_get_image returns the correct default alt text.
	 *
	 * @author automattic
	 * @since 10.4
	 */
	public function test_jetpack_og_get_image_alt_text_default() {
		$this->go_to( get_permalink( $this->icon_id ) );

		$image = jetpack_og_get_image();

		$this->assertSame( '', $image['alt_text'] );
	}

	/**
	 * Test if jetpack_og_get_image returns the correct filtered alt text.
	 *
	 * @author automattic
	 * @since 10.4
	 */
	public function test_jetpack_og_get_image_alt_text_filter() {
		$this->go_to( get_permalink( $this->icon_id ) );

		add_filter( 'jetpack_open_graph_image_default_alt_text', array( $this, 'get_default_alt_text' ) );
		$image = jetpack_og_get_image();
		remove_filter( 'jetpack_open_graph_image_default_alt_text', array( $this, 'get_default_alt_text' ) );

		$this->assertEquals( $image['alt_text'], $this->get_default_alt_text() );
	}

	/**
	 * Test if jetpack_og_get_image returns the correct alt text when set.
	 *
	 * @author automattic
	 * @since 10.4
	 */
	public function test_jetpack_og_get_image_alt_text_when_set() {
		$this->go_to( get_permalink( $this->icon_id ) );

		$alt_text = 'Example Alt Text';

		update_post_meta( $this->icon_id, '_wp_attachment_image_alt', $alt_text );

		$image = jetpack_og_get_image();

		$this->assertEquals( $image['alt_text'], $alt_text );
	}

	/**
	 * Test jetpack_og_remove_query_blocks with various scenarios.
	 *
	 * @dataProvider jetpack_og_remove_query_blocks_data_provider
	 *
	 * @param string $description Input description with potential query blocks.
	 * @param string $expected_result Expected cleaned description.
	 */
	#[DataProvider( 'jetpack_og_remove_query_blocks_data_provider' )]
	public function test_jetpack_og_remove_query_blocks( $description, $expected_result ) {
		$result = jetpack_og_remove_query_blocks( $description );
		$this->assertEquals( $expected_result, $result );
	}

	/**
	 * Data provider for jetpack_og_remove_query_blocks tests.
	 */
	public static function jetpack_og_remove_query_blocks_data_provider() {
		return array(
			'basic_query_block_removal' => array(
				'Some text before. <!-- wp:query {"queryId":49} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-title /-->
<!-- /wp:post-template --></div>
<!-- /wp:query --> Some text after.',
				'Some text before.  Some text after.',
			),
			'nested_query_blocks'       => array(
				'Before. <!-- wp:query {"queryId":1} -->
<div class="wp-block-query">
<!-- wp:query {"queryId":2} -->
<div class="wp-block-query">Nested content</div>
<!-- /wp:query -->
</div>
<!-- /wp:query --> After.',
				'Before.  After.',
			),
			'preserves_other_blocks'    => array(
				'<!-- wp:paragraph -->
<p>This paragraph should be preserved.</p>
<!-- /wp:paragraph -->
<!-- wp:query {"queryId":1} -->
<div class="wp-block-query">This should be removed.</div>
<!-- /wp:query -->
<!-- wp:heading -->
<h2>This heading should be preserved.</h2>
<!-- /wp:heading -->',
				'<!-- wp:paragraph -->
<p>This paragraph should be preserved.</p>
<!-- /wp:paragraph -->
<!-- wp:heading -->
<h2>This heading should be preserved.</h2>
<!-- /wp:heading -->',
			),
			'void_query_blocks'         => array(
				'Before. <!-- wp:query {"queryId":1} /--> After.',
				'Before.  After.',
			),
			'no_query_blocks'           => array(
				'<!-- wp:paragraph -->
<p>This content has no query blocks.</p>
<!-- /wp:paragraph -->',
				'<!-- wp:paragraph -->
<p>This content has no query blocks.</p>
<!-- /wp:paragraph -->',
			),
			'empty_string'              => array(
				'',
				'',
			),
			'plain_text_no_blocks'      => array(
				'This is just plain text with no blocks at all.',
				'This is just plain text with no blocks at all.',
			),
		);
	}

	/**
	 * Test if jetpack_og_get_description handles query blocks correctly.
	 *
	 * @author automattic
	 * @since $$next-version$$
	 */
	public function test_jetpack_og_get_description_with_query_blocks() {
		$description_with_query = 'Some text before. <!-- wp:query {"queryId":1} --><div>Query content</div><!-- /wp:query --> Some text after.';

		// The function should remove the query block and then process the remaining text.
		$result = jetpack_og_get_description( $description_with_query );

		// Should contain the text before and after, but not the query block content.
		$this->assertStringContainsString( 'Some text before', $result );
		$this->assertStringContainsString( 'Some text after', $result );
		$this->assertStringNotContainsString( 'Query content', $result );
	}
}
