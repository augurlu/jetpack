import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import { FormCheckbox } from 'components/forms';
import { createNotice } from 'components/global-notices/state/notices/actions';
import notices from 'notices';

class GlobalNotices extends Component {
	constructor() {
		super( ...arguments );

		this.state = { useState: true };
		this.toggleUseState = this.toggleUseState.bind( this );
		this.showSuccessNotice = this.showNotice.bind( this, 'success' );
		this.showErrorNotice = this.showNotice.bind( this, 'error' );
		this.showInfoNotice = this.showNotice.bind( this, 'info' );
		this.showWarningNotice = this.showNotice.bind( this, 'warning' );
	}

	toggleUseState( event ) {
		this.setState( {
			useState: event.target.checked,
		} );
	}

	showNotice( type ) {
		const message = `This is a ${ type } notice`;
		if ( this.state.useState ) {
			this.props.createNotice( `is-${ type }`, message );
		} else {
			notices[ type ]( message );
		}
	}

	render() {
		const id = 'example-formcheckbox';
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/global-notices">Global Notices</a>
				</h2>
				<label htmlFor={ id }>
					<FormCheckbox
						id={ id }
						onChange={ this.toggleUseState }
						checked={ this.state.useState }
					/>
					Use global application state
				</label>
				<ButtonGroup>
					<Button onClick={ this.showSuccessNotice }>Show success notice</Button>
					<Button onClick={ this.showErrorNotice }>Show error notice</Button>
					<Button onClick={ this.showInfoNotice }>Show info notice</Button>
					<Button onClick={ this.showWarningNotice }>Show warning notice</Button>
				</ButtonGroup>
			</div>
		);
	}
}

GlobalNotices.propTypes = {
	createNotice: PropTypes.func,
};

const ConnectedGlobalNotices = connect( null, { createNotice } )( GlobalNotices );
ConnectedGlobalNotices.displayName = 'GlobalNotices';
export default ConnectedGlobalNotices;
