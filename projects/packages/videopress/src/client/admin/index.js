/**
 * External dependencies
 */
import { ThemeProvider } from '@automattic/jetpack-components';
import * as WPElement from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router';
/**
 * Internal dependencies
 */
import { initStore } from '../state';
import AdminPage from './components/admin-page';
import EditVideoDetails from './components/edit-video-details';
import useUnloadPrevent from './hooks/use-unload-prevent';
import useVideos from './hooks/use-videos';
import './style.module.scss';

initStore();

/**
 * Component to scroll window to top on route change.
 *
 * @return {null} Null.
 */
function ScrollToTop() {
	const location = useLocation();
	useEffect( () => {
		// Timeout to mitigate flickering.
		setTimeout( () => {
			window.scrollTo( 0, 0 );
		}, 0 );
	}, [ location ] );

	return null;
}

const VideoPress = () => {
	const { isUploading } = useVideos();

	useUnloadPrevent( {
		shouldPrevent: isUploading,
		message: __(
			'Leaving will cancel the upload. Are you sure you want to exit?',
			'jetpack-videopress-pkg'
		),
	} );

	return (
		<ThemeProvider>
			<HashRouter>
				<ScrollToTop />
				<Routes>
					<Route path="/" element={ <AdminPage /> } />
					<Route path="/video/:videoId/edit" element={ <EditVideoDetails /> } />
				</Routes>
			</HashRouter>
		</ThemeProvider>
	);
};

/**
 * Initial render function.
 */
function render() {
	const container = document.getElementById( 'jetpack-videopress-root' );

	if ( null === container ) {
		return;
	}

	WPElement.createRoot( container ).render( <VideoPress /> );
}

render();
