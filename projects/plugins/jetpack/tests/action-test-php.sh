#!/usr/bin/env bash

set -eo pipefail

# Conditionally allow WooCommerce/Jetpack integration tests to run.
if [[ "$WITH_WOOCOMMERCE" == true ]]; then
	export JETPACK_TEST_WOOCOMMERCE=1
	echo "::group::Jetpack WooCommerce tests"
	phpunit-select-config 'phpunit.#.xml.dist' --group=woocommerce
	echo "::endgroup::"
	exit 0
fi

if [[ "$WITH_WPCOMSH" == true ]]; then
	export JETPACK_TEST_WPCOMSH=1
fi

echo "::group::Jetpack tests"
phpunit-select-config 'phpunit.#.xml.dist'
echo "::endgroup::"

if [[ "$WP_BRANCH" == "trunk" ]]; then
	echo "::group::Jetpack multisite tests"
	WP_MULTISITE=1 phpunit-select-config 'tests/php.multisite.#.xml'
	echo "::endgroup::"
fi

if [[ "$WP_BRANCH" == "latest" && "$PHP_VERSION" == "7.2" ]]; then
	echo "::group::Jetpack Legacy Full Sync tests"
	LEGACY_FULL_SYNC=1 phpunit-select-config 'phpunit.#.xml.dist' --group=legacy-full-sync
	echo "::endgroup::"
fi
