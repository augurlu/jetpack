import { createRef } from '@wordpress/element';
import clsx from 'clsx';
import uid from 'component-uid';
import debugFactory from 'debug';
import { assign } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import RootChild from 'components/root-child';
import {
	bindWindowListeners,
	unbindWindowListeners,
	suggested as suggestPosition,
	constrainLeft,
	offset,
} from './util';

import './style.scss';

/**
 * Module variables
 */
const noop = () => {};
const debug = debugFactory( 'calypso:popover' );
const __popovers = new Set();

class Popover extends Component {
	static propTypes = {
		autoPosition: PropTypes.bool,
		className: PropTypes.string,
		closeOnEsc: PropTypes.bool,
		id: PropTypes.string,
		ignoreContext: PropTypes.shape( { getDOMNode: PropTypes.function } ),
		position: PropTypes.string,
		rootClassName: PropTypes.string,
		showDelay: PropTypes.number,

		onClose: PropTypes.func.isRequired,
		onShow: PropTypes.func,
	};

	static defaultProps = {
		autoPosition: true,
		className: 'dops-popover',
		closeOnEsc: true,
		isVisible: false,
		position: 'top',
		showDelay: 0,

		onShow: noop,
	};

	constructor( props ) {
		super( props );

		this.setPopoverId( props.id );

		// bound methods
		this.setDOMBehavior = this.setDOMBehavior.bind( this );
		this.setPosition = this.setPosition.bind( this );
		this.onClickout = this.onClickout.bind( this );
		this.onKeydown = this.onKeydown.bind( this );
		this.onWindowChange = this.onWindowChange.bind( this );

		this.state = {
			show: props.isVisible,
			left: -99999,
			top: -99999,
			positionClass: this.getPositionClass( props.position ),
		};

		this.domContainerRef = createRef();
		this.domContextRef = createRef();
	}

	componentDidMount() {
		this.bindEscKeyListener();
		this.bindDebouncedReposition();
		bindWindowListeners();
	}

	isDOMNode( obj ) {
		return obj instanceof HTMLElement;
	}

	componentDidUpdate( prevProps ) {
		const { context, isVisible } = this.props;

		// update context (target - expecting a DOM node not a ref) reference into a property.
		if ( context !== prevProps.context ) {
			if ( ! context || this.isDOMNode( context ) ) {
				this.domContextRef.current = context;
			} else {
				this.debug( 'Expected a DOM node for props.context', context );
			}
		}

		if ( isVisible !== prevProps.isVisible ) {
			if ( isVisible ) {
				this.show();
			} else {
				this.hide();
			}
		}

		if ( ! this.domContainerRef.current || ! this.domContextRef.current ) {
			return null;
		}

		if ( ! isVisible || isVisible === prevProps.isVisible ) {
			return null;
		}

		this.debug( 'Update position after render completes' );

		setTimeout( () => this.setPosition(), 0 );
	}

	componentWillUnmount() {
		this.debug( 'unmounting .... ' );
		this.unbindClickoutHandler();
		this.unbindDebouncedReposition();
		this.unbindEscKeyListener();
		unbindWindowListeners();

		__popovers.delete( this.id );
		debug( 'current popover instances: ', __popovers.size );
	}

	// --- ESC key ---
	bindEscKeyListener() {
		if ( ! this.props.closeOnEsc ) {
			return null;
		}

		if ( this.escEventHandlerAdded ) {
			return null;
		}

		this.debug( 'adding escKey listener ...' );
		this.escEventHandlerAdded = true;
		document.addEventListener( 'keydown', this.onKeydown, true );
	}

	unbindEscKeyListener() {
		if ( ! this.props.closeOnEsc ) {
			return null;
		}

		if ( ! this.escEventHandlerAdded ) {
			return null;
		}

		this.debug( 'unbinding `escKey` listener ...' );
		document.removeEventListener( 'keydown', this.onKeydown, true );
	}

	onKeydown( event ) {
		if ( event.keyCode !== 27 ) {
			return null;
		}

		this.close( true );
	}

	// --- click outside ---
	bindClickoutHandler( el = this.domContainerRef.current ) {
		if ( ! el ) {
			this.debug( 'no element to bind clickout side ' );
			return null;
		}

		if ( this._clickoutHandlerReference ) {
			this.debug( 'clickout event already bound' );
			return null;
		}

		this.debug( 'binding `clickout` event' );
		this._clickoutHandlerReference = e => {
			if ( ! el.contains( e.target ) ) {
				this.onClickout( e );
			}
		};
		document.addEventListener( 'click', this._clickoutHandlerReference, true );
	}

	unbindClickoutHandler() {
		if ( this._clickoutHandlerReference ) {
			this.debug( 'unbinding `clickout` listener ...' );
			document.removeEventListener( 'click', this._clickoutHandlerReference, true );
			this._clickoutHandlerReference = null;
		}
	}

	onClickout( event ) {
		let shouldClose =
			this.domContextRef.current &&
			this.domContextRef.current?.contains &&
			! this.domContextRef.current.contains( event.target );

		if ( this.props.ignoreContext && shouldClose ) {
			let ignoreContext;
			if ( ! this.props.ignoreContext || this.isDOMNode( this.props.ignoreContext ) ) {
				ignoreContext = this.props.ignoreContext;
			} else {
				this.debug( 'Expected a DOM node for props.context', this.props.ignoreContext );
			}
			if ( ignoreContext && ignoreContext.contains ) {
				shouldClose = shouldClose && ! ignoreContext.contains( event.target );
			} else {
				shouldClose = false;
			}
		}

		if ( shouldClose ) {
			this.close();
		}
	}

	// --- window `scroll` and `resize` ---
	bindDebouncedReposition() {
		window.addEventListener( 'scroll', this.onWindowChange, true );
		window.addEventListener( 'resize', this.onWindowChange, true );
	}

	unbindDebouncedReposition() {
		if ( this.willReposition ) {
			window.cancelAnimationFrame( this.willReposition );
			this.willReposition = null;
		}

		window.removeEventListener( 'scroll', this.onWindowChange, true );
		window.removeEventListener( 'resize', this.onWindowChange, true );
		this.debug( 'unbinding `debounce reposition` ...' );
	}

	onWindowChange() {
		this.willReposition = window.requestAnimationFrame( this.setPosition );
	}

	setDOMBehavior( domContainer ) {
		if ( ! domContainer ) {
			this.unbindClickoutHandler();
			return null;
		}

		this.debug( 'setting DOM behavior' );

		this.bindClickoutHandler( domContainer );

		// store DOM element references - note we expect DOM nodes not refs.
		this.domContainerRef.current = domContainer;
		// store context (target) reference into a property
		if ( ! this.props.context || this.isDOMNode( this.props.context ) ) {
			this.domContextRef.current = this.props.context;
		} else {
			this.debug( 'Expected a DOM node for props.context', this.props.context );
		}

		this.domContainerRef.current.focus();
		this.setPosition();
	}

	getPositionClass( position = this.props.position ) {
		return `is-${ position.replace( /\s+/g, '-' ) }`;
	}

	/**
	 * Computes the position of the Popover in function
	 * of its main container and the target.
	 *
	 * @return {object} reposition parameters
	 */
	computePosition() {
		if ( ! this.props.isVisible ) {
			return null;
		}

		const { domContainerRef, domContextRef } = this;

		const { position } = this.props;

		if ( ! domContainerRef.current || ! domContextRef.current ) {
			this.debug( '[WARN] no DOM elements to work' );
			return null;
		}

		let suggestedPosition = position;

		this.debug( 'position: %o', position );

		if ( this.props.autoPosition ) {
			suggestedPosition = suggestPosition(
				position,
				domContainerRef.current,
				domContextRef.current
			);
			this.debug( 'suggested position: %o', suggestedPosition );
		}

		const reposition = assign(
			{},
			constrainLeft(
				offset( suggestedPosition, domContainerRef.current, domContextRef.current ),
				domContainerRef.current
			),
			{ positionClass: this.getPositionClass( suggestedPosition ) }
		);

		this.debug( 'updating reposition: ', reposition );

		return reposition;
	}

	debug( string, ...args ) {
		debug( `[%s] ${ string }`, this.id, ...args );
	}

	setPopoverId( id ) {
		this.id = id || `pop__${ uid( 16 ) }`;
		__popovers.add( this.id );

		this.debug( 'creating ...' );
		debug( 'current popover instances: ', __popovers.size );
	}

	setPosition() {
		const position = this.computePosition();
		if ( ! position ) {
			return null;
		}

		this.willReposition = null;
		this.setState( position );
	}

	getStylePosition() {
		const { left, top } = this.state;
		return { left, top };
	}

	show() {
		if ( ! this.props.showDelay ) {
			this.setState( { show: true } );
			return null;
		}

		this.debug( 'showing in %o', `${ this.props.showDelay }ms` );
		this.clearShowTimer();

		this._openDelayTimer = setTimeout( () => {
			this.setState( { show: true } );
		}, this.props.showDelay );
	}

	hide() {
		// unbind click-outside event every time the component is hidden.
		this.unbindClickoutHandler();
		this.setState( { show: false } );
		this.clearShowTimer();
	}

	clearShowTimer() {
		if ( ! this._openDelayTimer ) {
			return null;
		}

		clearTimeout( this._openDelayTimer );
		this._openDelayTimer = null;
	}

	close( wasCanceled = false ) {
		if ( ! this.props.isVisible ) {
			this.debug( 'popover should be already closed' );
			return null;
		}

		this.domContextRef.current.focus();
		this.props.onClose( wasCanceled );
	}

	render() {
		if ( ! this.state.show ) {
			this.debug( 'is hidden. return no render' );
			return null;
		}

		if ( ! this.props.context ) {
			this.debug( 'No `context` to tie. return no render' );
			return null;
		}

		const classes = clsx( 'dops-popover', this.props.className, this.state.positionClass );

		this.debug( 'rendering ...' );

		return (
			<RootChild className={ this.props.rootClassName }>
				<div style={ this.getStylePosition() } className={ classes } ref={ this.setDOMBehavior }>
					<div className="dops-popover__arrow" />

					<div className="dops-popover__inner">{ this.props.children }</div>
				</div>
			</RootChild>
		);
	}
}

export default Popover;
