import { getRedirectUrl, Notice, ToggleControl } from '@automattic/jetpack-components';
import { useEffect } from 'react';
import { useSingleModuleState } from './lib/stores';
import styles from './module.module.scss';
import ErrorBoundary from '$features/error-boundary/error-boundary';
import { __ } from '@wordpress/i18n';
import { isWoaHosting } from '$lib/utils/hosting';
import { useNotices } from '$features/notice/context';
import { createInterpolateElement } from '@wordpress/element';
import { ExternalLink } from '@wordpress/components';
import Pill from '$features/ui/pill/pill';
import type { ReactNode } from 'react';

type ModuleProps = {
	title: ReactNode;
	description: ReactNode;
	children?: ReactNode;
	slug: string;
	toggle?: boolean;
	worksOffline?: boolean;
	onEnable?: () => void;
	onBeforeToggle?: ( newStatus: boolean ) => void;
	onDisable?: () => void;
	onMountEnable?: () => void;
};

const Module = ( {
	title,
	description,
	children,
	slug,
	toggle = true,
	worksOffline = true,
	onEnable,
	onBeforeToggle,
	onDisable,
	onMountEnable,
}: ModuleProps ) => {
	const { site } = Jetpack_Boost;
	const { setNotice } = useNotices();
	const [ status, setStatus ] = useSingleModuleState( slug, active => {
		const activatedMessage = __( 'Module activated', 'jetpack-boost' );
		const deactivatedMessage = __( 'Module deactivated', 'jetpack-boost' );

		setNotice( {
			id: 'update-module-state',
			type: 'success',
			message: active ? activatedMessage : deactivatedMessage,
		} );
		if ( active ) {
			onEnable?.();
		} else {
			onDisable?.();
		}
	} );
	const isModuleActive = status?.active ?? false;
	const isModuleAvailable = status?.available ?? false;
	// Page Cache is not available for WoA sites, but since WoA sites
	// have their own caching, we want to show that Page Cache is active.
	const isFakeActive = ! isModuleAvailable && isWoaHosting() && slug === 'page_cache';

	const showOfflineMessage = ! site.online && ! worksOffline;
	const offlineMessage = (
		<Notice level="warning" hideCloseButton={ true }>
			<div className={ styles.offlineMessage }>
				{ __(
					'This module will not work while your website is not publicly available.',
					'jetpack-boost'
				) }
			</div>
		</Notice>
	);

	const handleToggle = () => {
		const newState = ! isModuleActive;
		const deactivateMessage = __( 'Deactivating module', 'jetpack-boost' );
		const activateMessage = __( 'Activating module', 'jetpack-boost' );

		setNotice( {
			id: 'update-module-state',
			type: 'pending',
			message: newState ? activateMessage : deactivateMessage,
		} );

		if ( onBeforeToggle ) {
			onBeforeToggle( newState );
		}
		setStatus( newState );
	};

	useEffect( () => {
		if ( isModuleActive ) {
			onMountEnable?.();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Don't show unavailable modules
	if ( ! isModuleAvailable && slug !== 'page_cache' ) {
		return null;
	}

	return (
		<div className={ styles.module } data-testid={ `module-${ slug }` }>
			<div className={ styles.toggle }>
				{ toggle && (
					<ToggleControl
						className={ `jb-feature-toggle-${ slug }` }
						size="small"
						checked={ isModuleActive || isFakeActive }
						disabled={ ! isModuleAvailable }
						onChange={ handleToggle }
					/>
				) }
			</div>

			<div className={ styles.content }>
				<h3>
					{ title }
					{ Jetpack_Boost.developmentFeatures.includes( slug ) && (
						<Pill text={ __( 'Under Development', 'jetpack-boost' ) } variant="red" />
					) }
				</h3>

				<div className={ styles.description }>{ description }</div>

				{ showOfflineMessage ? offlineMessage : isModuleActive && children }
			</div>
		</div>
	);
};

export default ( props: ModuleProps ) => {
	return (
		<ErrorBoundary
			fallback={ error => (
				<div>
					<div>
						<h3>{ props.title }</h3>

						<div className={ styles[ 'failed-module-notice' ] }>
							<Notice
								level="error"
								hideCloseButton={ true }
								title={ __( 'Failed to load module', 'jetpack-boost' ) }
							>
								<p>
									{ createInterpolateElement(
										__(
											'We encountered an error while loading this module. Please refresh the page and try again. If the issue persists, <link>click here</link> to get help.',
											'jetpack-boost'
										),
										{
											link: (
												<ExternalLink
													href={ getRedirectUrl( 'jetpack-boost-help-module-load-failed' ) }
												/>
											),
										}
									) }
								</p>
								<code>{ `${ error.constructor.name }: ${ error.message }` }</code>
							</Notice>
						</div>
					</div>
				</div>
			) }
		>
			<Module { ...props } />
		</ErrorBoundary>
	);
};
