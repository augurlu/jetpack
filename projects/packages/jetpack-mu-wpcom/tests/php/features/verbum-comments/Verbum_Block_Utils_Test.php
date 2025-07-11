<?php
/**
 * Test class for Verbum_Block_Utils.
 *
 * @package automattic/jetpack-mu-wpcom
 */

use Automattic\Jetpack\Jetpack_Mu_Wpcom;
use PHPUnit\Framework\Attributes\CoversClass;
require_once Jetpack_Mu_Wpcom::PKG_DIR . 'src/features/verbum-comments/assets/class-verbum-block-utils.php';

/**
 * Test class for Verbum_Block_Utils.
 *
 * @covers \Verbum_Block_Utils
 */
#[CoversClass( Verbum_Block_Utils::class )]
class Verbum_Block_Utils_Test extends \WorDBless\BaseTestCase {
	/**
	 * Ensure string comments are not modified when 'render_verbum_blocks' is applied
	 */
	public function test_comment_text_string_comment() {
		$comment_content  = 'This is a test comment';
		$filtered_content = Verbum_Block_Utils::render_verbum_blocks( $comment_content );
		$this->assertEquals( $comment_content, $filtered_content );
	}

	/**
	 * Ensure blocks are filtered when 'render_verbum_blocks' is applied
	 */
	public function test_comment_text_block_sanitization() {
		$comment_content  = '<!-- wp:paragraph -->Testing<!-- /wp:paragraph --><!-- wp:latest-posts -->';
		$filtered_content = Verbum_Block_Utils::render_verbum_blocks( $comment_content );
		$this->assertEquals( 'Testing', $filtered_content );
	}

	/**
	 * Ensure blocks are rendered properly
	 */
	public function test_comment_text_block_sanitization_sanity_check() {
		$comment_content  = '<!-- wp:paragraph --><p>test</p><!-- /wp:paragraph --><!-- wp:list --><ul><!-- wp:list-item --><li>1</li><!-- /wp:list-item --><!-- wp:list-item --><li>2</li><!-- /wp:list-item --><!-- wp:list-item --><li>3</li><!-- /wp:list-item --></ul><!-- /wp:list --><!-- wp:quote --><blockquote class="wp-block-quote"><!-- wp:paragraph --><p>something</p><!-- /wp:paragraph --><cite>someone</cite></blockquote><!-- /wp:quote -->';
		$filtered_content = preg_replace( '/\R+/', '', Verbum_Block_Utils::render_verbum_blocks( $comment_content ) );

		$expected_content = '<p>test</p><ul><li>1</li><li>2</li><li>3</li></ul><blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow"><p>something</p><cite>someone</cite></blockquote>';
		$this->assertSame( $expected_content, $filtered_content );
	}

	/**
	 * Ensure innerBlocks are filtered when 'render_verbum_blocks' is applied
	 */
	public function test_comment_text_block_sanitization_inner_blocks() {
		$comment_content  = '<!-- wp:paragraph {} --><!-- wp:latest-posts --><!-- /wp:paragraph -->';
		$filtered_content = Verbum_Block_Utils::render_verbum_blocks( $comment_content );
		$this->assertSame( '', $filtered_content );
	}

	/**
	 * Ensure string comments are not modified when 'pre_comment_content' is applied
	 */
	public function test_pre_comment_content_string_comment() {
		$comment_content  = 'This is a test comment';
		$filtered_content = Verbum_Block_Utils::remove_blocks( $comment_content );
		$this->assertEquals( $comment_content, $filtered_content );
	}

	/**
	 * Ensure blocks are filtered when 'pre_comment_content' is applied
	 */
	public function test_pre_comment_content__block_sanitization() {
		$comment_content  = '<!-- wp:paragraph -->Testing<!-- /wp:paragraph --><!-- wp:latest-posts -->';
		$filtered_content = Verbum_Block_Utils::remove_blocks( $comment_content );
		$this->assertEquals( '<!-- wp:paragraph -->Testing<!-- /wp:paragraph -->', $filtered_content );
	}

	/**
	 * Ensure innerBlocks are removed if not allowed
	 */
	public function test_pre_comment_content_inner_blocks() {
		$comment_content = <<<HTML
<!-- wp:quote -->
<blockquote class="wp-block-quote">
	<p>Allowed outer quote block</p>
	<!-- wp:button {"text":"I am a disallowed button!","url":"#"} -->
	<a class="wp-block-button__link" href="#">I am a disallowed button!</a>
	<!-- /wp:button -->
</blockquote>
<!-- /wp:quote -->
HTML;

		$expected_content = <<<HTML
<!-- wp:quote -->
<blockquote class="wp-block-quote">
	<p>Allowed outer quote block</p>
</blockquote>
<!-- /wp:quote -->
HTML;

		$filtered_content = Verbum_Block_Utils::remove_blocks( $comment_content );
		// Normalize whitespace before comparison
		$filtered_content = preg_replace( '/\s+/', ' ', $filtered_content );
		$expected_content = preg_replace( '/\s+/', ' ', $expected_content );
		$this->assertSame( $expected_content, $filtered_content );
	}
}
