import * as React from 'react';

import './path-breadcrumbs.scss';

/**
 * Splits URL by slashes for rendering breadcrumbs.
 *
 * @param {string} path - String URL.
 * @return {string[]} - Array of strings.
 */
function splitDomainPath( path ) {
	const splits = path.split( '/' ).filter( piece => piece.length > 0 );
	splits.shift(); // Removes domain name from splits; e.g. 'jetpack.com'
	return splits;
}

const PathBreadcrumbs = ( { className, onClick, url } ) => {
	const breadcrumbPieces = splitDomainPath( url );

	if ( breadcrumbPieces.length < 1 ) {
		return null;
	}

	return (
		<div className={ `jetpack-instant-search__path-breadcrumb ${ className ? className : '' }` }>
			<a
				className="jetpack-instant-search__path-breadcrumb-link"
				href={ `//${ url }` }
				onClick={ onClick }
				tabIndex="-1"
				aria-hidden="true"
			>
				{ breadcrumbPieces.map( ( piece, index, pieces ) => (
					<span className="jetpack-instant-search__path-breadcrumb-piece" key={ piece }>
						{ decodeURIComponent( piece ) }
						{ index !== pieces.length - 1 ? ' › ' : '' }
					</span>
				) ) }
			</a>
		</div>
	);
};
export default PathBreadcrumbs;
