import { Modal } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
import clsx from 'clsx';
import type { FC, ReactElement } from 'react';
import './style.scss';

interface Props {
	isOpen: boolean;
	className?: string;
	title: string;
	description: string;
	imageSrc: string;
	actionButtons: ReactElement;
	onRequestClose: () => void;
	onOpen?: () => void;
}

const NuxModal: FC< Props > = ( {
	isOpen,
	className,
	title,
	description,
	imageSrc,
	actionButtons,
	onRequestClose,
	onOpen,
} ) => {
	const prevIsOpen = useRef< boolean | null >( null );

	useEffect( () => {
		if ( ! prevIsOpen.current && isOpen ) {
			onOpen?.();
		}

		prevIsOpen.current = isOpen;
	}, [ prevIsOpen, isOpen, onOpen ] );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className={ clsx( 'wpcom-block-editor-nux-modal', className ) }
			title=""
			onRequestClose={ onRequestClose }
		>
			<div className="wpcom-block-editor-nux-modal__image-container">
				<img src={ imageSrc } alt={ title } />
			</div>
			<h1 className="wpcom-block-editor-nux-modal__title">{ title }</h1>
			<p className="wpcom-block-editor-nux-modal__description">{ description }</p>
			<div className="wpcom-block-editor-nux-modal__buttons">{ actionButtons }</div>
		</Modal>
	);
};

export default NuxModal;
