import {
	getScoreLetter,
	didScoresChange,
	getScoreMovementPercentage,
} from '@automattic/jetpack-boost-score-api';
import { BoostScoreBar, Button } from '@automattic/jetpack-components';
import { sprintf, __ } from '@wordpress/i18n';
import ContextTooltip from './context-tooltip/context-tooltip';
import RefreshIcon from '$svg/refresh';
import PerformanceHistory from '$features/performance-history/performance-history';
import ErrorNotice from '$features/error-notice/error-notice';
import clsx from 'clsx';
import { useEffect, useMemo, useCallback } from 'react';
import { useDebouncedRefreshScore, useSpeedScores } from './lib/hooks';

import styles from './speed-score.module.scss';
import { useModulesState } from '$features/module/lib/stores';
import { useCriticalCssState } from '$features/critical-css/lib/stores/critical-css-state';
import { useLocalCriticalCssGeneratorStatus } from '$features/critical-css/critical-css-context/critical-css-context-provider';
import { queryClient } from '@automattic/jetpack-react-data-sync-client';
import ErrorBoundary from '$features/error-boundary/error-boundary';
import PopOut from './pop-out/pop-out';
import { useCornerstonePages } from '$features/cornerstone-pages/lib/stores/cornerstone-pages';
import { recordBoostEvent } from '$lib/utils/analytics';
import { useLcpState } from '$features/lcp/lib/stores/lcp-state';

const SpeedScore = () => {
	const [ cornerstonePages ] = useCornerstonePages();
	const { site } = Jetpack_Boost;
	const pageSpeedUrl = cornerstonePages[ 0 ];
	const [ { status, error, scores }, loadScore ] = useSpeedScores( pageSpeedUrl );
	const scoreLetter = scores ? getScoreLetter( scores.current.mobile, scores.current.desktop ) : '';
	const showPrevScores = scores && didScoresChange( scores ) && ! scores.isStale;
	const [ { data } ] = useModulesState();
	const [ cssState ] = useCriticalCssState();
	const { isGenerating: criticalCssIsGenerating } = useLocalCriticalCssGeneratorStatus();
	const [ { data: lcpState } ] = useLcpState();

	// Construct an array of current module states
	const moduleStates = useMemo(
		() =>
			Object.entries( data || {} ).reduce( ( acc: boolean[], [ key, value ] ) => {
				if ( key !== 'image_guide' && key !== 'image_size_analysis' ) {
					acc.push( value.active );
				}
				return acc;
			}, [] ),
		[ data ]
	);

	const showScoreChangePopOut =
		status === 'loaded' && ! scores.isStale && getScoreMovementPercentage( scores );

	// Mark performance history data as stale when speed scores are loaded.
	useEffect( () => {
		if ( site.online && status === 'loaded' ) {
			queryClient.invalidateQueries( { queryKey: [ 'performance_history' ] } );
		}
	}, [ site.online, status ] );

	const handleClickRefresh = () => {
		recordBoostEvent( 'speed_score_refresh_clicked', {} );
		loadScore( true );
	};

	// Ask the API to recompute the score.
	const refreshScore = useCallback( async () => {
		if ( site.online ) {
			loadScore( true );
		}
	}, [ loadScore, site.online ] );

	// Load speed scores on mount.
	useEffect( () => {
		if ( site.online ) {
			loadScore();
		}
	}, [ loadScore, site.online ] );

	// Refresh the score when something that can affect the score changes.
	useDebouncedRefreshScore(
		{
			moduleStates,
			pendingStates: {
				criticalCss: {
					isPending: cssState.status === 'pending' || criticalCssIsGenerating,
					timestamp: cssState.updated || 0,
				},
				lcp: {
					isPending: lcpState?.status === 'pending',
					timestamp: lcpState?.updated || 0,
				},
			},
		},
		refreshScore
	);

	// translators: %s is a letter grade, e.g. "A" or "B"
	let heading = sprintf( __( 'Overall Score: %s', 'jetpack-boost' ), scoreLetter );
	if ( status === 'loading' ) {
		heading = __( 'Loading…', 'jetpack-boost' );
	} else if ( status === 'error' ) {
		heading = __( 'Whoops, something went wrong', 'jetpack-boost' );
	}

	return (
		<>
			<div className="jb-container">
				<div id="jp-admin-notices" className="jetpack-boost-jitm-card" />
				<div
					data-testid="speed-scores"
					className={ clsx( styles[ 'speed-scores' ], { loading: status === 'loading' } ) }
				>
					{ site.online ? (
						<div className={ styles.top } data-testid="speed-scores-top">
							<h2>{ heading }</h2>
							{ status === 'loaded' && <ContextTooltip /> }
							<Button
								variant="link"
								size="small"
								weight="regular"
								className={ styles[ 'action-button' ] }
								onClick={ handleClickRefresh }
								disabled={ status === 'loading' }
								icon={ <RefreshIcon /> }
							>
								{ __( 'Refresh', 'jetpack-boost' ) }
							</Button>
						</div>
					) : (
						<div className={ styles.offline } data-testid="speed-scores-offline">
							<h2>{ __( 'Website is not publicly available', 'jetpack-boost' ) }</h2>
							<p>
								{ __(
									'Performance score and some other Boost features cannot work because the Boost Cloud cannot reach your website. To fix this, you need to make your website publicly available.',
									'jetpack-boost'
								) }
							</p>
						</div>
					) }

					{ status === 'error' && (
						<ErrorNotice
							title={ __( 'Failed to load Speed Scores', 'jetpack-boost' ) }
							error={ error }
							suggestion={ __( '<action>Try again</action>', 'jetpack-boost' ) }
							vars={ {
								action: <Button size="small" variant="link" onClick={ () => loadScore( true ) } />,
							} }
						/>
					) }

					<BoostScoreBar
						prevScore={ scores.noBoost?.mobile }
						score={ scores.current.mobile }
						active={ site.online }
						isLoading={ status === 'loading' }
						showPrevScores={ showPrevScores }
						scoreBarType="mobile"
						noBoostScoreTooltip={ __( 'Your mobile score without Boost', 'jetpack-boost' ) }
					/>

					<BoostScoreBar
						prevScore={ scores.noBoost?.desktop }
						score={ scores.current.desktop }
						active={ site.online }
						isLoading={ status === 'loading' }
						showPrevScores={ showPrevScores }
						scoreBarType="desktop"
						noBoostScoreTooltip={ __( 'Your desktop score without Boost', 'jetpack-boost' ) }
					/>
				</div>
				{ site.online && <PerformanceHistory /> }
			</div>

			<PopOut scoreChange={ showScoreChangePopOut } />
		</>
	);
};

export default () => {
	return (
		<ErrorBoundary
			fallback={ _error => (
				<div className="jb-container">
					<p>{ __( 'Failed to load Speed Score.', 'jetpack-boost' ) }</p>
				</div>
			) }
		>
			<SpeedScore />
		</ErrorBoundary>
	);
};
