import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Button from '../button/index.tsx';
import styles from './style.module.scss';

/**
 * The Jetpack Action button.
 *
 * This component extends the regular `Button` component and adds a `isLoading` prop that will disable and display a spinner, giving the user the feedback that some action is happening. It also provides a generic error message.
 *
 * It is useful to async actions when the user has to wait the result of a request or process.
 *
 * @param {object} props - The properties.
 * @return {import('react').ReactNode} The `ActionButton` component.
 */
const ActionButton = props => {
	const {
		label,
		onClick,
		isLoading = false,
		loadingText,
		isDisabled,
		displayError = false,
		errorMessage = __( 'An error occurred. Please try again.', 'jetpack-components' ),
		variant = 'primary',
		isExternalLink = false,
		customClass,
	} = props;

	const loadingContent = loadingText || <Spinner />;

	return (
		<>
			{
				<Button
					className={ clsx( styles.button, 'jp-action-button--button', customClass ) }
					label={ label }
					onClick={ onClick }
					variant={ isExternalLink ? 'link' : variant }
					isExternalLink={ isExternalLink }
					disabled={ isLoading || isDisabled }
				>
					{ isLoading ? loadingContent : label }
				</Button>
			}

			{ displayError && (
				<p className={ clsx( styles.error, 'jp-action-button__error' ) }>{ errorMessage }</p>
			) }
		</>
	);
};

ActionButton.propTypes = {
	/** The button label. */
	label: PropTypes.string.isRequired,
	/** The callback to be called on click. */
	onClick: PropTypes.func,
	/** Will disable the button and display a spinner if set to true. */
	isLoading: PropTypes.bool,
	/** Will disable the button with no spinner. */
	isDisabled: PropTypes.bool,
	/** Displays an error message */
	displayError: PropTypes.bool,
	/** The error message string */
	errorMessage: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	/** The type/variant of button */
	variant: PropTypes.arrayOf( PropTypes.oneOf( [ 'primary', 'secondary', 'link' ] ) ),
	/** Will display the button as a link with an external icon. */
	isExternalLink: PropTypes.bool,
};

export default ActionButton;
