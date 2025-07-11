import { __ } from '@wordpress/i18n';
import { cleanForSlug } from '@wordpress/url';
import * as React from 'react';
import { Component } from 'react';
import Gridicon from './gridicon';
import PhotonImage from './photon-image';
import ProductPrice from './product-price';
import ProductRatings from './product-ratings';

import './search-result-product.scss';

class SearchResultProduct extends Component {
	render() {
		const { result_type, fields, highlight } = this.props.result;
		if ( result_type !== 'post' ) {
			return null;
		}

		const getCategories = () => {
			let cats = fields[ 'category.name.default' ];

			if ( ! cats ) {
				return [];
			}

			if ( ! Array.isArray( cats ) ) {
				cats = [ cats ];
			}

			return cats;
		};

		const firstImage = Array.isArray( fields[ 'image.url.raw' ] )
			? fields[ 'image.url.raw' ][ 0 ]
			: fields[ 'image.url.raw' ];

		const title =
			Array.isArray( highlight.title ) && highlight.title[ 0 ].length > 0
				? highlight.title[ 0 ]
				: __( 'No title', 'jetpack-search-pkg' );

		// TODO: Remove this check once checking result.highlight is more reliable.
		const hasQuery =
			typeof this.props.searchQuery === 'string' && this.props.searchQuery.trim() !== '';
		const titleHasMark = title.includes( '<mark>' );
		const showMatchHint =
			hasQuery &&
			! titleHasMark &&
			typeof highlight === 'object' &&
			Object.entries( highlight ).some(
				( [ key, value ] ) =>
					key !== 'title' && key !== 'comments' && Array.isArray( value ) && value[ 0 ]?.length > 0
			);

		return (
			<li
				className={ [
					'jetpack-instant-search__search-result',
					'jetpack-instant-search__search-result-product',
					getCategories()
						.map( cat => 'jetpack-instant-search__search-result-category--' + cleanForSlug( cat ) )
						.join( ' ' ),
				].join( ' ' ) }
			>
				<a
					className="jetpack-instant-search__search-result-product-img-link"
					href={ `//${ fields[ 'permalink.url.raw' ] }` }
					onClick={ this.props.onClick }
				>
					<div
						className={ `jetpack-instant-search__search-result-product-img-container ${
							firstImage
								? ''
								: 'jetpack-instant-search__search-result-product-img-container--placeholder'
						}` }
					>
						{ firstImage ? (
							<PhotonImage
								alt={ fields[ 'image.alt_text' ] }
								className="jetpack-instant-search__search-result-product-img"
								isPhotonEnabled={ this.props.isPhotonEnabled }
								src={ `//${ firstImage }` }
							/>
						) : (
							<div className="jetpack-instant-search__search-result-product-img">
								<Gridicon
									icon="block"
									style={ {} } // Mandatory. Overrides manual setting of height/width in Gridicon.
								/>
								<Gridicon
									icon="image"
									style={ {} } // Mandatory. Overrides manual setting of height/width in Gridicon.
									title={ __( 'Does not have an image', 'jetpack-search-pkg' ) }
								/>
							</div>
						) }
					</div>
				</a>
				<h3 className="jetpack-instant-search__search-result-title jetpack-instant-search__search-result-product-title">
					<a
						className="jetpack-instant-search__search-result-title-link"
						href={ `//${ fields[ 'permalink.url.raw' ] }` }
						onClick={ this.props.onClick }
						//eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ { __html: title } }
					/>
				</h3>

				<ProductPrice
					price={ fields[ 'wc.price' ] }
					salePrice={ fields[ 'wc.sale_price' ] }
					formattedPrice={ fields[ 'wc.formatted_price' ] }
					formattedRegularPrice={ fields[ 'wc.formatted_regular_price' ] }
					formattedSalePrice={ fields[ 'wc.formatted_sale_price' ] }
				/>

				{ !! fields[ 'meta._wc_average_rating.double' ] && (
					<ProductRatings
						count={ fields[ 'meta._wc_review_count.long' ] }
						rating={ fields[ 'meta._wc_average_rating.double' ] }
						permalink={ `//${ fields[ 'permalink.url.raw' ] }` }
					/>
				) }
				{ showMatchHint && (
					<div className="jetpack-instant-search__search-result-product-match">
						<mark>
							<Gridicon icon="search" style={ {} } title={ false } />
							<span>
								{ 'comment' in highlight
									? __( 'Matches comments', 'jetpack-search-pkg' )
									: __(
											'Matches content',
											'jetpack-search-pkg',
											/* dummy arg to avoid bad minification */ 0
									  ) }
							</span>
						</mark>
					</div>
				) }
			</li>
		);
	}
}

export default SearchResultProduct;
