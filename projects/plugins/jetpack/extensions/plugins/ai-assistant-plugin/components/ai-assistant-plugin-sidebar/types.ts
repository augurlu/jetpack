import { PLACEMENT_DOCUMENT_SETTINGS, PLACEMENT_JETPACK_SIDEBAR } from './constants';
import type { ReactNode } from 'react';

export type JetpackSettingsContentProps = {
	placement: typeof PLACEMENT_JETPACK_SIDEBAR | typeof PLACEMENT_DOCUMENT_SETTINGS;
	requireUpgrade: boolean;
	upgradeType: string;
	showUsagePanel: boolean;
	showFairUsageNotice: boolean;
};

export type CoreSelect = {
	getPostType: ( postTypeName: string ) => {
		viewable: boolean;
	};
};

export interface PanelProps {
	title: string;
	icon?: JSX.Element;
	initialOpen?: boolean;
	name?: string;
	children: ReactNode;
}
