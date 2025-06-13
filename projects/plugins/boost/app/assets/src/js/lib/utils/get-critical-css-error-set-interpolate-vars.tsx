import { ExternalLink } from '@wordpress/components';
import { useNavigate } from 'react-router';
import actionLinkInterpolateVar from '$lib/utils/action-link-interpolate-var';
import { InterpolateVars } from '$lib/utils/interplate-vars-types';
import supportLinkInterpolateVar from '$lib/utils/support-link-interpolate-var';
import { useRegenerateCriticalCssAction } from '$features/critical-css/lib/stores/critical-css-state';
import { suggestion } from '$features/critical-css/lib/describe-critical-css-recommendations';
import { ErrorSet } from '$features/critical-css/lib/critical-css-errors';
import { recordBoostEvent } from './analytics';

function getCriticalCssErrorSetInterpolateVars( errorSet: ErrorSet ) {
	const regenerateAction = useRegenerateCriticalCssAction();
	const navigate = useNavigate();

	function retry() {
		regenerateAction.mutate();
		navigate( '/' );
	}

	const interpolateVars: InterpolateVars = {
		...actionLinkInterpolateVar( () => {
			recordBoostEvent( 'critical_css_retry', {
				error_type: errorSet.type,
			} );

			retry();
		}, 'retry' ),
		...supportLinkInterpolateVar(),
		b: <b />,
		strong: <strong />,
	};

	if ( 'listLink' in suggestion( errorSet ) ) {
		interpolateVars.link = <ExternalLink href={ suggestion( errorSet ).listLink } />;
	}

	return interpolateVars;
}

export default getCriticalCssErrorSetInterpolateVars;
