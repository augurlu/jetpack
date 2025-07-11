import * as React from 'react';
import { Component } from 'react';
import SearchBox from './search-box';

const noop = event => event.preventDefault();

class SearchForm extends Component {
	onClear = () => this.props.onChangeSearch( '' );
	onChangeSearch = event => this.props.onChangeSearch( event.currentTarget.value );

	render() {
		return (
			<form autoComplete="off" onSubmit={ noop } role="search" className={ this.props.className }>
				<div className="jetpack-instant-search__search-form">
					<SearchBox
						isVisible={ this.props.isVisible }
						onChange={ this.onChangeSearch }
						onClear={ this.onClear }
						shouldRestoreFocus
						searchQuery={ this.props.searchQuery }
					/>
				</div>
			</form>
		);
	}
}

export default SearchForm;
