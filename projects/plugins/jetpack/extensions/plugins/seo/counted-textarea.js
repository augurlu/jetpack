import { TextareaControl } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';

export const CountedTextArea = ( { suggestedLimit, value, label, ...inputProps } ) => {
	const help =
		! suggestedLimit || value.length <= suggestedLimit
			? sprintf(
					/* translators: Placeholder is a number of characters in a sentence. */
					_n( '%d character', '%d characters', value.length, 'jetpack' ),
					value.length
			  )
			: sprintf(
					/* translators: Placeholder is a number of characters in a sentence. */
					__(
						'It’s recommended to use less than %1$d characters in this field. (%2$d/%1$d)',
						'jetpack'
					),
					suggestedLimit,
					value.length
			  );

	return (
		<div className="jetpack-seo-message-box">
			<TextareaControl
				__nextHasNoMarginBottom={ true }
				label={ label }
				help={ help }
				value={ value }
				{ ...inputProps }
			/>
		</div>
	);
};
