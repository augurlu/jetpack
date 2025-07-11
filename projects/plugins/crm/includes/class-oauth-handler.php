<?php 
/*!
 * Jetpack CRM
 * https://jetpackcrm.com
 *
 * OAuth connection handler.
 *
 */
namespace Automattic\JetpackCRM;
use League\OAuth2\Client\Provider\Google;
use League\OAuth2\Client\Grant\RefreshToken;
use Google\Client;
use Google\Service\Gmail;

// block direct access
defined( 'ZEROBSCRM_PATH' ) || exit( 0 );

class Oauth_Handler {

	/* 
	* Enabled.
	*/
	private $enabled = true;

	/* 
	* Debug output?
	*/
	private $debug = true;

	/**
	 * Callback url base (url which oauth bounces back to) (has provider attached via `get_callback_url()`)
	 */
	private $providers = array(

		'google_mail' => array(
			'name'      => 'Google Mail',
			'provider'  => 'google_mail', // means we'll use 'provider_google_mail()' instead of 'provider_generic()'
			'docs_url'  => 'https://kb.jetpackcrm.com/knowledge-base/using-gmail-with-jetpack-crm-mail-delivery-system/#setting-up-gmail-oauth-connection-and-mail-delivery-method',

			// required for refreshing tokens generically:
			// https://github.com/thephpleague/oauth2-google/blob/main/src/Provider/Google.php#L39
        	'url_authorize'               => 'https://accounts.google.com/o/oauth2/v2/auth',
        	'url_access_token'            => 'https://oauth2.googleapis.com/token',
        	'url_resource_owner_details'  => 'https://openidconnect.googleapis.com/v1/userinfo',

        	// required scopes
			/* Scopes: https://developers.google.com/gmail/api/auth/scopes

				https://www.googleapis.com/auth/gmail.compose
				https://www.googleapis.com/auth/gmail.send
				Google_Service_Gmail::GMAIL_READONLY
			*/
        	'scopes'                      => array( 'https://www.googleapis.com/auth/gmail.send' )
		)

	);


	/**
	 * Init
	 */
	public function __construct() {
		// Add our action to the stack
		add_filter( 'jpcrm_listener_actions', array( $this, 'add_listener_action' ), 1 );

		// set action for endpoint listener to fire, so we can catch oauth requests (if any)
		add_action( 'jpcrm_listener_oauth', array( $this, 'catch_oauth_request' ), 10 );
	}


	/**
	 * Uses package installer to ensure packages are installed
	 */
	public function ensure_packages_installed() {

		global $zbs;

		$zbs->load_package_installer();
		$zbs->ensure_package_installed( 'oauth_dependencies', 1.0 );

	}



	/**
	 * Return enabled state
	 */
	public function enabled() {

		return $this->enabled;

	}


	/**
	 * Include league/oauth2-client, (well, in fact, autoload /vendor)
	 * Either: league/oauth2-client
	 * https://oauth2-client.thephpleague.com/usage/
	 * Or: league/oauth2-google
	 * https://github.com/thephpleague/oauth2-google
	 * 
	 */


	/**
	 * Returns a provider class (typically generated by `provider_generic()`, but allows exceptions, (e.g. `provider_google_mail()`))
	 */
	public function provider( $provider_key, $args=array() ){

		// see if we have a unique provider class (e.g. google_mail)
		$provider_info = $this->get_provider( $provider_key );

		if ( isset( $provider_info['provider'] ) && method_exists( $this, 'provider_' . $provider_info['provider'] ) ){

			// use custom provider
			return call_user_func_array( array( $this, 'provider_' . $provider_info['provider'] ), $args );

		} else {

			// use generic provider
			return $this->provider_generic( $args );

		}

	}


	/**
	 * Returns a generic provider instance
	 */
	public function provider_generic( $args=array() ){

		global $zbs;

        // ============ LOAD ARGS =============
        $default_args = array(

        	'id'                      => '',
        	'secret'                  => '',
        	'redirect_uri'            => '',

        	'urlAuthorize'            => '',
        	'urlAccessToken'          => '',
        	'urlResourceOwnerDetails' => ''

        ); foreach ($default_args as $argK => $argV){ $$argK = $argV; if (is_array($args) && isset($args[$argK])) {  if (is_array($args[$argK])){ $newData = $$argK; if (!is_array($newData)) $newData = array(); foreach ($args[$argK] as $subK => $subV){ $newData[$subK] = $subV; }$$argK = $newData;} else { $$argK = $args[$argK]; } } }
        // ============ / LOAD ARGS =============

		// make sure our dependencies are installed
		$this->ensure_packages_installed();

		// build provider
		return new \League\OAuth2\Client\Provider\GenericProvider([
    		'clientId'                => $id,                     // The client ID assigned to you by the provider
		    'clientSecret'            => $secret,                 // The client password assigned to you by the provider
		    'redirectUri'             => $redirect_uri,           // 'https://my.example.com/your-redirect-url/',
		    'urlAuthorize'            => $urlAuthorize,           // 'https://service.example.com/authorize',
		    'urlAccessToken'          => $urlAccessToken,         // 'https://service.example.com/token',
		    'urlResourceOwnerDetails' => $urlResourceOwnerDetails //'https://service.example.com/resource'
		]);

	}


	/**
	 * Returns Google Mail provider instance
	 */
	public function provider_google_mail( $args=array() ){

        // ============ LOAD ARGS =============
        $default_args = array(

        	'id'                      => '',
        	'secret'                  => ''

        ); foreach ($default_args as $argK => $argV){ $$argK = $argV; if (is_array($args) && isset($args[$argK])) {  if (is_array($args[$argK])){ $newData = $$argK; if (!is_array($newData)) $newData = array(); foreach ($args[$argK] as $subK => $subV){ $newData[$subK] = $subV; }$$argK = $newData;} else { $$argK = $args[$argK]; } } }
        // ============ / LOAD ARGS =============

		// make sure our dependencies are installed
		$this->ensure_packages_installed();

		// args
		$args = array(
		    'clientId'     => $id,
		    'clientSecret' => $secret,
		    'redirectUri'  => $this->get_callback_url( 'google_mail' ),
		    'accessType'   => 'offline', // Required to get a refreshToken
		    'scopes'       => $this->get_provider_detail( 'google_mail', 'scopes' )
		);

		// Hosted Domain, optional; used to restrict access to users on your G Suite/Google Apps for Business accounts
		/* We could later expose this via setting, but leaving unrestricted is more useful for now
		$domain = $zbs->get_domain();
		if ( $domain ){
			$args['hostedDomain'] = $domain;
		}
		*/

		// other params: https://github.com/thephpleague/oauth2-google
		// prompt, scopes, accessType

		// return provider
		return new Google( $args );

	}


	/*
	 * Add our listener action to the stack
	 *
	*/
	public function add_listener_action( $actions = array() ) {

		$actions[] = 'oauth';

		return $actions;

    
	}


	/*
	 * Catch OAuth requests
	 * Fired on load, catches any oauth responses inbound
	*/
	public function catch_oauth_request() {

		// at this point the Endpoint_Listener layer has verified the call via `is_listener_request()`

		// split by oauth providers, retrieve provider
		$provider = sanitize_text_field( $_GET['jpcrm_oauth_provider'] );

		if ( $this->legitimate_provider( $provider ) ){

			// got auth function? (e.g. `catch_google_mail_authorisation`)
			if ( method_exists( $this, 'catch_' . $provider . '_authorisation' ) ){

				// make sure our dependencies are installed
				$this->ensure_packages_installed();

				return call_user_func_array( array( $this, 'catch_' . $provider . '_authorisation' ), array() );

			}

		}

	}


	/*
	* Catch Google Mail Authorisation requests
	* https://github.com/thephpleague/oauth2-google
	*/
	public function catch_google_mail_authorisation(){

		// at this point the Endpoint_Listener layer has verified the call via `is_listener_request()`
		
		global $zbs;

		// require admin
		if ( !zeroBSCRM_isZBSAdminOrAdmin() ){

			return false;

		}

		// retrieve keys
		$config = $this->get_provider_config( 'google_mail' );
		if ( !is_array( $config ) || empty( $config['id'] ) || empty( $config['secret'] ) ){

			// not yet setup, needs id/secret
			$this->display_alert( 
				'info', 
				__( 'Google API Credentials needed', 'zero-bs-crm' ),
				'<p>' . __( 'To authenticate this OAuth connection you\'ll first need to add API credentials.', 'zero-bs-crm' ) . '</p>'
			    . '<p style="text-align:center"><a href="' . jpcrm_esc_link( $zbs->slugs['settings'] . '&tab=oauth&edit-provider=google_mail' ) . '" class="ui button green">' . __( 'Add your credentials', 'zero-bs-crm' ) . '</a></p>',
				'',
				'', 
				true // exit
			);

		} else {

			$google_client_id     = $config['id'];
			$google_client_secret = $config['secret'];

		}

		// quick check
		if ( empty( $google_client_id ) || empty( $google_client_secret ) ){
			return false;
		}

		// start session
		// Remove if session.auto_start=1 in php.ini
		session_start();

		// args
		$args = array(
		    'id'           => $google_client_id,
		    'secret'       => $google_client_secret
		);

		// retrieve provider
		$provider = $this->provider_google_mail( $args );

		// process
		if ( !empty( $_GET['error'] ) ){

		    // Got an error, probably user denied access
			$error_string = htmlspecialchars( $_GET['error'], ENT_QUOTES, 'UTF-8' );
			$this->display_alert( 
				'warning', 
				sprintf( __( 'Google API Connection Error %s', 'zero-bs-crm' ), '#1' ),
				'<p>' . __( 'There was an error connecting to Google:', 'zero-bs-crm' ) . '</p>'
				. '<p><code>' . $error_string . '</code></p>',
				'',
				'', 
				true // exit
			);

		} elseif ( empty( $_GET['code'] ) ) {

		    // If we don't have an authorization code then redirect to get one
		    $authorisation_url = $provider->getAuthorizationUrl(['prompt' => 'consent', 'access_type' => 'offline']);
		    $_SESSION['oauth2state'] = $provider->getState();
		    header( 'Location: ' . $authorisation_url );
			exit( 0 );

		} elseif ( empty( $_GET['state'] ) || ( $_GET['state'] !== $_SESSION['oauth2state'] ) ) {
			// State is invalid, possible CSRF attack in progress
			// (though to get here we'd need to be admin, so probably this'll never fire)
			unset( $_SESSION['oauth2state'] );
			exit( 0 );
		} else {

			try {

			    // Try to get an access token (using the authorization code grant)
			    $token = $provider->getAccessToken('authorization_code', [
			        'code' => $_GET['code']
			    ]);

			    // save token (override any existing)
			    $config['token']         = $token->getToken();
			    $config['refresh_token'] = $token->getRefreshToken();
			    $config['expires']       = $token->getExpires();

			    try {

				    // verify:
				    if ( !$token->hasExpired() ){

		        		$resource_owner = $provider->getResourceOwner( $token );
		        		$resource_owner = $resource_owner->toArray();

		        		// if this is an array, we're definitely connected!
		        		if ( is_array( $resource_owner ) && isset( $resource_owner['email']) ){

		        			// here we can save any meta :)
		        			// (in gmail case, might be useful for mail delivery methods)
		        			if ( !isset( $config['meta'] ) || !is_array( $config['meta'] ) ){
		        				$config['meta'] = array();
		        			}

			        		/* Example:
			        		Array
							(
							    [sub] => 111285058559146358423
							    [name] => Woody Hayday
							    [given_name] => Woody
							    [family_name] => Hayday
							    [picture] => https://lh3.googleusercontent.com/a-/AOh14GgBbDQY4COolmrmvq1G4w_NQdirrJfGSPraw8LzEA=s96-c
							    [email] => woodyhayday@gmail.com
							    [email_verified] => 1
							    [locale] => en-GB
							)
							*/

		        			$fields = array( 'name', 'given_name', 'family_name', 'picture', 'email', 'email_verified', 'locale' );
		        			foreach ( $fields as $field_key ){

			        			if ( isset( $resource_owner[ $field_key ] ) ){
			        				$config['meta'][ $field_key ] = sanitize_text_field( $resource_owner[ $field_key ] );
			        			}

			        		}

		        		}

		        		// Save 
        				$this->update_provider_config( 'google_mail', $config );

        				// visual output
        				$account_details = $resource_owner['email'];
        				if ( isset( $resource_owner['picture'] ) && !empty( $resource_owner['picture'] ) ){

        					$account_details = '<img src="' . $resource_owner['picture'] . '" alt="" style="max-width:60px;margin:1em" />' . $account_details;

        				}

						$this->display_alert(
							'info', 
							__( 'Google API Connection Complete', 'zero-bs-crm' ),
							'<p>' . __( 'You have successfully connected the following Google account to your CRM:', 'zero-bs-crm' ) . '</p>'
							. '<div style="display: flex;align-items: center;justify-content: center;">' . $account_details . '</div>'
							. '<p>' . __( 'You can now close this window and return to your settings page.', 'zero-bs-crm' ) . '</p>',
							'',
							'', 
							true,
							true // refresh on parent close
						);


				    }

				} catch ( Exception $e ){

					$this->display_alert( 
						'warning', 
						sprintf( __( 'Google API Connection Error %s', 'zero-bs-crm' ), '#2' ),
						'<p>' . __( 'There was an error connecting to Google:', 'zero-bs-crm' ) . '</p>'
						. '<p><code>' . $e->getMessage() . '</code></p>',
						'',
						'', 
						true // exit
					);

				}


			} catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

				$this->display_alert( 
					'warning', 
					sprintf( __( 'Google API Connection Error %s', 'zero-bs-crm' ), '#3' ),
					'<p>' . __( 'There was an error connecting to Google:', 'zero-bs-crm' ) . '</p>'
					. '<p><code>' . $e->getMessage() . '</code></p>',
					'',
					'', 
					true // exit
				);

			}

		}
	}


	/*
	 * Retrieve a callback url with provider affixed
	*/
	public function get_callback_url( $provider ){

		global $zbs;

		if ( $this->legitimate_provider( $provider ) ){

			// load listener if it's not already loaded
			$zbs->load_listener();

			return $zbs->listener->get_callback_url( 'oauth' ) . '&jpcrm_oauth_provider=' . urlencode( $provider );

		}

		return false;

	}

	/*
	 * Checks if a provider is on the list
	*/
	public function legitimate_provider( $provider ){

		if ( !empty( $provider ) && in_array( $provider, array_keys( $this->providers ) ) ){

			return true;

		}

		return false;

	}

	/*
	* Retrieves a provider detail, (e.g. google's 'url_authorize')
	*/
	public function get_provider_detail( $provider, $attribute_key ){

		if ( isset( $this->providers[ $provider ] ) && isset( $this->providers[ $provider ][ $attribute_key ] ) ){

			return $this->providers[ $provider ][ $attribute_key ];

		}

		return false;

	}


	/*
	 * Returns provider summary details
	*/
	public function get_provider( $provider ){

		if ( isset( $this->providers[ $provider ] ) ){

			return $this->providers[ $provider ];

		}

	}

	/*
	 * Returns providers array
	*/
	public function get_providers( ){

		return $this->providers;

	}


	/*
	 * get config/token for a provider
	 *
	 * @param string $provider_key - e.g. 'google_mail'
	*/
	public function get_provider_config( $provider_key, $return_token_string_only=false, $refresh_token_if_expired=true ){

		global $zbs;

		// basic check
		if ( !$this->legitimate_provider( $provider_key ) ){
			return false;
		}

		// retrieve token configs as they are
		$existing_token_configs = $zbs->settings->get( 'oauth_tokens', false );

		// retrieve
		if ( is_array( $existing_token_configs ) && isset( $existing_token_configs[ $provider_key ] ) ){

			// get current
			$token_config = $existing_token_configs[ $provider_key ];
			$token_config['expires'] = (int)$token_config['expires'];

			// if expired and $refresh_token_if_expired, regen
			if ( $refresh_token_if_expired && !empty( $token_config['token'] ) && isset( $token_config['expires'] ) && $token_config['expires'] < time() ){

				$this->debug_message( 'Found token which has expired!<br>' );

				// refresh token
				$refreshed_token_config = $this->refresh_token( $provider_key, $token_config );

				if ( is_array( $refreshed_token_config ) ){

					// success
					$token_config = $refreshed_token_config;

				} else {

					// failed refreshing token
					return false;

				}

			}

			// if only the token itself, return that
			if ( $return_token_string_only ){

				return $token_config['token'];

			}

			// else return the whole token info array
			return $token_config;

		}

		// no such token
		return false;

	}


	/*
	 * Update config/token for a provider
	 *
	 * @param string $provider - e.g. 'google_mail'
	 * @param array $args
	*/
	public function update_provider_config( $provider, $args=array() ){

		global $zbs;

        // ============ LOAD ARGS =============
        $default_args = array(

        	'id'            => '',
        	'secret'        => '',
        	'token'         => '',
        	'refresh_token' => '',
        	'expires'       => '',
        	'meta'          => array()

        ); foreach ($default_args as $argK => $argV){ $$argK = $argV; if (is_array($args) && isset($args[$argK])) {  if (is_array($args[$argK])){ $newData = $$argK; if (!is_array($newData)) $newData = array(); foreach ($args[$argK] as $subK => $subV){ $newData[$subK] = $subV; }$$argK = $newData;} else { $$argK = $args[$argK]; } } }
        // ============ / LOAD ARGS =============

		// basic check
		if ( !$this->legitimate_provider( $provider ) ){
			return false;
		}

		// retrieve tokens as they are
		$existing_token_configs = $zbs->settings->get( 'oauth_tokens', false );

		// check is an array
		if ( !is_array( $existing_token_configs ) ) {
			$existing_token_configs = array();
		}

		// hard override
		$existing_token_configs[ $provider ] = array(

			// credentials
			'id'               => $id,
			'secret'           => $secret,

			// token
			'token'            => $token,
			'expires'          => $expires,
			'refresh_token'    => $refresh_token,
			'last_updated_by'  => zeroBSCRM_user(),
			'last_updated'     => time(),

			// optional, per provider extras
			'meta'             => $meta

		);

		// update
		$zbs->settings->update( 'oauth_tokens', $existing_token_configs );

	}


	/*
	 * Delete config/token for a provider
	 *
	 * @param string $provider - e.g. 'google_mail'
	*/
	public function delete_provider_config( $provider ){

		global $zbs;

		// retrieve tokens as they are
		$existing_token_configs = $zbs->settings->get( 'oauth_tokens', false );

		// if exists
		if ( isset( $existing_token_configs[ $provider ] ) ){
			
			// direct unset
			unset( $existing_token_configs[ $provider ] );

			// update
			$zbs->settings->update( 'oauth_tokens', $existing_token_configs );
			
			return true;

		}

		return false;

	}


	/*
	 * Refreshes a user token and returns
	 *
	 * @param string $provider_key - e.g. `google_mail`
	 * @param array|bool $provider_config - either the config (if already available), or false (and this function will load it)
	 *
	 * @return array - updated token config
	*/
	public function refresh_token( $provider_key, $provider_config=false ){

		// if no config, load it
		if ( !is_array( $provider_config ) ){

			// note false for third parameter `refresh_token_if_expired` - this is to avoid an infinite loop
			$provider_config = $this->get_provider_config( $provider_key, false, false );

		}

		// got refresh token?
		if ( !isset( $provider_config['refresh_token'] ) || empty( $provider_config['refresh_token'] ) ){

			return false;

		}

		// make sure our dependencies are installed
		$this->ensure_packages_installed();

		// if we have a specific function for this provider, defer to that:
		if ( method_exists( $this, 'refresh_token_' . $provider_key ) ){

			return call_user_func_array( array( $this, 'refresh_token_' . $provider_key ), array( $provider_config ) );

		}

		// otherwise, generic...
		
		$this->debug_message( 'Refreshing access token...' );

		// build args
		$args = array(


        	'id'                      => $provider_config['id'],
        	'secret'                  => $provider_config['secret'],
        	'redirect_uri'            => $this->get_callback_url( $provider_key ),


        	'urlAuthorize'            => $this->get_provider_detail( $provider_key, 'url_authorize' ),
        	'urlAccessToken'          => $this->get_provider_detail( $provider_key, 'url_access_token' ),
        	'urlResourceOwnerDetails' => $this->get_provider_detail( $provider_key, 'url_resource_owner_details' )


		);

		// retrieve provider
		$provider = $this->provider( $provider_key, $args );

		try {

			// generate new token (generic)
			// https://oauth2-client.thephpleague.com/usage/#refreshing-a-token
			$new_token = $provider->getAccessToken('refresh_token', [
		        'refresh_token' => $provider_config['refresh_token']
			]);

			// success?
			if ( !empty( $new_token->getToken() ) ){

				$this->debug_message( 'Success!' );

				$new_refresh_token = $new_token->getRefreshToken();
				
				// when a new refresh token isn't set, keep the old one
				if ( empty( $new_refresh_token ) ){
					$new_refresh_token = $provider_config['refresh_token'];
				}

				// save it
				$config = $this->get_provider_config( $provider_key, false, false );
				$config['token'] = $new_token->getToken();
			    $config['refresh_token'] = $new_refresh_token;
				$config['expires'] = $new_token->getExpires();
			        		
				$this->update_provider_config( $provider_key, $config );

				// return it
				return $config;

			}


		} catch ( \League\OAuth2\Client\Provider\Exception\IdentityProviderException $e ){

			$this->debug_message( 'Error refreshing token: ' . $e->getMessage() );

			switch ( $e->getMessage() ){

				case 'invalid_request':
				default:

					// Something wrong with the request
					$this->debug_message( '<pre>' . print_r( $e->getResponseBody(), 1 ) . '</pre>' );

					// clear tokens
					$config = $this->get_provider_config( $provider_key, false, false );
					$config['token'] = '';
					$config['expires'] = '';
					$config['refresh_token'] = '';				        		
					$this->update_provider_config( $provider_key, $config );

					break;
			}

		}

		return false;

	}

	/*
	 * Refreshes a Google mail user token and returns refreshed provider config
	 *
	 * @param array|bool $provider_config - either the config (if already available), or false (and this function will load it)
	 *
	 * @return array - updated token config
	*/
	public function refresh_token_google_mail( $provider_config=false ){

		// if no config, load it
		if ( !is_array( $provider_config ) ){

			// note false for third parameter `refresh_token_if_expired` - this is to avoid an infinite loop
			$provider_config = $this->get_provider_config( 'google_mail', false, false );

		}

		// got refresh token?
		if ( !isset( $provider_config['refresh_token'] ) || empty( $provider_config['refresh_token'] ) ){

			return false;

		}

		// make sure our dependencies are installed
		$this->ensure_packages_installed();

		// build arguments
		$args = array(

        	'id'                      => $provider_config['id'],
        	'secret'                  => $provider_config['secret']

        );

		// retrieve provider
		$provider = $this->provider_google_mail( $args );

		// grant type
		$grant = new RefreshToken();

		$this->debug_message( 'Refreshing Google Token...' );

		try {

			$new_token = $provider->getAccessToken( $grant, [ 'refresh_token' => $provider_config['refresh_token'] ] );
			$new_refresh_token = $new_token->getRefreshToken();

			// when a new refresh token isn't set, keep the old one
			if ( empty( $new_refresh_token ) ){
				$new_refresh_token = $provider_config['refresh_token'];
			}


			$this->debug_message( 'Success!' );

			// save it
			$config = $this->get_provider_config( 'google_mail', false, false );
			$config['token']         = $new_token->getToken();
		    $config['refresh_token'] = $new_refresh_token;
			$config['expires']       = $new_token->getExpires();
		        		
			$this->update_provider_config( 'google_mail', $config );

			return $config;

		} catch ( \League\OAuth2\Client\Provider\Exception\IdentityProviderException $e ){

			$this->debug_message( 'Error refreshing Google token: ' . $e->getMessage() );
			$this->debug_message( '<pre>' . print_r( $e->getResponseBody(), 1 ) . '</pre>' );

			// clear expired/faulty token
			$config = $this->get_provider_config( 'google_mail', false, false );
			$config['token'] = '';
			$config['expires'] = '';
			$config['refresh_token'] = '';		        		
			$this->update_provider_config( 'google_mail', $config );

		}		

		return false;

	}


	/*
	 * Returns a connection status (bool) for provider from a provider key or config
	 * Note: Could be hardened by using oauth to re-verify valid token
	 *
	 * @param string $provider - e.g. 'google_mail'
	 * @param array|bool $provider_config - if passed, validity of config is checked
	*/
	public function connection_status( $provider, $provider_config=false ){	   	

		// load if not provided
		if ( !is_array( $provider_config ) ){
   			$provider_config = $this->get_provider_config( $provider );
   		}

   		// got config?
   		if ( is_array( $provider_config ) && !empty( $provider_config['id'] ) && !empty( $provider_config['secret'] ) ){	   		

	        if (
	        	isset( $provider_config['refresh_token'] ) && !empty( $provider_config['refresh_token'] ) 
	        	&&
	        	isset( $provider_config['expires'] ) && !empty( $provider_config['expires'] )
	        ){

	   			return true;

	        }

	    }

	    return false;

	}


	/*
	 * Returns a connection status string for provider
	 *
	 * @param string $provider - e.g. 'google_mail'
	 * @param bool $shorthand - if true will return 'connected' instead of longform html status
	*/
	public function connection_status_string( $provider, $shorthand=false ){
	   	
	   	$status = __( 'Not yet configured', 'zero-bs-crm' );
	   	$short_status = 'no-config';

   		$provider_config = $this->get_provider_config( $provider );

   		// got config?
   		if ( is_array( $provider_config ) && !empty( $provider_config['id'] ) && !empty( $provider_config['secret'] ) ){

	   		$status = __( 'Not yet connected', 'zero-bs-crm' );
	   		$short_status = 'config-no-connect';

	        if (
	        	isset( $provider_config['refresh_token'] ) && !empty( $provider_config['refresh_token'] ) 
	        	&&
	        	isset( $provider_config['expires'] ) && !empty( $provider_config['expires'] )
	        ){

	   			$short_status = 'seems-connected';

            	// some providers can give specific user info to enrich the status string:
            	switch ( $provider ){

            		case 'google_mail':

            			$username = __( 'Generic User', 'zero-bs-crm' );
            			if ( isset( $provider_config['meta'] ) && is_array( $provider_config['meta'] ) ){

            				if ( isset( $provider_config['meta']['name'] ) ){

            					$username = $provider_config['meta']['name'];

            				}

            				if ( isset( $provider_config['meta']['email'] ) ){

            					if ( !empty( $username ) ){
            						$username .= ' ';
            					}

            					$username .= '(' . $provider_config['meta']['email'] . ')';

            				}


            			}


            			$status =  '<span class="ui green label">' . sprintf( __( 'Connected as %s', 'zero-bs-crm' ), $username ) . '</span>';

            			break;

            		default:

                		$status =  '<span class="ui green label">' . __( 'Connected', 'zero-bs-crm' ) . '</span>';

                	break;

                }

	        }

	    }

	    if ( $shorthand ){
	    	
	    	return $short_status;

	    }

        return $status;

	}


	/*
	 * Wrapper for outputting messages, abstracted in case we want to phase into a stack system
	 * There are surely better ways...
	*/
	private function display_alert( $msg_class='', $msg_header='', $msg_html='', $icon_class='', $id='', $singular=false, $refresh_parent = false ){

		// if $singular we're just showing the error as a single page (as used in OAuth flow)
		if ( $singular ){

			?><html>
			<head>
				<link rel="stylesheet" type="text/css" href="<?php echo esc_url( plugins_url( '/build/lib/semantic-ui-css/semantic.min.css', ZBS_ROOTFILE ) ); /* phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedStylesheet */ ?>">
				<style>
					body {
						vertical-align: middle;
    					display: flex;
					}
					#jpcrm-oauth-error-wrapper {
					    max-width: 600px;
					    margin: auto;
					    vertical-align: middle;
					}
				</style>
				<?php
				if ( $refresh_parent ) {
					?>
					<script>
						// reloads parent window
						window.opener.location.reload();
					</script>
				<?php } ?>
			</head>
			<body>
				<div id="jpcrm-oauth-error-wrapper">
					<?php

		}
		
		// err msg
		echo zeroBSCRM_UI2_messageHTML( $msg_class, $msg_header, $msg_html, $icon_class, $id );

		if ( $singular ){

			?></div></body></html><?php

			exit( 0 );

		}

	}

	/*
	* Output debug, if enabled
	*/
	private function debug_message( $message ){

		if ( $this->debug ){

			echo $message;

		}

	}

	/**
	* Returns an authorized Google API client.
	* 
	* @param string $provider_key - key of OAuth provider to use
	* 
	* @return Client the authorized client object
	*/
	// adapted from class-v3-zerobscrm-googlecontact.php
	function get_google_client( $provider_key ){

		// make sure our dependencies are installed
		$this->ensure_packages_installed();

		// retrieve config
		$provider_config = $this->get_provider_config( $provider_key );

		if ( is_array( $provider_config ) && ! empty( $provider_config['token'] ) ) {

			//modified from: https://developers.google.com/people/quickstart/php  since we will always be getting 'offline' access so does not need to re-ask user
			$client = new \Google_Client();

			$client->setAccessType('offline');
			$client->setClientId( $provider_config['id'] );
			$client->setClientSecret( $provider_config['secret'] );
			$client->setAccessToken( $provider_config['token'] );
			$client->setScopes('https://www.googleapis.com/auth/gmail.send');

			return $client;

		}

		return false;
	}
}
