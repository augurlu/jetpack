import { Button, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import minimize from '../icons/minimize';
import type { TourStepRendererProps } from '../../../types';
import type { FunctionComponent } from 'react';

interface Props {
	onMinimize: TourStepRendererProps[ 'onMinimize' ];
	onDismiss: TourStepRendererProps[ 'onDismiss' ];
}

const WpcomTourKitStepCardOverlayControls: FunctionComponent< Props > = ( {
	onMinimize,
	onDismiss,
} ) => {
	return (
		<div className="wpcom-tour-kit-step-card-overlay-controls">
			<Flex>
				<Button
					label={ __( 'Minimize Tour', 'jetpack-mu-wpcom' ) }
					variant="primary"
					className="wpcom-tour-kit-step-card-overlay-controls__minimize-icon"
					icon={ minimize }
					iconSize={ 24 }
					onClick={ onMinimize }
				></Button>
				<Button
					label={ __( 'Close Tour', 'jetpack-mu-wpcom' ) }
					variant="primary"
					icon={ close }
					iconSize={ 24 }
					onClick={ onDismiss( 'close-btn' ) }
				></Button>
			</Flex>
		</div>
	);
};

export default WpcomTourKitStepCardOverlayControls;
