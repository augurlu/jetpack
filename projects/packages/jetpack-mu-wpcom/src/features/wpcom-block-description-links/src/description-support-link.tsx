import { localizeUrl } from '@automattic/i18n-utils';
import { useAnalytics } from '@automattic/jetpack-shared-extension-utils';
import { WpcomSupportLink } from '@automattic/jetpack-shared-extension-utils/components';
import { __ } from '@wordpress/i18n';
import { useState, JSXElementConstructor, ReactElement } from 'react';
import type { JSX } from 'react';

interface Props {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	children: string | ReactElement< string | JSXElementConstructor< any > >;
	title: string;
	url: string;
	postId: number;
}

/**
 * Create the block description link.
 *
 * @param {Props}                                                      props          - The component props.
 * @param {string | ReactElement<string | JSXElementConstructor<any>>} props.children - The component children.
 * @param {string}                                                     props.title    - Block title.
 * @param {string}                                                     props.url      - Support link URL.
 * @param {number}                                                     props.postId   - Post ID.
 * @return {JSX.Element} The component to render.
 */
export default function DescriptionSupportLink( {
	children,
	title,
	url,
	postId,
}: Props ): JSX.Element {
	// This was cooked up to only apply the link in the BlockEditor sidebar.
	// Since there was no identifier in the environment to differentiate.
	const [ ref, setRef ] = useState< Element | null >();
	const { tracks } = useAnalytics();

	if ( ref && ! ref?.closest( '.block-editor-block-inspector' ) ) {
		return children as JSX.Element;
	}

	return (
		<>
			{ children }
			<br />
			<WpcomSupportLink
				supportLink={ localizeUrl( url ) }
				supportPostId={ postId }
				onClick={ () => {
					tracks.recordEvent( 'jetpack_mu_wpcom_block_description_support_link_click', {
						block: title,
						support_link: url,
					} );
				} }
				style={ { display: 'block', marginTop: 10, maxWidth: 'fit-content' } }
				ref={ reference => ref !== reference && setRef( reference ) }
			>
				{ __( 'Block guide', 'jetpack-mu-wpcom' ) }
			</WpcomSupportLink>
		</>
	);
}
