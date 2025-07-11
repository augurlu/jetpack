import { FeaturedImage, PLACEMENT_MEDIA_SOURCE_DROPDOWN } from '@automattic/jetpack-ai-client';

/**
 * JetpackAIFeaturedImage component
 * @param {object}   props         - The component properties.
 * @param {Function} props.onClose - To handle the close.
 * @return {import('react').ReactElement} The `JetpackAIFeaturedImage` component.
 */
function JetpackAIFeaturedImage( { onClose = () => {} } ) {
	return <FeaturedImage placement={ PLACEMENT_MEDIA_SOURCE_DROPDOWN } onClose={ onClose } />;
}

export default JetpackAIFeaturedImage;
