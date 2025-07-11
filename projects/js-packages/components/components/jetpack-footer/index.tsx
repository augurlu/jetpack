import { __, _x } from '@wordpress/i18n';
import { Icon, external } from '@wordpress/icons';
import clsx from 'clsx';
import { getRedirectUrl } from '../../index.ts';
import getSiteAdminUrl from '../../tools/get-site-admin-url/index.ts';
import AutomatticBylineLogo from '../automattic-byline-logo/index.tsx';
import './style.scss';
import JetpackLogo from '../jetpack-logo/index.tsx';
import useBreakpointMatch from '../layout/use-breakpoint-match/index.ts';
import type { JetpackFooterProps, JetpackFooterMenuItem } from './types.ts';
import type { FC, ReactNode } from 'react';

const JetpackIcon: FC = () => (
	<JetpackLogo logoColor="#000" showText={ false } height={ 16 } aria-hidden="true" />
);

const ExternalIcon: FC = () => (
	<>
		<Icon icon={ external } size={ 16 } />
		<span className="jp-dashboard-footer__accessible-external-link">
			{
				/* translators: accessibility text */
				__( '(opens in a new tab)', 'jetpack-components' )
			}
		</span>
	</>
);

/**
 * JetpackFooter component displays a tiny Jetpack logo with the product name on the left and the Automattic Airline "by line" on the right.
 *
 * @param {JetpackFooterProps} props - Component properties.
 * @return {ReactNode} JetpackFooter component.
 */
const JetpackFooter: FC< JetpackFooterProps > = ( {
	moduleName = __( 'Jetpack', 'jetpack-components' ),
	className,
	moduleNameHref = 'https://jetpack.com',
	menu,
	useInternalLinks,
	onAboutClick,
	onPrivacyClick,
	onTermsClick,
	...otherProps
} ) => {
	const [ isSm ] = useBreakpointMatch( 'sm', '<=' );
	const [ isMd ] = useBreakpointMatch( 'md', '<=' );
	const [ isLg ] = useBreakpointMatch( 'lg', '>' );

	const siteAdminUrl = getSiteAdminUrl();

	let items: JetpackFooterMenuItem[] = [
		{
			label: _x( 'About', 'Link to learn more about Jetpack.', 'jetpack-components' ),
			title: __( 'About Jetpack', 'jetpack-components' ),
			href: useInternalLinks
				? new URL( 'admin.php?page=jetpack_about', siteAdminUrl ).href
				: getRedirectUrl( 'jetpack-about' ),
			target: useInternalLinks ? '_self' : '_blank',
			onClick: onAboutClick,
		},
		{
			label: _x( 'Privacy', 'Shorthand for Privacy Policy.', 'jetpack-components' ),
			title: __( "Automattic's Privacy Policy", 'jetpack-components' ),
			href: useInternalLinks
				? new URL( 'admin.php?page=jetpack#/privacy', siteAdminUrl ).href
				: getRedirectUrl( 'a8c-privacy' ),
			target: useInternalLinks ? '_self' : '_blank',
			onClick: onPrivacyClick,
		},
		{
			label: _x( 'Terms', 'Shorthand for Terms of Service.', 'jetpack-components' ),
			title: __( 'WordPress.com Terms of Service', 'jetpack-components' ),
			href: getRedirectUrl( 'wpcom-tos' ),
			target: '_blank',
			onClick: onTermsClick,
		},
	];

	if ( menu ) {
		items = [ ...items, ...menu ];
	}

	const jetpackItemContent = (
		<>
			<JetpackIcon />
			{ moduleName }
		</>
	);

	return (
		<footer
			className={ clsx(
				'jp-dashboard-footer',
				{
					'is-sm': isSm,
					'is-md': isMd,
					'is-lg': isLg,
				},
				className
			) }
			aria-label={ __( 'Jetpack', 'jetpack-components' ) }
			role="contentinfo"
			{ ...otherProps }
		>
			<ul>
				<li className="jp-dashboard-footer__jp-item">
					{ moduleNameHref ? (
						<a href={ moduleNameHref }>{ jetpackItemContent }</a>
					) : (
						jetpackItemContent
					) }
				</li>
				{ items.map( item => {
					const isButton = item.role === 'button';
					const isExternalLink = ! isButton && item.target === '_blank';

					return (
						<li key={ item.label }>
							<a
								href={ item.href }
								title={ item.title }
								target={ item.target }
								onClick={ item.onClick }
								onKeyDown={ item.onKeyDown }
								className={ clsx( 'jp-dashboard-footer__menu-item', {
									'is-external': isExternalLink,
								} ) }
								role={ item.role }
								rel={ isExternalLink ? 'noopener noreferrer' : undefined }
								tabIndex={ isButton ? 0 : undefined }
							>
								{ item.label }
								{ isExternalLink && <ExternalIcon /> }
							</a>
						</li>
					);
				} ) }
				<li className="jp-dashboard-footer__a8c-item">
					<a
						href={
							useInternalLinks
								? new URL( 'admin.php?page=jetpack_about', siteAdminUrl ).href
								: getRedirectUrl( 'a8c-about' )
						}
						aria-label={ __( 'An Automattic Airline', 'jetpack-components' ) }
					>
						<AutomatticBylineLogo aria-hidden="true" />
					</a>
				</li>
			</ul>
		</footer>
	);
};

export default JetpackFooter;
