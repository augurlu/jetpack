/**
 * External dependencies
 */
import { isBlobURL } from '@wordpress/blob';
import { RichText } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { Component, createRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { isEqual } from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import { paginationCustomRender } from './pagination';
import {
	swiperApplyAria,
	swiperInit,
	swiperPaginationRender,
	swiperResize,
} from './swiper-callbacks';

class Slideshow extends Component {
	pendingRequestAnimationFrame = null;
	resizeObserver = null;
	static defaultProps = {
		effect: 'slide',
	};

	constructor( props ) {
		super( props );

		this.slideshowRef = createRef();
		this.btnNextRef = createRef();
		this.btnPrevRef = createRef();
		this.paginationRef = createRef();
	}

	componentDidMount() {
		const { onError } = this.props;
		this.buildSwiper()
			.then( swiper => {
				this.swiperInstance = swiper;
				this.initializeResizeObserver( swiper );
			} )
			.catch( () => {
				onError( __( 'The Swiper library could not be loaded.', 'jetpack' ) );
			} );
	}

	componentWillUnmount() {
		this.clearResizeObserver();
		this.clearPendingRequestAnimationFrame();
	}

	componentDidUpdate( prevProps ) {
		const { align, autoplay, delay, effect, images, onError } = this.props;

		/* A change in alignment or images only needs an update */
		if ( align !== prevProps.align || ! isEqual( images, prevProps.images ) ) {
			this.swiperInstance && this.swiperInstance.update();
		}
		/* A change in effect requires a full rebuild */
		if (
			effect !== prevProps.effect ||
			autoplay !== prevProps.autoplay ||
			delay !== prevProps.delay ||
			images !== prevProps.images
		) {
			let realIndex;
			if ( ! this.swiperIndex ) {
				realIndex = 0;
			} else if ( images.length === prevProps.images.length ) {
				realIndex = this.swiperInstance.realIndex;
			} else {
				realIndex = prevProps.images.length;
			}
			this.swiperInstance && this.swiperInstance.destroy( true, true );
			this.buildSwiper( realIndex )
				.then( swiper => {
					this.swiperInstance = swiper;
					this.initializeResizeObserver( swiper );
				} )
				.catch( () => {
					onError( __( 'The Swiper library could not be loaded.', 'jetpack' ) );
				} );
		}
	}

	initializeResizeObserver = swiper => {
		this.clearResizeObserver();
		this.resizeObserver = new ResizeObserver( () => {
			this.clearPendingRequestAnimationFrame();
			this.pendingRequestAnimationFrame = requestAnimationFrame( () => {
				swiperResize( swiper );
				swiper.update();
			} );
		} );
		this.resizeObserver.observe( swiper.el );
	};

	clearPendingRequestAnimationFrame = () => {
		if ( this.pendingRequestAnimationFrame ) {
			cancelAnimationFrame( this.pendingRequestAnimationFrame );
			this.pendingRequestAnimationFrame = null;
		}
	};

	clearResizeObserver = () => {
		if ( this.resizeObserver ) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
	};

	render() {
		// If user has not selected any images, don't print any markup.
		if ( ! this.props?.images?.length ) {
			return null;
		}

		const { autoplay, className, delay, effect, images } = this.props;
		// Note: React omits the data attribute if the value is null, but NOT if it is false.
		// This is the reason for the unusual logic related to autoplay below.
		return (
			<div
				className={ className }
				data-autoplay={ autoplay || null }
				data-delay={ autoplay ? delay : null }
				data-effect={ effect }
				style={ {
					'--aspect-ratio': images[ 0 ]?.aspectRatio
						? `calc(${ images[ 0 ].aspectRatio })`
						: undefined,
				} }
			>
				<div
					className="wp-block-jetpack-slideshow_container swiper-container"
					ref={ this.slideshowRef }
				>
					<ul className="wp-block-jetpack-slideshow_swiper-wrapper swiper-wrapper">
						{ images.map( ( { alt, caption, id, url, aspectRatio }, index ) => (
							<li
								className={ clsx(
									'wp-block-jetpack-slideshow_slide',
									'swiper-slide',
									isBlobURL( url ) && 'is-transient'
								) }
								key={ id ? `${ id }-${ index }` : `${ url }-${ index }` }
							>
								<figure>
									<img
										alt={ alt }
										className={
											`wp-block-jetpack-slideshow_image wp-image-${ id }` /* wp-image-${ id } makes WordPress add a srcset */
										}
										data-id={ id }
										data-aspect-ratio={ aspectRatio }
										src={ url }
									/>
									{ isBlobURL( url ) && <Spinner /> }
									{ caption && (
										<RichText.Content
											className="wp-block-jetpack-slideshow_caption gallery-caption"
											tagName="figcaption"
											value={ caption }
										/>
									) }
								</figure>
							</li>
						) ) }
					</ul>
					<a
						className="wp-block-jetpack-slideshow_button-prev swiper-button-prev swiper-button-white"
						ref={ this.btnPrevRef }
						role="button"
					/>
					<a
						className="wp-block-jetpack-slideshow_button-next swiper-button-next swiper-button-white"
						ref={ this.btnNextRef }
						role="button"
					/>
					<a
						aria-label="Pause Slideshow"
						className="wp-block-jetpack-slideshow_button-pause"
						role="button"
					/>
					<div
						className="wp-block-jetpack-slideshow_pagination swiper-pagination swiper-pagination-white"
						ref={ this.paginationRef }
					/>
				</div>
			</div>
		);
	}

	prefersReducedMotion = () => {
		return (
			typeof window !== 'undefined' &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		);
	};

	buildSwiper = ( initialSlide = 0 ) =>
		// Using refs instead of className-based selectors allows us to
		// have multiple swipers on one page without collisions, and
		// without needing to add IDs or the like.
		createSwiper(
			this.slideshowRef.current,
			{
				autoplay:
					this.props.autoplay && ! this.prefersReducedMotion()
						? {
								delay: this.props.delay * 1000,
								disableOnInteraction: false,
						  }
						: false,
				effect: this.props.effect,
				loop: true,
				initialSlide,
				followFinger: false,
				navigation: {
					nextEl: this.btnNextRef.current,
					prevEl: this.btnPrevRef.current,
				},
				pagination: {
					clickable: true,
					el: this.paginationRef.current,
					type: 'custom',
					renderCustom: paginationCustomRender,
				},
			},
			{
				init: swiperInit,
				imagesReady: swiperResize,
				paginationRender: swiperPaginationRender,
				transitionEnd: swiperApplyAria,
			}
		);
}

export default Slideshow;
