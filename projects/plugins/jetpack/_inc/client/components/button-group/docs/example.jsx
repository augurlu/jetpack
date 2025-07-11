/* eslint-disable jsx-a11y/click-events-have-key-events */

import { PureComponent } from 'react';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import Card from 'components/card';
import Gridicon from 'components/gridicon';

class Buttons extends PureComponent {
	static displayName = 'ButtonGroup';

	state = {
		compact: false,
	};

	toggleButtons = () => {
		this.setState( { compact: ! this.state.compact } );
	};

	render() {
		return (
			<div>
				<a
					className="docs__design-toggle button"
					role="button"
					tabIndex={ 0 }
					onClick={ this.toggleButtons }
				>
					{ this.state.compact ? 'Normal Buttons' : 'Compact Buttons' }
				</a>
				<Card>
					<div className="docs__design-button-row">
						<ButtonGroup>
							<Button compact={ this.state.compact }>Do thing</Button>
							<Button compact={ this.state.compact }>Do another thing</Button>
						</ButtonGroup>
					</div>
					<div className="docs__design-button-row">
						<ButtonGroup>
							<Button compact={ this.state.compact }>Button one</Button>
							<Button compact={ this.state.compact }>Button two</Button>
							<Button compact={ this.state.compact } scary>
								Button Three
							</Button>
						</ButtonGroup>
					</div>
					<div className="docs__design-button-row">
						<ButtonGroup>
							<Button compact={ this.state.compact }>
								<Gridicon icon="add-image" />
							</Button>
							<Button compact={ this.state.compact }>
								<Gridicon icon="heart" />
							</Button>
							<Button compact={ this.state.compact }>
								<Gridicon icon="briefcase" />
							</Button>
							<Button compact={ this.state.compact }>
								<Gridicon icon="history" />
							</Button>
						</ButtonGroup>
					</div>
					<div className="docs__design-button-row">
						<ButtonGroup>
							<Button primary compact={ this.state.compact }>
								Publish
							</Button>
							<Button primary compact={ this.state.compact }>
								<Gridicon icon="calendar" />
							</Button>
						</ButtonGroup>
					</div>
				</Card>
			</div>
		);
	}
}

export default Buttons;
