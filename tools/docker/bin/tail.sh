#!/usr/bin/env bash

WP_DEBUG_LOG=/var/www/html/wp-content/debug.log

if [ ! -e "$WP_DEBUG_LOG" ] ; then
	touch "$WP_DEBUG_LOG"
	chown www-data:www-data "$WP_DEBUG_LOG"
fi

tail -F --lines 100 "$WP_DEBUG_LOG"
