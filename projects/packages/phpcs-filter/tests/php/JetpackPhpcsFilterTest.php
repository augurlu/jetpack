<?php
/**
 * Tests for JetpackPhpcsFilter.php.
 *
 * @package automattic/jetpack-phpcs-filter
 */

namespace Automattic\Jetpack\PhpcsFilter\Tests;

use PHP_CodeSniffer\Config;
use PHP_CodeSniffer\Files\FileList;
use PHP_CodeSniffer\Files\LocalFile;
use PHP_CodeSniffer\Filters\Automattic\JetpackPhpcsFilter;
use PHP_CodeSniffer\Ruleset;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

/**
 * Tests for JetpackPhpcsFilter.php.
 */
class JetpackPhpcsFilterTest extends TestCase {

	/**
	 * Old CWD to restore after the test.
	 *
	 * @var string
	 */
	private $oldcwd;

	/**
	 * Set up.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->oldcwd = getcwd();
		Config::setConfigData( 'jetpack-filter-basedir', null, true );
	}

	/**
	 * Tear down.
	 */
	public function tearDown(): void {
		parent::tearDown();
		chdir( $this->oldcwd );
	}

	/** Test .phpcsignore handling */
	public function testPhpcsignore() {
		$makeExpect = function ( $base ) {
			return array(
				"$base/a/file.php",
				"$base/b/anotherfile.php",
				"$base/b/file.php",
				"$base/c1/2.php",
				"$base/c1/3.php",
				"$base/c1/4.php",
				"$base/c1/c2/3.php",
				"$base/c1/c2/4.php",
				"$base/c1/c2/c3/4.php",
				"$base/file.php",
				"$base/gitignored-but-overridden-file.php",
			);
		};

		chdir( __DIR__ . '/../../tests/fixtures/phpcsignore' );

		$config = new Config();

		// When run from the base of the repo, it reads tests/fixtures/.phpcsignore and so ignores everything.
		chdir( __DIR__ . '/../../' );
		$di     = new RecursiveDirectoryIterator( 'tests/fixtures/phpcsignore', RecursiveDirectoryIterator::SKIP_DOTS | RecursiveDirectoryIterator::FOLLOW_SYMLINKS );
		$filter = new RecursiveIteratorIterator( new JetpackPhpcsFilter( $di, 'tests/fixtures/phpcsignore', $config, new Ruleset( $config ) ) );
		$this->assertSame( array(), array_keys( iterator_to_array( $filter ) ) );

		// When run from the fixture dir, it reads only .phpcsignore in that dir and below.
		chdir( __DIR__ . '/../../tests/fixtures/phpcsignore' );
		$di     = new RecursiveDirectoryIterator( '.', RecursiveDirectoryIterator::SKIP_DOTS | RecursiveDirectoryIterator::FOLLOW_SYMLINKS );
		$filter = new RecursiveIteratorIterator( new JetpackPhpcsFilter( $di, '.', $config, new Ruleset( $config ) ) );
		$files  = array();
		foreach ( $filter as $file ) {
			$this->assertInstanceOf( LocalFile::class, $file );
			$files[] = $file->getFilename();
		}
		sort( $files );
		$this->assertSame( $makeExpect( '.' ), $files );

		// Set the base dir config and it uses that.
		chdir( __DIR__ . '/../../' );
		Config::setConfigData( 'jetpack-filter-basedir', 'tests/fixtures/phpcsignore', true );
		$di     = new RecursiveDirectoryIterator( 'tests/fixtures/phpcsignore', RecursiveDirectoryIterator::SKIP_DOTS | RecursiveDirectoryIterator::FOLLOW_SYMLINKS );
		$filter = new RecursiveIteratorIterator( new JetpackPhpcsFilter( $di, 'tests/fixtures/phpcsignore', $config, new Ruleset( $config ) ) );
		$files  = array();
		foreach ( $filter as $file ) {
			$this->assertInstanceOf( LocalFile::class, $file );
			$files[] = $file->getFilename();
		}
		sort( $files );
		$this->assertSame( $makeExpect( 'tests/fixtures/phpcsignore' ), $files );
	}

	/** Test .gitignore handling */
	public function testGitignore() {
		chdir( __DIR__ . '/../../tests/fixtures/phpcsignore' );

		$config = new Config( array( '--runtime-set', 'jetpack-filter-use-gitignore', '0' ) );

		chdir( __DIR__ . '/../../tests/fixtures/phpcsignore' );
		$di     = new RecursiveDirectoryIterator( '.', RecursiveDirectoryIterator::SKIP_DOTS | RecursiveDirectoryIterator::FOLLOW_SYMLINKS );
		$filter = new RecursiveIteratorIterator( new JetpackPhpcsFilter( $di, '.', $config, new Ruleset( $config ) ) );
		$files  = array();
		foreach ( $filter as $file ) {
			$this->assertInstanceOf( LocalFile::class, $file );
			$files[] = $file->getFilename();
		}
		sort( $files );
		$this->assertSame(
			array(
				'./a/file.php',
				'./b/anotherfile.php',
				'./b/file.php',
				'./c1/2.php',
				'./c1/3.php',
				'./c1/4.php',
				'./c1/c2/3.php',
				'./c1/c2/4.php',
				'./c1/c2/c3/4.php',
				'./file.php',
				'./gitignored-but-overridden-file.php',
				'./gitignoredfile.php',
				'./gitignoredir/file.php',
			),
			$files
		);
	}

	/** Test no-ignore option */
	public function testNoignore() {
		chdir( __DIR__ . '/../../tests/fixtures/phpcsignore' );

		$config = new Config( array( '--runtime-set', 'jetpack-filter-no-ignore', '1' ) );

		chdir( __DIR__ . '/../../tests/fixtures/phpcsignore' );
		$di     = new RecursiveDirectoryIterator( '.', RecursiveDirectoryIterator::SKIP_DOTS | RecursiveDirectoryIterator::FOLLOW_SYMLINKS );
		$filter = new RecursiveIteratorIterator( new JetpackPhpcsFilter( $di, '.', $config, new Ruleset( $config ) ) );
		$files  = array();
		foreach ( $filter as $file ) {
			$this->assertInstanceOf( LocalFile::class, $file );
			$files[] = $file->getFilename();
		}
		sort( $files );
		$this->assertSame(
			array(
				'./a/anotherfile.php',
				'./a/file.php',
				'./a/ignoredfile.php',
				'./b/anotherfile.php',
				'./b/file.php',
				'./b/ignoredfile.php',
				'./c1/1.php',
				'./c1/2.php',
				'./c1/3.php',
				'./c1/4.php',
				'./c1/c2/1.php',
				'./c1/c2/2.php',
				'./c1/c2/3.php',
				'./c1/c2/4.php',
				'./c1/c2/c3/1.php',
				'./c1/c2/c3/2.php',
				'./c1/c2/c3/3.php',
				'./c1/c2/c3/4.php',
				'./file.php',
				'./gitignored-but-overridden-file.php',
				'./gitignoredfile.php',
				'./gitignoredir/file.php',
				'./ignoredfile.php',
				'./ignoredir/file.php',
			),
			$files
		);
	}

	/**
	 * Test per-dir config handling.
	 *
	 * @dataProvider provideRun
	 * @param string $path Fixture path.
	 */
	#[DataProvider( 'provideRun' )]
	public function testRun( $path ) {
		$path = realpath( $path );
		chdir( $path );
		$l = strlen( $path ) + 1;

		$expect = json_decode( file_get_contents( 'expect.json' ), true );
		$this->assertIsArray( $expect, 'expect.json contains a JSON object' );

		$config         = new Config();
		$config->filter = 'Automattic\\JetpackPhpcsFilter';
		$config->files  = array( $path );
		$ruleset        = new Ruleset( $config );
		$files          = new FileList( $config, $ruleset );

		$actual = array();
		foreach ( $files as $file ) {
			if ( $file->ignored ) {
				continue;
			}
			$file->reloadContent();
			$file->process();

			$data = array();
			foreach ( $file->getErrors() as $line => $cols ) {
				foreach ( $cols as $msgs ) {
					foreach ( $msgs as $msg ) {
						$data[ $line ][] = $msg['source'];
					}
				}
				sort( $data[ $line ] );
			}
			foreach ( $file->getWarnings() as $line => $cols ) {
				foreach ( $cols as $msgs ) {
					foreach ( $msgs as $msg ) {
						$data[ $line ][] = $msg['source'];
					}
				}
				sort( $data[ $line ] );
			}
			ksort( $data );

			$name            = substr( $file->getFilename(), $l );
			$actual[ $name ] = array();
			foreach ( $data as $line => $codes ) {
				foreach ( $codes as $code ) {
					$actual[ $name ][] = "Line $line: $code";
				}
			}

			$file->cleanUp();
		}

		$this->assertEquals( $expect, $actual );
	}

	/** Data provider for testRun(). */
	public static function provideRun() {
		return array(
			'General tests'                  => array( __DIR__ . '/../../tests/fixtures/perdir' ),
			'Custom per-directory file name' => array( __DIR__ . '/../../tests/fixtures/perdir-custom' ),
		);
	}
}
