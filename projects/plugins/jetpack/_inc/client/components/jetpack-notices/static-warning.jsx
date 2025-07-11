import { Component } from 'react';
import { connect } from 'react-redux';
import SimpleNotice from 'components/notice';
import {
	getJetpackNotices as _getJetpackNotices,
	isNoticeDismissed as _isNoticeDismissed,
} from 'state/jetpack-notices';

export class StaticWarning extends Component {
	static displayName = 'StaticWarning';

	render() {
		return (
			<SimpleNotice showDismiss={ false } status="is-warning">
				<div>
					#HEADER_TEXT#
					<br />
					#TEXT#
				</div>
			</SimpleNotice>
		);
	}
}

export default connect( state => {
	return {
		jetpackNotices: () => _getJetpackNotices( state ),
		isDismissed: notice => _isNoticeDismissed( state, notice ),
	};
} )( StaticWarning );
