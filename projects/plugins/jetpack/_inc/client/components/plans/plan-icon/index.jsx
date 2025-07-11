import PropTypes from 'prop-types';
import { Component } from 'react';
import { imagePath } from 'constants/urls';
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_STARTER,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_TRIAL,
	PLAN_MIGRATION_TRIAL,
	PLAN_100_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_WOOEXPRESS_ESSENTIALS,
	PLAN_WOOEXPRESS_ESSENTIALS_MONTHLY,
	PLAN_WOOEXPRESS_PERFORMANCE,
	PLAN_WOOEXPRESS_PERFORMANCE_MONTHLY,
	PLAN_WOOEXPRESS_TRIAL,
	PLAN_PRO,
	PLAN_VIP,
	PLAN_WPCOM_SEARCH,
	PLAN_WPCOM_SEARCH_MONTHLY,
	PLAN_JETPACK_BACKUP_T0_YEARLY,
	PLAN_JETPACK_BACKUP_T0_MONTHLY,
	PLAN_JETPACK_BACKUP_T1_BI_YEARLY,
	PLAN_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_BACKUP_T1_MONTHLY,
	PLAN_JETPACK_BACKUP_T2_YEARLY,
	PLAN_JETPACK_BACKUP_T2_MONTHLY,
	PLAN_JETPACK_SCAN_BI_YEARLY,
	PLAN_JETPACK_SCAN,
	PLAN_JETPACK_SCAN_MONTHLY,
	PLAN_JETPACK_ANTI_SPAM_BI_YEARLY,
	PLAN_JETPACK_ANTI_SPAM,
	PLAN_JETPACK_ANTI_SPAM_MONTHLY,
	PLAN_JETPACK_SEARCH_BI_YEARLY,
	PLAN_JETPACK_SEARCH,
	PLAN_JETPACK_SEARCH_FREE,
	PLAN_JETPACK_SEARCH_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_STARTER,
	PLAN_JETPACK_STARTER_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_COMPLETE_BI_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_VIDEOPRESS_BI_YEARLY,
	PLAN_JETPACK_VIDEOPRESS,
	PLAN_JETPACK_VIDEOPRESS_MONTHLY,
	PLAN_JETPACK_GOLDEN_TOKEN_LIFETIME,

	// DEPRECATED: Daily and Real-time variations will soon be retired.
	// Remove after all customers are migrated to new products.
	PLAN_JETPACK_BACKUP_DAILY,
	PLAN_JETPACK_BACKUP_DAILY_MONTHLY,
	PLAN_JETPACK_BACKUP_REALTIME,
	PLAN_JETPACK_BACKUP_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_SOCIAL_BASIC_BI_YEARLY,
	PLAN_JETPACK_SOCIAL_BASIC,
	PLAN_JETPACK_SOCIAL_BASIC_MONTHLY,
	PLAN_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
	PLAN_JETPACK_SOCIAL_ADVANCED,
	PLAN_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	PLAN_JETPACK_SOCIAL_V1_BI_YEARLY,
	PLAN_JETPACK_SOCIAL_V1,
	PLAN_JETPACK_SOCIAL_V1_MONTHLY,
	PLAN_JETPACK_BOOST_BI_YEARLY,
	PLAN_JETPACK_BOOST,
	PLAN_JETPACK_BOOST_MONTHLY,
	PLAN_JETPACK_AI_MONTHLY,
	PLAN_JETPACK_AI_YEARLY,
	PLAN_JETPACK_AI_BI_YEARLY,
	PLAN_JETPACK_STATS_BI_YEARLY,
	PLAN_JETPACK_STATS,
	PLAN_JETPACK_STATS_MONTHLY,
	PLAN_JETPACK_STATS_YEARLY,
	PLAN_JETPACK_STATS_PWYW_YEARLY,
	PLAN_JETPACK_STATS_FREE,
	PLAN_JETPACK_CREATOR_BI_YEARLY,
	PLAN_JETPACK_CREATOR_YEARLY,
	PLAN_JETPACK_CREATOR_MONTHLY,
	PLAN_JETPACK_GROWTH_BI_YEARLY,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
	FEATURE_JETPACK_CRM,
} from 'lib/plans/constants';

import './style.scss';

const PRODUCT_ICON_MAP = {
	[ PLAN_FREE ]: 'plans/wpcom-free.svg',
	[ PLAN_PERSONAL ]: 'plans/wpcom-personal.svg',
	[ PLAN_PERSONAL_2_YEARS ]: 'plans/wpcom-personal.svg',
	[ PLAN_PERSONAL_3_YEARS ]: 'plans/wpcom-personal.svg',
	[ PLAN_PERSONAL_MONTHLY ]: 'plans/wpcom-personal.svg',
	[ PLAN_STARTER ]: 'plans/wpcom-personal.svg',
	[ PLAN_PREMIUM ]: 'plans/wpcom-premium.svg',
	[ PLAN_PREMIUM_2_YEARS ]: 'plans/wpcom-premium.svg',
	[ PLAN_PREMIUM_3_YEARS ]: 'plans/wpcom-premium.svg',
	[ PLAN_PREMIUM_MONTHLY ]: 'plans/wpcom-premium.svg',
	[ PLAN_BUSINESS ]: 'plans/wpcom-business.svg',
	[ PLAN_BUSINESS_2_YEARS ]: 'plans/wpcom-business.svg',
	[ PLAN_BUSINESS_3_YEARS ]: 'plans/wpcom-business.svg',
	[ PLAN_BUSINESS_MONTHLY ]: 'plans/wpcom-business.svg',
	[ PLAN_BUSINESS_TRIAL ]: 'plans/wpcom-business.svg',
	[ PLAN_MIGRATION_TRIAL ]: 'plans/wpcom-business.svg',
	[ PLAN_PRO ]: 'plans/wpcom-business.svg',
	[ PLAN_100_YEARS ]: 'plans/wpcom-business.svg',
	[ PLAN_ECOMMERCE ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_ECOMMERCE_2_YEARS ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_ECOMMERCE_3_YEARS ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_ECOMMERCE_MONTHLY ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_WOOEXPRESS_ESSENTIALS ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_WOOEXPRESS_ESSENTIALS_MONTHLY ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_WOOEXPRESS_PERFORMANCE ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_WOOEXPRESS_PERFORMANCE_MONTHLY ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_WOOEXPRESS_TRIAL ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_VIP ]: 'plans/wpcom-ecommerce.svg',
	[ PLAN_WPCOM_SEARCH ]: 'products/product-jetpack-search.svg',
	[ PLAN_WPCOM_SEARCH_MONTHLY ]: 'products/product-jetpack-search.svg',
	[ PLAN_JETPACK_BACKUP_T0_YEARLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_T0_MONTHLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_T1_BI_YEARLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_T1_YEARLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_T1_MONTHLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_T2_YEARLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_T2_MONTHLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_SCAN_BI_YEARLY ]: 'products/product-jetpack-scan.svg',
	[ PLAN_JETPACK_SCAN ]: 'products/product-jetpack-scan.svg',
	[ PLAN_JETPACK_SCAN_MONTHLY ]: 'products/product-jetpack-scan.svg',
	[ PLAN_JETPACK_ANTI_SPAM_BI_YEARLY ]: 'products/product-jetpack-anti-spam.svg',
	[ PLAN_JETPACK_ANTI_SPAM ]: 'products/product-jetpack-anti-spam.svg',
	[ PLAN_JETPACK_ANTI_SPAM_MONTHLY ]: 'products/product-jetpack-anti-spam.svg',
	[ PLAN_JETPACK_SEARCH_BI_YEARLY ]: 'products/product-jetpack-search.svg',
	[ PLAN_JETPACK_SEARCH ]: 'products/product-jetpack-search.svg',
	[ PLAN_JETPACK_SEARCH_FREE ]: 'products/product-jetpack-search.svg',
	[ PLAN_JETPACK_SEARCH_MONTHLY ]: 'products/product-jetpack-search.svg',
	[ PLAN_JETPACK_FREE ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_PERSONAL ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_PERSONAL_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_PREMIUM ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_PREMIUM_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_BUSINESS ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_BUSINESS_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_STARTER ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_STARTER_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_SECURITY_T1_BI_YEARLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_COMPLETE_BI_YEARLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_COMPLETE ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_VIDEOPRESS_BI_YEARLY ]: 'products/product-jetpack-videopress.svg',
	[ PLAN_JETPACK_VIDEOPRESS ]: 'products/product-jetpack-videopress.svg',
	[ PLAN_JETPACK_VIDEOPRESS_MONTHLY ]: 'products/product-jetpack-videopress.svg',
	[ PLAN_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_SOCIAL_BASIC ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_SOCIAL_BASIC_MONTHLY ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_SOCIAL_ADVANCED ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_SOCIAL_V1_BI_YEARLY ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_SOCIAL_V1 ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_SOCIAL_V1_MONTHLY ]: 'products/product-jetpack-social.svg',
	[ PLAN_JETPACK_GOLDEN_TOKEN_LIFETIME ]: 'plans/jetpack-golden-token.svg',
	[ PLAN_JETPACK_CREATOR_BI_YEARLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_CREATOR_YEARLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_CREATOR_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_GROWTH_BI_YEARLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_GROWTH_YEARLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_GROWTH_MONTHLY ]: 'plans/jetpack.svg',

	// DEPRECATED: Daily and Real-time variations will soon be retired.
	// Remove after all customers are migrated to new products.
	[ PLAN_JETPACK_BACKUP_DAILY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_DAILY_MONTHLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_REALTIME ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_BACKUP_REALTIME_MONTHLY ]: 'products/product-jetpack-backup.svg',
	[ PLAN_JETPACK_SECURITY_DAILY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_SECURITY_REALTIME ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ]: 'plans/jetpack.svg',
	[ PLAN_JETPACK_BOOST_BI_YEARLY ]: 'products/product-jetpack-boost.svg',
	[ PLAN_JETPACK_BOOST ]: 'products/product-jetpack-boost.svg',
	[ PLAN_JETPACK_BOOST_MONTHLY ]: 'products/product-jetpack-boost.svg',
	[ PLAN_JETPACK_AI_MONTHLY ]: 'products/product-jetpack-ai.svg',
	[ PLAN_JETPACK_AI_YEARLY ]: 'products/product-jetpack-ai.svg',
	[ PLAN_JETPACK_AI_BI_YEARLY ]: 'products/product-jetpack-ai.svg',
	[ PLAN_JETPACK_STATS_BI_YEARLY ]: 'products/product-jetpack-stats.svg',
	[ PLAN_JETPACK_STATS ]: 'products/product-jetpack-stats.svg',
	[ PLAN_JETPACK_STATS_MONTHLY ]: 'products/product-jetpack-stats.svg',
	[ PLAN_JETPACK_STATS_YEARLY ]: 'products/product-jetpack-stats.svg',
	[ PLAN_JETPACK_STATS_PWYW_YEARLY ]: 'products/product-jetpack-stats.svg',
	[ PLAN_JETPACK_STATS_FREE ]: 'products/product-jetpack-stats.svg',
	// CRM plans do not exist on WPCOM so this is a hacky way of assigning an icon anyway
	[ FEATURE_JETPACK_CRM ]: 'products/product-jetpack-crm.svg',
};
const DEFAULT_SIZE = 32;

export default class PlanIcon extends Component {
	render() {
		const { className, alt, plan } = this.props;
		const fallback = imagePath + 'plans/jetpack.svg';
		const imageSrc = PRODUCT_ICON_MAP[ plan ] ? imagePath + PRODUCT_ICON_MAP[ plan ] : fallback;

		return (
			<img
				className={ className }
				src={ imageSrc }
				width={ DEFAULT_SIZE }
				height={ DEFAULT_SIZE }
				alt={ alt || '' }
			/>
		);
	}
}

PlanIcon.propTypes = {
	classNames: PropTypes.string,
	alt: PropTypes.string,
	plan: PropTypes.oneOf( [
		PLAN_FREE,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PERSONAL_3_YEARS,
		PLAN_PERSONAL_MONTHLY,
		PLAN_STARTER,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_PREMIUM_3_YEARS,
		PLAN_PREMIUM_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_BUSINESS_3_YEARS,
		PLAN_BUSINESS_MONTHLY,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
		PLAN_ECOMMERCE_3_YEARS,
		PLAN_ECOMMERCE_MONTHLY,
		PLAN_VIP,
		PLAN_WPCOM_SEARCH,
		PLAN_WPCOM_SEARCH_MONTHLY,
		PLAN_JETPACK_BACKUP_T0_YEARLY,
		PLAN_JETPACK_BACKUP_T0_MONTHLY,
		PLAN_JETPACK_BACKUP_T1_YEARLY,
		PLAN_JETPACK_BACKUP_T1_BI_YEARLY,
		PLAN_JETPACK_BACKUP_T1_MONTHLY,
		PLAN_JETPACK_BACKUP_T2_YEARLY,
		PLAN_JETPACK_BACKUP_T2_MONTHLY,
		PLAN_JETPACK_SCAN_BI_YEARLY,
		PLAN_JETPACK_SCAN,
		PLAN_JETPACK_SCAN_MONTHLY,
		PLAN_JETPACK_ANTI_SPAM_BI_YEARLY,
		PLAN_JETPACK_ANTI_SPAM,
		PLAN_JETPACK_ANTI_SPAM_MONTHLY,
		PLAN_JETPACK_SEARCH_BI_YEARLY,
		PLAN_JETPACK_SEARCH,
		PLAN_JETPACK_SEARCH_FREE,
		PLAN_JETPACK_SEARCH_MONTHLY,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_JETPACK_STARTER,
		PLAN_JETPACK_STARTER_MONTHLY,
		PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
		PLAN_JETPACK_SECURITY_T1_YEARLY,
		PLAN_JETPACK_SECURITY_T1_MONTHLY,
		PLAN_JETPACK_SECURITY_T2_YEARLY,
		PLAN_JETPACK_SECURITY_T2_MONTHLY,
		PLAN_JETPACK_COMPLETE_BI_YEARLY,
		PLAN_JETPACK_COMPLETE,
		PLAN_JETPACK_COMPLETE_MONTHLY,
		PLAN_JETPACK_VIDEOPRESS_BI_YEARLY,
		PLAN_JETPACK_VIDEOPRESS,
		PLAN_JETPACK_VIDEOPRESS_MONTHLY,
		PLAN_JETPACK_SOCIAL_BASIC_BI_YEARLY,
		PLAN_JETPACK_SOCIAL_BASIC,
		PLAN_JETPACK_SOCIAL_BASIC_MONTHLY,
		PLAN_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
		PLAN_JETPACK_SOCIAL_ADVANCED,
		PLAN_JETPACK_SOCIAL_ADVANCED_MONTHLY,
		PLAN_JETPACK_SOCIAL_V1_BI_YEARLY,
		PLAN_JETPACK_SOCIAL_V1,
		PLAN_JETPACK_SOCIAL_V1_MONTHLY,
		PLAN_JETPACK_GOLDEN_TOKEN_LIFETIME,
		PLAN_JETPACK_CREATOR_BI_YEARLY,
		PLAN_JETPACK_CREATOR_YEARLY,
		PLAN_JETPACK_CREATOR_MONTHLY,
		PLAN_JETPACK_GROWTH_BI_YEARLY,
		PLAN_JETPACK_GROWTH_YEARLY,
		PLAN_JETPACK_GROWTH_MONTHLY,

		// DEPRECATED: Daily and Real-time variations will soon be retired.
		// Remove after all customers are migrated to new products.
		PLAN_JETPACK_BACKUP_DAILY,
		PLAN_JETPACK_BACKUP_DAILY_MONTHLY,
		PLAN_JETPACK_BACKUP_REALTIME,
		PLAN_JETPACK_BACKUP_REALTIME_MONTHLY,
		PLAN_JETPACK_SECURITY_DAILY,
		PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
		PLAN_JETPACK_SECURITY_REALTIME,
		PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		PLAN_JETPACK_VIDEOPRESS_BI_YEARLY,
		PLAN_JETPACK_VIDEOPRESS,
		PLAN_JETPACK_VIDEOPRESS_MONTHLY,
		PLAN_JETPACK_STATS_BI_YEARLY,
		PLAN_JETPACK_STATS,
		PLAN_JETPACK_STATS_MONTHLY,
		PLAN_JETPACK_STATS_YEARLY,
		PLAN_JETPACK_STATS_PWYW_YEARLY,
		PLAN_JETPACK_STATS_FREE,
		PLAN_JETPACK_AI_YEARLY,
		PLAN_JETPACK_BOOST,
		FEATURE_JETPACK_CRM,
	] ).isRequired,
};
