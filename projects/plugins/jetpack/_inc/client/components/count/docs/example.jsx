import { PureComponent } from 'react';
import Count from 'components/count';

export default class extends PureComponent {
	static displayName = 'Count';

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/count">Count</a>
				</h2>
				<div>
					<Count count={ 65365 } />
				</div>
			</div>
		);
	}
}
