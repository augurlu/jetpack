import {
	useAnalytics,
	PLAN_TYPE_UNLIMITED,
	usePlanType,
} from '@automattic/jetpack-shared-extension-utils';
import { Button } from '@wordpress/components';
import { useCallback, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import debugFactory from 'debug';
import './style.scss';
import useAiFeature from '../../hooks/use-ai-feature/index.ts';
import usePostContent from '../../hooks/use-post-content.ts';
import useSaveToMediaLibrary from '../../hooks/use-save-to-media-library.ts';
import AiImageModal from './components/ai-image-modal.tsx';
import useAiImage from './hooks/use-ai-image.ts';
import useSiteType from './hooks/use-site-type.ts';
import {
	IMAGE_GENERATION_MODEL_STABLE_DIFFUSION,
	IMAGE_GENERATION_MODEL_DALL_E_3,
	GENERAL_IMAGE_FEATURE_NAME,
} from './types.ts';
import type { ReactElement } from 'react';

/**
 * The type for the callback function that is called when the user selects an image.
 */
type SetImageCallbackProps = {
	id: number;
	url: string;
};

type GeneralPurposeImageProps = {
	placement: string;
	onClose?: () => void;
	onSetImage?: ( image: SetImageCallbackProps ) => void;
};

const debug = debugFactory( 'jetpack-ai:general-purpose-image' );

/**
 * GeneralPurposeImage component
 * @param {GeneralPurposeImageProps} props - The component properties.
 * @return {ReactElement} - rendered component.
 */
export default function GeneralPurposeImage( {
	placement,
	onClose = () => {},
	onSetImage = () => {},
}: GeneralPurposeImageProps ) {
	const [ isFeaturedImageModalVisible, setIsFeaturedImageModalVisible ] = useState( true );
	const siteType = useSiteType();
	const { getPostContent } = usePostContent();
	const { saveToMediaLibrary } = useSaveToMediaLibrary();
	const { tracks } = useAnalytics();
	const { recordEvent } = tracks;
	const [ prompt, setPrompt ] = useState( '' );

	// Get feature data
	const { requireUpgrade, requestsCount, requestsLimit, currentTier, costs } = useAiFeature();
	const planType = usePlanType( currentTier );
	const generalImageCost = costs?.[ GENERAL_IMAGE_FEATURE_NAME ]?.activeModel ?? 10;
	const generalImageActiveModel =
		generalImageCost === costs?.[ GENERAL_IMAGE_FEATURE_NAME ]?.stableDiffusion
			? IMAGE_GENERATION_MODEL_STABLE_DIFFUSION
			: IMAGE_GENERATION_MODEL_DALL_E_3;
	const isUnlimited = planType === PLAN_TYPE_UNLIMITED;
	const requestsBalance = requestsLimit - requestsCount;
	const notEnoughRequests = requestsBalance < generalImageCost;

	const {
		current,
		setCurrent,
		processImageGeneration,
		handlePreviousImage,
		handleNextImage,
		currentImage,
		currentPointer,
		images,
		pointer,
		imageStyles,
		guessStyle,
	} = useAiImage( {
		cost: generalImageCost,
		autoStart: false,
		type: 'general-image-generation',
		feature: GENERAL_IMAGE_FEATURE_NAME,
	} );

	const hasPrompt = prompt.length >= 3;
	const disableInput = notEnoughRequests || currentPointer?.generating || requireUpgrade;
	const disableAction = disableInput || ! hasPrompt;

	const handleModalClose = useCallback( () => {
		setIsFeaturedImageModalVisible( false );
		onClose?.();
	}, [ onClose ] );

	const handleGenerate = useCallback(
		async ( { userPrompt, style }: { userPrompt?: string; style?: string } ) => {
			debug( 'handleGenerate', userPrompt, style );

			// track the generate image event
			recordEvent( 'jetpack_ai_general_image_generation_generate_image', {
				placement,
				model: generalImageActiveModel,
				site_type: siteType,
				style,
			} );
			processImageGeneration( {
				userPrompt,
				postContent: getPostContent(),
				notEnoughRequests,
				style,
			} ).catch( error => {
				recordEvent( 'jetpack_ai_general_image_generation_error', {
					placement,
					error: error?.message,
					model: generalImageActiveModel,
					site_type: siteType,
					style,
				} );
			} );
		},
		[
			recordEvent,
			placement,
			generalImageActiveModel,
			siteType,
			processImageGeneration,
			getPostContent,
			notEnoughRequests,
		]
	);

	const handleRegenerate = useCallback(
		( { userPrompt, style }: { userPrompt?: string; style?: string } ) => {
			debug( 'handleRegenerate', userPrompt );
			// track the regenerate image event
			recordEvent( 'jetpack_ai_general_image_generation_generate_another_image', {
				placement,
				model: generalImageActiveModel,
				site_type: siteType,
				style,
			} );

			setCurrent( crrt => crrt + 1 );
			processImageGeneration( {
				userPrompt,
				postContent: getPostContent(),
				notEnoughRequests,
				style,
			} ).catch( error => {
				recordEvent( 'jetpack_ai_general_image_generation_error', {
					placement,
					error: error?.message,
					model: generalImageActiveModel,
					site_type: siteType,
				} );
			} );
		},
		[
			recordEvent,
			placement,
			generalImageActiveModel,
			siteType,
			processImageGeneration,
			getPostContent,
			notEnoughRequests,
			setCurrent,
		]
	);

	const handleTryAgain = useCallback(
		( { userPrompt, style }: { userPrompt?: string; style?: string } ) => {
			debug( 'handleTryAgain', userPrompt );
			// track the try again event
			recordEvent( 'jetpack_ai_general_image_generation_try_again', {
				placement,
				model: generalImageActiveModel,
				site_type: siteType,
				style,
			} );

			processImageGeneration( {
				userPrompt,
				postContent: getPostContent(),
				notEnoughRequests,
				style,
			} ).catch( error => {
				recordEvent( 'jetpack_ai_general_image_generation_error', {
					placement,
					error: error?.message,
					model: generalImageActiveModel,
					site_type: siteType,
				} );
			} );
		},
		[
			recordEvent,
			placement,
			generalImageActiveModel,
			siteType,
			processImageGeneration,
			getPostContent,
			notEnoughRequests,
		]
	);

	const handleAccept = useCallback( () => {
		// track the accept/use image event
		recordEvent( 'jetpack_ai_general_image_generation_use_image', {
			placement,
			model: generalImageActiveModel,
			site_type: siteType,
		} );

		const setImage = image => {
			onSetImage?.( { id: image.id, url: image.url } );
			handleModalClose();
		};

		// If the image is already in the media library, use it directly, if it failed for some reason
		// save it to the media library and then use it.
		if ( currentImage?.libraryId ) {
			setImage( {
				id: currentImage?.libraryId,
				url: currentImage?.libraryUrl,
			} );
		} else {
			saveToMediaLibrary( currentImage?.image ).then( image => {
				setImage( image );
			} );
		}
	}, [
		recordEvent,
		placement,
		generalImageActiveModel,
		siteType,
		currentImage?.libraryId,
		currentImage?.libraryUrl,
		currentImage?.image,
		onSetImage,
		handleModalClose,
		saveToMediaLibrary,
	] );

	const generateAgainText = __( 'Generate another image', 'jetpack-ai-client' );
	const generateText = __( 'Generate', 'jetpack-ai-client' );

	const upgradeDescription = notEnoughRequests
		? sprintf(
				// Translators: %d is the cost of generating a featured image.
				__(
					"Image generation costs %d requests per image. You don't have enough requests to generate another image.",
					'jetpack-ai-client'
				),
				generalImageCost
		  )
		: null;

	const acceptButton = (
		<Button
			onClick={ handleAccept }
			variant="primary"
			disabled={ ! currentImage?.image || currentImage?.generating }
		>
			{ __( 'Insert image', 'jetpack-ai-client' ) }
		</Button>
	);

	return (
		<AiImageModal
			images={ images }
			currentIndex={ current }
			title={ __( 'Generate an image with AI', 'jetpack-ai-client' ) }
			cost={ generalImageCost }
			open={ isFeaturedImageModalVisible }
			placement={ placement }
			onClose={ handleModalClose }
			onTryAgain={ handleTryAgain }
			onGenerate={ pointer?.current > 0 ? handleRegenerate : handleGenerate }
			generating={ currentPointer?.generating }
			notEnoughRequests={ notEnoughRequests }
			requireUpgrade={ requireUpgrade }
			upgradeDescription={ upgradeDescription }
			currentLimit={ requestsLimit }
			currentUsage={ requestsCount }
			isUnlimited={ isUnlimited }
			hasError={ Boolean( currentPointer?.error ) }
			handlePreviousImage={ handlePreviousImage }
			handleNextImage={ handleNextImage }
			acceptButton={ acceptButton }
			generateButtonLabel={ pointer?.current > 0 ? generateAgainText : generateText }
			instructionsPlaceholder={ __(
				"Describe the image you'd like to create and select a style.",
				'jetpack-ai-client'
			) }
			imageStyles={ imageStyles }
			onGuessStyle={ guessStyle }
			prompt={ prompt }
			setPrompt={ setPrompt }
			inputDisabled={ disableInput }
			actionDisabled={ disableAction }
		/>
	);
}
