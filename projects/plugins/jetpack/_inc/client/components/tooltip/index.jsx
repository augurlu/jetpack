import { isMobile } from '@automattic/viewport';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Popover from 'components/popover';

import './style.scss';

/**
 * Module variables
 */
const noop = () => {};

class Tooltip extends Component {
	static propTypes = {
		autoPosition: PropTypes.bool,
		className: PropTypes.string,
		id: PropTypes.string,
		isVisible: PropTypes.bool,
		position: PropTypes.string,
		rootClassName: PropTypes.string,
		status: PropTypes.string,
		showDelay: PropTypes.number,
		showOnMobile: PropTypes.bool,
	};

	static defaultProps = {
		showDelay: 100,
		position: 'top',
		showOnMobile: false,
	};

	render() {
		if ( ! this.props.showOnMobile && isMobile() ) {
			return null;
		}

		const classes = clsx(
			'dops-popover',
			'dops-tooltip',
			`is-${ this.props.position }`,
			this.props.className
		);

		return (
			<Popover
				autoPosition={ this.props.autoPosition }
				className={ classes }
				rootClassName={ this.props.rootClassName }
				context={ this.props.context }
				id={ this.props.id }
				isVisible={ this.props.isVisible }
				onClose={ noop }
				position={ this.props.position }
				showDelay={ this.props.showDelay }
			>
				{ this.props.children }
			</Popover>
		);
	}
}

export default Tooltip;
