/** @ssr-ready **/

import clsx from 'clsx';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import Count from 'components/count';

class SelectDropdownItem extends Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		path: PropTypes.string,
		selected: PropTypes.bool,
		onClick: PropTypes.func,
		count: PropTypes.number,
	};

	static defaultProps = {
		selected: false,
	};

	itemLinkRef = createRef();

	render() {
		const optionClassName = clsx( this.props.className, {
			'dops-select-dropdown__item': true,
			'is-selected': this.props.selected,
			'is-disabled': this.props.disabled,
		} );

		return (
			<li className="dops-select-dropdown__option">
				<a
					ref={ this.itemLinkRef }
					href={ this.props.path }
					className={ optionClassName }
					onClick={ this.props.disabled ? null : this.props.onClick }
					data-bold-text={ this.props.value || this.props.children }
					role="option"
					tabIndex={ 0 }
					aria-selected={ this.props.selected }
				>
					<span className="dops-select-dropdown__item-text">
						{ this.props.children }
						{ 'number' === typeof this.props.count && <Count count={ this.props.count } /> }
					</span>
				</a>
			</li>
		);
	}
}

export default SelectDropdownItem;
