/**
 * External dependencies
 */
import { createExPlatClient } from '@automattic/explat-client';
import createExPlatClientReactHelpers from '@automattic/explat-client-react-helpers';
import debugFactory from 'debug';
/**
 * Internal dependencies
 */
import { getAnonId, initializeAnonId } from './anon';
import {
	fetchExperimentAssignmentAnonymously,
	fetchExperimentAssignmentWithAuth,
} from './assignment';
import { logError } from './error';
import { isDevelopmentMode } from './utils';

const debug = debugFactory( 'jetpack-explat:client' );

export { createExPlatClient };

export const initializeExPlat = async (): Promise< string | null | void > => {
	debug( 'initializing explat' );
	return initializeAnonId().catch( e => logError( { message: e.message } ) );
};

initializeExPlat();

const exPlatClient = createExPlatClient( {
	fetchExperimentAssignment: fetchExperimentAssignmentAnonymously,
	getAnonId,
	logError,
	isDevelopmentMode,
} );

export const { loadExperimentAssignment, dangerouslyGetExperimentAssignment } = exPlatClient;

export const { useExperiment, Experiment, ProvideExperimentData } =
	createExPlatClientReactHelpers( exPlatClient );

const exPlatClientWithAuth = createExPlatClient( {
	fetchExperimentAssignment: fetchExperimentAssignmentWithAuth,
	getAnonId,
	logError,
	isDevelopmentMode,
} );

export const {
	loadExperimentAssignment: loadExperimentAssignmentWithAuth,
	dangerouslyGetExperimentAssignment: dangerouslyGetExperimentAssignmentWithAuth,
} = exPlatClientWithAuth;

export const {
	useExperiment: useExperimentWithAuth,
	Experiment: ExperimentWithAuth,
	ProvideExperimentData: ProvideExperimentDataWithAuth,
} = createExPlatClientReactHelpers( exPlatClientWithAuth );
