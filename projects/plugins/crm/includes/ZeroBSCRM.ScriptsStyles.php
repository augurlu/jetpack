<?php 
/*!
 * Jetpack CRM
 * https://jetpackcrm.com
 * V2.4+
 *
 * Copyright 2020 Automattic
 *
 * Date: 06/02/18
 */
// phpcs:disable WordPress.WP.EnqueuedResourceParameters.NotInFooter,Generic.WhiteSpace.ScopeIndent.Incorrect

#} ===============================================================================
#} === INIT registration & Global Style & Script setups
#} ===============================================================================

// WH moved this from core.php in v3.0 (filing)
// Registers globally used stuff (mostly)
function zeroBSCRM_scriptStyles_initStyleRegister(){

	global $zbs;

		// ===========================================
		// ================  Global  =================

			// registers the styles on admin init
			wp_register_style( 'jpcrm-semanticui-lib', plugins_url( '/build/lib/semantic-ui-css/semantic.min.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
			wp_register_style( 'zbs-wp-semanticui', plugins_url( '/css/ZeroBSCRM.admin.semantic-ui' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array( 'jpcrm-semanticui-lib' ), $zbs::VERSION );
			wp_register_script( 'semanticuijs', plugins_url( '/build/lib/semantic-ui-css/semantic.min.js', ZBS_ROOTFILE ), array(), $zbs::VERSION );

			// global
			wp_register_style( 'zerobscrmadmcss', plugins_url( '/css/ZeroBSCRM.admin.global' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array( 'zbs-wp-semanticui' ), $zbs::VERSION );
			wp_enqueue_script( 'zerobscrmadmjs', plugins_url( '/js/ZeroBSCRM.admin.global' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

			// emerald styles
			wp_register_style( 'jpcrm-emerald', plugins_url( '/css/jpcrm-emerald' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );

		// ================ / Global  ================
		// ===========================================


		// ===========================================
		// ============  Page-specific  ==============

			// list view
			wp_register_style( 'zerobscrmlistview', plugins_url( '/css/ZeroBSCRM.admin.listview' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
			wp_register_script( 'zerobscrmlistviewjs', plugins_url( '/js/ZeroBSCRM.admin.listview' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

				#} localise the list view...
				// WH note: Pretty sure we do this on page, so should janitor this up (later)
				$zbs_translation_array = array(
					'zbs_edit' => __( 'Edit', 'zero-bs-crm' ),
					'zbs_view' => __( 'View', 'zero-bs-crm' ),
				);
				wp_localize_script( 'zerobscrmlistviewjs', 'zbs_lang', $zbs_translation_array );

			// Single view
			wp_register_style( 'zerobscrmsingleview', plugins_url( '/css/ZeroBSCRM.admin.singleview' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
			wp_register_script( 'zerobscrmsingleview', plugins_url( '/js/ZeroBSCRM.admin.singleview' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

			// edit view
			wp_register_style( 'zerobscrmeditview', plugins_url( '/css/ZeroBSCRM.admin.editview' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
			wp_register_script( 'zerobscrmeditviewjs', plugins_url( '/js/ZeroBSCRM.admin.editview' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );
			wp_register_script( 'zerobscrmtagmetaboxjs', plugins_url( '/js/ZeroBSCRM.admin.tags.metabox' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

			// Metabox manager (rearrange them)
			wp_register_script( 'zerobscrmmm', plugins_url( '/js/ZeroBSCRM.admin.metabox.manager' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

			// Segment Editor
			wp_register_style( 'zbs-segmentedit-css', plugins_url( '/css/ZeroBSCRM.admin.segmentedit' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
			wp_register_script( 'zbs-segmentedit-js', ZEROBSCRM_URL . '/js/ZeroBSCRM.admin.segmentedit' . wp_scripts_get_suffix() . '.js', array( 'jquery' ), $zbs::VERSION );

			// home dash
			wp_register_style( 'zerobscrmhomedash', plugins_url( '/css/ZeroBSCRM.admin.homedash' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array( 'zbs-wp-semanticui' ), $zbs::VERSION );

			// settings page
			wp_register_style( 'zerobscrmsettings', plugins_url( '/css/ZeroBSCRM.admin.settings' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );

			// mail delivery wizard
			wp_register_style( 'zerobscrmmaildeliverywizard', plugins_url( '/css/ZeroBSCRM.admin.maildeliverywizard' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );

			// systems page: 
			wp_register_script( 'jpcrmadminsystem', plugins_url( '/js/jpcrm-admin-system' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

		// ============ / Page-specific ==============
		// ===========================================

		// ===========================================
		// ============  Libs  =======================

			// jq ui 
			wp_register_script( 'zerobscrmadmjqui', plugins_url( '/js/lib/jquery-ui.min.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );
			// above didn't seem to include all libs req for draggable, this does, specific build for listviews
			// 29/07/2017 http://jqueryui.com/download/#!version=1.12.1&components=111111111111111110000000010000000000000000000000
			wp_register_script( 'zerobscrmadmjquidraggable', plugins_url( '/js/lib/jquery-ui.1.12.1.dragdrop.listview.min.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

			// jq modal
			wp_register_style( 'jpcrm-jquery-modal', plugins_url( '/build/lib/jquery-modal/jquery.modal.min.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
			wp_register_script( 'jpcrm-jquery-modal', plugins_url( '/build/lib/jquery-modal/jquery.modal.min.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

			// font awesome
			wp_register_style( 'jpcrm-fontawesome', plugins_url( '/build/lib/font-awesome/css/font-awesome.min.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );

			// chart.js
			wp_register_script( 'jpcrm-chartjs', plugins_url( '/build/lib/chart.js/chart.umd.min.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION, true );

			// SweetAlert2
			wp_register_style( 'zerobscrmswa', plugins_url( '/build/lib/sweetalert2/sweetalert2.min.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
			wp_enqueue_script( 'zerobscrmswa', plugins_url( '/build/lib/sweetalert2/sweetalert2.min.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

			// typeahead.js
			wp_enqueue_script( 'jpcrm-typeahead', plugins_url( '/build/lib/typeahead.js/typeahead.bundle.min.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

		// ============ / Libs =======================
		// ===========================================

		// ===========================================
		// ============  Whitelabel  =================

			// WL css overrides (3/11/18 ++)
			// if the file exists, this registers + enqueues css
				if ( file_exists( dirname( ZBS_ROOTFILE ) . '/css/wl.adm.override.css' ) ) {
					wp_enqueue_style( 'zbswladmcss', plugins_url( '/css/wl.adm.override.css', ZBS_ROOTFILE ), array( 'zerobscrmadmcss', 'zerobscrmlistview', 'zerobscrmeditview' ), $zbs::VERSION );
				}

		// ============ / Whitelabel =================
		// ===========================================

		// LEGACY SUPPORT for ext's with menus
		if (zeroBSCRM_isAdminPage()){
			zeroBSCRM_global_admin_styles();
		}
}

// This builds our globally available jpcrm_root object with formatting etc. settings
function zeroBSCRM_scriptStyles_enqueueJSRoot(){

	global $zbs;

	// =================================================
	// ================  Global JS ROOT =================
	// here we expose root for js /i refs etc.
	// WH: we also give locale for datetimepickers everywhere (was zbsDateLocaleOverride, now window.zbs_root.localeOptions)
	/*  var localeOpt = {
		format: "DD.MM.YYYY",
		cancelLabel: 'Clear'
	}; */
	// WH: We also expose our number formats (for js $ formating)
	$zbscrm_currency_position                  = $zbs->settings->get( 'currency_position' );
	$zbscrm_currency_format_thousand_separator = $zbs->settings->get( 'currency_format_thousand_separator' );
	$zbscrm_currency_format_decimal_separator  = $zbs->settings->get( 'currency_format_decimal_separator' );
	$zbscrm_currency_format_number_of_decimals = $zbs->settings->get( 'currency_format_number_of_decimals' );

	$jpcrm_root = array(
		'crmname'              => 'Jetpack CRM',
		'root'                 => ZEROBSCRM_URL,
		'localeOptions'        => zeroBSCRM_date_localeForDaterangePicker(),
		'locale'               => get_locale(),
		'locale_short'         => zeroBSCRM_getLocale( false ),
		'currencyOptions'      => array(
			'symbol'            => zeroBSCRM_getCurrencyChr(),
			'currencyStr'       => zeroBSCRM_getCurrencyStr(),
			'position'          => $zbscrm_currency_position,
			'thousandSeparator' => $zbscrm_currency_format_thousand_separator,
			'decimalSeparator'  => $zbscrm_currency_format_decimal_separator,
			'noOfDecimals'      => $zbscrm_currency_format_number_of_decimals,
		),
		'timezone_offset'      => (int) get_option( 'gmt_offset' ),
		'timezone_offset_mins' => ( (int) get_option( 'gmt_offset' ) * 60 ),
		'wl'                   => ( zeroBSCRM_isWL() ? 1 : -1 ),
		'dal'                  => 3,
	);

	// this is for wl peeps, if set it'll override WYSIWYG logo + settings logo
	$jpcrm_root['crmlogo'] = 'i/icon-32.png';

	// Language strings for global JavaScript usage
	$lang_array = array(
		// General action strings
		'send'              => __( 'Send', 'zero-bs-crm' ),
		'sent'              => __( 'Sent', 'zero-bs-crm' ),
		'notsent'           => __( 'Not Sent', 'zero-bs-crm' ),
		'cancel'            => __( 'Cancel', 'zero-bs-crm' ),
		'contact'           => __( 'Contact', 'zero-bs-crm' ),
		'company'           => __( 'Company', 'zero-bs-crm' ),
		'viewall'           => __( 'View all', 'zero-bs-crm' ),

		// Statement functionality
		'sendstatement'     => __( 'Send Statement', 'zero-bs-crm' ),
		'sendstatementaddr' => __( 'Send Statement to Email:', 'zero-bs-crm' ),
		'enteremail'        => __( 'Enter an Email Address..', 'zero-bs-crm' ),
		'statementsent'     => __( 'Statement was successfully sent', 'zero-bs-crm' ),
		'statementnotsent'  => __( 'Statement could not be sent at this time', 'zero-bs-crm' ),

		// Entity types and totals
		'total'             => __( 'Total', 'zero-bs-crm' ),
		'totals'            => __( 'Totals', 'zero-bs-crm' ),
		'quote'             => __( 'Quote', 'zero-bs-crm' ),
		'quotes'            => __( 'Quotes', 'zero-bs-crm' ),
		'invoice'           => __( 'Invoice', 'zero-bs-crm' ),
		'invoices'          => __( 'Invoices', 'zero-bs-crm' ),
		'transaction'       => __( 'Transaction', 'zero-bs-crm' ),
		'transactions'      => __( 'Transactions', 'zero-bs-crm' ),

		// daterangepicker ranges
		'today'             => __( 'Today', 'zero-bs-crm' ),
		'yesterday'         => __( 'Yesterday', 'zero-bs-crm' ),
		'last_7_days'       => __( 'Last 7 days', 'zero-bs-crm' ),
		'last_30_days'      => __( 'Last 30 days', 'zero-bs-crm' ),
		'this_month'        => __( 'This month', 'zero-bs-crm' ),
		'last_month'        => __( 'Last month', 'zero-bs-crm' ),
	);

	$lang_array = apply_filters( 'zbs_globaljs_lang', $lang_array );

	if ( is_array( $lang_array ) && count( $lang_array ) > 0 ) {
		$jpcrm_root['lang'] = $lang_array;
	}

	$jpcrm_root['zbsnonce'] = wp_create_nonce( 'zbscrmjs-glob-ajax-nonce' );

	// GENERIC links for building view/edit links in JS globally:

	// v3.0+ - returns a link with _TYPE_ instead of 'contact' etc. used by js func zeroBSCRMJS_obj_viewLink (globally avail)
	$generic_view_link = str_replace( 'contact', '_TYPE_', jpcrm_esc_link( 'view', -1, 'zerobs_customer', true ) );
	// v3.0+ - returns a link with _TYPE_ instead of 'contact' etc. used by js func zeroBSCRMJS_obj_editLink (globally avail)
	$generic_edit_link = str_replace( 'contact', '_TYPE_', jpcrm_esc_link( 'edit', -1, 'zerobs_customer', true ) );

	$jpcrm_root['links'] = array(
		'generic_view' => $generic_view_link,
		'generic_edit' => $generic_edit_link,
	);

	##WLREMOVE
	unset( $jpcrm_root['crmlogo'] );
	##/WLREMOVE

	$jpcrm_root['jp_green'] = jpcrm_get_jp_green();

	// filter jpcrm_root, allows us to pass js vars directly into the js global via filter
	$jpcrm_root = apply_filters( 'zbs_globaljs_vars', $jpcrm_root );

	wp_localize_script( 'zerobscrmadmjs', 'zbs_root', $jpcrm_root ); // This relies on the script being registered by zeroBSCRM_initStyleRegister() above
}

/**
 * Return an array of JP Green values
 */
function jpcrm_get_jp_green() {
	$jp_green = array(
		'0'   => '#f0f2eb',
		'5'   => '#d0e6b8',
		'10'  => '#9dd977',
		'20'  => '#64ca43',
		'30'  => '#2fb41f',
		'40'  => '#069e08',
		'50'  => '#008710',
		'60'  => '#007117',
		'70'  => '#005b18',
		'80'  => '#004515',
		'90'  => '#003010',
		'100' => '#001c09',
	);

	return $jp_green;
}

#} ===============================================================================
#} === /  INIT registration & Global Style & Script setups
#} ===============================================================================


#} ===============================================================================
#} === Edit View individual type functions (e.g. quotebuilder)
#} ===============================================================================

// Cleaned from messy core.php routine in v3.0
function zeroBSCRM_scriptStyles_admin_quoteBuilder(){

	global $zbs;
	wp_enqueue_style( 'zerobscrm-quotebuilder', plugins_url( '/css/ZeroBSCRM.admin.quotebuilder' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
	wp_enqueue_script( 'zerobscrm-quotebuilderjs', plugins_url( '/js/ZeroBSCRM.admin.quotebuilder' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

}

// Cleaned from messy core.php routine in v3.0
// NOTE, this was firing on Invoice List View (WH removed 3.0), now only fires on invoice editor (correctly)
function zeroBSCRM_scriptStyles_admin_invoiceBuilder(){

	global $zbs;

	#}  MS invoice stuff. xxx
	wp_enqueue_style( 'zerobscrm-invoicebuilder', plugins_url( '/css/ZeroBSCRM.admin.invoicebuilder' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
	wp_enqueue_script( 'zerobscrm-invoicebuilderjs', plugins_url( '/js/ZeroBSCRM.admin.invoicebuilder' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery', 'semanticuijs' ), $zbs::VERSION );

			//localise the invoice builder strings...
	$zbs_invtranslation_array = array(
		'zbs_item_name' => __( 'Item Name', 'zero-bs-crm' ),
		'zbs_item_desc'	=> __('Enter a detailed description (optional)',"zero-bs-crm"),
		'zbs_add_row'	=> __('Add Row',"zero-bs-crm"),
		'zbs_remove_row' => __('Remove Row',"zero-bs-crm")
	);

	$zbs_links = array(
		'admin_url' => admin_url(),
	);

	wp_localize_script( 'zerobscrm-invoicebuilderjs', 'zbs_lang', $zbs_invtranslation_array );
	wp_localize_script( 'zerobscrm-invoicebuilderjs', 'zbs_links', $zbs_links);

}

// edit transaction page scripts.
function zeroBSCRM_scriptStyles_admin_transactionBuilder(){

	global $zbs;
	wp_enqueue_style( 'zerobscrmtranscss', plugins_url( '/css/ZeroBSCRM.admin.transactionedit' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
	wp_enqueue_script( 'zerobscrm-transedit-js', ZEROBSCRM_URL . 'js/ZeroBSCRM.admin.transactioneditor' . wp_scripts_get_suffix() . '.js', array( 'jquery' ), $zbs::VERSION );

}

// Cleaned from messy core.php routine in v3.0
function zeroBSCRM_scriptStyles_admin_formBuilder(){

	global $zbs;
	wp_enqueue_style( 'zerobscrmformcss', plugins_url( '/css/ZeroBSCRM.admin.frontendforms' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );

}

#} ===============================================================================
#} === /  Edit View individual type functions (e.g. quotebuilder)
#} ===============================================================================



#} ===============================================================================
#} === Unsorted Styles from pre v3.0
#} ===============================================================================
function zeroBSCRM_global_admin_styles(){

	global $zbs;

	// It seems we've got this firing multiple times, (WH spotted 2.4), so am putting this lame protection place. 
	// Ideally need to stop it firing twice
	if (!defined('ZBS_GAS')){
	
	//enqueue these (via the admin_print_styles-{$page})

		// prev core
		wp_enqueue_style( 'zerobscrmadmcss' );
		wp_enqueue_style( 'jpcrm-jquery-modal' );
		wp_enqueue_style( 'jpcrm-fontawesome' );
		wp_enqueue_style( 'zerobscrmswa' );
		wp_enqueue_script( 'jpcrm-jquery-modal' );

		// emerald styles
		wp_enqueue_style( 'jpcrm-emerald' );

		// moment everywhere (from 2.98)
		wp_enqueue_script( 'jpcrm-moment', ZEROBSCRM_URL . 'build/lib/moment/moment-with-locales.min.js', array( 'jquery' ), $zbs::VERSION, false );

		// semantic everywhere (on our pages)
		wp_enqueue_style( 'zbs-wp-semanticui' );
		wp_enqueue_script( 'semanticuijs' );

		do_action('zbs-global-admin-styles');

		// DEFINE ZBS page :)
		if (!defined('ZBS_PAGE')) define('ZBS_PAGE',true);

		// DEFINE ZBS styles fired / dupe check protection
		if (!defined('ZBS_GAS')) define('ZBS_GAS',true);

	} // / dupe check protection
}

// 2.98.2 - MS styles tidy up that were inline
// for the Extension Manager page (was inline)
function zeroBSCRM_extension_admin_styles() {
	global $zbs;
	wp_register_style( 'zerobscrmexts', ZEROBSCRM_URL . 'css/ZeroBSCRM.admin.extensions-page' . wp_scripts_get_suffix() . '.css', array(), $zbs::VERSION );
	wp_enqueue_style( 'zerobscrmexts' );
}

// 2.98.2 - MS tidy up of style into compressed sheet (was inline)
function zeroBSCRM_intro_admin_styles() {
	global $zbs;
	wp_register_style( 'zerobscrmintro', ZEROBSCRM_URL . 'css/ZeroBSCRM.admin.intro' . wp_scripts_get_suffix() . '.css', array(), $zbs::VERSION );
	wp_enqueue_style( 'zerobscrmintro' );
}

function zeroBSCRM_email_styles() {
	global $zbs;
	wp_register_style( 'zerobscrmemails', ZEROBSCRM_URL . 'css/ZeroBSCRM.admin.email' . wp_scripts_get_suffix() . '.css', array(), $zbs::VERSION );
	wp_enqueue_style( 'zerobscrmemails' );
	wp_register_script( 'zerobsjsemail', ZEROBSCRM_URL . 'js/ZeroBSCRM.admin.email' . wp_scripts_get_suffix() . '.js', array( 'jquery' ), $zbs::VERSION );
	wp_enqueue_script( 'zerobsjsemail');
	do_action( 'zbs_extra_email_script_styles' );
}
function zeroBSCRM_admin_styles_ui2_listview(){

	wp_enqueue_style( 'zerobscrmlistview' );
	wp_enqueue_script( 'semanticuijs' );
	// Removed at request of plugin reviewers. (used wp core ver) wp_enqueue_script( 'zerobscrmadmjqui');
	wp_enqueue_script( 'jquery-ui-sortable' );

	// our list view css
	wp_enqueue_script( 'zerobscrmlistviewjs' );

	zeroBSCRM_enqueue_libs_js_momentdatepicker();

	// hook to allow modules etc. to add list view stylesheets
	do_action( 'jpcrm_enqueue_styles_listview' );
}
function zeroBSCRM_admin_styles_ui2_editview(){

	//enqueue these (via the admin_print_styles-{$page})

			// Removed at request of plugin reviewers. (used wp core ver) wp_enqueue_script( 'zerobscrmadmjqui');
			wp_enqueue_script( 'jquery-ui-sortable' );
			wp_enqueue_style( 'zerobscrmeditview' );
			wp_enqueue_script( 'semanticuijs' );
			wp_enqueue_script( 'zerobscrmeditviewjs' );
			wp_enqueue_script( 'zerobscrmtagmetaboxjs' );
			wp_enqueue_script( 'zerobscrmmm' ); // metabox manager

			// daterange + moment
			zeroBSCRM_enqueue_libs_js_momentdatepicker();

			// catch type-specific includes :)
			if (isset($_GET['zbstype']) && !empty($_GET['zbstype'])){

				switch ($_GET['zbstype']){

					case 'quote':
						zeroBSCRM_scriptStyles_admin_quoteBuilder();
						break;

					case 'invoice':
						zeroBSCRM_scriptStyles_admin_invoiceBuilder();
						break;

					case 'transaction':
						zeroBSCRM_scriptStyles_admin_transactionBuilder();
						break;

					case 'form':
						zeroBSCRM_scriptStyles_admin_formBuilder();
						break;

					case 'event':
						zeroBSCRM_calendar_admin_styles();
						break;


				}
			}

			// extra scripts (e.g. Twilio Connect hooks into this - otherwise the button will not do anything)
			do_action('zbs_postenqueue_editview'); //zbs_extra_custeditscripts
}
function zeroBSCRM_settingspage_admin_styles(){

	global $zbs;

	// needs datepicker (MS needed for paypal sync, was a gross hack elsewhere so put here)
	wp_enqueue_script( 'jpcrm-daterangepicker', ZEROBSCRM_URL . 'build/lib/daterangepicker/daterangepicker.js', array( 'jquery' ), $zbs::VERSION );

	wp_enqueue_style( 'zerobscrmsettings' );
	wp_register_script( 'zerobscrm-settingspage-js', ZEROBSCRM_URL . 'js/ZeroBSCRM.admin.settings' . wp_scripts_get_suffix() . '.js', array( 'jquery' ), $zbs::VERSION );
	wp_enqueue_script( 'zerobscrm-settingspage-js' );

	#} Field Sorts
	if (isset($_GET['tab']) && $_GET['tab'] == 'fieldsorts'){
		wp_enqueue_script( 'zerobscrmadmjqui');

		#} Our custom sortables css
		wp_enqueue_style( 'zerobscrmsortscss', plugins_url( '/css/ZeroBSCRM.admin.sortables' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
	}
}

/* Placeholder function for Invoicing Pro <= 2.8.3. */
function zeroBSCRM_admin_styles_ui2_semantic(){}

function zeroBSCRM_admin_styles_ui2_semantic_settingspage(){
			wp_enqueue_style( 'zerobscrmmaildeliverywizard' );
			wp_enqueue_style( 'zerobscrmsettings' );
}

function zeroBSCRM_admin_styles_singleview(){

	// single item view
	wp_enqueue_style( 'zerobscrmsingleview' );
	wp_enqueue_script( 'zerobscrmsingleview' );

}

function jpcrm_admin_scripts_systems_page(){

	wp_enqueue_script( 'jpcrmadminsystem' );

}

function zeroBSCRM_admin_styles_homedash(){
	global $zbs;
	// home dashboard styles and script
	wp_enqueue_style( 'zerobscrmhomedash' );
	wp_enqueue_style( 'jpcrm-funnel', ZEROBSCRM_URL . 'css/jpcrm-admin-funnel' . wp_scripts_get_suffix() . '.css', array(), $zbs::VERSION );
	wp_enqueue_script( 'jpcrm-funnel', ZEROBSCRM_URL . 'js/jpcrm-admin-funnel' . wp_scripts_get_suffix() . '.js', array(), $zbs::VERSION, true );
	wp_enqueue_script( 'jpcrm-chartjs' );
	zeroBSCRM_enqueue_libs_js_momentdatepicker();
	wp_enqueue_script( 'jpcrm-dash', ZEROBSCRM_URL . 'js/ZeroBSCRM.admin.dash' . wp_scripts_get_suffix() . '.js', array( 'jquery' ), $zbs::VERSION, true );
}

function zeroBSCRM_admin_scripts_editcust(){
	
	zeroBSCRM_dequeueJSModal();

	//scripts here for the edit customer page (for the "Quick Add Company, Tasks, etc")
	wp_enqueue_script( 'zerobscrmcustjs' );
}


function zeroBSCRM_calendar_admin_styles(){
	global $zbs;
	zeroBSCRM_enqueue_libs_js_momentdatepicker();
	wp_enqueue_script( 'jpcrm-fullcalendar', ZEROBSCRM_URL . 'build/lib/fullcalendar/index.global.min.js', array(), $zbs::VERSION, true );
	wp_enqueue_script( 'jpcrm-tasks', ZEROBSCRM_URL . 'js/jpcrm-admin-tasks' . wp_scripts_get_suffix() . '.js', array( 'jpcrm-fullcalendar' ), $zbs::VERSION, true );
	wp_enqueue_style( 'jpcrm-tasks', ZEROBSCRM_URL . 'css/jpcrm-admin-tasks' . wp_scripts_get_suffix() . '.css', array(), $zbs::VERSION );
}

function zeroBSCRM_dequeueJSModal(){
	wp_dequeue_style( 'jpcrm-jquery-modal' );
	wp_dequeue_script( 'jpcrm-jquery-modal' );
}

function zeroBSCRM_add_admin_styles( $hook ) {

    global $post;
    $zeroBSCRM_custom_slug = ''; if (isset($_GET['zbsslug'])) $zeroBSCRM_custom_slug = sanitize_text_field($_GET['zbsslug']);

    if ( $hook == 'post-new.php' || $hook == 'post.php' || $hook == 'edit-tags.php' || 'edit.php' ) { // || $hook == 'edit.php'
        if (is_object($post)){
	        if ( 'zerobs_customer' === $post->post_type || 'zerobs_quote' === $post->post_type || 'zerobs_company' === $post->post_type || 'zerobs_invoice' === $post->post_type || 'zerobs_transaction' === $post->post_type || 'zerobs_form' === $post->post_type || 'zerobs_mailcampaign' === $post->post_type || 'zerobs_event' === $post->post_type || 'zerobs_quo_template' === $post->post_type   ) {     
	           zeroBSCRM_global_admin_styles();
	            //semantic throughout... 
	            if('zerobs_customer' === $post->post_type || 'zerobs_quo_template' === $post->post_type || 'zerobs_transaction' === $post->post_type || 'zerobs_quote' === $post->post_type || 'zerobs_invoice' === $post->post_type || 'zerobs_form' === $post->post_type || 'zerobs_company' === $post->post_type || 'zerobs_event' === $post->post_type){
	            	//semantic roll out (in stages)
	            	// These now get rolled into zeroBSCRM_global_admin_styles zeroBSCRM_admin_styles_ui2_semantic();

	            	//single customer stuff (like click to SMS etc...)
	            	zeroBSCRM_admin_scripts_editcust();

	            	do_action('zbs_extra_custeditscripts');
				}
				
				if('zerobs_event' === $post->post_type){
					zeroBSCRM_calendar_admin_styles();
				}
	            
	        }
    	}else if(isset($_GET['post_type']) && ($_GET['post_type'] == 'zerobs_customer' || $_GET['post_type'] == 'zerobs_quo_template' || $_GET['post_type'] == 'zerobs_event' || $_GET['post_type'] == 'zerobs_transaction' || $_GET['post_type'] == 'zerobs_company')){
    		zeroBSCRM_global_admin_styles();
    		// These now get rolled into zeroBSCRM_global_admin_styles zeroBSCRM_admin_styles_ui2_semantic();
    	}else if(isset($_GET['post_type']) && ($_GET['post_type'] == 'zerobs_form' || $_GET['post_type'] ==  'zerobs_event')){
    		zeroBSCRM_global_admin_styles();
    		// These now get rolled into zeroBSCRM_global_admin_styles zeroBSCRM_admin_styles_ui2_semantic();
    	}else if($zeroBSCRM_custom_slug == 'zbs-add-user' || $zeroBSCRM_custom_slug == 'zbs-edit-user'){
    		zeroBSCRM_global_admin_styles();
    		// These now get rolled into zeroBSCRM_global_admin_styles zeroBSCRM_admin_styles_ui2_semantic();
    	} 

    	// this needed to be separate to the above for some reason on some hosts.
    	if (isset($_GET['page']) && $_GET['page'] == 'zbs-add-edit'){

    		zeroBSCRM_admin_styles_singleview();
    	}
    }
    
}
add_action( 'admin_enqueue_scripts', 'zeroBSCRM_add_admin_styles', 10, 1 );

	// THIS IS LEGACY! It's used for <3.0 on CPT edit pages. Otherwise enqueue properly like in zeroBSCRM_settingspage_admin_styles via menus :)
	function zeroBSCRM_load_libs_js_momentdatepicker(){
	    add_action( 'admin_enqueue_scripts', 'zeroBSCRM_enqueue_libs_js_momentdatepicker' );
	}

	function zeroBSCRM_enqueue_libs_js_momentdatepicker(){

		global $zbs;
		wp_enqueue_script( 'jpcrm-daterangepicker', ZEROBSCRM_URL . 'build/lib/daterangepicker/daterangepicker.js', array( 'jquery' ), $zbs::VERSION );
		#} CSS is wrapped into main plugin css
	}

	#} Customer Filters
	function zeroBSCRM_load_libs_js_customerfilters(){
	    add_action( 'admin_enqueue_scripts', 'zeroBSCRM_enqueue_libs_js_customerfilters' );
	}
	function zeroBSCRM_enqueue_libs_js_customerfilters(){

		global $zbs;
		#} Customer Filters
		wp_enqueue_script( 'zbs-js-customerfilters-v1', ZEROBSCRM_URL . '/js/ZeroBSCRM.admin.customerfilters' . wp_scripts_get_suffix() . '.js', array( 'jquery' ), $zbs::VERSION );
	}

	#} Media Manager
	function zeroBSCRM_enqueue_media_manager(){
		wp_enqueue_media();
		wp_enqueue_script( 'custom-header' );
	}
	add_action('admin_enqueue_scripts', 'zeroBSCRM_enqueue_media_manager');

function zeroBSCRM_add_admin_segmenteditor_scripts($hook) {

	global $zbs;

	// if our page page=zbs-add-edit&action=edit&zbstype=segment
	if(isset($_GET['page']) && $_GET['page'] == $zbs->slugs['addedit'] && isset($_GET['zbstype']) && $_GET['zbstype'] == 'segment'){
		
		// NOTE: these are used in mail campaigns v2, make sure if change name here, change there
		wp_enqueue_script( 'zbs-segmentedit-js');
		wp_enqueue_style( 'zbs-segmentedit-css');
		zeroBSCRM_enqueue_libs_js_momentdatepicker();
	}
    
}
add_action( 'admin_enqueue_scripts', 'zeroBSCRM_add_admin_segmenteditor_scripts');


// MAIL TEMPLATES
#} Code Editor - limit to only our edit templates slug... :) 
function zeroBSCRM_mailTemplatesEnqueue(){
	global $zbs, $pagenow;

	$slug = ''; if (isset($_GET['page'])) $slug = sanitize_text_field($_GET['page']);
    if ( $slug != $zbs->slugs['email-templates']) {
        return;
    }

	if(isset($_GET['zbs_template_editor']) && !empty($_GET['zbs_template_editor'])){
		if($_GET['zbs_template_editor'] != 1){
			return;
		}
	}

	if(!isset($_GET['zbs_template_editor'])){
		return;
	}
   
    // Enqueue code editor and settings for manipulating HTML.
    $settings = wp_enqueue_code_editor( array( 'type' => 'text/html' ) );
 
    // Bail if user disabled CodeMirror.
    if ( false === $settings ) {
        return;
    }

    // pass codemirror setting for read-only
    if ( !isset( $settings['codemirror'] ) ){
    	$settings['codemirror'] = array();
    }
    $settings['codemirror']['readOnly'] = true;
    
    wp_add_inline_script(
        'code-editor',
        sprintf(
            'jQuery( function() { wp.codeEditor.initialize( "zbstemplatehtml", %s ); } );',
            wp_json_encode( $settings )
        )
    );
}
add_action( 'admin_enqueue_scripts', 'zeroBSCRM_mailTemplatesEnqueue');


#} ===============================================================================
#} === / Unsorted Styles from pre v3.0
#} ===============================================================================


function zeroBSCRM_admin_styles_exportTools(){

	global $zbs;
	
	wp_register_style( 'zbs-adm-css-export', plugins_url( '/css/ZeroBSCRM.admin.export' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array( 'zbs-wp-semanticui' ), $zbs::VERSION );

	wp_enqueue_style( 'zbs-adm-css-export' );
}


/**
 * Styles and scripts for resources page
 */
function jpcrm_crm_resources_page_styles_scripts() {

	global $zbs;
	wp_enqueue_style( 'jpcrm-crm-sync-resources-page', plugins_url( '/css/JetpackCRM.admin.resources-page' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ) );

}

/**
 * Styles and scripts for support page
 */
function jpcrm_support_page_styles_scripts() {

	global $zbs;

	wp_enqueue_style( 'jpcrm-support-page', plugins_url( 'css/jpcrm.admin.support-page' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );
}

// used in form templates & shortcode outputted forms.
// https://wordpress.stackexchange.com/questions/165754/enqueue-scripts-styles-when-shortcode-is-present
function zeroBSCRM_forms_scriptsStylesRegister(){

	global $zbs;

	// js
	wp_register_script( 'zbsfrontendformsjs', plugins_url( '/js/ZeroBSCRM.public.leadform' . wp_scripts_get_suffix() . '.js', ZBS_ROOTFILE ), array( 'jquery' ), $zbs::VERSION );

	// css
	wp_register_style( 'zbsfrontendformscss', plugins_url( '/css/ZeroBSCRM.public.frontendforms' . wp_scripts_get_suffix() . '.css', ZBS_ROOTFILE ), array(), $zbs::VERSION );

}
add_action( 'wp_enqueue_scripts', 'zeroBSCRM_forms_scriptsStylesRegister');
