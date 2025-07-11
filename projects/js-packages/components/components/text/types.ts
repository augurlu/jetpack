import { VARIANTS_MAPPING } from './constants.ts';
import type { CSSProperties, ElementType, FC, ReactNode } from 'react';

export type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type TextProps = {
	variant?: keyof typeof VARIANTS_MAPPING;
	/** margin */
	m?: SpacingValue;
	/** margin-top */
	mt?: SpacingValue;
	/** margin-right */
	mr?: SpacingValue;
	/** margin-bottom */
	mb?: SpacingValue;
	/** margin-left */
	ml?: SpacingValue;
	/** margin left and right */
	mx?: SpacingValue;
	/** margin top and bottom */
	my?: SpacingValue;
	/** padding */
	p?: SpacingValue;
	/** padding-top */
	pt?: SpacingValue;
	/** padding-right */
	pr?: SpacingValue;
	/** padding-bottom */
	pb?: SpacingValue;
	/** padding-left */
	pl?: SpacingValue;
	/** padding left and right */
	px?: SpacingValue;
	/** padding top and bottom */
	py?: SpacingValue;
	/** HTML Class */
	className?: string;
	/** The text itself that will be rendered. */
	children: ReactNode;
	/** Force an specific tag (span, div) or use a custom component that will receive className and children */
	component?: FC< { [ prop: string ]: unknown } > | ElementType;
	style?: CSSProperties;
};

export type H3Props = TextProps & {
	/** Font weight: 'bold' (default) | 'regular'. */
	weight?: 'bold' | 'regular';
};

export type TitleProps = TextProps & {
	/** Heading size: 'medium' (default) | 'small'. */
	size?: 'medium' | 'small';
};
