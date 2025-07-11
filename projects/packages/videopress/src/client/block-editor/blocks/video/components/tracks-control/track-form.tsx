/**
 * External dependencies
 */
import { MediaUploadCheck, store as blockEditorStore } from '@wordpress/block-editor';
import {
	FormFileUpload,
	Button,
	TextControl,
	SelectControl,
	MenuGroup,
	ToggleControl,
	Notice,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import debugFactory from 'debug';
/**
 * Types
 */
import type { TrackFormProps } from './types';
import type { UploadTrackDataProps } from '../../../../../lib/video-tracks/types';
import type { ReactElement } from 'react';

const DEFAULT_KIND = 'subtitles';

const ACCEPTED_FILE_TYPES = '.vtt,text/vtt';

const KIND_OPTIONS = [
	{ label: __( 'Subtitles', 'jetpack-videopress-pkg' ), value: 'subtitles' },
	{ label: __( 'Captions', 'jetpack-videopress-pkg' ), value: 'captions' },
	{ label: __( 'Descriptions', 'jetpack-videopress-pkg' ), value: 'descriptions' },
	{ label: __( 'Chapters', 'jetpack-videopress-pkg' ), value: 'chapters' },
	{ label: __( 'Metadata', 'jetpack-videopress-pkg' ), value: 'metadata' },
];

const debug = debugFactory( 'videopress:tracks:track-form' );

/**
 * Track From component
 *
 * @param {TrackFormProps} props - Component props.
 * @return {ReactElement}   Track form react component.
 */
export default function TrackForm( {
	onCancel,
	onSave,
	tracks,
	errorMessage,
}: TrackFormProps ): ReactElement {
	// eslint-disable-next-line @wordpress/no-unused-vars-before-return -- @todo Start extending jetpack-js-tools/eslintrc/react in eslintrc, then we can remove this disable comment.
	const [ isSavingTrack, setIsSavingTrack ] = useState( false );
	// eslint-disable-next-line @wordpress/no-unused-vars-before-return -- @todo Start extending jetpack-js-tools/eslintrc/react in eslintrc, then we can remove this disable comment.
	const [ trackExists, setTrackExists ] = useState( false );
	// eslint-disable-next-line @wordpress/no-unused-vars-before-return -- @todo Start extending jetpack-js-tools/eslintrc/react in eslintrc, then we can remove this disable comment.
	const [ error, setError ] = useState( '' );
	// eslint-disable-next-line @wordpress/no-unused-vars-before-return -- @todo Start extending jetpack-js-tools/eslintrc/react in eslintrc, then we can remove this disable comment.
	const [ replaceTrack, setReplaceTrack ] = useState( false );
	const [ track, setTrack ] = useState< UploadTrackDataProps >( {
		kind: DEFAULT_KIND,
		srcLang: '',
		label: '',
		tmpFile: null,
	} );

	debug( 'props.errorMessage', errorMessage );

	const updateTrack = useCallback(
		( key: 'kind' | 'srcLang' | 'label' | 'tmpFile', value: string | File ) => {
			debug( 'updateTrack', key, value );
			// changing the file is the only change that can override the errorMessage coming from the control
			if ( key === 'tmpFile' ) {
				setError( '' );
			}
			setTrack( prev => ( { ...prev, [ key ]: value } ) );
		},
		[ track ]
	);

	useEffect( () => {
		const exists = tracks.some( t => t.srcLang === track.srcLang && t.kind === track.kind );
		setTrackExists( exists );
	}, [ track, tracks ] );

	useEffect( () => {
		setError( errorMessage );
		errorMessage && setIsSavingTrack( false );
	}, [ errorMessage ] );

	const fileName = track.tmpFile?.name;

	const mediaUpload = useSelect( select => {
		return select( blockEditorStore ).getSettings().mediaUpload;
	}, [] );

	// eslint-disable-next-line @wordpress/no-unused-vars-before-return -- @todo Start extending jetpack-js-tools/eslintrc/react in eslintrc, then we can remove this disable comment.
	const onSaveHandler = useCallback( () => {
		setIsSavingTrack( true );
		setError( '' );
		onSave( track );
	}, [ track ] );

	// eslint-disable-next-line @wordpress/no-unused-vars-before-return -- @todo Start extending jetpack-js-tools/eslintrc/react in eslintrc, then we can remove this disable comment.
	const setSourceLanguage = useCallback(
		( newSrcLang: string ) => {
			updateTrack( 'srcLang', newSrcLang );
			if ( newSrcLang?.length > 5 ) {
				return setError(
					__( 'Language must be five characters or less.', 'jetpack-videopress-pkg' )
				);
			}

			// let the error message from the control take over
			setError( errorMessage || '' );
		},
		[ errorMessage ]
	);

	if ( ! mediaUpload ) {
		return null;
	}

	const help = sprintf(
		/* translators: %s: The allowed file types to be uploaded as a video text track." */
		__( 'Add a new text track to the video. Allowed formats: %s', 'jetpack-videopress-pkg' ),
		ACCEPTED_FILE_TYPES
	);
	debug( 'error', error );

	return (
		<MenuGroup
			className="video-tracks-control__track-form"
			label={ __( 'Upload track', 'jetpack-videopress-pkg' ) }
		>
			<div className="video-tracks-control__track-form-container">
				<div className="video-tracks-control__track-form-upload-file">
					<div className="video-tracks-control__track-form-upload-file-label">
						<span>{ __( 'File', 'jetpack-videopress-pkg' ) }:</span>
						{ fileName && <strong>{ fileName }</strong> }
						<MediaUploadCheck>
							<FormFileUpload
								onChange={ event => {
									const files = event.target.files;
									if ( ! files?.length ) {
										return;
									}

									updateTrack( 'tmpFile', files[ 0 ] );
								} }
								accept={ ACCEPTED_FILE_TYPES }
								render={ ( { openFileDialog } ) => {
									return (
										<Button
											variant="link"
											onClick={ () => {
												openFileDialog();
											} }
										>
											{ __( 'Select track', 'jetpack-videopress-pkg' ) }
										</Button>
									);
								} }
								__next40pxDefaultSize={ true }
							/>
						</MediaUploadCheck>
					</div>
					<div className="video-tracks-control__track-form-upload-file-help">{ help }</div>
				</div>
				<div className="video-tracks-control__track-form-label-language">
					<TextControl
						onChange={ newLabel => updateTrack( 'label', newLabel ) }
						label={ __( 'Label', 'jetpack-videopress-pkg' ) }
						value={ track.label }
						help={ __( 'Title of track', 'jetpack-videopress-pkg' ) }
						disabled={ isSavingTrack }
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>
					<TextControl
						className="video-tracks-control__track-form-language-tag"
						label={ __( 'Source language', 'jetpack-videopress-pkg' ) }
						value={ track.srcLang }
						onChange={ setSourceLanguage }
						help={ __( 'Language (en, fr, etc.)', 'jetpack-videopress-pkg' ) }
						disabled={ isSavingTrack }
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>
				</div>
				<SelectControl
					options={ KIND_OPTIONS }
					value={ track.kind }
					label={
						/* translators: %s: The kind of video text track e.g: "Subtitles, Captions" */
						__( 'Kind', 'jetpack-videopress-pkg' )
					}
					onChange={ newKind => updateTrack( 'kind', newKind ) }
					disabled={ isSavingTrack }
					__nextHasNoMarginBottom={ true }
					__next40pxDefaultSize={ true }
				/>

				{ error && (
					<Notice status="error" isDismissible={ false }>
						{ error }
					</Notice>
				) }

				<div
					className={ `video-tracks-control__track-form-buttons-container ${
						trackExists ? ' track-exists' : ''
					}` }
				>
					{ trackExists && (
						<ToggleControl
							className="video-tracks-control__track-form-toggle"
							label={ __( 'Track exists. Replace?', 'jetpack-videopress-pkg' ) }
							checked={ replaceTrack }
							onChange={ setReplaceTrack }
							__nextHasNoMarginBottom={ true }
						/>
					) }
					<Button
						isBusy={ isSavingTrack }
						variant="secondary"
						disabled={
							! track.tmpFile || isSavingTrack || ( trackExists && ! replaceTrack ) || !! error
						}
						onClick={ onSaveHandler }
					>
						{ __( 'Save', 'jetpack-videopress-pkg' ) }
					</Button>

					<Button variant="link" onClick={ onCancel }>
						{ __( 'Cancel', 'jetpack-videopress-pkg' ) }
					</Button>
				</div>
			</div>
		</MenuGroup>
	);
}
