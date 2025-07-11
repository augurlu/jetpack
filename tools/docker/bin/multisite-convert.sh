#!/usr/bin/env bash

if ! $(wp core is-installed); then
	echo
	echo "WordPress has to be installed first. To install, run:"
	echo
	echo "  jetpack docker install"
	echo
	exit 1;
fi

# Do the conversion, requires WP installed
wp core multisite-convert

# Update domain to wp-config.php
wp config set DOMAIN_CURRENT_SITE "${WP_DOMAIN}" --type=constant

# Use multisite htaccess template
cp -f /var/lib/jetpack-config/htaccess-multi /var/www/html/.htaccess

# Update domain to DB
wp db query "UPDATE wp_blogs SET domain='${WP_DOMAIN}' WHERE blog_id=1;"

echo
echo "WordPress converted to a multisite. Open ${WP_DOMAIN}"
echo
