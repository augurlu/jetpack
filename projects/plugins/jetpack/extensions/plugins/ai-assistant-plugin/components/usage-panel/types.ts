import { PlanType } from '@automattic/jetpack-shared-extension-utils';
import {
	PLACEMENT_DOCUMENT_SETTINGS,
	PLACEMENT_JETPACK_SIDEBAR,
} from '../ai-assistant-plugin-sidebar/constants';
import type { MouseEvent } from 'react';

export const USAGE_PANEL_PLACEMENT_BLOCK_SETTINGS_SIDEBAR = 'block_settings_sidebar' as const;

/*
 * Props for the usage panel component.
 */
export type UsagePanelProps = {
	placement?:
		| typeof PLACEMENT_JETPACK_SIDEBAR
		| typeof PLACEMENT_DOCUMENT_SETTINGS
		| typeof USAGE_PANEL_PLACEMENT_BLOCK_SETTINGS_SIDEBAR;
};

export type InternalUsagePanelProps = {
	isOverLimit: boolean;
	requestsCount: number;
	requestsLimit: number;
	nextStart: string;
	nextLimit: number;
	planType: PlanType;
	loading: boolean;
	canUpgrade: boolean;
	showContactUsCallToAction: boolean;
	contactUsURL: string;
	handleContactUsClick: ( event: MouseEvent< HTMLButtonElement > ) => void;
	checkoutUrl: string;
	handleUpgradeClick: ( event: MouseEvent< HTMLButtonElement > ) => void;
};
