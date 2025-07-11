/* eslint-disable jsdoc/require-description,jsdoc/require-param-description,jsdoc/require-param-type,jsdoc/require-returns */
/* global ajaxurl, jetpackAdminMenu, jQuery */
import './admin-menu.css';

( function ( $ ) {
	/**
	 *
	 */
	function init() {
		const adminbar = document.querySelector( '#wpadminbar' );

		if ( ! adminbar ) {
			return;
		}

		const wpwrap = document.querySelector( '#wpwrap' );
		const adminMenu = document.querySelector( '#adminmenu' );
		const dismissClass = 'dismissible-card__close-icon';

		/**
		 *
		 * @param value
		 */
		function setAriaExpanded( value ) {
			const anchors = adminbar.querySelectorAll( '#wp-admin-bar-blog a' );
			for ( let i = 0; i < anchors.length; i++ ) {
				anchors[ i ].setAttribute( 'aria-expanded', value );
			}
		}

		setFocusOnActiveMenuItem();
		setAriaExpanded( 'false' );

		const adminbarBlog = adminbar.querySelector( '#wp-admin-bar-blog.my-sites > a' );

		// Toggle sidebar when toggle is clicked.
		if ( adminbarBlog && ! document.body.classList.contains( 'wpcom-admin-interface' ) ) {
			// We need to remove an event listener and attribute from the my sites button to prevent default behavior of the wp-responsive-overlay.
			$( '#wp-admin-bar-blog.my-sites > a' ).off( 'click.wp-responsive' );
			adminbarBlog.removeAttribute( 'aria-haspopup' );
			// Toggle the sidebar when the 'My Sites' button is clicked in a mobile view.
			adminbarBlog.addEventListener( 'click', toggleSidebar );
			// Detect a click outside the sidebar and close it if its open.
			document.addEventListener( 'click', closeSidebarWhenClickedOutside );
		}

		/**
		 *
		 * @param event
		 */
		function closeSidebarWhenClickedOutside( event ) {
			const isClickOnToggle = !! event.target.closest( '#wp-admin-bar-blog > a' );
			const isClickInsideMenu = document.getElementById( 'adminmenu' ).contains( event.target );
			const sidebarIsOpen = wpwrap.classList.contains( 'wp-responsive-open' );
			const shouldCloseSidebar = sidebarIsOpen && ! isClickOnToggle && ! isClickInsideMenu;
			if ( shouldCloseSidebar ) {
				toggleSidebar( event );
			}
		}

		/**
		 *
		 * @param event
		 */
		function toggleSidebar( event ) {
			// Prevent the menu toggle from being triggered when the screen is not in mobile view.
			// This allows the toggle to function as a link to the site's dashboard the same way it works in Calypso.
			if ( $( window ).width() > 782 ) {
				event.stopImmediatePropagation(); // Prevent propagation to conflicting event handlers.
				return true;
			}

			event.preventDefault();

			// Remove event handlers from the original toggle as its hidden and conflicts with the new toggle.
			$( '#wp-admin-bar-menu-toggle' ).off( 'click.wp-responsive' );

			// Close any open toolbar submenus.
			const hovers = adminbar.querySelectorAll( '.hover' );

			const hoverLength = hovers.length;
			for ( let i = 0; i < hoverLength; i++ ) {
				hovers[ i ].classList.remove( 'hover' );
			}
			wpwrap.classList.toggle( 'wp-responsive-open' );
			if ( wpwrap.classList.contains( 'wp-responsive-open' ) ) {
				setAriaExpanded( 'true' );
				const first = document.querySelector( '#adminmenu a' );
				if ( first ) {
					first.focus();
				}
			} else {
				setAriaExpanded( 'false' );
			}
		}

		if ( adminMenu ) {
			const collapseButton = adminMenu.querySelector( '#collapse-button' );
			// Nav-Unification feature:
			// Saves the sidebar state in server when "Collapse menu" is clicked.
			// This is needed so that we update WPCOM for this preference in real-time.
			if ( collapseButton ) {
				collapseButton.addEventListener( 'click', function ( event ) {
					// Let's the core event listener be triggered first.
					setTimeout( function () {
						saveSidebarIsExpanded( event.target.parentNode.getAttribute( 'aria-expanded' ) );
					}, 50 );
				} );
			}

			adminMenu.addEventListener( 'click', function ( event ) {
				if (
					event.target.classList.contains( dismissClass ) ||
					event.target.closest( '.' + dismissClass )
				) {
					event.preventDefault();

					const siteNotice = document.getElementById( 'toplevel_page_site-notices' );
					if ( siteNotice ) {
						siteNotice.style.display = 'none';
					}

					const jitmDismissButton = event.target;

					makeAjaxRequest(
						'POST',
						ajaxurl,
						'application/x-www-form-urlencoded; charset=UTF-8',
						'id=' +
							encodeURIComponent( jitmDismissButton.dataset.feature_id ) +
							'&feature_class=' +
							encodeURIComponent( jitmDismissButton.dataset.feature_class ) +
							'&action=jitm_dismiss' +
							'&_ajax_nonce=' +
							jetpackAdminMenu.jitmDismissNonce
					);
				}
			} );

			makeAjaxRequest(
				'GET',
				ajaxurl + '?action=upsell_nudge_jitm&_ajax_nonce=' + jetpackAdminMenu.upsellNudgeJitm,
				undefined,
				null,
				function ( xhr ) {
					try {
						if ( xhr.readyState === XMLHttpRequest.DONE ) {
							if ( xhr.status === 200 && xhr.responseText ) {
								adminMenu.insertAdjacentHTML( 'afterbegin', xhr.responseText );
							}
						}
					} catch {
						// On failure, we just won't display an upsell nudge
					}
				}
			);
		}
	}

	/**
	 *
	 * @param method
	 * @param url
	 * @param contentType
	 * @param body
	 * @param callback
	 */
	function makeAjaxRequest( method, url, contentType, body = null, callback = null ) {
		const xhr = new XMLHttpRequest();
		xhr.open( method, url, true );
		xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
		if ( contentType ) {
			xhr.setRequestHeader( 'Content-Type', contentType );
		}
		xhr.withCredentials = true;
		if ( callback ) {
			xhr.onreadystatechange = function () {
				callback( xhr );
			};
		}
		xhr.send( body );
	}

	/**
	 *
	 * @param expanded
	 */
	function saveSidebarIsExpanded( expanded ) {
		makeAjaxRequest(
			'POST',
			ajaxurl,
			'application/x-www-form-urlencoded; charset=UTF-8',
			'action=sidebar_state&expanded=' + expanded
		);
	}

	/**
	 *
	 */
	function setFocusOnActiveMenuItem() {
		const currentMenuItem = document.querySelector( '.wp-submenu .current > a' );

		if ( ! currentMenuItem ) {
			return;
		}

		currentMenuItem.focus( { preventScroll: true } );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )( jQuery );
