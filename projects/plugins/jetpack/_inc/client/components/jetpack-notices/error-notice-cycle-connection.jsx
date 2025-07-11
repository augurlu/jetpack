import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SimpleNotice from 'components/notice';
import NoticeActionReconnect from './notice-action-reconnect';

export default class ErrorNoticeCycleConnection extends Component {
	static defaultProps = {
		text: __( 'Connection Error, please reconnect.', 'jetpack' ),
		display: true,
	};

	static propTypes = {
		text: PropTypes.string.isRequired,
		errorCode: PropTypes.string,
		errorData: PropTypes.object,
		action: PropTypes.string,
		display: PropTypes.bool,
	};

	render() {
		return (
			<SimpleNotice
				showDismiss={ false }
				text={ this.props.text }
				status={ 'is-error' }
				icon={ 'link-break' }
				display={ this.props.display }
			>
				<NoticeActionReconnect
					errorCode={ this.props.errorCode }
					errorData={ this.props.errorData }
					action={ this.props.action }
				>
					{ __( 'Restore Connection', 'jetpack' ) }
				</NoticeActionReconnect>
			</SimpleNotice>
		);
	}
}
