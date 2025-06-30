import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { getRedirectUrl } from '../../index.ts';
import Text from '../text/index.tsx';
import type { TermsOfServiceProps } from './types.ts';
import type { FC, ReactNode } from 'react';
import './styles.scss';

const TermsOfService: FC< TermsOfServiceProps > = ( {
	className,
	multipleButtons,
	agreeButtonLabel,
	isTextOnly,
	...textProps
} ) => {
	const getTOSContent = () => {
		if ( isTextOnly ) {
			return <TermsOfServiceTextOnly />;
		}
		if ( multipleButtons ) {
			return <MultipleButtonsText multipleButtonsLabels={ multipleButtons } />;
		}
		return <SingleButtonText agreeButtonLabel={ agreeButtonLabel } />;
	};

	return (
		<Text className={ clsx( className, 'terms-of-service' ) } { ...textProps }>
			{ getTOSContent() }
		</Text>
	);
};

const MultipleButtonsText = ( { multipleButtonsLabels } ) => {
	if ( Array.isArray( multipleButtonsLabels ) && multipleButtonsLabels.length > 1 ) {
		return createInterpolateElement(
			sprintf(
				/* translators: %1$s is button label 1 and %2$s is button label 2 */
				__(
					'By clicking <strong>%1$s</strong> or <strong>%2$s</strong>, you agree to our <tosLink>Terms of Service</tosLink> and to <shareDetailsLink>sync your site‘s data</shareDetailsLink> with us.',
					'jetpack-components'
				),
				multipleButtonsLabels[ 0 ],
				multipleButtonsLabels[ 1 ]
			),
			{
				strong: <strong />,
				tosLink: <Link slug="wpcom-tos" />,
				shareDetailsLink: <Link slug="jetpack-support-what-data-does-jetpack-sync" />,
			}
		);
	}

	return createInterpolateElement(
		__(
			'By clicking the buttons above, you agree to our <tosLink>Terms of Service</tosLink> and to <shareDetailsLink>sync your site‘s data</shareDetailsLink> with us.',
			'jetpack-components'
		),
		{
			tosLink: <Link slug="wpcom-tos" />,
			shareDetailsLink: <Link slug="jetpack-support-what-data-does-jetpack-sync" />,
		}
	);
};

const SingleButtonText = ( { agreeButtonLabel } ) =>
	createInterpolateElement(
		sprintf(
			/* translators: %s is a button label */
			__(
				'By clicking <strong>%s</strong>, you agree to our <tosLink>Terms of Service</tosLink> and to <shareDetailsLink>sync your site‘s data</shareDetailsLink> with us.',
				'jetpack-components'
			),
			agreeButtonLabel
		),
		{
			strong: <strong />,
			tosLink: <Link slug="wpcom-tos" />,
			shareDetailsLink: <Link slug="jetpack-support-what-data-does-jetpack-sync" />,
		}
	);

const TermsOfServiceTextOnly = () =>
	createInterpolateElement(
		__(
			'By continuing you agree to our <tosLink>Terms of Service</tosLink> and to <shareDetailsLink>sync your site’s data</shareDetailsLink> with us. We’ll check if that email is linked to an existing WordPress.com account or create a new one instantly.',
			'jetpack-components'
		),
		{
			tosLink: <Link slug="wpcom-tos" />,
			shareDetailsLink: <Link slug="jetpack-support-what-data-does-jetpack-sync" />,
		}
	);

const Link: FC< { slug: string; children?: ReactNode } > = ( { slug, children } ) => (
	<ExternalLink className="terms-of-service__link" href={ getRedirectUrl( slug ) }>
		{ children }
	</ExternalLink>
);

export default TermsOfService;
