import clsx from 'clsx';
import { assign, omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createElement } from 'react';
import Gridicon from '../gridicon';

import './style.scss';

class CardSection extends Component {
	static propTypes = {
		title: PropTypes.any,
		vertical: PropTypes.any,
		style: PropTypes.object,
		className: PropTypes.string,
		device: PropTypes.oneOf( [ 'desktop', 'tablet', 'phone' ] ),
	};

	static defaultProps = { vertical: null };

	render() {
		return (
			<div
				className={ clsx( 'dops-card-section', this.props.className ) }
				style={ this.props.style }
			>
				{ this.props.title ? this._renderWithTitle() : this.props.children }
			</div>
		);
	}

	_renderWithTitle = () => {
		const orientation = this.props.vertical ? 'vertical' : 'horizontal';
		const wrapperClassName = 'dops-card-section-orient-' + orientation;

		return (
			<div className={ wrapperClassName }>
				<h4 className="dops-card-section-label">{ this.props.title }</h4>
				<div className="dops-card-section-content">{ this.props.children }</div>
			</div>
		);
	};
}

class CardFooter extends Component {
	render() {
		return <div className="dops-card-footer">{ this.props.children }</div>;
	}
}

class Card extends Component {
	static propTypes = {
		meta: PropTypes.any,
		icon: PropTypes.string,
		iconLabel: PropTypes.any,
		iconColor: PropTypes.string,
		style: PropTypes.object,
		className: PropTypes.string,
		href: PropTypes.string,
		onClick: PropTypes.func,
		title: PropTypes.string,
		tagName: PropTypes.string,
		target: PropTypes.string,
		compact: PropTypes.bool,
		children: PropTypes.node,
	};

	static defaultProps = {
		iconColor: '#787878',
		className: '',
		tagName: 'div',
		onClick: () => {},
	};

	render() {
		const className = clsx( 'dops-card', this.props.className, {
			'is-card-link': !! this.props.href,
			'is-compact': this.props.compact,
		} );

		const omitProps = [ 'compact', 'tagName', 'meta', 'iconColor' ];

		let linkIndicator;
		if ( this.props.href ) {
			linkIndicator = this.props.target && (
				<Gridicon className="dops-card__link-indicator" icon="external" />
			);
		} else {
			omitProps.push( 'href', 'target' );
		}

		let fancyTitle;
		if ( this.props.title ) {
			fancyTitle = (
				<h2 className="dops-card-title">
					{ this.props.title }
					{ this.props.meta && <span className="dops-card-meta">{ this.props.meta }</span> }
					{ ( this.props.icon || this.props.iconLabel ) && this._renderIcon() }
				</h2>
			);
		}

		return createElement(
			this.props.href ? 'a' : this.props.tagName,
			assign( omit( this.props, omitProps ), { className } ),
			fancyTitle,
			this.props.children,
			linkIndicator
		);
	}

	_renderIcon = () => {
		return (
			<span className="dops-card-icon" style={ { color: this.props.iconColor } }>
				{ this.props.icon && (
					<Gridicon icon={ this.props.icon } style={ { backgroundColor: this.props.iconColor } } />
				) }
				{ this.props.iconLabel }
			</span>
		);
	};
}

Card.Section = CardSection;
Card.Footer = CardFooter;

export default Card;
