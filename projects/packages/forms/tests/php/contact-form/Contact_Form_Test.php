<?php
/**
 * Unit Tests for Automattic\Jetpack\Forms\Contact_Form.
 *
 * To run the test visit the packages/forms directory and run composer test-php
 *
 * @package automattic/jetpack-forms
 */

namespace Automattic\Jetpack\Forms\ContactForm;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Before;
use PHPUnit\Framework\Attributes\BeforeClass;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Group;
use WorDBless\BaseTestCase;
use WorDBless\Posts;
use WP_Block;

/**
 * Test class for Contact_Form
 *
 * @covers Automattic\Jetpack\Forms\ContactForm\Contact_Form
 * @covers \Automattic\Jetpack\Forms\ContactForm\Contact_Form_Field
 * @covers \Automattic\Jetpack\Forms\ContactForm\Contact_Form_Plugin
 * @covers \Automattic\Jetpack\Forms\ContactForm\Util
 */
#[CoversClass( Contact_Form::class )]
#[CoversClass( Contact_Form_Field::class )]
#[CoversClass( Contact_Form_Plugin::class )]
#[CoversClass( Util::class )]
class Contact_Form_Test extends BaseTestCase {

	private $post;

	private $track_feedback_inserted;

	private $plugin;

	/**
	 * Sets up the test environment before the class tests begin.
	 *
	 * @beforeClass
	 */
	#[BeforeClass]
	public static function set_up_class() {
		define( 'DOING_AJAX', true ); // Defined so that 'exit' is not called in process_submission.

		// Remove any relevant filters that might exist before running the tests.
		remove_all_filters( 'grunion_still_email_spam' );
		remove_all_filters( 'jetpack_contact_form_is_spam' );
		remove_all_filters( 'wp_mail' );
	}

	/**
	 * Inserts globals needed to process contact form submits
	 */
	private function set_globals() {
		$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
		$_SERVER['HTTP_USER_AGENT'] = 'unit-test';
		$_SERVER['HTTP_REFERER']    = 'test';
	}

	/**
	 * Sets up the test environment before each unit test.
	 *
	 * @before
	 */
	#[Before]
	public function set_up_test_case() {
		// Avoid actually trying to send any mail.
		add_filter( 'pre_wp_mail', '__return_true', PHP_INT_MAX );
		$this->track_feedback_inserted = array();
		$this->set_globals();

		$author_id = wp_insert_user(
			array(
				'user_email' => 'john@example.com',
				'user_login' => 'test_user',
				'user_pass'  => 'abc123',
			)
		);

		$post_id = wp_insert_post(
			array(
				'post_title'   => 'abc',
				'post_content' => 'def',
				'post_status'  => 'draft',
				'post_author'  => $author_id,
			),
			true
		);

		global $post;
		$post = get_post( $post_id );

		// Place post_id to contact form id to make the form processable.
		$_POST['contact-form-id'] = $post_id;

		// Make the global post (used by contact forms) accessbile to tests.
		$this->post = $post;

		// Initialize plugin.
		$this->plugin = Contact_Form_Plugin::init();
		// Call to add tokenization hook.
		$this->plugin->process_form_submission();
	}

	/**
	 * Tears down the test environment after each unit test.
	 */
	public function tear_down() {
		// Remove filters after running tests.
		remove_all_filters( 'wp_mail' );
		remove_all_filters( 'grunion_still_email_spam' );
		remove_all_filters( 'jetpack_contact_form_is_spam' );

		// Reset the forms array
		Contact_Form::$forms        = array();
		Contact_Form::$last         = null;
		Contact_Form::$current_form = null;
	}

	/**
	 * Adds the field values to the global $_POST value.
	 *
	 * @param array  $values Array of form fields and values.
	 * @param string $form_id Optional form ID. If not provided, will use $this->post->ID.
	 */
	private function add_field_values( $values, $form_id = null ) {
		$prefix = $form_id ? $form_id : 'g' . $this->post->ID;
		$_POST  = array();
		foreach ( $values as $key => $val ) {
			if ( strpos( $key, 'contact-form' ) === 0 || strpos( $key, 'action' ) === 0 ) {
				$_POST[ $key ] = $val;
			} else {
				$_POST[ $prefix . '-' . $key ] = $val;
			}
		}
	}

	/**
	 * Tests that the submission as a whole will produce something in the
	 * database when required information is provided.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_store_a_feedback_correctly_with_default_form() {
		$form   = new Contact_Form( array() );
		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );
		$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match' );

		// Default metadata should be saved.
		$email = get_post_meta( $submission->ID, '_feedback_email', true );
		$this->assertEquals( 'john <john@example.com>', $email['to'][0] );
		$this->assertStringContainsString( 'IP Address: 127.0.0.1', $email['message'] );
	}

	/**
	 * Test the success_message method when customThankyou is set to 'message'.
	 */
	public function test_success_message_with_custom_thankyou_message() {
		// Create a form with customThankyou = 'message'
		$form = new Contact_Form(
			array(
				'customThankyou'        => 'message',
				'customThankyouMessage' => 'Thank you <span class="highlight" style="color:green">very much</span> for your submission!',
			)
		);

		// Call the method
		$success_message = Contact_Form::success_message( 1, $form );

		// Verify that the message contains our custom thank you with allowed HTML elements
		$this->assertStringContainsString( '<span class="highlight" style="color:green">very much</span>', $success_message );
		$this->assertStringContainsString( 'Thank you', $success_message );
		$this->assertStringContainsString( 'for your submission', $success_message );
	}

	/**
	 * Test the success_message method when customThankyou is not set to 'message'.
	 * This test uses a real form submission and relies on get_compiled_form.
	 */
	public function test_success_message_with_compiled_form() {
		// Create a form submission
		$this->add_field_values(
			array(
				'name'    => 'John Doe',
				'email'   => 'john@example.com',
				'message' => 'Test message',
			)
		);

		// Create a contact form
		$form = new Contact_Form(
			array(
				'customThankyou' => 'redirect', // Any value that's not 'message'
			),
			"[contact-field label='Name' type='name' required='1'/][contact-field label='Email' type='email' required='1'/][contact-field label='Message' type='textarea' required='1'/]"
		);

		// Process the submission to create a feedback post
		$result = $form->process_submission();
		$this->assertTrue( is_string( $result ), 'Form submission should be successful' );

		// Get the feedback ID from the most recent post
		$feedback_id = end( Posts::init()->posts )->ID;

		// Call the success_message method
		$success_message = Contact_Form::success_message( $feedback_id, $form );

		// Verify the success message format
		$this->assertStringContainsString( '<div class="field-name">Name:</div>', $success_message );
		$this->assertStringContainsString( '<div class="field-value">John Doe</div>', $success_message );
		$this->assertStringContainsString( '<div class="field-name">Email:</div>', $success_message );
		$this->assertStringContainsString( '<div class="field-value">john@example.com</div>', $success_message );
	}

	/**
	 * Test the escape_and_sanitize_field_value method.
	 */
	public function test_escape_and_sanitize_field_value() {
		// Test empty value
		$this->assertSame( '', Contact_Form::escape_and_sanitize_field_value( '' ) );
		$this->assertSame( '', Contact_Form::escape_and_sanitize_field_value( null ) );

		// Test file upload field structure
		$file_upload_value = array(
			'field_id' => 'test_upload',
			'files'    => array(
				array(
					'file_id' => '12345',
					'name'    => 'test-document.pdf',
					'size'    => 1024,
				),
				array(
					'file_id' => '67890',
					'name'    => 'another-document.docx',
					'size'    => 2048,
				),
			),
		);

		$result = Contact_Form::escape_and_sanitize_field_value( $file_upload_value );
		$this->assertStringContainsString( 'test-document.pdf', $result );
		$this->assertStringContainsString( 'another-document.docx', $result );
		$this->assertStringContainsString( '<span class="jetpack-forms-file-size">', $result );
		$this->assertStringContainsString( '(1 KB)', $result );
		$this->assertStringContainsString( '(2 KB)', $result );

		// Test empty file upload field
		$empty_file_upload = array(
			'field_id' => 'test_upload',
			'files'    => array(),
		);
		$this->assertSame( '', Contact_Form::escape_and_sanitize_field_value( $empty_file_upload ) );

		// Test regular array values
		$array_value = array( 'option 1', 'option 2', 'option 3' );
		$this->assertEquals( 'option 1, option 2, option 3', Contact_Form::escape_and_sanitize_field_value( $array_value ) );

		// Test value with brackets (should be escaped)
		$bracket_value = 'This is a [test] with brackets';
		$result        = Contact_Form::escape_and_sanitize_field_value( $bracket_value );
		$this->assertEquals( 'This is a &#091;test&#093; with brackets', $result );

		// Test value with HTML (should be stripped)
		$html_value = 'This has <strong>HTML</strong> tags';
		$result     = Contact_Form::escape_and_sanitize_field_value( $html_value );
		$this->assertEquals( 'This has HTML tags', $result );

		// Test value with newlines (should be converted to <br>)
		$multiline_value = "Line 1\nLine 2\nLine 3";
		$result          = Contact_Form::escape_and_sanitize_field_value( $multiline_value );
		$this->assertEquals( "Line 1<br />\nLine 2<br />\nLine 3", $result );

		// Test deeply nested array
		$nested_array = array(
			array( 'item1', 'item2' ),
			array( 'item3', 'item4' ),
		);
		$result       = Contact_Form::escape_and_sanitize_field_value( $nested_array );
		$this->assertEquals( 'item1, item2, item3, item4', $result );
	}

	/**
	 * Tests that the submission as a whole will produce something in the
	 * database when required information is provided.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_not_store_ip() {
		add_filter( 'jetpack_contact_form_forget_ip_address', '__return_true' );
		$form   = new Contact_Form( array() );
		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );

		// Default metadata should be saved.
		$email = get_post_meta( $submission->ID, '_feedback_email', true );
		$this->assertStringNotContainsString( 'IP Address', $email['message'] );
		remove_all_filters( 'jetpack_contact_form_forget_ip_address' );
	}

	/**
	 * Tests that the submission as a whole will produce something in the
	 * database when some labels are provided.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_store_extra_field_metadata() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'     => 'John Doe',
				'dropdown' => 'First option',
				'radio'    => 'Second option',
				'text'     => 'Texty text',
			)
		);

		// Initialize a form with name, dropdown and radiobutton (first, second
		// and third option), text field.
		$form   = new Contact_Form( array(), "[contact-field label='Name' type='name' required='1'/][contact-field label='Dropdown' type='select' options='First option,Second option,Third option'/][contact-field label='Radio' type='radio' options='First option,Second option,Third option'/][contact-field label='Text' type='text'/]" );
		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );
		$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match' );

		// Default metadata should be saved.
		$extra_fields = get_post_meta( $submission->ID, '_feedback_extra_fields', true );

		$this->assertCount( 3, $extra_fields, 'There should be exactly three extra fields when one of the fields is name, and the others are an extra dropdown, radio button field and text field' );

		/*
		 * Metadata starts counting from 5, because post content has:
		 *   1_Name
		 *   2_Dropdown
		 *   3_Radio
		 *   4_Text
		 */
		$this->assertEquals( 'First option', $extra_fields['5_Dropdown'], 'When the first option of a dropdown field with label Dropdown is selected, there should be metadata with that key and value' );
		$this->assertEquals( 'Second option', $extra_fields['6_Radio'], 'When the first option of a radio button field with label Radio is selected, there should be metadata with that key and value' );
		$this->assertEquals( 'Texty text', $extra_fields['7_Text'], 'When the text field with label Text is filled with the text \'Texty text\', there should be metadata with that key and value' );
	}

	/**
	 * Tests that the submission will store the subject when specified.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_store_subject_when_specified() {
		$form   = new Contact_Form( array( 'subject' => 'I\'m sorry, but the party\'s over' ) ); // Default form.
		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );
		$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match' );

		// Default metadata should be saved.
		$this->assertStringContainsString( 'SUBJECT: I\\\'m sorry, but the party\\\'s over', $submission->post_content, 'The stored subject didn\'t match the given' );
	}

	/**
	 * Tests that the submission will store the subject with tokens replace using the name and text fields.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_store_subject_with_token_replaced_from_name_and_text_field() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'  => 'John Doe',
				'state' => 'Kansas',
			)
		);

		$form = new Contact_Form( array( 'subject' => 'Hello {name} from {state}!' ), "[contact-field label='Name' type='name' required='1'/][contact-field label='State' type='text'/]" );

		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );
		$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match' );

		$this->assertStringContainsString( 'SUBJECT: Hello John Doe from Kansas!', $submission->post_content, 'The stored subject didn\'t match the given' );
	}

	/**
	 * Tests that the submission will store the subject with a token replaced using the radio button field.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_store_subject_with_token_replaced_from_radio_button_field() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'  => 'John Doe',
				'state' => 'Kansas',
			)
		);

		$form   = new Contact_Form( array( 'subject' => 'Hello {name} from {state}!' ), "[contact-field label='Name' type='name' required='1'/][contact-field label='State' type='radio' options='Kansas,California'/]" );
		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );
		$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match' );

		$this->assertStringContainsString( 'SUBJECT: Hello John Doe from Kansas!', $submission->post_content, 'The stored subject didn\'t match the given' );
	}

	/**
	 * Tests that the submission will store the subject with a token replaced using the dropdown field.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_store_subject_with_token_replaced_from_dropdown_field() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'  => 'John Doe',
				'state' => 'Kansas',
			)
		);

		$form   = new Contact_Form( array( 'subject' => 'Hello {name} from {state}!' ), "[contact-field label='Name' type='name' required='1'/][contact-field label='State' type='select' options='Kansas,California'/]" );
		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );
		$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match' );

		$this->assertStringContainsString( 'SUBJECT: Hello John Doe from Kansas!', $submission->post_content, 'The stored subject didn\'t match the given' );
	}

	/**
	 * Tests the form submission will store the fields and their values in the post content.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_store_fields_and_their_values_to_post_content() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'     => 'John Doe',
				'dropdown' => 'First option',
				'radio'    => 'Second option',
				'text'     => 'Texty text',
			)
		);

		// Initialize a form with name, dropdown and radiobutton (first, second
		// and third option), text field.
		$form   = new Contact_Form( array(), "[contact-field label='Name' type='name' required='1'/][contact-field label='Dropdown' type='select' options='First option,Second option,Third option'/][contact-field label='Radio' type='radio' options='First option,Second option,Third option'/][contact-field label='Text' type='text'/]" );
		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );
		$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match' );

		$this->assertStringContainsString( '\"1_Name\":\"John Doe\"', $submission->post_content, 'Post content did not contain the name label and/or value' );
		$this->assertStringContainsString( '\"2_Dropdown\":\"First option\"', $submission->post_content, 'Post content did not contain the dropdown label and/or value' );
		$this->assertStringContainsString( '\"3_Radio\":\"Second option\"', $submission->post_content, 'Post content did not contain the radio button label and/or value' );
		$this->assertStringContainsString( '\"4_Text\":\"Texty text\"', $submission->post_content, 'Post content did not contain the text field label and/or value' );
	}

	/**
	 * Tests that the form submission will store the fields and their value in the email meta.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_will_store_fields_and_their_values_to_email_meta() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'     => 'John Doe',
				'dropdown' => 'First option',
				'radio'    => 'Second option',
				'text'     => 'Texty text',
			)
		);

		// Initialize a form with name, dropdown and radiobutton (first, second
		// and third option), text field.
		$form   = new Contact_Form( array(), "[contact-field label='Name' type='name' required='1'/][contact-field label='Dropdown' type='select' options='First option,Second option,Third option'/][contact-field label='Radio' type='radio' options='First option,Second option,Third option'/][contact-field label='Text' type='text'/]" );
		$result = $form->process_submission();

		// Processing should be successful and produce the success message.
		$this->assertTrue( is_string( $result ) );

		$feedback_id = end( Posts::init()->posts )->ID;
		$submission  = get_post( $feedback_id );
		$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match' );

		$email = get_post_meta( $submission->ID, '_feedback_email', true );

		$expected  = '<p><strong>Name:</strong><br /><span>John Doe</span></p>';
		$expected .= '<p><strong>Dropdown:</strong><br /><span>First option</span></p>';
		$expected .= '<p><strong>Radio:</strong><br /><span>Second option</span></p>';
		$expected .= '<p><strong>Text:</strong><br /><span>Texty text</span></p>';

		$this->assertStringContainsString( $expected, $email['message'] );
	}

	/**
	 * Tests that the form subussion sends the correct single email.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_sends_correct_single_email() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'     => 'John Doe',
				'dropdown' => 'First option',
				'radio'    => 'Second option',
				'text'     => 'Texty text',
			)
		);

		add_filter( 'wp_mail', array( $this, 'pre_test_process_submission_sends_correct_single_email' ) );

		// Initialize a form with name, dropdown and radiobutton (first, second
		// and third option), text field.
		$form   = new Contact_Form(
			array(
				'to'      => 'john <john@example.com>',
				'subject' => 'Hello there!',
			),
			"[contact-field label='Name' type='name' required='1'/][contact-field label='Dropdown' type='select' options='First option,Second option,Third option'/][contact-field label='Radio' type='radio' options='First option,Second option,Third option'/][contact-field label='Text' type='text'/]"
		);
		$result = $form->process_submission();
		$this->assertNotNull( $result );
	}

	/**
	 * This method is hooked to the wp-mail filter.
	 *
	 * @param array $args A compacted array of wp_mail() arguments, including the "to" email,
	 *                    subject, message, headers, and attachments values.
	 */
	public function pre_test_process_submission_sends_correct_single_email( $args ) {
		$this->assertContains( 'john <john@example.com>', $args['to'] );
		$this->assertEquals( 'Hello there!', $args['subject'] );

		$expected  = '<p><strong>Name:</strong><br /><span>John Doe</span></p>';
		$expected .= '<p><strong>Dropdown:</strong><br /><span>First option</span></p>';
		$expected .= '<p><strong>Radio:</strong><br /><span>Second option</span></p>';
		$expected .= '<p><strong>Text:</strong><br /><span>Texty text</span></p>';

		$this->assertStringContainsString( $expected, $args['message'] );
	}

	/**
	 * Tests that the response template is generated correctly
	 */
	public function test_wrap_message_in_html_tags() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'     => 'John Doe',
				'dropdown' => 'First option',
				'radio'    => 'Second option',
				'text'     => 'Texty text',
			)
		);

		// Initialize a form with name, dropdown and radiobutton (first, second
		// and third option), text field.
		$form = new Contact_Form(
			array(
				'to'      => 'john@example.com, jane@example.com',
				'subject' => 'Hello there!',
			),
			"[contact-field label='Name' type='name' required='1'/][contact-field label='Dropdown' type='select' options='First option,Second option,Third option'/][contact-field label='Radio' type='radio' options='First option,Second option,Third option'/][contact-field label='Text' type='text'/]"
		);

		$title  = 'You got a new response!';
		$body   = 'Here are the details:';
		$footer = 'This is the footer';
		$result = $form->wrap_message_in_html_tags( $title, $body, $footer );

		$this->assertStringContainsString( $title, $result );
		$this->assertStringContainsString( $body, $result );
		$this->assertStringContainsString( $footer, $result );
	}

	/**
	 * Tests that the form subussion sends the correct multiple emails.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_sends_correct_multiple_email() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'     => 'John Doe',
				'dropdown' => 'First option',
				'radio'    => 'Second option',
				'text'     => 'Texty text',
			)
		);

		add_filter( 'wp_mail', array( $this, 'pre_test_process_submission_sends_correct_multiple_email' ) );

		// Initialize a form with name, dropdown and radiobutton (first, second
		// and third option), text field.
		$form = new Contact_Form(
			array(
				'to'      => 'john@example.com, jane@example.com',
				'subject' => 'Hello there!',
			),
			"[contact-field label='Name' type='name' required='1'/][contact-field label='Dropdown' type='select' options='First option,Second option,Third option'/][contact-field label='Radio' type='radio' options='First option,Second option,Third option'/][contact-field label='Text' type='text'/]"
		);

		$result = $form->process_submission();
		$this->assertNotNull( $result );
	}

	/**
	 * This method is hooked to the wp-mail filter.
	 *
	 * @param array $args A compacted array of wp_mail() arguments, including the "to" email,
	 *                    subject, message, headers, and attachments values.
	 */
	public function pre_test_process_submission_sends_correct_multiple_email( $args ) {
		$this->assertEquals( array( 'john <john@example.com>', 'jane <jane@example.com>' ), $args['to'] );
	}

	/**
	 * Tests that the form submission fails when spam is marked with a WP_Error object.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_fails_if_spam_marked_with_WP_Error() {
		add_filter( 'jetpack_contact_form_is_spam', array( $this, 'pre_test_process_submission_fails_if_spam_marked_with_WP_Error' ), 11 ); // Run after akismet filter.

		$form   = new Contact_Form( array() );
		$result = $form->process_submission();

		$this->assertInstanceOf( 'WP_Error', $result, 'When $is_spam contains a WP_Error, the result of process_submission should be a WP_Error' );
		$this->assertEquals( 'Message is spam', $result->get_error_message() );
	}

	/**
	 * This method is hooked to the jetpack_contact_form_is_spam filter.
	 */
	public function pre_test_process_submission_fails_if_spam_marked_with_WP_Error() {
		return new \WP_Error( 'spam', 'Message is spam' );
	}

	/**
	 * Tests that the form submission won't send if the submission is marked as spam.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_wont_send_spam_if_marked_as_spam_with_true() {
		add_filter( 'jetpack_contact_form_is_spam', '__return_true', 11 ); // Run after akismet filter.

		add_filter( 'wp_mail', array( $this, 'pre_test_process_submission_wont_send_spam_if_marked_as_spam_with_true' ) );

		$form   = new Contact_Form( array( 'to' => 'john@example.com' ) );
		$result = $form->process_submission();
		$this->assertNotNull( $result );
	}

	/**
	 * This method is hooked to the wp-mail filter, and the test will fail if this method is called.
	 */
	public function pre_test_process_submission_wont_send_spam_if_marked_as_spam_with_true() {
		$this->assertTrue( false ); // Fail if trying to send.
	}

	/**
	 * Tests that the email subject is labeled with Spam when the submission is spam and the filter to send spam is set to true.
	 *
	 * @author tonykova
	 */
	public function test_process_submission_labels_message_as_spam_in_subject_if_marked_as_spam_with_true_and_sending_spam() {
		add_filter( 'jetpack_contact_form_is_spam', '__return_true', 11 ); // Run after akismet filter.

		add_filter( 'grunion_still_email_spam', '__return_true' );

		add_filter( 'wp_mail', array( $this, 'pre_test_process_submission_labels_message_as_spam_in_subject_if_marked_as_spam_with_true_and_sending_spam' ) );

		$form   = new Contact_Form( array( 'to' => 'john@example.com' ) );
		$result = $form->process_submission();
		$this->assertNotNull( $result );
	}

	/**
	 * This method is hooked to the wp-mail filter.
	 *
	 * @param array $args A compacted array of wp_mail() arguments, including the "to" email,
	 *                    subject, message, headers, and attachments values.
	 */
	public function pre_test_process_submission_labels_message_as_spam_in_subject_if_marked_as_spam_with_true_and_sending_spam( $args ) {
		$this->assertStringContainsString( '***SPAM***', $args['subject'] );
	}

	/**
	 * Tests that 'grunion_delete_old_spam()' deletes an old post that is marked as spam.
	 *
	 * @author tonykova
	 */
	public function test_grunion_delete_old_spam_deletes_an_old_post_marked_as_spam() {
		// grunion_Delete_old_spam performs direct DB queries which cannot be tested outside of a working WP install.
		$this->markTestSkipped();
		// @phan-suppress-next-line PhanPluginUnreachableCode
		$post_id = wp_insert_post(
			array(
				'post_type'     => 'feedback',
				'post_status'   => 'spam',
				'post_date_gmt' => '1987-01-01 12:00:00',
			)
		);

		Util::grunion_delete_old_spam();
		$this->assertNull( get_post( $post_id ), 'An old spam feedback should be deleted' );
	}

	/**
	 * Tests that 'grunion_delete_old_spam' does not delete a new post that is marked as spam.
	 *
	 * @author tonykova
	 */
	public function test_grunion_delete_old_spam_does_not_delete_a_new_post_marked_as_spam() {
		$post_id = wp_insert_post(
			array(
				'post_title'  => 'testing',
				'post_contnt' => 'testing',
				'post_type'   => 'feedback',
				'post_status' => 'spam',
			)
		);

		Util::grunion_delete_old_spam();
		$this->assertEquals( $post_id, get_post( $post_id )->ID, 'A new spam feedback should be left intact when deleting old spam' );
	}

	public function test_parse_fields_from_content() {

		$comment_content      = 'This is a test comment content.';
		$comment_author       = 'Test User';
		$comment_author_email = 'test@email.com';
		$comment_author_url   = 'http://example.com';
		$comment_ip_text      = 'https://127.0.0.1';
		$subject              = 'Test Subject';
		$all_values           = array(
			'field1'                  => 'value1',
			'field2'                  => 'value2',
			'email_marketing_consent' => 'yes',
		);

		$content = addslashes( wp_kses( "$comment_content\n<!--more-->\nAUTHOR: {$comment_author}\nAUTHOR EMAIL: {$comment_author_email}\nAUTHOR URL: {$comment_author_url}\nSUBJECT: {$subject}\nIP: {$comment_ip_text}\nJSON_DATA\n" . wp_json_encode( $all_values ), array() ) );
		// Create a mock post with JSON_DATA format
		$post_id = wp_insert_post(
			array(
				'post_type'    => 'feedback',
				'post_status'  => 'publish',
				'post_content' => $content,
			)
		);

		// Parse fields from the post
		$fields = Contact_Form_Plugin::parse_fields_from_content( $post_id );

		// Assert that basic feedback fields were parsed correctly
		$this->assertEquals( $comment_author, $fields['_feedback_author'] );
		$this->assertEquals( $comment_author_email, $fields['_feedback_author_email'] );
		$this->assertEquals( $comment_author_url, $fields['_feedback_author_url'] );
		$this->assertEquals( $subject, $fields['_feedback_subject'] );
		$this->assertEquals( $comment_ip_text, $fields['_feedback_ip'] );

		// Assert that JSON data fields were parsed correctly
		$this->assertIsArray( $fields['_feedback_all_fields'] );
		$this->assertEquals( $all_values['field1'], $fields['_feedback_all_fields']['field1'] );
		$this->assertEquals( $all_values['field2'], $fields['_feedback_all_fields']['field2'] );
		$this->assertEquals( $all_values['email_marketing_consent'], $fields['_feedback_all_fields']['email_marketing_consent'] );

		// Test caching by calling the method again and ensuring the same object is returned
		$cached_fields = Contact_Form_Plugin::parse_fields_from_content( $post_id );
		$this->assertSame( $fields, $cached_fields );

		// Clean up
		wp_delete_post( $post_id, true );
	}

	public function test_parse_fields_from_content_form_submission() {
		// Fill field values.
		$this->add_field_values(
			array(
				'name'     => 'John Doe',
				'dropdown' => 'First option',
				'radio'    => 'Second option',
				'text'     => 'Texty text',
			)
		);

		// Initialize a form with name, dropdown and radiobutton (first, second
		// and third option), text field.
		$form = new Contact_Form( array(), "[contact-field label='Name' type='name' required='1'/][contact-field label='Dropdown' type='select' options='First option,Second option,Third option'/][contact-field label='Radio' type='radio' options='First option,Second option,Third option'/][contact-field label='Text' type='text'/]" );
		$form->process_submission();

		$post_id = end( Posts::init()->posts )->ID;
		$fields  = Contact_Form_Plugin::parse_fields_from_content( $post_id );

		// Assert basic feedback fields
		$this->assertEquals( 'John Doe', $fields['_feedback_author'] );
		$this->assertSame( '', $fields['_feedback_author_email'] );
		$this->assertSame( '', $fields['_feedback_author_url'] );
		$this->assertStringContainsString( 'abc', $fields['_feedback_subject'] );
		$this->assertEquals( '127.0.0.1', $fields['_feedback_ip'] );

		// Assert all fields array structure
		$this->assertIsArray( $fields['_feedback_all_fields'] );
		$this->assertEquals( 'John Doe', $fields['_feedback_all_fields']['1_Name'] );
		$this->assertEquals( 'First option', $fields['_feedback_all_fields']['2_Dropdown'] );
		$this->assertEquals( 'Second option', $fields['_feedback_all_fields']['3_Radio'] );
		$this->assertEquals( 'Texty text', $fields['_feedback_all_fields']['4_Text'] );

		// Check metadata fields
		$this->assertArrayHasKey( 'email_marketing_consent', $fields['_feedback_all_fields'] );
		$this->assertArrayHasKey( 'entry_title', $fields['_feedback_all_fields'] );
		$this->assertArrayHasKey( 'entry_permalink', $fields['_feedback_all_fields'] );
		$this->assertArrayHasKey( 'feedback_id', $fields['_feedback_all_fields'] );

		// Verify specific content
		$this->assertEquals( 'abc', $fields['_feedback_all_fields']['entry_title'] );
		$this->assertStringContainsString( 'example.org', $fields['_feedback_all_fields']['entry_permalink'] );
		$this->assertMatchesRegularExpression( '/^[a-f0-9]{32}$/', $fields['_feedback_all_fields']['feedback_id'] );

		wp_delete_post( $post_id, true );
	}

	/**
	 * Tests that token is left intact when there is not matching field.
	 *
	 * @author tonykova
	 */
	public function test_token_left_intact_when_no_matching_field() {
		$plugin       = Contact_Form_Plugin::init();
		$subject      = 'Hello {name}!';
		$field_values = array(
			'City' => 'Chicago',
		);

		$this->assertEquals( 'Hello {name}!', $plugin->replace_tokens_with_input( $subject, $field_values ) );
	}

	/**
	 * Tests that token is replaced with an empty string when there is not value in field.
	 *
	 * @author tonykova
	 */
	public function test_replaced_with_empty_string_when_no_value_in_field() {
		$plugin       = Contact_Form_Plugin::init();
		$subject      = 'Hello {name}!';
		$field_values = array(
			'Name' => null,
		);

		$this->assertEquals( 'Hello !', $plugin->replace_tokens_with_input( $subject, $field_values ) );
	}

	/**
	 * Tests that token in curly brackets is replaced with the value when the name has whitespace.
	 *
	 * @author tonykova
	 */
	public function test_token_can_replace_entire_subject_with_token_field_whose_name_has_whitespace() {
		$plugin       = Contact_Form_Plugin::init();
		$subject      = '{subject token}';
		$field_values = array(
			'Subject Token' => 'Chicago',
		);

		$this->assertEquals( 'Chicago', $plugin->replace_tokens_with_input( $subject, $field_values ) );
	}

	/**
	 * Tests that token with curly brackets is replaced with value.
	 *
	 * @author tonykova
	 */
	public function test_token_with_curly_brackets_can_be_replaced() {
		$plugin       = Contact_Form_Plugin::init();
		$subject      = '{subject {token}}';
		$field_values = array(
			'Subject {Token}' => 'Chicago',
		);

		$this->assertEquals( 'Chicago', $plugin->replace_tokens_with_input( $subject, $field_values ) );
	}

	/**
	 * Tests that the field attributes remain the same when no escaping is necessary.
	 *
	 * @author tonykova
	 */
	public function test_parse_contact_field_keeps_string_unchanged_when_no_escaping_necesssary() {
		$shortcode = '[contact-field label="Name" type="name" required="1"/][contact-field label="Email" type="email" required="1"/][contact-field label="asdasd" type="text"/][contact-field id="1" required derp herp asd lkj]adsasd[/contact-field]';
		$html      = do_shortcode( $shortcode );

		$this->assertEquals( $shortcode, $html );
	}

	/**
	 * Tests that the default label is added when no label is present.
	 */
	public function test_make_sure_that_we_add_default_label_when_non_is_present() {
		$shortcode = "[contact-field type='name' required='1' /]";
		$html      = do_shortcode( $shortcode );
		$this->assertEquals( '[contact-field type="name" required="1" label="Name"/]', $html );
	}

	/**
	 * Tests the empty options are removed from form fields.
	 */
	public function test_make_sure_that_we_remove_empty_options_from_form_field() {
		$shortcode = "[contact-field type='select' required='1' options='fun,,run' label='fun times' values='go,,have some fun'/]";
		$html      = do_shortcode( $shortcode );
		$this->assertEquals( '[contact-field type="select" required="1" options="fun,run" label="fun times" values="go,have some fun"/]', $html );
	}

	/**
	 * Tests shortcode with commas and brackets.
	 */
	public function test_array_values_with_commas_and_brackets() {
		$shortcode = "[contact-field type='radio' options='\"foo\",bar&#044; baz,&#091;b&#092;rackets&#093;' label='fun &#093;&#091; times'/]";
		$html      = do_shortcode( $shortcode );
		$this->assertEquals( '[contact-field type="radio" options="&quot;foo&quot;,bar&#044; baz,&#091;b&#092;rackets&#093;" label="fun &#093;&#091; times"/]', $html );
	}

	/**
	 * Tests Gutenblock input with commas and brackets.
	 */
	public function test_array_values_with_commas_and_brackets_from_gutenblock() {
		$attr  = array(
			'type'    => 'radio',
			'options' => array( '"foo"', 'bar, baz', '[b\\rackets]' ),
			'label'   => 'fun ][ times',
		);
		$block = array(
			'blockName' => 'jetpack/field-radio',
		);
		$html  = Contact_Form_Plugin::gutenblock_render_field_radio( $attr, '', new WP_Block( $block ) );
		$this->assertEquals( '[contact-field type="radio" options="&quot;foo&quot;,bar&#044; baz,&#091;b&#092;rackets&#093;" label="fun &#093;&#091; times"/]', $html );
	}

	/**
	 * Test for text field_renders
	 */
	public function test_make_sure_text_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'text',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-text',
			'class'               => 'lalala',
			'default'             => 'foo',
			'placeholder'         => 'PLACEHOLDTHIS!',
			'id'                  => 'funID',
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'text' ) );
		$this->assertValidField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Test for email field_renders
	 */
	public function test_make_sure_email_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'email',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-email',
			'class'               => 'lalala',
			'default'             => 'foo',
			'placeholder'         => 'PLACEHOLDTHIS!',
			'id'                  => 'funID',
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'email' ) );
		$this->assertValidField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Test for url field_renders
	 */
	public function test_make_sure_url_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'url',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-url',
			'class'               => 'lalala',
			'default'             => 'foo',
			'placeholder'         => 'PLACEHOLDTHIS!',
			'id'                  => 'funID',
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'text' ) );
		$this->assertValidField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Test for telephone field_renders
	 */
	public function test_make_sure_telephone_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'telephone',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-telephone',
			'class'               => 'lalala',
			'default'             => 'foo',
			'placeholder'         => 'PLACEHOLDTHIS!',
			'id'                  => 'funID',
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'tel' ) );
		$this->assertValidField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Test for date field_renders
	 */
	public function test_make_sure_date_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'date',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-date',
			'class'               => 'lalala',
			'default'             => 'foo',
			'placeholder'         => 'PLACEHOLDTHIS!',
			'id'                  => 'funID',
			'format'              => '(YYYY-MM-DD)',
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'text' ) );
		$this->assertValidField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Test for textarea field_renders.
	 */
	public function test_make_sure_textarea_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'textarea',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-textarea',
			'class'               => 'lalala',
			'default'             => 'foo',
			'placeholder'         => 'PLACEHOLDTHIS!',
			'id'                  => 'funID',
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'textarea' ) );
		$this->assertValidField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Test for checkbox field_renders.
	 */
	public function test_make_sure_checkbox_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'checkbox',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-checkbox',
			'class'               => 'lalala',
			'default'             => 'foo',
			'placeholder'         => 'PLACEHOLDTHIS!',
			'id'                  => 'funID',
			'optionclasses'       => 'option-tomato option-lettuce',
			'optionstyles'        => 'color:cheese;font-size:11px;',
			'labelclasses'        => 'label-tomato label-lettuce',
			'labelstyles'         => 'color:beef;font-size:22px;',
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'checkbox' ) );
		$this->assertValidCheckboxField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Multiple fields.
	 */
	public function test_make_sure_checkbox_multiple_field_renders_as_expected() {
		$attributes          = array(
			'label'               => 'fun',
			'type'                => 'checkbox-multiple',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-checkbox-multiple',
			'class'               => 'lalala',
			'default'             => 'option 1',
			'id'                  => 'funID',
			'options'             => array( 'option 1', 'option 2' ),
			'values'              => array( 'option 1', 'option 2' ),
			'optionclasses'       => 'option-cheese option-ham',
			'inputclasses'        => 'input-tomato input-lettuce',
			'optionsdata'         => wp_json_encode(
				array(
					array(
						'label' => 'option 1',
						'class' => 'has-text-color',
						'style' => 'color:caramel; font-size:14px;',
					),
					array(
						'label' => 'option 2',
						'class' => 'has-text-color',
						'style' => 'color:gummy; font-size:14px;',
					),
				)
			),
		);
		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'checkbox' ) );
		$this->assertValidFieldMultiField( $this->render_field( $attributes ), $expected_attributes );
	}

	public function test_make_sure_form_outlined_checkbox_multiple_field_renders_as_expected() {
		$attributes              = array(
			'label'               => 'fun',
			'type'                => 'checkbox-multiple',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-checkbox-multiple',
			'class'               => 'lalala',
			'default'             => 'option 1',
			'id'                  => 'funID',
			'options'             => array( 'option 1', 'option 2' ),
			'values'              => array( 'option 1', 'option 2' ),
			'optionclasses'       => 'option-cheese option-ham',
			'inputclasses'        => 'input-tomato input-lettuce',
			'optionsdata'         => wp_json_encode(
				array(
					array(
						'label' => 'option 1',
						'class' => 'has-text-color',
						'style' => 'color:caramel; font-size:14px;',
					),
					array(
						'label' => 'option 2',
						'class' => 'has-text-color',
						'style' => 'color:gummy; font-size:14px;',
					),
				)
			),
		);
		$contact_form_attributes = array(
			'className' => 'is-style-outlined',
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'checkbox' ) );

		$this->assertValidFieldMultiField( $this->render_field( $attributes, $contact_form_attributes ), $expected_attributes, $contact_form_attributes );
	}

	/**
	 * Test for radio field_renders
	 */
	public function test_make_sure_radio_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'radio',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-radio',
			'class'               => 'lalala',
			'default'             => 'option 1',
			'id'                  => 'funID',
			'options'             => array( 'option 1', 'option 2', 'option 3, or 4', 'back\\slash' ),
			'values'              => array( 'option 1', 'option 2', 'option [34]', '\\' ),
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'radio' ) );

		$this->assertValidFieldMultiField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Test for radio field_renders with block style classes.
	 */
	public function test_make_sure_radio_field_renders_as_expected_with_block_style_classes() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'radio',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-radio',
			'class'               => 'lalala',
			'default'             => 'option 1',
			'id'                  => 'funID',
			'options'             => array( 'option 1', 'option 2', 'option 3, or 4', 'back\\slash' ),
			'values'              => array( 'option 1', 'option 2', 'option [34]', '\\' ),
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'radio' ) );

		$this->assertValidFieldMultiField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Test for select field_renders
	 */
	public function test_make_sure_select_field_renders_as_expected() {
		$attributes = array(
			'label'               => 'fun',
			'type'                => 'select',
			'fieldwrapperclasses' => 'wp-block-jetpack-field-select',
			'class'               => 'lalala',
			'default'             => 'option 1',
			'id'                  => 'funID',
			'options'             => array( 'option 1', 'option 2', 'option 3, or 4', 'back\\slash' ),
			'values'              => array( 'option 1', 'option 2', 'option [34]', '\\' ),
		);

		$expected_attributes = array_merge( $attributes, array( 'input_type' => 'select' ) );
		$this->assertValidFieldMultiField( $this->render_field( $attributes ), $expected_attributes );
	}

	/**
	 * Renders a Contact_Form_Field.
	 *
	 * @param array $attributes An associative array of shortcode attributes.
	 * @param array $contact_form_attributes An associative array of attributes to pass to the Contact_Form constructor.
	 *
	 * @return string The field html string.
	 */
	public function render_field( $attributes, $contact_form_attributes = array() ) {
		$form  = new Contact_Form( $contact_form_attributes );
		$field = new Contact_Form_Field( $attributes, '', $form );
		return $field->render();
	}

	/**
	 * Gets the first div in the input html.
	 *
	 * @param string $html The html string.
	 * @param array  $contact_form_attributes An associative array containing the contact form's attributes.
	 *
	 * @return DOMElement The first div element.
	 */
	public function getCommonDiv( $html, $contact_form_attributes = array() ) {
		$doc = new DOMDocument();
		$doc->loadHTML( $html );
		$first_el = $this->getFirstElement( $doc, 'div' );
		/**
		 * If the contact form has the `is-style-outlined` class name, we need to get the second div element.
		 * This is because, to achieve the outlined effect, the first div is the wrapper div, and the second div is the field wrapper div.
		 */
		if ( isset( $contact_form_attributes['className'] ) && 'is-style-outlined' === $contact_form_attributes['className'] ) {
			$first_el = $this->getFirstElement( $doc, 'div', 1 );
		}
		return $first_el;
	}

	/**
	 * Gets the first element in the given DOMDocument object.
	 *
	 * @param DOMDocument|DOMElement $dom The DOMDocument object.
	 * @param string                 $tag The tag name.
	 * @param int                    $index The index.
	 *
	 * @return DOMElement|null The first element with the given tag.
	 */
	public function getFirstElement( $dom, $tag, $index = 0 ) {
		$elements = $dom->getElementsByTagName( $tag );
		$element  = $elements->item( $index );
		return $element instanceof DOMElement ? $element : null;
	}

	/**
	 * Tests whether the class attribute in the wrapper div matches the field's class attribute value.
	 *
	 * @param DOMElement $wrapper_div The wrapper div.
	 * @param array      $attributes An associative array containing the field's attributes.
	 */
	public function assertFieldClasses( $wrapper_div, $attributes ) {
		if ( 'date' === $attributes['type'] ) {
			$attributes['class'] = 'jp-contact-form-date';
		}

		/*
		 * $attributes['optionclasses'] is passed to Contact_Form_Field->render_field()
		 * via $field_class and applied to the wrapper div.
		 */
		$options_classes_wrap = '';
		if ( isset( $attributes['optionclasses'] ) ) {
			$options_classes = explode( ' ', $attributes['optionclasses'] );
			foreach ( $options_classes as $option_class ) {
				$options_classes_wrap .= " {$option_class}-wrap";
			}
		}

		/*
		 * $attributes['inputclasses'] is passed to Contact_Form_Field->render_field()
		 * via $field_class applied to the wrapper div.
		 */
		$input_classes_wrap = '';
		if ( isset( $attributes['inputclasses'] ) ) {
			$input_classes = explode( ' ', $attributes['inputclasses'] );
			foreach ( $input_classes as $input_class ) {
				$input_classes_wrap .= " {$input_class}-wrap";
			}
		}

		// Multiple classes are also added to the wrapper div with the -wrap suffix.
		$classes_wrap = '';
		if ( isset( $attributes['class'] ) ) {
			$wrapper_classes = explode( ' ', $attributes['class'] );
			foreach ( $wrapper_classes as $wrapper_class ) {
				if ( $wrapper_class ) {
					$classes_wrap .= " {$wrapper_class}-wrap";
				}
			}
		}

		$css_class         = "wp-block-jetpack-field-{$attributes['type']} grunion-field-{$attributes['type']}-wrap{$classes_wrap}{$input_classes_wrap}{$options_classes_wrap} grunion-field-wrap";
		$wrapper_div_class = $wrapper_div->getAttribute( 'class' );

		$this->assertEquals(
			$css_class,
			$wrapper_div_class,
			'div class attribute doesn\'t match'
		);
	}

	/**
	 * Tests whether the input class attribute matches the field's class attribute value.
	 *
	 * @param DOMElement $input The input element.
	 * @param array      $attributes An associative array containing the field's attributes.
	 */
	public function assertInputClasses( $input, $attributes ) {
		/*
		 * $attributes['optionclasses'] is passed to
		 * Contact_Form_Field->render_checkbox_multiple_field() as $class
		 * and applied to the input.
		 */
		$options_classes_input = '';
		if ( isset( $attributes['optionclasses'] ) ) {
			$options_classes = explode( ' ', $attributes['optionclasses'] );
			foreach ( $options_classes as $option_class ) {
				$options_classes_input .= " {$option_class}";
			}
		}

		/*
		 * $attributes['inputclasses'] is passed to Contact_Form_Field->render_field()
		 * via $field_class applied to the wrapper div.
		 */
		$input_classes_input = '';
		if ( isset( $attributes['inputclasses'] ) ) {
			$input_classes = explode( ' ', $attributes['inputclasses'] );
			foreach ( $input_classes as $input_class ) {
				$input_classes_input .= " {$input_class}";
			}
		}

		// Multiple classes are also added to the input element, with the exception of is-style-* classes.
		$classes_input = '';
		if ( isset( $attributes['class'] ) ) {
			$input_classes = explode( ' ', $attributes['class'] );
			foreach ( $input_classes as $input_class ) {
				if ( strpos( $input_class, 'is-style-' ) !== false ) {
					continue;
				}
				$classes_input .= " {$input_class}";
			}
		}
		$this->assertEquals(
			$attributes['type'] . $classes_input . $input_classes_input . $options_classes_input . ' grunion-field',
			$input->getAttribute( 'class' ),
			'input class attribute doesn\'t match'
		);
	}

	/**
	 * Tests whether the label class attribute matches the field's class attribute value.
	 *
	 * @param DOMElement $label The input element.
	 * @param array      $attributes An associative array containing the field's attributes.
	 * @param string     $classes_prefix The prefix of the classes.
	 */
	public function assertLabelClasses( $label, $attributes, $classes_prefix ) {
		/*
		 * $attributes['optionclasses'] is added to the label class attribute in
		 * render functions, e.g., Contact_Form_Field->render_checkbox_field().
		 */
		$options_classes_input = '';
		if ( isset( $attributes['optionclasses'] ) ) {
			$options_classes = explode( ' ', $attributes['optionclasses'] );
			foreach ( $options_classes as $option_class ) {
				$options_classes_input .= " {$option_class}";
			}
		}

		/*
		 * $attributes['labelclasses'] is assigned to $this->label_classes and applied in
		 * render functions, e.g., Contact_Form_Field->render_checkbox_field().
		 */
		$label_classes_input = '';
		if ( isset( $attributes['labelclasses'] ) ) {
			$label_classes = explode( ' ', $attributes['labelclasses'] );
			foreach ( $label_classes as $label_class ) {
				$label_classes_input .= " {$label_class}";
			}
		}

		$this->assertEquals(
			$classes_prefix . $label_classes_input . $options_classes_input,
			$label->getAttribute( 'class' ),
			'input class attribute doesn\'t match'
		);
	}

	/**
	 * Tests whether the label in the wrapper div matches the field's label.
	 *
	 * @param DOMElement $wrapper_div The wrapper div.
	 * @param array      $attributes An associative array containing the field's attributes.
	 * @param string     $tag_name The tag used to label the field. Could be `legend` for checkboxes
	 *                                                       and radio buttons.
	 */
	public function assertFieldLabel( $wrapper_div, $attributes, $tag_name = 'label' ) {
		$type     = $attributes['type'];
		$label    = $this->getFirstElement( $wrapper_div, $tag_name );
		$expected = 'date' === $type ? $attributes['label'] . ' ' . $attributes['format'] : $attributes['label'];

		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$this->assertEquals( $expected, trim( (string) $label->nodeValue ), 'Label is not what we expect it to be...' );
	}

	/**
	 * Tests whether a field is valid.
	 *
	 * @param string $html The html string.
	 * @param array  $attributes An associative array containing the field's attributes.
	 */
	public function assertValidField( $html, $attributes ) {

		$wrapper_div = $this->getCommonDiv( $html );
		$this->assertFieldClasses( $wrapper_div, $attributes );
		$this->assertFieldLabel( $wrapper_div, $attributes );

		// Get label.
		$label = $this->getFirstElement( $wrapper_div, 'label' );

		// Input.
		$input = (
			'textarea' === $attributes['type']
			? $this->getFirstElement( $wrapper_div, 'textarea' )
			: $this->getFirstElement( $wrapper_div, 'input' )
		);

		// Label matches for matches input ID.
		$this->assertEquals(
			$label->getAttribute( 'for' ),
			$input->getAttribute( 'id' ),
			'label for does not equal input ID!'
		);

		$this->assertEquals( $input->getAttribute( 'placeholder' ), $attributes['placeholder'], 'Placeholder doesn\'t match' );
		if ( 'textarea' === $attributes['type'] ) {
			// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			$this->assertEquals( $input->nodeValue, $attributes['default'], 'value and default doesn\'t match' );
			$this->assertEquals(
				$label->getAttribute( 'for' ),
				'contact-form-comment-' . $input->getAttribute( 'name' ),
				'label for doesn\'t match the input name'
			);
		} else {
			$this->assertEquals( $input->getAttribute( 'type' ), $attributes['input_type'], 'Type doesn\'t match' );
			$this->assertEquals( $input->getAttribute( 'value' ), $attributes['default'], 'value and default doesn\'t match' );
			// Label matches for matches input name.
			$this->assertEquals(
				$label->getAttribute( 'for' ),
				$input->getAttribute( 'name' ),
				'label for doesn\'t match the input name'
			);
		}

		if ( 'date' === $attributes['type'] ) {
			$this->assertEquals(
				$input->getAttribute( 'class' ),
				"{$attributes['type']} jp-contact-form-date grunion-field",
				'input class attribute doesn\'t match'
			);
		} else {
			$this->assertEquals(
				$input->getAttribute( 'class' ),
				"{$attributes['type']} {$attributes['class']} grunion-field",
				'input class attribute doesn\'t match'
			);
		}
	}

	/**
	 * Tests whether a checkbox field is valid.
	 *
	 * @param string $html The html string.
	 * @param array  $attributes An associative array containing the field's attributes.
	 */
	public function assertValidCheckboxField( $html, $attributes ) {

		$wrapper_div = $this->getCommonDiv( $html );
		$this->assertFieldClasses( $wrapper_div, $attributes );
		$this->assertFieldLabel( $wrapper_div, $attributes );

		$label = $wrapper_div->getElementsByTagName( 'label' )->item( 0 );
		$input = $wrapper_div->getElementsByTagName( 'input' )->item( 0 );

		$this->assertInstanceOf( DOMElement::class, $label );
		$this->assertInstanceOf( DOMElement::class, $input );

		$this->assertLabelClasses( $label, $attributes, 'grunion-field-label ' . $attributes['type'] );

		$this->assertEquals( $input->getAttribute( 'name' ), $attributes['id'], 'Input name doesn\'t match' );
		$this->assertEquals( 'Yes', $input->getAttribute( 'value' ), 'Input value doesn\'t match' );
		$this->assertEquals( $input->getAttribute( 'type' ), $attributes['type'], 'Input type doesn\'t match' );
		if ( $attributes['default'] ) {
			$this->assertEquals( 'checked', $input->getAttribute( 'checked' ), 'Input checked doesn\'t match' );
		}

		$styles = $label->getAttribute( 'style' );
		$this->assertEquals( $attributes['labelstyles'] . $attributes['optionstyles'], $styles, 'Label styles don\'t match' );
	}

	/**
	 * Tests whether a multifield contact form field is valid.
	 *
	 * @param string $html The html string.
	 * @param array  $attributes An associative array containing the field's attributes.
	 * @param array  $contact_form_attributes An associative array containing the contact form's attributes.
	 */
	public function assertValidFieldMultiField( $html, $attributes, $contact_form_attributes = array() ) {
		$wrapper_div = $this->getCommonDiv( $html, $contact_form_attributes );
		$this->assertFieldClasses( $wrapper_div, $attributes );

		// Inputs.
		if ( 'select' === $attributes['type'] ) {
			$label = $this->getFirstElement( $wrapper_div, 'label' );

			$this->assertFieldLabel( $wrapper_div, $attributes );
			$this->assertEquals( 'grunion-field-label select', $label->getAttribute( 'class' ), 'label class doesn\'t match' );

			$select = $this->getFirstElement( $wrapper_div, 'select' );
			$this->assertEquals(
				$label->getAttribute( 'for' ),
				$select->getAttribute( 'id' ),
				'label for does not equal input ID!'
			);

			$this->assertEquals(
				$label->getAttribute( 'for' ),
				$select->getAttribute( 'name' ),
				'label for does not equal input name!'
			);

			$select_wrapper = $wrapper_div->getElementsByTagName( 'div' )->item( 0 );
			// @phan-suppress-next-line PhanUndeclaredMethod
			$select_wrapper_class = $select_wrapper->getAttribute( 'class' ) ?? '';

			$this->assertEquals( 'contact-form__select-wrapper select ' . $attributes['class'] . ' grunion-field', $select_wrapper_class, ' select class does not match expected' );
			// Options.
			$options = $select->getElementsByTagName( 'option' );
			$n       = $options->length;
			$this->assertCount( $n, $attributes['options'], 'Number of inputs doesn\'t match number of options' );
			$this->assertCount( $n, $attributes['values'], 'Number of inputs doesn\'t match number of values' );
			for ( $i = 0; $i < $n; $i++ ) {
				$option = $options->item( $i );
				$this->assertInstanceOf( DOMElement::class, $option );
				$this->assertEquals( $option->getAttribute( 'value' ), $attributes['values'][ $i ], 'Input value doesn\'t match' );
				if ( 0 === $i ) {
					$this->assertEquals( 'selected', $option->getAttribute( 'selected' ), 'Input is not selected' );
				} else {
					$this->assertNotEquals( 'selected', $option->getAttribute( 'selected' ), 'Input is selected' );
				}
				//phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$this->assertEquals( $option->nodeValue, $attributes['options'][ $i ], 'Input does not match the option' );
			}
		} else {
			$label = $this->getFirstElement( $wrapper_div, 'legend' );

			$this->assertFieldLabel( $wrapper_div, $attributes, 'legend' );
			$this->assertEquals( 'grunion-field-label', $label->getAttribute( 'class' ), 'label class doesn\'t match' );
			// Radio and Checkboxes.
			$labels = $wrapper_div->getElementsByTagName( 'label' );
			$n      = $labels->length;
			$this->assertCount( $n, $attributes['options'], 'Number of inputs doesn\'t match number of options' );
			$this->assertCount( $n, $attributes['values'], 'Number of inputs doesn\'t match number of values' );
			for ( $i = 0; $i < $n; $i++ ) {
				$item_label = $labels->item( $i );
				//phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$this->assertEquals( $item_label->nodeValue, $attributes['options'][ $i ] );

				// @phan-suppress-next-line PhanUndeclaredMethod -- parentElement was only added in PHP 8.3, and Phan can't know that parentNode will be an element.
				$input = $item_label->parentNode->getElementsByTagName( 'input' )->item( 0 ); //phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$this->assertEquals( $input->getAttribute( 'type' ), $attributes['input_type'], 'Type doesn\'t match' );
				if ( 'radio' === $attributes['input_type'] ) {
					$this->assertEquals( $input->getAttribute( 'name' ), $attributes['id'], 'Input name doesn\'t match' );
				} else {
					$this->assertEquals( $input->getAttribute( 'name' ), $attributes['id'] . '[]', 'Input name doesn\'t match' );
				}
				$this->assertEquals( $input->getAttribute( 'value' ), $attributes['values'][ $i ], 'Input value doesn\'t match' );

				$this->assertInputClasses( $input, $attributes );

				if ( 0 === $i ) {
					$this->assertEquals( 'checked', $input->getAttribute( 'checked' ), 'Input checked doesn\'t match' );
				} else {
					$this->assertNotEquals( 'checked', $input->getAttribute( 'checked' ), 'Input checked doesn\'t match' );
				}

				if ( ! empty( $attributes['optionsdata'] ) ) {
					$filtered = array_filter(
						json_decode( $attributes['optionsdata'] ),
						function ( $option ) use ( $input ) {
							return $option->label === $input->getAttribute( 'value' );
						}
					);
					// Block styles and classes are applied to the option wrapper.
					$option = $item_label->parentNode;  //phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

					$option_data = array_values( $filtered )[0] ?? null;
					// @phan-suppress-next-line PhanUndeclaredMethod - Phan doesn't know that getAttribute is available. But it is.
					if ( ! empty( $item_label->getAttribute( 'style' ) ) ) {
						// @phan-suppress-next-line PhanUndeclaredMethod
						$this->assertEquals( $option->getAttribute( 'style' ), $option_data->style, 'Style doesn\'t match' );
					}
					// @phan-suppress-next-line PhanUndeclaredMethod
					if ( ! empty( $item_label->getAttribute( 'class' ) ) ) {
						// @phan-suppress-next-line PhanUndeclaredMethod
						$this->assertContains( $option_data->class, explode( ' ', $option->getAttribute( 'class' ) ), 'Class doesn\'t match' );
					}
				}
			}
		}
	}

	/**
	 * Tests that the form attributes and values are properly escaped.
	 *
	 * @author tonykova
	 */
	public function test_parse_contact_field_escapes_things_inside_a_value_and_attribute_and_the_content() {

		$shortcode = "[contact-field label='Name' type='name' required='1'/][contact-field label='Email' type=''email'' req'uired='1'/][contact-field label='asdasd' type='text'/][contact-field id='1' required 'derp' herp asd lkj]adsasd[/contact-field]";
		$html      = do_shortcode( $shortcode );

		/*
		 * The expected string has some quotes escaped, since we want to make
		 * sure we don't output anything harmful
		 */
		$this->assertEquals( '[contact-field label="Name" type="name" required="1"/][contact-field label="Email" type=&#039;&#039;email&#039;&#039; req&#039;uired=&#039;1&#039;/][contact-field label="asdasd" type="text"/][contact-field id="1" required derp herp asd lkj]adsasd[/contact-field]', $html );
	}

	/**
	 * Tests that the form content is trimmed
	 */
	public function test_parse_contact_field_trims_content() {

		$shortcode = '[contact-field id="1" required]     adsasd        [/contact-field]';
		$html      = do_shortcode( $shortcode );

		/*
		 * The expected string has some quotes escaped, since we want to make
		 * sure we don't output anything harmful
		 */
		$this->assertEquals( '[contact-field id="1" required]adsasd[/contact-field]', $html );
	}

	/**
	 * Test get_export_data_for_posts with fully vaid data input.
	 *
	 * @group csvexport
	 */
	#[Group( 'csvexport' )]
	public function test_get_export_data_for_posts_fully_valid_data() {
		/**
		 * Contact_Form_Plugin mock object.
		 *
		 * @var Contact_Form_Plugin $mock
		 */
		$mock = $this->getMockBuilder( Contact_Form_Plugin::class )
			->onlyMethods(
				array(
					'get_post_meta_for_csv_export',
					'get_parsed_field_contents_of_post',
					'get_post_content_for_csv_export',
					'map_parsed_field_contents_of_post_to_field_names',
					'has_json_data',
				)
			)
			->disableOriginalConstructor()
			->getMock();

		$get_post_meta_for_csv_export_map = array(
			array(
				15,
				false,
				array(
					'key1' => 'value1',
					'key2' => 'value2',
					'key3' => 'value3',
					'key4' => 'value4',

				),
			),
			array(
				16,
				false,
				array(
					'key3' => 'value3',
					'key4' => 'value4',
					'key5' => 'value5',
					'key6' => 'value6',
				),
			),
		);

		$get_parsed_field_contents_of_post_map = array(
			array( 15, array( '_feedback_subject' => 'subj1' ) ),
			array( 16, array( '_feedback_subject' => 'subj2' ) ),
		);

		$get_post_content_for_csv_export_map = array(
			array( 15, 'This is my test 15' ),
			array( 16, 'This is my test 16' ),
		);

		$mapped_fields_contents_map = array(
			array(
				array(
					'_feedback_subject'      => 'subj1',
					'_feedback_main_comment' => 'This is my test 15',
				),
				true,
				array(
					'Contact Form' => 'subj1',
					'4_Comment'    => 'This is my test 15',
				),
			),
			array(
				array(
					'_feedback_subject'      => 'subj2',
					'_feedback_main_comment' => 'This is my test 16',
				),
				true,
				array(
					'Contact Form' => 'subj2',
					'4_Comment'    => 'This is my test 16',
				),
			),
		);

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_post_meta_for_csv_export' )
			->willReturnMap( $get_post_meta_for_csv_export_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_parsed_field_contents_of_post' )
			->willReturnMap( $get_parsed_field_contents_of_post_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_post_content_for_csv_export' )
			->willReturnMap( $get_post_content_for_csv_export_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'map_parsed_field_contents_of_post_to_field_names' )
			->willReturnMap( $mapped_fields_contents_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'has_json_data' )
			->willReturn( false );

		$result = $mock->get_export_data_for_posts( array( 15, 16 ) );

		$expected_result = array(
			'Contact Form' => array( 'subj1', 'subj2' ),
			'key1'         => array( 'value1', '' ),
			'key2'         => array( 'value2', '' ),
			'key3'         => array( 'value3', 'value3' ),
			'key4'         => array( 'value4', 'value4' ),
			'key5'         => array( '', 'value5' ),
			'key6'         => array( '', 'value6' ),
			'4_Comment'    => array( 'This is my test 15', 'This is my test 16' ),
		);

		$this->assertEquals( $expected_result, $result );
	}

	/**
	 * Test get_export_data_for_posts with single invalid entry for post meta
	 *
	 * @group csvexport
	 */
	#[Group( 'csvexport' )]
	public function test_get_export_data_for_posts_invalid_single_entry_meta() {
		/**
		 * Contact_Form_Plugin mock object.
		 *
		 * @var Contact_Form_Plugin $mock
		 * */
		$mock = $this->getMockBuilder( Contact_Form_Plugin::class )
			->onlyMethods(
				array(
					'get_post_meta_for_csv_export',
					'get_parsed_field_contents_of_post',
					'get_post_content_for_csv_export',
					'map_parsed_field_contents_of_post_to_field_names',
				)
			)
			->disableOriginalConstructor()
			->getMock();

		$get_post_meta_for_csv_export_map = array(
			array( 15, false, null ),
			array(
				16,
				false,
				array(
					'key3' => 'value3',
					'key4' => 'value4',
					'key5' => 'value5',
					'key6' => 'value6',
				),
			),
		);

		$get_parsed_field_contents_of_post_map = array(
			array( 15, array( '_feedback_subject' => 'subj1' ) ),
			array( 16, array( '_feedback_subject' => 'subj2' ) ),
		);

		$get_post_content_for_csv_export_map = array(
			array( 15, 'This is my test 15' ),
			array( 16, 'This is my test 16' ),
		);

		$mapped_fields_contents_map = array(
			array(
				array(
					'_feedback_subject'      => 'subj1',
					'_feedback_main_comment' => 'This is my test 15',
				),
				true,
				array(
					'Contact Form' => 'subj1',
					'Comment'      => 'This is my test 15',
				),
			),
			array(
				array(
					'_feedback_subject'      => 'subj2',
					'_feedback_main_comment' => 'This is my test 16',
				),
				true,
				array(
					'Contact Form' => 'subj2',
					'Comment'      => 'This is my test 16',
				),
			),
		);

		// Even though there is no post meta for the first, we don't stop the cycle
		// and each mock expects two calls.
		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_post_meta_for_csv_export' )
			->willReturnMap( $get_post_meta_for_csv_export_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_parsed_field_contents_of_post' )
			->willReturnMap( $get_parsed_field_contents_of_post_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_post_content_for_csv_export' )
			->willReturnMap( $get_post_content_for_csv_export_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'map_parsed_field_contents_of_post_to_field_names' )
			->willReturnMap( $mapped_fields_contents_map );

		$result = $mock->get_export_data_for_posts( array( 15, 16 ) );

		$expected_result = array(
			'Contact Form' => array( 'subj1', 'subj2' ),
			'key3'         => array( '', 'value3' ),
			'key4'         => array( '', 'value4' ),
			'key5'         => array( '', 'value5' ),
			'key6'         => array( '', 'value6' ),
			'Comment'      => array( 'This is my test 15', 'This is my test 16' ),
		);

		$this->assertEquals( $expected_result, $result );
	}

	/**
	 * Test get_export_data_for_posts with invalid all entries for post meta
	 *
	 * @group csvexport
	 */
	#[Group( 'csvexport' )]
	public function test_get_export_data_for_posts_invalid_all_entries_meta() {
		/**
		 * Contact_Form_Plugin mock object.
		 *
		 * @var Contact_Form_Plugin $mock
		 */
		$mock = $this->getMockBuilder( Contact_Form_Plugin::class )
			->onlyMethods(
				array(
					'get_post_meta_for_csv_export',
					'get_parsed_field_contents_of_post',
					'get_post_content_for_csv_export',
					'map_parsed_field_contents_of_post_to_field_names',
				)
			)
			->disableOriginalConstructor()
			->getMock();

		$get_post_meta_for_csv_export_map = array(
			array( 15, false, null ),
			array( 16, false, null ),
		);

		$get_parsed_field_contents_of_post_map = array(
			array( 15, array( '_feedback_subject' => 'subj1' ) ),
			array( 16, array( '_feedback_subject' => 'subj2' ) ),
		);

		$get_post_content_for_csv_export_map = array(
			array( 15, 'This is my test 15' ),
			array( 16, 'This is my test 16' ),
		);

		$mapped_fields_contents_map = array(
			array(
				array(
					'_feedback_subject'      => 'subj1',
					'_feedback_main_comment' => 'This is my test 15',
				),
				true,
				array(
					'Contact Form' => 'subj1',
					'Comment'      => 'This is my test 15',
				),
			),
			array(
				array(
					'_feedback_subject'      => 'subj2',
					'_feedback_main_comment' => 'This is my test 16',
				),
				true,
				array(
					'Contact Form' => 'subj2',
					'Comment'      => 'This is my test 16',
				),
			),
		);

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_post_meta_for_csv_export' )
			->willReturnMap( $get_post_meta_for_csv_export_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_parsed_field_contents_of_post' )
			->willReturnMap( $get_parsed_field_contents_of_post_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_post_content_for_csv_export' )
			->willReturnMap( $get_post_content_for_csv_export_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'map_parsed_field_contents_of_post_to_field_names' )
			->willReturnMap( $mapped_fields_contents_map );

		$result = $mock->get_export_data_for_posts( array( 15, 16 ) );

		$expected_result = array(
			'Contact Form' => array( 'subj1', 'subj2' ),
			'Comment'      => array( 'This is my test 15', 'This is my test 16' ),
		);

		$this->assertEquals( $expected_result, $result );
	}

	/**
	 * Test get_export_data_for_posts with single invalid entry for parsed fields.
	 *
	 * @group csvexport
	 */
	#[Group( 'csvexport' )]
	public function test_get_export_data_for_posts_single_invalid_entry_for_parse_fields() {
		/**
		 * Contact_Form_Plugin mock object.
		 *
		 * @var Contact_Form_Plugin $mock
		 * */
		$mock = $this->getMockBuilder( Contact_Form_Plugin::class )
			->onlyMethods(
				array(
					'get_post_meta_for_csv_export',
					'get_parsed_field_contents_of_post',
					'get_post_content_for_csv_export',
					'map_parsed_field_contents_of_post_to_field_names',
				)
			)
			->disableOriginalConstructor()
			->getMock();

		$get_post_meta_for_csv_export_map = array(
			array(
				15,
				false,
				array(
					'key1' => 'value1',
					'key2' => 'value2',
					'key3' => 'value3',
					'key4' => 'value4',

				),
			),
			array(
				16,
				false,
				array(
					'key3' => 'value3',
					'key4' => 'value4',
					'key5' => 'value5',
					'key6' => 'value6',
				),
			),
		);

		$get_parsed_field_contents_of_post_map = array(
			array( 15, array() ),
			array( 16, array( '_feedback_subject' => 'subj2' ) ),
		);

		$get_post_content_for_csv_export_map = array(
			array( 15, 'This is my test 15' ),
			array( 16, 'This is my test 16' ),
		);

		$mapped_fields_contents_map = array(
			array(
				array(
					'_feedback_subject'      => 'subj1',
					'_feedback_main_comment' => 'This is my test 15',
				),
				true,
				array(
					'Contact Form' => 'subj1',
					'Comment'      => 'This is my test 15',
				),
			),
			array(
				array(
					'_feedback_subject'      => 'subj2',
					'_feedback_main_comment' => 'This is my test 16',
				),
				true,
				array(
					'Contact Form' => 'subj2',
					'Comment'      => 'This is my test 16',
				),
			),
		);

		$mock->expects( $this->once() )
			->method( 'get_post_meta_for_csv_export' )
			->willReturnMap( $get_post_meta_for_csv_export_map );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_parsed_field_contents_of_post' )
			->willReturnMap( $get_parsed_field_contents_of_post_map );

		$mock->expects( $this->once() )
			->method( 'get_post_content_for_csv_export' )
			->willReturnMap( $get_post_content_for_csv_export_map );

		$mock->expects( $this->once() )
			->method( 'map_parsed_field_contents_of_post_to_field_names' )
			->willReturnMap( $mapped_fields_contents_map );

		$result = $mock->get_export_data_for_posts( array( 15, 16 ) );

		$expected_result = array(
			'Contact Form' => array( 'subj2' ),
			'key3'         => array( 'value3' ),
			'key4'         => array( 'value4' ),
			'key5'         => array( 'value5' ),
			'key6'         => array( 'value6' ),
			'Comment'      => array( 'This is my test 16' ),
		);

		$this->assertEquals( $expected_result, $result );
	}

	/**
	 * Test get_export_data_for_posts with all entries for parsed fields invalid.
	 *
	 * @group csvexport
	 */
	#[Group( 'csvexport' )]
	public function test_get_export_data_for_posts_all_entries_for_parse_fields_invalid() {
		/**
		 * Contact_Form_Plugin mock object.
		 *
		 * @var Contact_Form_Plugin $mock
		 */
		$mock = $this->getMockBuilder( Contact_Form_Plugin::class )
			->onlyMethods(
				array(
					'get_post_meta_for_csv_export',
					'get_parsed_field_contents_of_post',
					'get_post_content_for_csv_export',
					'map_parsed_field_contents_of_post_to_field_names',
				)
			)
			->disableOriginalConstructor()
			->getMock();

		$get_parsed_field_contents_of_post_map = array(
			array( 15, array() ),
			array( 16, array() ),
		);

		$mock->expects( $this->never() )
			->method( 'get_post_meta_for_csv_export' );

		$mock->expects( $this->exactly( 2 ) )
			->method( 'get_parsed_field_contents_of_post' )
			->willReturnMap( $get_parsed_field_contents_of_post_map );

		$result = $mock->get_export_data_for_posts( array( 15, 16 ) );

		$expected_result = array();

		$this->assertEquals( $expected_result, $result );
	}

	/**
	 * Test map_parsed_field_contents_of_post_to_field_names
	 *
	 * @group csvexport
	 */
	#[Group( 'csvexport' )]
	public function test_map_parsed_field_contents_of_post_to_field_names() {

		$input_data = array(
			'test_field'             => 'moonstruck',
			'_feedback_subject'      => 'This is my form',
			'_feedback_author_email' => '',
			'_feedback_author'       => 'John Smith',
			'_feedback_author_url'   => 'http://example.com',
			'_feedback_main_comment' => 'This is my comment!',
			'another_field'          => 'thunderstruck',
		);

		$plugin = Contact_Form_Plugin::init();

		$result = $plugin->map_parsed_field_contents_of_post_to_field_names( $input_data );

		$expected_result = array(
			'1_Name'    => 'John Smith',
			'3_Website' => 'http://example.com',
			'4_Comment' => 'This is my comment!',
		);

		$this->assertEquals( $expected_result, $result );
	}

	/**
	 * Tests the functionality of 'Contact_Form_Plugin::personal_data_exporter'.
	 *
	 * @author jaswrks
	 */
	public function test_personal_data_exporter() {
		// Contact_Form_Plugin::personal_data_exporter uses `get_posts` internally making it currently untestable outside of a WP environment.
		$this->markTestSkipped();
		// @phan-suppress-next-line PhanPluginUnreachableCode
		$this->add_field_values(
			array(
				'name'     => 'John Doe',
				'email'    => 'john@example.com',
				'dropdown' => 'First option',
				'radio'    => 'Second option',
				'text'     => 'Texty text',
			)
		);

		$feedback_ids = array();

		for ( $i = 1; $i <= 2; $i++ ) {
			$form = new Contact_Form(
				array(
					'to'      => '"john" <john@example.com>',
					'subject' => 'Hello world! [ ' . wp_rand() . ' ]',
				),
				'
					[contact-field label="Name" type="name" required="1"/]
					[contact-field label="Email" type="email" required="1"/]
					[contact-field label="Dropdown" type="select" options="First option,Second option,Third option"/]
					[contact-field label="Radio" type="radio" options="First option,Second option,Third option"/]
					[contact-field label="Text" type="text"/]
				'
			);
			$this->assertTrue(
				is_string( $form->process_submission() ),
				'form submission ' . $i
			);

			$feedback_ids[] = end( Posts::init()->posts )->ID;
		}

		$posts = array_map(
			function ( $id ) {
				$submission = get_post( $id );

				$this->assertEquals( 'feedback', $submission->post_type, 'Post type doesn\'t match!' );

				return $submission;
			},
			$feedback_ids
		);

		$export = $this->plugin->personal_data_exporter( 'john@example.com' );

		$this->assertCount( 2, $posts, 'posts count matches' );
		$this->assertCount( 2, $export['data'], 'export[data] count matches' );

		foreach ( $export['data'] as $data ) {
			$this->assertSame( 'feedback', $data['group_id'], 'group_id matches' );
			$this->assertSame( 'Feedback', $data['group_label'], 'group_label matches' );
			$this->assertSame( true, ! empty( $data['item_id'] ), 'has item_id key' );
			$this->assertCount( 10, $data['data'], 'has total expected data keys' );
		}
	}

	/**
	 * Tests the functionality of 'Contact_Form_Plugin::personal_data_eraser'.
	 *
	 * @author jaswrks
	 */
	public function test_personal_data_eraser() {
		// Contact_Form_Plugin::personal_data_exporter uses `get_posts` internally making it currently untestable outside of a WP environment.
		$this->markTestSkipped();
		// @phan-suppress-next-line PhanPluginUnreachableCode
		$this->add_field_values(
			array(
				'name'  => 'John Doe',
				'email' => 'john@example.com',
			)
		);

		for ( $i = 1; $i <= 2; $i++ ) {
			$form = new Contact_Form(
				array(
					'to'      => '"john" <john@example.com>',
					'subject' => 'Hello world! [ ' . wp_rand() . ' ]',
				),
				'
					[contact-field label="Name" type="name" required="1"/]
					[contact-field label="Email" type="email" required="1"/]
				'
			);
			$this->assertTrue(
				is_string( $form->process_submission() ),
				'form submission ' . $i
			);
		}

		$posts = get_posts( array( 'post_type' => 'feedback' ) );
		$this->assertCount( 2, $posts, 'posts count matches before erasing' );

		$this->plugin->personal_data_eraser( 'john@example.com' );

		$posts = get_posts( array( 'post_type' => 'feedback' ) );
		$this->assertCount( 0, $posts, 'posts count matches after erasing' );
	}

	/**
	 * Tests the functionality of 'Contact_Form_Plugin::personal_data_eraser' with pagination.
	 */
	public function test_personal_data_eraser_pagination() {
		// Contact_Form_Plugin::personal_data_exporter uses `get_posts` internally making it currently untestable outside of a WP environment.
		$this->markTestSkipped();
		// @phan-suppress-next-line PhanPluginUnreachableCode
		$this->add_field_values(
			array(
				'name'  => 'Jane Doe',
				'email' => 'jane_doe@example.com',
			)
		);

		for ( $i = 1; $i <= 3; $i++ ) {
			$form = new Contact_Form(
				array(
					'to'      => '"jane" <jane_doe@example.com>',
					'subject' => 'Hello world! [ ' . wp_rand() . ' ]',
				),
				'
					[contact-field label="Name" type="name" required="1"/]
					[contact-field label="Email" type="email" required="1"/]
				'
			);
			$this->assertTrue(
				is_string( $form->process_submission() ),
				'form submission ' . $i
			);
		}

		$this->add_field_values(
			array(
				'name'  => 'Jane Doe Again',
				'email' => 'jane@example.com',
			)
		);

		$form = new Contact_Form(
			array(
				'to'      => '"jane" <jane@example.com>',
				'subject' => 'Hello world! [ ' . wp_rand() . ' ]',
			),
			'
				[contact-field label="Name" type="name" required="1"/]
				[contact-field label="Email" type="email" required="1"/]
			'
		);
		$this->assertTrue(
			is_string( $form->process_submission() ),
			'form submission ' . $i
		);

		$posts = get_posts( array( 'post_type' => 'feedback' ) );
		$this->assertCount( 4, $posts, 'posts count matches before erasing' );

		$this->plugin->_internal_personal_data_eraser( 'jane_doe@example.com', 1, 1 );
		$posts = get_posts( array( 'post_type' => 'feedback' ) );
		$this->assertCount( 3, $posts, 'posts count matches after page 1' );

		$this->plugin->_internal_personal_data_eraser( 'jane_doe@example.com', 2, 1 );
		$posts = get_posts( array( 'post_type' => 'feedback' ) );
		$this->assertCount( 2, $posts, 'posts count matches after page 2' );

		$this->plugin->_internal_personal_data_eraser( 'jane_doe@example.com', 3, 1 );
		$posts = get_posts( array( 'post_type' => 'feedback' ) );
		$this->assertCount( 1, $posts, 'posts count matches after page 3' );

		$this->plugin->_internal_personal_data_eraser( 'jane@example.com', 1, 1 );
		$posts = get_posts( array( 'post_type' => 'feedback' ) );
		$this->assertCount( 0, $posts, 'posts count matches after deleting the other feedback responder' );
	}

	/**
	 * Tests the functionality of the Util::grunion_contact_form_apply_block_attribute() function.
	 */
	public function test_grunion_contact_form_apply_block_attribute() {
		// No contact form block.
		$original = <<<EOT
<!-- wp:template-part {"slug":"post-meta-icons","theme":"pub/zoologist"} /-->

<!-- wp:spacer {"height":"150px"} -->
<div style="height:150px;" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"30px","right":"20px","bottom":"0px","left":"20px"}}},"layout":{"inherit":true}} -->
<div class="wp-block-group" style="padding-top:30px;padding-right:20px;padding-bottom:0;padding-left:20px;"><!-- wp:columns {"align":"wide","className":"next-prev-links"} -->
<div class="wp-block-columns alignwide next-prev-links"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"type":"previous","label":"←","showTitle":true} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"textAlign":"right","label":"→","showTitle":true} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:post-comments /--></div>
<!-- /wp:group -->
EOT;
		$expected = <<<EOT
<!-- wp:template-part {"slug":"post-meta-icons","theme":"pub/zoologist"} /-->

<!-- wp:spacer {"height":"150px"} -->
<div style="height:150px;" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"30px","right":"20px","bottom":"0px","left":"20px"}}},"layout":{"inherit":true}} -->
<div class="wp-block-group" style="padding-top:30px;padding-right:20px;padding-bottom:0;padding-left:20px;"><!-- wp:columns {"align":"wide","className":"next-prev-links"} -->
<div class="wp-block-columns alignwide next-prev-links"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"type":"previous","label":"←","showTitle":true} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"textAlign":"right","label":"→","showTitle":true} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:post-comments /--></div>
<!-- /wp:group -->
EOT;
		$this->assertEquals(
			$expected,
			Util::grunion_contact_form_apply_block_attribute( $original, array( 'foo' => 'bar' ) )
		);
		// Contact form block without attributes.
		$original = <<<EOT
<!-- wp:template-part {"slug":"post-meta-icons","theme":"pub/zoologist"} /-->

<!-- wp:spacer {"height":"150px"} -->
<div style="height:150px;" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/contact-form -->
<div class="wp-block-jetpack-contact-form"><!-- wp:jetpack/field-name {"label":"Single Template","required":true} /-->

<!-- wp:jetpack/field-textarea /-->

<!-- wp:jetpack/button {"element":"button","text":"Contact Us"} /--></div>
<!-- /wp:jetpack/contact-form -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"30px","right":"20px","bottom":"0px","left":"20px"}}},"layout":{"inherit":true}} -->
<div class="wp-block-group" style="padding-top:30px;padding-right:20px;padding-bottom:0;padding-left:20px;"><!-- wp:columns {"align":"wide","className":"next-prev-links"} -->
<div class="wp-block-columns alignwide next-prev-links"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"type":"previous","label":"←","showTitle":true} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"textAlign":"right","label":"→","showTitle":true} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:post-comments /--></div>
<!-- /wp:group -->
EOT;
		$expected = <<<EOT
<!-- wp:template-part {"slug":"post-meta-icons","theme":"pub/zoologist"} /-->

<!-- wp:spacer {"height":"150px"} -->
<div style="height:150px;" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/contact-form {"foo":"bar"} -->
<div class="wp-block-jetpack-contact-form"><!-- wp:jetpack/field-name {"label":"Single Template","required":true} /-->

<!-- wp:jetpack/field-textarea /-->

<!-- wp:jetpack/button {"element":"button","text":"Contact Us"} /--></div>
<!-- /wp:jetpack/contact-form -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"30px","right":"20px","bottom":"0px","left":"20px"}}},"layout":{"inherit":true}} -->
<div class="wp-block-group" style="padding-top:30px;padding-right:20px;padding-bottom:0;padding-left:20px;"><!-- wp:columns {"align":"wide","className":"next-prev-links"} -->
<div class="wp-block-columns alignwide next-prev-links"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"type":"previous","label":"←","showTitle":true} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"textAlign":"right","label":"→","showTitle":true} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:post-comments /--></div>
<!-- /wp:group -->
EOT;
		$this->assertEquals(
			$expected,
			Util::grunion_contact_form_apply_block_attribute( $original, array( 'foo' => 'bar' ) )
		);
		// Contact form block with attributes.
		$original = <<<EOT
<!-- wp:template-part {"slug":"post-meta-icons","theme":"pub/zoologist"} /-->

<!-- wp:spacer {"height":"150px"} -->
<div style="height:150px;" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/contact-form {"customThankyou":"message"} -->
<div class="wp-block-jetpack-contact-form"><!-- wp:jetpack/field-name {"label":"Single Template","required":true} /-->

<!-- wp:jetpack/field-textarea /-->

<!-- wp:jetpack/button {"element":"button","text":"Contact Us"} /--></div>
<!-- /wp:jetpack/contact-form -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"30px","right":"20px","bottom":"0px","left":"20px"}}},"layout":{"inherit":true}} -->
<div class="wp-block-group" style="padding-top:30px;padding-right:20px;padding-bottom:0;padding-left:20px;"><!-- wp:columns {"align":"wide","className":"next-prev-links"} -->
<div class="wp-block-columns alignwide next-prev-links"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"type":"previous","label":"←","showTitle":true} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"textAlign":"right","label":"→","showTitle":true} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:post-comments /--></div>
<!-- /wp:group -->
EOT;
		$expected = <<<EOT
<!-- wp:template-part {"slug":"post-meta-icons","theme":"pub/zoologist"} /-->

<!-- wp:spacer {"height":"150px"} -->
<div style="height:150px;" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/contact-form {"customThankyou":"message","foo":"bar"} -->
<div class="wp-block-jetpack-contact-form"><!-- wp:jetpack/field-name {"label":"Single Template","required":true} /-->

<!-- wp:jetpack/field-textarea /-->

<!-- wp:jetpack/button {"element":"button","text":"Contact Us"} /--></div>
<!-- /wp:jetpack/contact-form -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"30px","right":"20px","bottom":"0px","left":"20px"}}},"layout":{"inherit":true}} -->
<div class="wp-block-group" style="padding-top:30px;padding-right:20px;padding-bottom:0;padding-left:20px;"><!-- wp:columns {"align":"wide","className":"next-prev-links"} -->
<div class="wp-block-columns alignwide next-prev-links"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"type":"previous","label":"←","showTitle":true} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:post-navigation-link {"textAlign":"right","label":"→","showTitle":true} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:post-comments /--></div>
<!-- /wp:group -->
EOT;
		$this->assertEquals(
			$expected,
			Util::grunion_contact_form_apply_block_attribute( $original, array( 'foo' => 'bar' ) )
		);
	}
	/**
	 * Helper function that tracks the ids of the feedbacks that got created.
	 */
	public function track_feedback_inserted( $post_id ) {
		$this->track_feedback_inserted[] = $post_id;
	}
	/**
	 * Tests that multiple instances of the same form work correctly with unique IDs.
	 */
	public function test_multiple_form_instances_with_unique_ids() {
		global $post;

		add_action( 'grunion_after_feedback_post_inserted', array( $this, 'track_feedback_inserted' ), 10, 1 );

		$this->add_field_values(
			array(
				'name'    => 'First form name 1',
				'message' => 'First form message 1',
			),
			'g' . $post->ID
		);

		$form1 = new Contact_Form( array(), "[contact-field label='Name' type='name' required='1'/][contact-field label='Message' type='textarea' required='1'/]" );
		// Submit first form
		$result1 = $form1->process_submission();

		$this->assertTrue( is_string( $result1 ), 'First form submission should be successful' );

		$this->add_field_values(
			array(
				'name'    => 'First form name 2',
				'message' => 'First form message 2',
			),
			'g' . $post->ID . '-2-1' // The 2 here is the count and 1 is now always set for page number which in this case is 1.
		);

		$form2   = new Contact_Form( array(), "[contact-field label='Name' type='name' required='1'/][contact-field label='Message' type='textarea' required='1'/]" );
		$result2 = $form2->process_submission();

		$this->assertTrue( is_string( $result2 ), 'First form submission should be successful' );

		// Verify that the forms have different IDs
		$this->assertNotEquals( $form1->get_attribute( 'id' ), $form2->get_attribute( 'id' ), 'Forms should have unique IDs' );

		remove_action( 'grunion_after_feedback_post_inserted', array( $this, 'track_feedback_inserted' ), 10 );

		$this->assertCount( 2, $this->track_feedback_inserted, 'The number of feedback forms that were inserted does not match! Expected 2.' );

		// Add assertion to ensure array is not empty
		$this->assertNotEmpty( $this->track_feedback_inserted, 'No feedback forms were inserted' );

		$count = 1;
		foreach ( $this->track_feedback_inserted as $feedback_id ) {
			$feedback = get_post( $feedback_id );
			$this->assertStringContainsString( 'First form name ' . $count, $feedback->post_content );
			$this->assertStringContainsString( 'First form message ' . $count, $feedback->post_content );
			++$count;
		}
	}

	/**
	 * Tests that forms properly determine defaults even if the user doesn't exist anymore.
	 */
	public function test_form_defaults_to_admin_email_on_no_user_data() {
		global $post;

		// Removing the user without reassinging posts.
		wp_delete_user( (int) $post->post_author );

		$this->add_field_values(
			array(
				'name'    => 'First form name 1',
				'message' => 'First form message 1',
			),
			'g' . $post->ID
		);

		$form1 = new Contact_Form(
			array(),
			"[contact-field label='Name' type='name' required='1'/]"
			. "[contact-field label='Message' type='textarea' required='1'/]"
		);

		$this->assertEquals( $form1->defaults['to'], get_option( 'admin_email' ), 'The default to address should equal the admin email.' );
	}
} // end class
