import { getRedirectUrl, ToggleControl } from '@automattic/jetpack-components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import clsx from 'clsx';
import { filter, includes } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'components/button';
import Card from 'components/card';
import FoldableCard from 'components/foldable-card';
import { FormFieldset, FormLegend } from 'components/forms';
import ModuleOverriddenBanner from 'components/module-overridden-banner';
import { withModuleSettingsFormHelpers } from 'components/module-settings/with-module-settings-form-helpers';
import SettingsCard from 'components/settings-card';
import SettingsGroup from 'components/settings-group';
import { imagePath } from 'constants/urls';
import analytics from 'lib/analytics';

class SiteStatsComponent extends Component {
	constructor( props ) {
		super( props );
		const countRoles = props.getOptionValue( 'count_roles', 'stats' ),
			roles = props.getOptionValue( 'roles', 'stats' );

		this.state = {
			count_roles: countRoles,
			roles: roles,

			count_roles_administrator: includes( countRoles, 'administrator', false ),
			count_roles_editor: includes( countRoles, 'editor', false ),
			count_roles_author: includes( countRoles, 'author', false ),
			count_roles_contributor: includes( countRoles, 'contributor', false ),
			count_roles_subscriber: includes( countRoles, 'subscriber', false ),

			roles_administrator: true,
			roles_editor: includes( roles, 'editor', false ),
			roles_author: includes( roles, 'author', false ),
			roles_contributor: includes( roles, 'contributor', false ),
			roles_subscriber: includes( roles, 'subscriber', false ),

			wpcom_reader_views_enabled: props.getOptionValue( 'wpcom_reader_views_enabled' ),
		};

		const defaultRoles = [ 'administrator', 'editor', 'author', 'contributor', 'subscriber' ];

		if ( roles?.length > 0 ) {
			roles.forEach( role => {
				if ( ! defaultRoles.includes( role ) ) {
					this.state[ `roles_${ role }` ] = true;
				}
			} );
		}

		if ( countRoles?.length > 0 ) {
			countRoles.forEach( role => {
				if ( ! defaultRoles.includes( role ) ) {
					this.state[ `count_roles_${ role }` ] = true;
				}
			} );
		}
	}

	/**
	 * Update state so toggles are updated.
	 *
	 * @param {string} optionName - the slug of the option to update
	 * @param {string} optionSet  - the name of a set of options ?
	 */
	updateOptions = ( optionName, optionSet ) => {
		let value = this.props.getOptionValue( optionSet, 'stats' ),
			toggled = false;
		if ( ! this.state[ `${ optionSet }_${ optionName }` ] ) {
			if ( ! includes( value, optionName ) ) {
				value.push( optionName );
				toggled = true;
			}
		} else if ( includes( value, optionName ) ) {
			value = filter( value, item => {
				return item !== optionName;
			} );
		}

		this.setState(
			{
				[ `${ optionSet }_${ optionName }` ]: ! this.state[ `${ optionSet }_${ optionName }` ],
			},
			() => {
				this.props.updateOptions( {
					[ optionSet ]: value,
				} );
			}
		);

		analytics.tracks.recordEvent( 'jetpack_wpa_settings_toggle', {
			module: 'stats',
			setting: optionSet,
			role: optionName,
			toggled: toggled ? 'on' : 'off',
		} );
	};

	/**
	 * Activate Stats.
	 */
	activateStats = () => {
		this.props.updateOptions( {
			stats: true,
		} );
	};

	trackOpenCard = () => {
		analytics.tracks.recordJetpackClick( {
			target: 'foldable-settings-open',
			feature: 'stats',
		} );
	};

	handleRoleToggleChange = ( role, setting ) => {
		return () => this.updateOptions( role, setting );
	};

	handleStatsOptionToggle( option_slug ) {
		return () => this.props.updateFormStateModuleOption( 'stats', option_slug );
	}

	handleOptionToggle = option_slug => () => {
		const value = ! this.props.getOptionValue( option_slug );

		this.setState(
			{
				[ option_slug ]: ! this.state[ option_slug ],
			},
			() => {
				this.props.updateOptions( {
					[ option_slug ]: value,
				} );
			}
		);

		analytics.tracks.recordEvent( 'jetpack_wpa_settings_toggle', {
			module: 'stats',
			setting: option_slug,
			toggled: value ? 'on' : 'off',
		} );
	};

	render() {
		const stats = this.props.getModule( 'stats' );
		const isStatsActive = this.props.getOptionValue( 'stats' );
		const unavailableInOfflineMode = this.props.isUnavailableInOfflineMode( 'stats' );
		const siteRoles = this.props.getSiteRoles();

		if ( 'inactive' === this.props.getModuleOverride( 'stats' ) ) {
			return <ModuleOverriddenBanner moduleName={ stats.name } />;
		}

		if ( ! isStatsActive ) {
			return (
				<Card
					className={
						'jp-at-a-glance__stats-card ' + ( this.props.isOfflineMode ? 'is-inactive' : '' )
					}
				>
					<div className="jp-at-a-glance__stats-inactive">
						<div className="jp-at-a-glance__stats-inactive-icon">
							<img
								src={ imagePath + 'stats.svg' }
								width="60"
								height="60"
								alt={ __( 'Line chart overlaid on a bar chart', 'jetpack' ) }
								className="jp-at-a-glance__stats-icon"
							/>
						</div>
						<div className="jp-at-a-glance__stats-inactive-text">
							{ this.props.isOfflineMode
								? __( 'Unavailable in Offline Mode', 'jetpack' )
								: createInterpolateElement(
										__(
											'Activate Jetpack Stats to see page views, likes, followers, subscribers, and more! <a>Learn More</a>',
											'jetpack'
										),
										{
											a: (
												<a
													href={ getRedirectUrl( 'jetpack-support-wordpress-com-stats' ) }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										}
								  ) }
						</div>
						{ ! this.props.isOfflineMode && (
							<div className="jp-at-a-glance__stats-inactive-button">
								<Button rna onClick={ this.activateStats } primary={ true }>
									{ __( 'Activate Jetpack Stats', 'jetpack' ) }
								</Button>
							</div>
						) }
					</div>
				</Card>
			);
		}

		return (
			<SettingsCard
				{ ...this.props }
				header={ _x( 'Jetpack Stats', 'Settings header', 'jetpack' ) }
				hideButton
				module="site-stats"
			>
				<FoldableCard
					onOpen={ this.trackOpenCard }
					header={ __(
						'Expand to update settings for how visits are counted and manage who can view this information.',
						'jetpack'
					) }
					clickableHeader={ true }
					className={ clsx( 'jp-foldable-settings-standalone', {
						'jp-foldable-settings-disable': unavailableInOfflineMode,
					} ) }
				>
					<SettingsGroup
						disableInOfflineMode
						module={ stats }
						support={ {
							text: __(
								'Displays information on your site activity, including visitors and popular posts or pages.',
								'jetpack'
							),
							link: getRedirectUrl( 'jetpack-support-wordpress-com-stats' ),
						} }
					>
						<FormFieldset className="jp-stats-form-fieldset">
							<ToggleControl
								checked={ !! this.props.getOptionValue( 'admin_bar' ) }
								disabled={
									! isStatsActive ||
									unavailableInOfflineMode ||
									this.props.isSavingAnyOption( [ 'stats' ] )
								}
								toggling={ this.props.isSavingAnyOption( [ 'admin_bar' ] ) }
								onChange={ this.handleStatsOptionToggle( 'admin_bar' ) }
								label={ __(
									'Include a small chart in your admin bar with a 48-hour traffic snapshot',
									'jetpack'
								) }
							/>
						</FormFieldset>
						<FormFieldset className="jp-stats-form-fieldset">
							<FormLegend>{ __( 'Count logged in page views from', 'jetpack' ) }</FormLegend>
							{ Object.keys( siteRoles ).map( key => (
								<ToggleControl
									checked={ this.state[ `count_roles_${ key }` ] }
									disabled={
										! isStatsActive ||
										unavailableInOfflineMode ||
										this.props.isSavingAnyOption( [ 'stats' ] )
									}
									toggling={ this.props.isSavingAnyOption( [ `count_roles_${ key }` ] ) }
									onChange={ this.handleRoleToggleChange( key, 'count_roles' ) }
									key={ `count_roles-${ key }` }
									label={ siteRoles[ key ].name }
								/>
							) ) }
						</FormFieldset>
						<FormFieldset className="jp-stats-form-fieldset">
							<FormLegend>{ __( 'Allow Jetpack Stats to be viewed by', 'jetpack' ) }</FormLegend>
							<ToggleControl
								checked={ true }
								disabled={ true }
								label={ siteRoles.administrator.name }
							/>
							{ Object.keys( siteRoles ).map( key =>
								'administrator' !== key ? (
									<ToggleControl
										checked={ this.state[ `roles_${ key }` ] }
										disabled={
											! isStatsActive ||
											unavailableInOfflineMode ||
											this.props.isSavingAnyOption( [ 'stats' ] )
										}
										toggling={ this.props.isSavingAnyOption( [ `roles_${ key }` ] ) }
										onChange={ this.handleRoleToggleChange( key, 'roles' ) }
										key={ `roles-${ key }` }
										label={ siteRoles[ key ].name }
									/>
								) : null
							) }
						</FormFieldset>
						<FormFieldset className="jp-stats-form-fieldset">
							<FormLegend>{ __( 'WordPress.com Reader', 'jetpack' ) }</FormLegend>
							<ToggleControl
								checked={ this.state.wpcom_reader_views_enabled }
								disabled={ ! isStatsActive || unavailableInOfflineMode }
								toggling={ this.props.isSavingAnyOption( [ 'wpcom_reader_views_enabled' ] ) }
								onChange={ this.handleOptionToggle( 'wpcom_reader_views_enabled' ) }
								label={ __( 'Show post views for this site.', 'jetpack' ) }
							/>
						</FormFieldset>
					</SettingsGroup>
				</FoldableCard>
			</SettingsCard>
		);
	}
}

export const SiteStats = connect()( withModuleSettingsFormHelpers( SiteStatsComponent ) );
