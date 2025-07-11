import { Button, Spinner } from '@wordpress/components';
import PropTypes from 'prop-types';

const ProductDetailButton = ( {
	children,
	className,
	href,
	isLoading = false,
	onClick,
	isPrimary = true,
	disabled = false,
} ) => {
	return (
		<Button
			onClick={ onClick }
			className={ className }
			href={ href }
			variant={ isPrimary ? 'primary' : 'secondary' }
			disabled={ isLoading || disabled }
		>
			{ isLoading ? <Spinner /> : children }
		</Button>
	);
};

ProductDetailButton.propTypes = {
	className: PropTypes.string,
	isLoading: PropTypes.bool,
	isPrimary: PropTypes.bool,
	disabled: PropTypes.bool,
};

export default ProductDetailButton;
