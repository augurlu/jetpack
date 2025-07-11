/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import {
	BaseControl,
	Button,
	ButtonGroup,
	CheckboxControl,
	SelectControl,
	QueryControls as BasicQueryControls
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies.
 */
import AutocompleteTokenField from './autocomplete-tokenfield';

const getCategoryTitle = category =>
	decodeEntities( category.name ) || __( '(no title)', 'jetpack-mu-wpcom' );

const getTermTitle = term => decodeEntities( term.name ) || __( '(no title)', 'jetpack-mu-wpcom' );

class QueryControls extends Component {
	fetchPostSuggestions = search => {
		const { postType } = this.props;
		const restUrl = window.newspack_blocks_data.specific_posts_rest_url;
		return apiFetch( {
			url: addQueryArgs( restUrl, {
				search,
				postsToShow: 20,
				_fields: 'id,title',
				type: 'post',
				postType,
			} ),
		} ).then( function ( posts ) {
			const result = posts.map( post => ( {
				value: post.id,
				label: decodeEntities( post.title ) || __( '(no title)', 'jetpack-mu-wpcom' ),
			} ) );
			return result;
		} );
	};
	fetchSavedPosts = postIDs => {
		const { postType } = this.props;
		const restUrl = window.newspack_blocks_data.posts_rest_url;
		return apiFetch( {
			url: addQueryArgs( restUrl, {
				// These params use the block query parameters (see Newspack_Blocks::build_articles_query).
				postsToShow: 100,
				include: postIDs.join( ',' ),
				_fields: 'id,title',
				postType,
			} ),
		} ).then( function ( posts ) {
			return posts.map( post => ( {
				value: post.id,
				label: decodeEntities( post.title.rendered ) || __( '(no title)', 'jetpack-mu-wpcom' ),
			} ) );
		} );
	};

	fetchAuthorSuggestions = search => {
		const restUrl = window.newspack_blocks_data.authors_rest_url;
		return apiFetch( {
			url: addQueryArgs( restUrl, {
				search,
				per_page: 20,
				fields: 'id,name',
			} ),
		} ).then( function ( users ) {
			return users.map( user => ( {
				value: user.id,
				label: decodeEntities( user.name ) || __( '(no name)', 'jetpack-mu-wpcom' ),
			} ) );
		} );
	};
	fetchSavedAuthors = userIDs => {
		const restUrl = window.newspack_blocks_data.authors_rest_url;
		return apiFetch( {
			url: addQueryArgs( restUrl, {
				per_page: 100,
				include: userIDs.join( ',' ),
				fields: 'id,name',
			} ),
		} ).then( function ( users ) {
			return users.map( user => ( {
				value: user.id,
				label: decodeEntities( user.name ) || __( '(no name)', 'jetpack-mu-wpcom' ),
			} ) );
		} );
	};

	fetchCategorySuggestions = search => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/categories', {
				search,
				per_page: 20,
				_fields: 'id,name,parent',
				orderby: 'count',
				order: 'desc',
			} ),
		} ).then( categories =>
			Promise.all(
				categories.map( category => {
					if ( category.parent > 0 ) {
						return apiFetch( {
							path: addQueryArgs( `/wp/v2/categories/${ category.parent }`, {
								_fields: 'name',
							} ),
						} ).then( parentCategory => ( {
							value: category.id,
							label: `${ getCategoryTitle( category ) } – ${ getCategoryTitle( parentCategory ) }`,
						} ) );
					}
					return Promise.resolve( {
						value: category.id,
						label: getCategoryTitle( category ),
					} );
				} )
			)
		);
	};
	fetchSavedCategories = categoryIDs => {
		return apiFetch({
			path: addQueryArgs('/wp/v2/categories', {
				per_page: 100,
				_fields: 'id,name',
				include: categoryIDs.join(','),
			}),
		}).then(function (categories) {
			const allCats = categories.map(category => ({
				value: category.id,
				label:
					decodeEntities(category.name) ||
					__('(no title)', 'jetpack-mu-wpcom'),
			}));
			// Look for categoryIDs that were not returned (deleted categories) and add them to the list.
			categoryIDs.forEach(catID => {
				if (!allCats.find(cat => cat.value === parseInt(catID))) {
					allCats.push({
						value: parseInt(catID),
						label: __('Deleted category', 'jetpack-mu-wpcom'),
					});
				}
			});
			return allCats;
		});
	};

	fetchTagSuggestions = search => {
		return apiFetch({
			path: addQueryArgs('/wp/v2/tags', {
				search,
				per_page: 20,
				_fields: 'id,name',
				orderby: 'count',
				order: 'desc',
			}),
		}).then(function (tags) {
			return tags.map(tag => ({
				value: tag.id,
				label:
					decodeEntities(tag.name) ||
					__('(no title)', 'jetpack-mu-wpcom'),
			}));
		});
	};
	fetchSavedTags = tagIDs => {
		return apiFetch({
			path: addQueryArgs('/wp/v2/tags', {
				per_page: 100,
				_fields: 'id,name',
				include: tagIDs.join(','),
			}),
		}).then(function (tags) {
			const allTags = tags.map(tag => ({
				value: tag.id,
				label:
					decodeEntities(tag.name) ||
					__('(no title)', 'jetpack-mu-wpcom'),
			}));
			// Look for tagIDs that were not returned (deleted tags) and add them to the list.
			tagIDs.forEach(tagID => {
				if (!allTags.find(tag => tag.value === parseInt(tagID))) {
					allTags.push({
						value: parseInt(tagID),
						label: __('Deleted tag', 'jetpack-mu-wpcom'),
					});
				}
			});
			return allTags;
		});
	};

	fetchCustomTaxonomiesSuggestions = ( taxSlug, search ) => {
		return apiFetch( {
			path: addQueryArgs( `/wp/v2/${ taxSlug }`, {
				search,
				per_page: 20,
				_fields: 'id,name,parent',
				orderby: 'count',
				order: 'desc',
			} ),
		} ).then( terms =>
			Promise.all(
				terms.map( term => {
					if ( term.parent > 0 ) {
						return apiFetch( {
							path: addQueryArgs( `/wp/v2/${ taxSlug }/${ term.parent }`, {
								_fields: 'name',
							} ),
						} ).then( parentTerm => ( {
							value: term.id,
							label: `${ getTermTitle( term ) } – ${ getTermTitle( parentTerm ) }`,
						} ) );
					}
					return Promise.resolve( {
						value: term.id,
						label: getTermTitle( term ),
					} );
				} )
			)
		);
	};
	fetchSavedCustomTaxonomies = ( taxSlug, termIDs ) => {
		return apiFetch( {
			path: addQueryArgs( `/wp/v2/${ taxSlug }`, {
				per_page: 100,
				_fields: 'id,name',
				include: termIDs.join( ',' ),
			} ),
		} ).then( function ( terms ) {
			return terms.map( term => ( {
				value: term.id,
				label: decodeEntities( term.name ) || __( '(no title)', 'jetpack-mu-wpcom' ),
			} ) );
		} );
	};

	render = () => {
		const {
			specificMode,
			onSpecificModeChange,
			onLoopModeChange,
			specificPosts,
			onSpecificPostsChange,
			authors,
			onAuthorsChange,
			categories,
			onCategoriesChange,
			categoryJoinType,
			onCategoryJoinTypeChange,
			includeSubcategories,
			onIncludeSubcategoriesChange,
			tags,
			onTagsChange,
			customTaxonomies,
			onCustomTaxonomiesChange,
			tagExclusions,
			onTagExclusionsChange,
			categoryExclusions,
			onCategoryExclusionsChange,
			customTaxonomyExclusions,
			onCustomTaxonomyExclusionsChange,
			enableSpecific,
		} = this.props;

		const registeredCustomTaxonomies = window.newspack_blocks_data?.custom_taxonomies;

		const customTaxonomiesPrepareChange = ( taxArr, taxHandler, taxSlug, value ) => {
			let newValue = taxArr.filter( tax => tax.slug !== taxSlug );
			newValue = [ ...newValue, { slug: taxSlug, terms: value } ];
			taxHandler( newValue );
		};

		const getTermsOfCustomTaxonomy = ( taxArr, taxSlug ) => {
			const tax = taxArr.find( taxObj => taxObj.slug === taxSlug );
			return tax ? tax.terms : [];
		};

		return (
            <>
                { enableSpecific && (
					<BaseControl
						label={ __( 'Mode', 'jetpack-mu-wpcom' ) }
						id="newspack-block__loop-type"
						className="newspack-block__button-group"
						help={ specificMode ? (
							__( 'The block will display only the specifically selected post(s).', 'jetpack-mu-wpcom' )
						) : (
							__(
                                'The block will display content based on the filtering settings below.',
                                'jetpack-mu-wpcom',
                                0
                            )
						) }
					>
						<ButtonGroup>
							<Button
								variant={ ! specificMode && 'primary' }
								aria-pressed={ ! specificMode }
								onClick={ onLoopModeChange }
							>
								{ __( 'Dynamic', 'jetpack-mu-wpcom' ) }
							</Button>
							<Button
								variant={ specificMode && 'primary' }
								aria-pressed={ specificMode }
								onClick={ onSpecificModeChange }
							>
								{ __( 'Static', 'jetpack-mu-wpcom' ) }
							</Button>
						</ButtonGroup>
					</BaseControl>
				) }
                { specificMode ? (
					<AutocompleteTokenField
						tokens={ specificPosts || [] }
						onChange={ onSpecificPostsChange }
						fetchSuggestions={ this.fetchPostSuggestions }
						fetchSavedInfo={ this.fetchSavedPosts }
						label={ __( 'Posts', 'jetpack-mu-wpcom' ) }
						help={ __(
							'Begin typing any word in a post title. Click on an autocomplete result to select it.',
							'jetpack-mu-wpcom'
						) }
					/>
				) : (
					<>
						<BasicQueryControls { ...this.props } maxItems={ 30 } />
						{ onCategoriesChange && (
							<BaseControl
								id="newspack-block__category-control"
							>
								<div className="components-base-control__label-dropdown">
									<BaseControl.VisualLabel>
										{ __( 'Category', 'jetpack-mu-wpcom' ) }
									</BaseControl.VisualLabel>
									<SelectControl
										size="small"
										value={ categoryJoinType }
										options={ [
											{ label: __( 'is one of', 'jetpack-mu-wpcom' ), value: 'or' },
											{ label: __( 'is all of', 'jetpack-mu-wpcom' ), value: 'all' },
										] }
										onChange={ ( value ) => {
											if ( 'all' === value ) {
												onIncludeSubcategoriesChange( false );
											}
											onCategoryJoinTypeChange( value );
										} }
										__nextHasNoMarginBottom
									/>
								</div>
								<AutocompleteTokenField
									tokens={ categories || [] }
									onChange={ onCategoriesChange }
									fetchSuggestions={ this.fetchCategorySuggestions }
									fetchSavedInfo={ this.fetchSavedCategories }
								/>
							</BaseControl>
						) }
						{ 'all' !== categoryJoinType && onIncludeSubcategoriesChange && (
							<CheckboxControl
								checked={ includeSubcategories }
								onChange={ onIncludeSubcategoriesChange }
								label={ __( 'Include subcategories ', 'jetpack-mu-wpcom' ) }
							/>
						) }
						{ onTagsChange && (
							<AutocompleteTokenField
								tokens={ tags || [] }
								onChange={ onTagsChange }
								fetchSuggestions={ this.fetchTagSuggestions }
								fetchSavedInfo={ this.fetchSavedTags }
								label={ __( 'Tags', 'jetpack-mu-wpcom' ) }
							/>
						) }
						{ onAuthorsChange && (
							<AutocompleteTokenField
								tokens={ authors || [] }
								onChange={ onAuthorsChange }
								fetchSuggestions={ this.fetchAuthorSuggestions }
								fetchSavedInfo={ this.fetchSavedAuthors }
								label={ __( 'Authors', 'jetpack-mu-wpcom' ) }
							/>
						) }
						{ onCustomTaxonomiesChange &&
							registeredCustomTaxonomies.map( ( tax, index ) => (
								<AutocompleteTokenField
									key={ index }
									tokens={ getTermsOfCustomTaxonomy( customTaxonomies, tax.slug ) }
									onChange={ value => {
										customTaxonomiesPrepareChange(
											customTaxonomies,
											onCustomTaxonomiesChange,
											tax.slug,
											value
										);
									} }
									fetchSuggestions={ search =>
										this.fetchCustomTaxonomiesSuggestions( tax.slug, search )
									}
									fetchSavedInfo={ termIds => this.fetchSavedCustomTaxonomies( tax.slug, termIds ) }
									label={ tax.label }
								/>
							) ) }
						{ onCategoryExclusionsChange && (
							<AutocompleteTokenField
								tokens={ categoryExclusions || [] }
								onChange={ onCategoryExclusionsChange }
								fetchSuggestions={ this.fetchCategorySuggestions }
								fetchSavedInfo={ this.fetchSavedCategories }
								label={ __( 'Excluded categories', 'jetpack-mu-wpcom' ) }
							/>
						) }
						{ onTagExclusionsChange && (
							<AutocompleteTokenField
								tokens={ tagExclusions || [] }
								onChange={ onTagExclusionsChange }
								fetchSuggestions={ this.fetchTagSuggestions }
								fetchSavedInfo={ this.fetchSavedTags }
								label={ __( 'Excluded tags', 'jetpack-mu-wpcom' ) }
							/>
						) }
						{ registeredCustomTaxonomies &&
							onCustomTaxonomyExclusionsChange &&
							registeredCustomTaxonomies.map( ( { label, slug } ) => (
								<AutocompleteTokenField
									fetchSavedInfo={ termIds => this.fetchSavedCustomTaxonomies( slug, termIds ) }
									fetchSuggestions={ search =>
										this.fetchCustomTaxonomiesSuggestions( slug, search )
									}
									key={ `${ slug }-exclusions-selector` }
									label={ sprintf(
										// translators: %s is the custom taxonomy label.
										__( 'Excluded %s', 'jetpack-mu-wpcom' ),
										label
									) }
									onChange={ value =>
										customTaxonomiesPrepareChange(
											customTaxonomyExclusions,
											onCustomTaxonomyExclusionsChange,
											slug,
											value
										)
									}
									tokens={ getTermsOfCustomTaxonomy( customTaxonomyExclusions, slug ) }
								/>
							) ) }
					</>
				) }
            </>
        );
	};
}

QueryControls.defaultProps = {
	enableSpecific: true,
	specificPosts: [],
	authors: [],
	categories: [],
	tags: [],
	customTaxonomies: [],
	tagExclusions: [],
	customTaxonomyExclusions: [],
};

export default QueryControls;
