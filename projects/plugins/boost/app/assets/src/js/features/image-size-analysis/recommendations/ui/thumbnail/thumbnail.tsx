import type { CSSProperties, FC } from 'react';
import styles from './thumbnail.module.scss';

interface ThumbnailProps {
	url?: string;
	title?: string;
	width: number;
	height: number;
}

const Thumbnail: FC< ThumbnailProps > = ( { url, title, width, height } ) => {
	const thumbnailStyle = {
		'--thumbnail-size': `${ width }px`,
	} as CSSProperties;

	return url && title ? (
		<img src={ url } alt={ title } width={ width } height={ height } className={ styles.image } />
	) : (
		<div className={ styles.placeholder } style={ thumbnailStyle } />
	);
};

export default Thumbnail;
