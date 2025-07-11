<?php

use PHPUnit\Framework\Attributes\CoversFunction;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Tests for functions in functions.global.php
 *
 * @covers ::jetpack_get_future_removed_version
 * @covers ::jetpack_get_vary_headers
 */
#[CoversFunction( 'jetpack_get_future_removed_version' )]
#[CoversFunction( 'jetpack_get_vary_headers' )]
class Functions_Global_Test extends WP_UnitTestCase {
	use \Automattic\Jetpack\PHPUnit\WP_UnitTestCase_Fix;

	/**
	 * Test string returned by jetpack_deprecated_function
	 *
	 * @since 8.8.0
	 * @dataProvider jetpack_deprecated_function_versions
	 *
	 * @param string $version  Version number passed to the function.
	 * @param string $expected Expected removed version number.
	 */
	#[DataProvider( 'jetpack_deprecated_function_versions' )]
	public function test_jetpack_get_future_removed_version( $version, $expected ) {
		$removed_version = jetpack_get_future_removed_version( $version );

		$this->assertEquals( $expected, $removed_version );
	}

	/**
	 * Data provider for the test_jetpack_get_future_removed_version() test.
	 *
	 * @return Array test version numbers potentially passed to the function.
	 */
	public static function jetpack_deprecated_function_versions() {
		return array(
			'no_version_number'                          => array(
				'jetpack',
				false,
			),
			'only_major_number'                          => array(
				'8.8',
				'9.4',
			),
			'full_version_number_without_text'           => array(
				'8.8.0',
				'9.4',
			),
			'full_version_number_with_jetpack_prepended' => array(
				'jetpack-8.8.0',
				'9.4',
			),
			'full_zero_version_number_with_jetpack'      => array(
				'jetpack-8.0.0',
				'8.6',
			),
			'semver_number_above_10'                     => array(
				'9.15.0',
				false,
			),
			'full_version_number_above_10'               => array(
				'10.5',
				'11.1',
			),
		);
	}
}
