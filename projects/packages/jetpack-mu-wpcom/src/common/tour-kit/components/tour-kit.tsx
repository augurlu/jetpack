import { createPortal, useEffect, useRef } from '@wordpress/element';
import { TourKitContextProvider } from '../contexts';
import ErrorBoundary from '../error-boundary';
import TourKitFrame from './tour-kit-frame';
import type { Config } from '../types';
import type { FunctionComponent } from 'react';

import '../styles.scss';

interface Props {
	config: Config;
	__temp__className?: string;
}

const TourKit: FunctionComponent< Props > = ( { config, __temp__className } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	useEffect( () => {
		const classes = [ 'tour-kit', ...( __temp__className ? [ __temp__className ] : [] ) ];

		portalParent.classList.add( ...classes );

		const portalParentElement = config.options?.portalParentElement || document.body;
		portalParentElement.appendChild( portalParent );

		return () => {
			portalParentElement.removeChild( portalParent );
		};
	}, [ __temp__className, portalParent, config.options?.portalParentElement ] );

	return (
		<ErrorBoundary>
			<TourKitContextProvider config={ config }>
				<div>{ createPortal( <TourKitFrame config={ config } />, portalParent ) }</div>
			</TourKitContextProvider>
		</ErrorBoundary>
	);
};

export default TourKit;
