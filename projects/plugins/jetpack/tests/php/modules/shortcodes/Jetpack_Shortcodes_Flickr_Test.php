<?php

use PHPUnit\Framework\Attributes\CoversFunction;

require_once __DIR__ . '/trait.http-request-cache.php';

/**
 * @covers ::flickr_embed_to_shortcode
 * @covers ::flickr_shortcode_handler
 * @covers ::flickr_shortcode_video_markup
 * @covers ::jetpack_flickr_video_to_shortcode
 */
#[CoversFunction( 'flickr_embed_to_shortcode' )]
#[CoversFunction( 'flickr_shortcode_handler' )]
#[CoversFunction( 'flickr_shortcode_video_markup' )]
#[CoversFunction( 'jetpack_flickr_video_to_shortcode' )]
class Jetpack_Shortcodes_Flickr_Test extends WP_UnitTestCase {
	use \Automattic\Jetpack\PHPUnit\WP_UnitTestCase_Fix;
	use Automattic\Jetpack\Tests\HttpRequestCacheTrait;

	/**
	 * Runs on every test.
	 */
	public function set_up() {
		parent::set_up();

		$pre_http_req_function = function ( $preempt, $parsed_args, $url ) {
			if ( 'https://embedr.flickr.com/photos/49931239842' === $url ) {
				return array(
					'body' => '<div class="slide slide-video" data-rapid="video" data-slideshow-position="" >
					<video src="https://www.flickr.com/photos/kalakeli/49931239842/play/360p/183f75d545/" width="NaN" height="NaN" poster="https://live.staticflickr.com/31337/49931239842_183f75d545_z.jpg" controls></video>
				</div>',
				);
			}

			if ( 'https://flickr.com/photo.gne?id=49931239842' === $url ) {
				return array(
					'body' => '<meta property="og:url" content="https://www.flickr.com/photos/kalakeli/49931239842/"  data-dynamic="true">',
				);
			}

			if ( str_starts_with( $url, 'https://www.flickr.com/services/oembed/' ) ) {
				$body = array(
					'html' => '<iframe src="https://embedr.flickr.com/photos/49931239842" width="500" height="281" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>',
				);

				return array(
					'body' => wp_json_encode( $body ),
				);
			}

			return $preempt;
		};

		add_filter(
			'pre_http_request',
			$pre_http_req_function,
			10,
			3
		);
	}

	/**
	 * @author scotchfield
	 * @since 3.2
	 */
	public function test_shortcodes_flickr_exists() {
		$this->assertTrue( shortcode_exists( 'flickr' ) );
	}

	/**
	 * @author scotchfield
	 * @since 3.2
	 */
	public function test_shortcodes_flickr() {
		$content = '[flickr]';

		$shortcode_content = do_shortcode( $content );

		$this->assertNotEquals( $content, $shortcode_content );
	}

	/**
	 * @author carlosenamdev
	 * @since 3.2
	 */
	public function test_shortcodes_flickr_photo() {
		$photo_link = 'https://www.flickr.com/photos/142669105@N04/26934351532';

		$content = '[flickr photo="' . $photo_link . '"]';

		$shortcode_content = do_shortcode( $content );

		$this->assertStringContainsString( $photo_link, $shortcode_content );
	}

	/**
	 * @author scotchfield
	 * @since 3.2
	 */
	public function test_shortcodes_flickr_video_link() {

		$video_link = 'https://www.flickr.com/photos/kalakeli/49931239842';

		$content = '[flickr video="' . $video_link . '"]';

		$shortcode_content = do_shortcode( $content );

		$this->assertStringContainsString( $video_link, $shortcode_content );
	}

	/**
	 * @author scotchfield
	 * @since 3.2
	 */
	public function test_shortcodes_flickr_video_id() {
		$video_id = '49931239842';
		$content  = '[flickr video="' . $video_id . '"]';

		$shortcode_content = do_shortcode( $content );

		$this->assertStringContainsString( $video_id, $shortcode_content );
	}

	/**
	 * @author scotchfield
	 * @since 3.2
	 */
	public function test_shortcodes_flickr_video_id_width_height() {
		$video_id = '49931239842';
		$width    = 200;
		$height   = 300;
		$content  = "[flickr video='$video_id' w=$width h=$height ]";

		$shortcode_content = do_shortcode( $content );

		$this->assertStringContainsString( $video_id, $shortcode_content );
		$this->assertStringContainsString( "width: $width", $shortcode_content );
		$this->assertStringContainsString( "height: $height", $shortcode_content );
	}

	/**
	 * Test the flickr_shortcode_video_markup function when the transient is not set.
	 */
	public function test_flickr_shortcode_video_markup_no_transient() {
		$output = '<div class="flick_video" style="max-width: 100%;width: 500px;height: 200px;"><video src="https://www.flickr.com/photos/kalakeli/49931239842/play/360p/183f75d545/" controls  /></div>';

		$atts = array(
			'w'        => 500,
			'h'        => 200,
			'controls' => 'yes',
			'autoplay' => 'no',
		);

		$shortcode_output = flickr_shortcode_video_markup( $atts, '49931239842', 'https://www.flickr.com/photos/kalakeli/49931239842' );
		$this->assertEquals( $output, $shortcode_output );
	}

	/**
	 * Test the flickr_shortcode_video_markup function when the transient is set.
	 */
	public function test_flickr_shortcode_video_markup_transient() {
		$output = '<div class="flick_video" style="max-width: 100%;width: 500px;height: 200px;"><video src="https://www.flickr.com/photos/kalakeli/49931239842/play/360p/183f75d545/" controls  /></div>';

		set_transient( 'flickr_video_49931239842', 'https://www.flickr.com/photos/kalakeli/49931239842/play/360p/183f75d545/', 2592000 );

		$atts = array(
			'w'        => 500,
			'h'        => 200,
			'controls' => 'yes',
			'autoplay' => 'no',
		);

		$shortcode_output = flickr_shortcode_video_markup( $atts, '49931239842', 'https://www.flickr.com/photos/kalakeli/49931239842' );

		$this->assertEquals( $output, $shortcode_output );

		delete_transient( 'flickr_video_49931239842' );
	}

	/**
	 * Test the flickr_shortcode_video_markup function when the video id is equals to the video param.
	 */
	public function test_flickr_shortcode_video_markup_id_equals_video_param() {
		$output = '<div class="flick_video" style="max-width: 100%;width: 500px;height: 200px;"><video src="https://www.flickr.com/photos/kalakeli/49931239842/play/360p/183f75d545/" controls  /></div>';

		$atts = array(
			'w'        => 500,
			'h'        => 200,
			'controls' => 'yes',
			'autoplay' => 'no',
		);

		$shortcode_output = flickr_shortcode_video_markup( $atts, '49931239842', '49931239842' );

		$this->assertEquals( $output, $shortcode_output );
	}

	/**
	 * Shortcode reversals.
	 */
	public function test_shortcodes_flickr_reversal_iframe_to_shortcode() {
		if ( defined( 'TESTING_IN_JETPACK' ) && TESTING_IN_JETPACK ) {
			self::markTestSkipped( 'This test only runs on WPCOM' );
		}
		$content = '<iframe src="https://www.flickr.com/photos/batmoo/5265478228/player/" height="500" width="375" frameborder="0" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>';

		$shortcode_content = wp_kses_post( $content );

		$this->assertEquals( '[flickr photo="https://www.flickr.com/photos/batmoo/5265478228/" w=375 h=500]', $shortcode_content );
	}

	/**
	 * Shortcode reversals.
	 */
	public function test_shortcodes_flickr_reversal_video_to_shortcode() {
		$content = '<div class="flickr_video" style="max-width: 100%;width: 500px;height: 300px;"><video src="https://www.flickr.com/photos/kalakeli/49931239842/play/360p/183f75d545/" controls autoplay /></div>';

		$shortcode_content = wp_kses_post( $content );

		$this->assertEquals( '[flickr video="https://www.flickr.com/photos/kalakeli/49931239842/" w=500 h=300 controls="yes" autoplay="yes"]', $shortcode_content );
	}
}
