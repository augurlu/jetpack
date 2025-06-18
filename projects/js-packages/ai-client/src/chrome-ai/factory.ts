import debugFactory from 'debug';
import { PROMPT_TYPE_CHANGE_LANGUAGE, PROMPT_TYPE_SUMMARIZE } from '../constants.ts';
import { PromptProp, PromptItemProps } from '../types.ts';
import { isChromeAIAvailable } from './get-availability.ts';
import ChromeAISuggestionsEventSource from './suggestions.ts';

const debug = debugFactory( 'ai-client:chrome-ai-factory' );

interface PromptContext {
	type?: string;
	content?: string;
	language?: string;
	tone?: string;
	words?: number;
}

/**
 * This will return an instance of ChromeAISuggestionsEventSource or false.
 *
 * @param promptArg - The messages array of the prompt.
 * @return ChromeAISuggestionsEventSource | bool
 */
export default async function ChromeAIFactory( promptArg: PromptProp ) {
	if ( ! isChromeAIAvailable() ) {
		debug( 'Chrome AI is not available' );
		return false;
	}

	const context = {
		content: '',
		language: '',
	};

	let promptType = '';
	let tone = null;
	let wordCount = null;

	debug( 'promptArg', promptArg );
	if ( Array.isArray( promptArg ) ) {
		for ( let i = 0; i < promptArg.length; i++ ) {
			const prompt: PromptItemProps = promptArg[ i ];
			if ( prompt.content ) {
				context.content = prompt.content;
			}

			if ( ! ( 'context' in prompt ) ) {
				continue;
			}

			const promptContext: PromptContext = prompt.context;

			if ( promptContext.type ) {
				promptType = promptContext.type;
			}

			if ( promptContext.language ) {
				context.language = promptContext.language;
			}

			if ( promptContext.content ) {
				context.content = promptContext.content;
			}

			if ( promptContext.tone ) {
				tone = promptContext.tone;
			}

			if ( promptContext.words ) {
				wordCount = promptContext.words;
			}
		}
	}

	debug( 'promptType', promptType );
	// Early return if the prompt type is not supported.
	if (
		! promptType.startsWith( 'ai-assistant-change-language' ) &&
		! promptType.startsWith( 'ai-content-lens' )
	) {
		debug( 'promptType is not supported' );
		return false;
	}

	// If the languageDetector is not available, we can't use the translation or summary features—it's safer to fall back
	// to the default AI model than to risk an unexpected error.
	if (
		! ( 'LanguageDetector' in self ) ||
		! self.LanguageDetector.create ||
		! self.LanguageDetector.availability
	) {
		debug( 'LanguageDetector is not available' );
		return false;
	}

	const languageDetectorAvailability = await self.LanguageDetector.availability();
	if ( languageDetectorAvailability === 'unavailable' ) {
		debug( 'LanguageDetector is unavailable' );
		return false;
	}

	const detector = await self.LanguageDetector.create();
	if ( languageDetectorAvailability !== 'available' ) {
		debug( 'awaiting detector ready' );
		await detector.ready;
	}

	if ( promptType.startsWith( 'ai-assistant-change-language' ) ) {
		const [ language ] = context.language.split( ' ' );

		if (
			! ( 'Translator' in self ) ||
			! self.Translator.create ||
			! self.Translator.availability
		) {
			debug( 'Translator is not available' );
			return false;
		}

		const languageOpts = {
			sourceLanguage: 'en',
			targetLanguage: language,
		};

		const confidences = await detector.detect( context.content );

		for ( const confidence of confidences ) {
			// 75% confidence is just a value that was picked. Generally
			// 80% of higher is pretty safe, but the source language is
			// required for the translator to work at all, which is also
			// why en is the default language.
			if ( confidence.confidence > 0.75 ) {
				languageOpts.sourceLanguage = confidence.detectedLanguage;
				break;
			}
		}

		debug( 'languageOpts', languageOpts );
		const translationAvailability = await self.Translator.availability( languageOpts );

		debug( 'translationAvailability', translationAvailability );
		if ( translationAvailability === 'unavailable' ) {
			debug( 'Translator is unavailable' );
			return false;
		}

		const chromeAI = new ChromeAISuggestionsEventSource( {
			content: context.content,
			promptType: PROMPT_TYPE_CHANGE_LANGUAGE,
			options: languageOpts,
		} );

		return chromeAI;
	}

	if ( promptType.startsWith( 'ai-content-lens' ) ) {
		if ( ! ( 'Summarizer' in self ) ) {
			debug( 'Summarizer is not available' );
			return false;
		}

		if ( context.language && context.language !== 'en (English)' ) {
			debug( 'Summary is not English' );
			return false;
		}

		debug( 'awaiting detector detect' );
		const confidences = await detector.detect( context.content );

		// if it doesn't look like the content is in English, we can't use the summary feature
		for ( const confidence of confidences ) {
			// 75% confidence is just a value that was picked. Generally
			// 80% of higher is pretty safe, but the source language is
			// required for the translator to work at all, which is also
			// why en is the default language.
			if ( confidence.confidence > 0.75 && confidence.detectedLanguage !== 'en' ) {
				debug( 'Confidence for non-English content' );
				return false;
			}
		}

		const summaryOpts = {
			tone: tone,
			wordCount: wordCount,
		};

		debug( 'summaryOpts', summaryOpts );
		return new ChromeAISuggestionsEventSource( {
			content: context.content,
			promptType: PROMPT_TYPE_SUMMARIZE,
			options: summaryOpts,
		} );
	}

	return false;
}
