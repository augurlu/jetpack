import { Gridicon } from '@automattic/jetpack-components';
import { formatNumber } from '@automattic/number-formatters';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import './record-count.scss';

const DOCS_URL = 'https://jetpack.com/support/search/jetpack-search-record-meter/';

/**
 * Returns record count component showing current records indexed and max records available for tier.
 *
 * @param {object} props - current record count and plan record limit.
 * @return {import('react').Component} record count component.
 */
export function RecordCount( props ) {
	if ( ! props.recordCount ) {
		return null;
	}

	const recordCount =
		typeof props.recordCount === 'number' ? formatNumber( props.recordCount ) : props.recordCount;

	const recordLimit =
		typeof props.tierMaximumRecords === 'number'
			? formatNumber( props.tierMaximumRecords )
			: props.tierMaximumRecords;
	let message;

	if ( recordLimit ) {
		message = createInterpolateElement(
			sprintf(
				// translators: %1$s: site's current record count, %2$s: record limit of the current plan
				__(
					'<s>%1$s</s> records indexed out of the <s>%2$s</s> allotted for your current plan',
					'jetpack-search-pkg'
				),
				recordCount,
				recordLimit
			),
			{
				s: <strong />,
			}
		);
	} else {
		message = createInterpolateElement(
			sprintf(
				// translators: %1$s: site's current record count, %2$s: record limit of the current plan
				__( '<s>%1$s</s> records indexed', 'jetpack-search-pkg' ),
				recordCount
			),
			{
				s: <strong />,
			}
		);
	}

	return (
		<div data-testid="record-count" className="jp-search-record-count">
			<p className="jp-search-record-count__message">
				{ message }
				{ DOCS_URL && (
					<a
						href={ DOCS_URL }
						className="jp-search-record-count__info"
						title={ __( 'More info', 'jetpack-search-pkg' ) }
					>
						<Gridicon
							className="jp-search-record-count__info-icon"
							icon={ 'info-outline' }
							size={ 18 }
						/>
						<span className="screen-reader-text">{ __( 'More info', 'jetpack-search-pkg' ) }</span>
					</a>
				) }
			</p>
		</div>
	);
}
