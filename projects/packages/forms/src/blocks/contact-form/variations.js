import { isWpcomPlatformSite } from '@automattic/jetpack-script-data';
import { hasFeatureFlag } from '@automattic/jetpack-shared-extension-utils';
import { Path } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import { compact } from 'lodash';
import renderMaterialIcon from '../shared/components/render-material-icon';
import { getIconColor } from '../shared/util/block-icons';

const variations = compact( [
	{
		name: 'regular-form',
		title: __( 'Form', 'jetpack-forms' ),
		icon: {
			foreground: getIconColor(),
			src: renderMaterialIcon(
				<>
					<Path d="m13 7.5 h 5 v 1.5 h -5 v -1.5z" />
					<Path d="m13 15 h 5 v 1.5 h -5 v -1.5z" />
					<Path d="m19.01,3H4.99c-1.1,0-1.99.89-1.99,1.99v14.02c0,1.1.89,1.99,1.99,1.99h14.02c1.1,0,1.99-.89,1.99-1.99V4.99c0-1.1-.89-1.99-1.99-1.99Zm.49,15.99c0,.28-.23.51-.51.51H5.01c-.28,0-.51-.23-.51-.51V5.01c0-.28.23-.51.51-.51h13.98c.28,0,.51.23.51.51v13.98Z" />
					<Path d="m9.46,13h-1.92c-.85,0-1.54.69-1.54,1.54v1.92c0,.85.69,1.54,1.54,1.54h1.92c.85,0,1.54-.69,1.54-1.54v-1.92c0-.85-.69-1.54-1.54-1.54Zm.04,3.5h-2v-2h2v2Z" />
					<Path d="m9.46,6h-1.92c-.85,0-1.54.69-1.54,1.54v1.92c0,.85.69,1.54,1.54,1.54h1.92c.85,0,1.54-.69,1.54-1.54v-1.92c0-.85-.69-1.54-1.54-1.54Zm.04,3.5h-2v-2h2v2Z" />
				</>
			),
		},
		attributes: {
			variationName: 'default-empty',
		},
		scope: [ 'transform' ],
		isActive: ( { variationName } ) => variationName !== 'multistep',
	},
	{
		name: 'contact-form',
		title: __( 'Contact Form', 'jetpack-forms' ),
		description: __( 'Add a contact form to your page.', 'jetpack-forms' ),
		icon: {
			foreground: getIconColor(),
			src: renderMaterialIcon(
				<>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M12 5.3203L6.6477 9L12 12.6797L17.3523 9L12 5.3203ZM12 3.5L4 9L12 14.5L20 9L12 3.5Z"
					/>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M4 18V9H5.5V18C5.5 18.4142 5.83579 18.75 6.25 18.75H17.75C18.1642 18.75 18.5 18.4142 18.5 18V9H20V18C20 19.2426 18.9926 20.25 17.75 20.25H6.25C5.00736 20.25 4 19.2426 4 18Z"
					/>
				</>
			),
		},
		innerBlocks: [
			[
				'jetpack/field-name',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Name', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-email',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Email', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-textarea',
				{},
				[
					[ 'jetpack/label', { label: __( 'Message', 'jetpack-forms' ) } ],
					[ 'jetpack/input', { type: 'textarea' } ],
				],
			],
			[
				'jetpack/button',
				{
					text: __( 'Contact Us', 'jetpack-forms' ),
					element: 'button',
					lock: { remove: true },
				},
			],
		],
		attributes: {
			variationName: 'default',
		},
	},
	{
		name: 'rsvp-form',
		title: __( 'RSVP Form', 'jetpack-forms' ),
		description: __( 'Add an RSVP form to your page', 'jetpack-forms' ),
		icon: {
			foreground: getIconColor(),
			src: renderMaterialIcon(
				<>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M7.87868 15.5L5.5 17.8787L5.5 6C5.5 5.72386 5.72386 5.5 6 5.5L18 5.5C18.2761 5.5 18.5 5.72386 18.5 6L18.5 15C18.5 15.2761 18.2761 15.5 18 15.5L7.87868 15.5ZM8.5 17L18 17C19.1046 17 20 16.1046 20 15L20 6C20 4.89543 19.1046 4 18 4L6 4C4.89543 4 4 4.89543 4 6L4 18.9393C4 19.5251 4.47487 20 5.06066 20C5.34196 20 5.61175 19.8883 5.81066 19.6893L8.5 17Z"
					/>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M15.6087 7.93847L11.4826 13.6692L8.45898 10.5196L9.54107 9.48084L11.3175 11.3313L14.3914 7.06201L15.6087 7.93847Z"
					/>
				</>
			),
		},
		innerBlocks: [
			[
				'jetpack/field-name',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Name', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-email',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Email', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-radio',
				{ required: true },
				[
					[ 'jetpack/label', { label: __( 'Attending?', 'jetpack-forms' ) } ],
					[
						'jetpack/options',
						{ type: 'radio' },
						[
							[
								'jetpack/option',
								{
									label: __( 'Yes', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
							[
								'jetpack/option',
								{
									label: __( 'No', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
						],
					],
				],
			],
			[
				'jetpack/field-textarea',
				{},
				[
					[ 'jetpack/label', { label: __( 'Other details', 'jetpack-forms' ) } ],
					[ 'jetpack/input', { type: 'textarea' } ],
				],
			],
			[
				'jetpack/button',
				{
					text: __( 'Send RSVP', 'jetpack-forms' ),
					element: 'button',
					lock: { remove: true },
				},
			],
		],
		attributes: {
			subject: __( 'A new RSVP from your website', 'jetpack-forms' ),
		},
		example: {
			innerBlocks: [
				{
					name: 'jetpack/field-name',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Name', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-email',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Email', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-radio',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Attending?', 'jetpack-forms' ) } },
						{
							name: 'jetpack/options',
							attributes: { type: 'radio' },
							innerBlocks: [
								{
									name: 'jetpack/option',
									attributes: {
										label: __( 'Yes', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
								{
									name: 'jetpack/option',
									attributes: {
										label: __( 'No', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
							],
						},
					],
				},
				{
					name: 'jetpack/field-textarea',
					innerBlocks: [
						{
							name: 'jetpack/label',
							attributes: { label: __( 'Other details', 'jetpack-forms' ) },
						},
						{ name: 'jetpack/input', attributes: { type: 'textarea' } },
					],
				},
				{
					name: 'jetpack/button',
					attributes: {
						text: __( 'Send RSVP', 'jetpack-forms' ),
						element: 'button',
						lock: { remove: true },
					},
				},
			],
		},
	},
	{
		name: 'registration-form',
		title: __( 'Registration Form', 'jetpack-forms' ),
		description: __( 'Add a Registration form to your page', 'jetpack-forms' ),
		icon: {
			foreground: getIconColor(),
			src: renderMaterialIcon(
				<>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M18.5 5.5V8H20V5.5H22.5V4H20V1.5H18.5V4H16V5.5H18.5ZM12 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12H18.5V18C18.5 18.2761 18.2761 18.5 18 18.5H6C5.72386 18.5 5.5 18.2761 5.5 18V6C5.5 5.72386 5.72386 5.5 6 5.5H12V4Z"
					/>
					<Path d="M16.75 17.5V15.5C16.75 13.9812 15.5188 12.75 14 12.75H10C8.48122 12.75 7.25 13.9812 7.25 15.5V17.5H8.75V15.5C8.75 14.8096 9.30964 14.25 10 14.25H14C14.6904 14.25 15.25 14.8096 15.25 15.5V17.5H16.75Z" />
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9ZM13 9C13 9.55228 12.5523 10 12 10C11.4477 10 11 9.55228 11 9C11 8.44772 11.4477 8 12 8C12.5523 8 13 8.44772 13 9Z"
					/>
				</>
			),
		},
		innerBlocks: [
			[
				'jetpack/field-name',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Name', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-email',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Email', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-telephone',
				{},
				[ [ 'jetpack/label', { label: __( 'Phone', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-select',
				{
					options: [
						__( 'Search engine', 'jetpack-forms' ),
						__( 'Social media', 'jetpack-forms' ),
						__( 'TV', 'jetpack-forms' ),
						__( 'Radio', 'jetpack-forms' ),
						__( 'Friend or family', 'jetpack-forms' ),
					],
				},
				[
					[ 'jetpack/label', { label: __( 'How did you hear about us?', 'jetpack-forms' ) } ],
					[
						'jetpack/input',
						{
							type: 'dropdown',
							placeholder: __( 'Select one option', 'jetpack-forms' ),
						},
					],
				],
			],
			[
				'jetpack/field-textarea',
				{},
				[
					[
						'jetpack/label',
						{
							label: __( 'Other details', 'jetpack-forms' ),
						},
					],
					[ 'jetpack/input', { type: 'textarea' } ],
				],
			],
			[
				'jetpack/button',
				{
					text: __( 'Send', 'jetpack-forms' ),
					element: 'button',
					lock: { remove: true },
				},
			],
		],
		attributes: {
			subject: __( 'A new registration from your website', 'jetpack-forms' ),
		},
		example: {
			innerBlocks: [
				{
					name: 'jetpack/field-name',
					attributes: { required: true },
					innerBlocks: [
						{
							name: 'jetpack/label',
							attributes: { label: __( 'Name', 'jetpack-forms' ) },
						},
						{
							name: 'jetpack/input',
						},
					],
				},
				{
					name: 'jetpack/field-email',
					attributes: { required: true },
					innerBlocks: [
						{
							name: 'jetpack/label',
							attributes: { label: __( 'Email', 'jetpack-forms' ) },
						},
						{
							name: 'jetpack/input',
						},
					],
				},
				{
					name: 'jetpack/field-telephone',
					innerBlocks: [
						{
							name: 'jetpack/label',
							attributes: { label: __( 'Phone', 'jetpack-forms' ) },
						},
						{
							name: 'jetpack/input',
						},
					],
				},
				{
					name: 'jetpack/field-select',
					attributes: {
						options: [
							__( 'Search Engine', 'jetpack-forms' ),
							__( 'Social Media', 'jetpack-forms' ),
							__( 'TV', 'jetpack-forms' ),
							__( 'Radio', 'jetpack-forms' ),
							__( 'Friend or Family', 'jetpack-forms' ),
						],
					},
					innerBlocks: [
						{
							name: 'jetpack/label',
							attributes: {
								label: __( 'How did you hear about us?', 'jetpack-forms' ),
							},
						},
						{
							name: 'jetpack/input',
							attributes: {
								type: 'dropdown',
								placeholder: __( 'Select one option', 'jetpack-forms' ),
							},
						},
					],
				},
				{
					name: 'jetpack/field-textarea',
					innerBlocks: [
						{
							name: 'jetpack/label',
							attributes: {
								label: __( 'Other details', 'jetpack-forms' ),
							},
						},
						{
							name: 'jetpack/input',
							attributes: {
								type: 'textarea',
							},
						},
					],
				},
				{
					name: 'jetpack/button',
					attributes: {
						text: __( 'Send', 'jetpack-forms' ),
						element: 'button',
						lock: { remove: true },
					},
				},
			],
		},
	},
	{
		name: 'appointment-form',
		title: __( 'Appointment Form', 'jetpack-forms' ),
		description: __( 'Add an Appointment booking form to your page', 'jetpack-forms' ),
		icon: {
			foreground: getIconColor(),
			src: renderMaterialIcon(
				<>
					<Path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V8H4V6Z" />
					<Path d="M7 9.25H11V13.25H7V9.25Z" />
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M6 5.5H18C18.2761 5.5 18.5 5.72386 18.5 6V12H20V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H12V18.5H6C5.72386 18.5 5.5 18.2761 5.5 18V6C5.5 5.72386 5.72386 5.5 6 5.5Z"
					/>
					<Path fillRule="evenodd" clipRule="evenodd" d="M17.25 21V15H18.75V21H17.25Z" />
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M15 17.25L21 17.25L21 18.75L15 18.75L15 17.25Z"
					/>
				</>
			),
		},
		innerBlocks: [
			[
				'jetpack/field-name',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Name', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-email',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Email', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-telephone',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Phone', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-date',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Date', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-radio',
				{ required: true },
				[
					[ 'jetpack/label', { label: __( 'Time', 'jetpack-forms' ) } ],
					[
						'jetpack/options',
						{ type: 'radio' },
						[
							[
								'jetpack/option',
								{
									label: __( 'Morning', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
							[
								'jetpack/option',
								{
									label: __( 'Afternoon', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
						],
					],
				],
			],
			[
				'jetpack/field-textarea',
				{},
				[
					[ 'jetpack/label', { label: __( 'Notes', 'jetpack-forms' ) } ],
					[ 'jetpack/input', { type: 'textarea' } ],
				],
			],
			[
				'jetpack/button',
				{
					text: __( 'Book appointment', 'jetpack-forms' ),
					element: 'button',
					lock: { remove: true },
				},
			],
		],
		attributes: {
			subject: __( 'A new appointment booked from your website', 'jetpack-forms' ),
		},
		example: {
			innerBlocks: [
				{
					name: 'jetpack/field-name',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Name', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-email',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Email', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-telephone',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Phone', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-date',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Date', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-radio',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Time', 'jetpack-forms' ) } },
						{
							name: 'jetpack/options',
							attributes: { type: 'radio' },
							innerBlocks: [
								{
									name: 'jetpack/option',
									attributes: {
										label: __( 'Morning', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
								{
									name: 'jetpack/option',
									attributes: {
										label: __( 'Afternoon', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
							],
						},
					],
				},
				{
					name: 'jetpack/field-textarea',
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Notes', 'jetpack-forms' ) } },
						{ name: 'jetpack/input', attributes: { type: 'textarea' } },
					],
				},
				{
					name: 'jetpack/button',
					attributes: {
						text: __( 'Book appointment', 'jetpack-forms' ),
						element: 'button',
						lock: { remove: true },
					},
				},
			],
		},
	},
	{
		name: 'feedback-form',
		title: __( 'Feedback Form', 'jetpack-forms' ),
		description: __( 'Add a feedback form to your page', 'jetpack-forms' ),
		icon: {
			foreground: getIconColor(),
			src: renderMaterialIcon(
				<>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
					/>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M9.5 11C10.3284 11 11 10.3284 11 9.5C11 8.67157 10.3284 8 9.5 8C8.67157 8 8 8.67157 8 9.5C8 10.3284 8.67157 11 9.5 11Z"
					/>
					<Path d="M16 9.5C16 10.3284 15.3284 11 14.5 11C13.6716 11 13 10.3284 13 9.5C13 8.67157 13.6716 8 14.5 8C15.3284 8 16 8.67157 16 9.5Z" />
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M14.5 11C15.3284 11 16 10.3284 16 9.5C16 8.67157 15.3284 8 14.5 8C13.6716 8 13 8.67157 13 9.5C13 10.3284 13.6716 11 14.5 11Z"
					/>
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M8.16492 14.6566L7.41431 13.7183L8.58561 12.7812L9.33622 13.7195C9.98358 14.5287 10.9637 14.9998 12 14.9998C13.0362 14.9998 14.0163 14.5287 14.6637 13.7195L15.4143 12.7812L16.5856 13.7183L15.835 14.6566C14.903 15.8216 13.4919 16.4998 12 16.4998C10.508 16.4998 9.09693 15.8216 8.16492 14.6566Z"
					/>
				</>
			),
		},
		innerBlocks: [
			[
				'jetpack/field-name',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Name', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-email',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Email', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-radio',
				{ required: true },
				[
					[ 'jetpack/label', { label: __( 'Please rate our website', 'jetpack-forms' ) } ],
					[
						'jetpack/options',
						{ type: 'radio' },
						[
							[
								'jetpack/option',
								{
									label: __( '1 - Very Bad', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
							[
								'jetpack/option',
								{
									label: __( '2 - Poor', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
							[
								'jetpack/option',
								{
									label: __( '3 - Average', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
							[
								'jetpack/option',
								{
									label: __( '4 - Good', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
							[
								'jetpack/option',
								{
									label: __( '5 - Excellent', 'jetpack-forms' ),
									placeholder: __( 'Add option…', 'jetpack-forms' ),
								},
							],
						],
					],
				],
			],
			[
				'jetpack/field-textarea',
				{},
				[
					[ 'jetpack/label', { label: __( 'How could we improve?', 'jetpack-forms' ) } ],
					[ 'jetpack/input', { type: 'textarea' } ],
				],
			],
			[
				'jetpack/button',
				{
					text: __( 'Send Feedback', 'jetpack-forms' ),
					element: 'button',
					lock: { remove: true },
				},
			],
		],
		attributes: {
			subject: __( 'New feedback received from your website', 'jetpack-forms' ),
		},
		example: {
			innerBlocks: [
				{
					name: 'jetpack/field-name',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Name', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-email',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Email', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-radio',
					attributes: { required: true },
					innerBlocks: [
						{
							name: 'jetpack/label',
							attributes: { label: __( 'Please rate our website', 'jetpack-forms' ) },
						},
						{
							name: 'jetpack/options',
							attributes: { type: 'radio' },
							innerBlocks: [
								{
									name: 'jetpack/option',
									attributes: {
										label: __( '1 - Very Bad', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
								{
									name: 'jetpack/option',
									attributes: {
										label: __( '2 - Poor', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
								{
									name: 'jetpack/option',
									attributes: {
										label: __( '3 - Average', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
								{
									name: 'jetpack/option',
									attributes: {
										label: __( '4 - Good', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
								{
									name: 'jetpack/option',
									attributes: {
										label: __( '5 - Excellent', 'jetpack-forms' ),
										placeholder: __( 'Add option…', 'jetpack-forms' ),
									},
								},
							],
						},
					],
				},
				{
					name: 'jetpack/field-textarea',
					innerBlocks: [
						{
							name: 'jetpack/label',
							attributes: { label: __( 'How could we improve?', 'jetpack-forms' ) },
						},
						{ name: 'jetpack/input', attributes: { type: 'textarea' } },
					],
				},
				{
					name: 'jetpack/button',
					attributes: {
						text: __( 'Send Feedback', 'jetpack-forms' ),
						element: 'button',
						lock: { remove: true },
					},
				},
			],
		},
	},
	hasFeatureFlag( 'multistep-form' ) && {
		name: 'multistep-form',
		title: __( 'Multistep Form', 'jetpack-forms' ),
		description: __( 'Create a form that spans multiple steps.', 'jetpack-forms' ),
		icon: {
			foreground: getIconColor(),
			src: renderMaterialIcon(
				<>
					<Path
						d="M7.3501 12C7.3501 10.7574 6.34274 9.75 5.1001 9.75C3.85746 9.75 2.8501 10.7574 2.8501 12C2.8501 13.2426 3.85746 14.25 5.1001 14.25C6.34274 14.25 7.3501 13.2426 7.3501 12Z"
						stroke="currentColor"
						strokeWidth="1.5"
						fill="none"
						className="icon-filler"
					/>
					<Path
						d="M14.3501 12C14.3501 10.7574 13.3427 9.75 12.1001 9.75C10.8575 9.75 9.8501 10.7574 9.8501 12C9.8501 13.2426 10.8575 14.25 12.1001 14.25C13.3427 14.25 14.3501 13.2426 14.3501 12Z"
						stroke="currentColor"
						strokeWidth="1.5"
						fill="none"
						className="icon-filler"
					/>
					<Path
						d="M21.3501 12C21.3501 10.7574 20.3427 9.75 19.1001 9.75C17.8575 9.75 16.8501 10.7574 16.8501 12C16.8501 13.2426 17.8575 14.25 19.1001 14.25C20.3427 14.25 21.3501 13.2426 21.3501 12Z"
						stroke="currentColor"
						strokeWidth="1.5"
						fill="none"
						className="icon-filler"
					/>
					<Path
						d="M19.1001 18.8636C19.1001 21.1364 17.4668 22.5 15.6001 22.5C13.7334 22.5 12.1001 21.5 12.1001 18.8636V16.5"
						stroke="currentColor"
						strokeWidth="1.5"
						fill="none"
						className="icon-filler"
					/>
					<Path d="M21.6001 19H20.1001H18.6001H16.6001L19.1001 16L21.6001 19Z" />
					<Path
						d="M12.1001 5.1364C12.1001 2.8636 10.4668 1.5 8.6001 1.5C6.73343 1.5 5.1001 2.5 5.1001 5.1364V7.5"
						stroke="currentColor"
						strokeWidth="1.5"
						fill="none"
						className="icon-filler"
					/>
					<Path d="M14.6001 5H13.1001H11.6001H9.6001L12.1001 8L14.6001 5Z" />
				</>
			),
		},
		innerBlocks: [
			[ 'jetpack/form-progress-indicator', {} ],
			[
				'jetpack/form-step-container',
				{},
				[
					[
						'jetpack/form-step',
						{ stepLabel: __( "Let's get acquainted", 'jetpack-forms' ) },
						[
							[
								'jetpack/field-name',
								{ placeholder: __( 'Jamie Smith', 'jetpack-forms' ) },
								[
									[ 'jetpack/label', { label: __( 'Name', 'jetpack-forms' ) } ],
									[ 'jetpack/input' ],
								],
							],
							[
								'jetpack/field-email',
								{
									required: true,
									placeholder: __( 'jamie.smith@example.com', 'jetpack-forms' ),
								},
								[
									[ 'jetpack/label', { label: __( 'Email Address', 'jetpack-forms' ) } ],
									[ 'jetpack/input' ],
								],
							],
							[
								'jetpack/field-select',
								{
									options: [
										__( 'I need help', 'jetpack-forms' ),
										__( "I'm interested in your services", 'jetpack-forms' ),
										__( 'Just exploring', 'jetpack-forms' ),
									],
								},
								[
									[
										'jetpack/label',
										{ label: __( 'What brings you here today?', 'jetpack-forms' ) },
									],
									[
										'jetpack/input',
										{ type: 'dropdown', placeholder: __( 'Select one option', 'jetpack-forms' ) },
									],
								],
							],
						],
					],
					[
						'jetpack/form-step',
						{ stepLabel: __( 'How can we help?', 'jetpack-forms' ) },
						[
							[
								'jetpack/field-textarea',
								{},
								[
									[
										'jetpack/label',
										{ label: __( 'What do you need help with?', 'jetpack-forms' ) },
									],
									[ 'jetpack/input', { type: 'textarea' } ],
								],
							],
							[
								'jetpack/field-select',
								{
									options: [
										__( 'Urgent (within 1 business day)', 'jetpack-forms' ),
										__( 'High priority (1–2 business days)', 'jetpack-forms' ),
										__( 'Normal (3–5 business days)', 'jetpack-forms' ),
										__( 'Flexible / No specific deadline', 'jetpack-forms' ),
									],
								},
								[
									[
										'jetpack/label',
										{ label: __( 'How soon do you need a response?', 'jetpack-forms' ) },
									],
									[
										'jetpack/input',
										{ type: 'dropdown', placeholder: __( 'Select one option', 'jetpack-forms' ) },
									],
								],
							],
						],
					],
					[
						'jetpack/form-step',
						{ stepLabel: __( 'Preferences', 'jetpack-forms' ) },
						[
							[
								'jetpack/field-select',
								{
									options: [
										__( 'Email', 'jetpack-forms' ),
										__( 'Phone call', 'jetpack-forms' ),
										__( 'Text message', 'jetpack-forms' ),
										__( 'WhatsApp', 'jetpack-forms' ),
									],
								},
								[
									[
										'jetpack/label',
										{ label: __( 'Preferred way to hear from us', 'jetpack-forms' ) },
									],
									[
										'jetpack/input',
										{ type: 'dropdown', placeholder: __( 'Select one option', 'jetpack-forms' ) },
									],
								],
							],
							[
								'jetpack/field-telephone',
								{},
								[
									[ 'jetpack/label', { label: __( 'Phone Number', 'jetpack-forms' ) } ],
									[
										'jetpack/input',
										{
											placeholder: __(
												"If you'd rather chat by phone, just leave your number here.",
												'jetpack-forms'
											),
										},
									],
								],
							],
							[
								'core/paragraph',
								{
									content: __(
										"✨ That's it! Send it over and we'll take care of the rest.",
										'jetpack-forms'
									),
								},
							],
						],
					],
				],
			],
			[
				'jetpack/form-step-navigation',
				{ layout: { type: 'flex', justifyContent: 'right' } },
				[
					[
						'jetpack/button',
						{
							element: 'button',
							uniqueId: 'previous-step',
							customVariant: 'previous',
							text: __( '← Back', 'jetpack-forms' ),
							className: 'is-style-outline',
							metaName: __( 'Previous button', 'jetpack-forms' ),
						},
					],
					[
						'jetpack/button',
						{
							element: 'button',
							uniqueId: 'next-step',
							customVariant: 'next',
							text: __( 'Next →', 'jetpack-forms' ),
							metaName: __( 'Next button', 'jetpack-forms' ),
						},
					],
					[
						'jetpack/button',
						{
							element: 'button',
							uniqueId: 'submit-step',
							customVariant: 'submit',
							text: __( 'Submit', 'jetpack-forms' ),
							metaName: __( 'Submit button', 'jetpack-forms' ),
						},
					],
				],
			],
		],
		attributes: {
			variationName: 'multistep',
		},
		scope: [ 'block', 'inserter', 'transform' ],
		isActive: [ 'variationName' ],
	},
	! isWpcomPlatformSite() && {
		name: 'lead-capture-form',
		title: __( 'Lead capture', 'jetpack-forms' ),
		description: __( 'A simple way to collect leads using forms on your site.', 'jetpack-forms' ),
		keywords: [
			_x( 'subscribe', 'block search term', 'jetpack-forms' ),
			_x( 'email', 'block search term', 'jetpack-forms' ),
			_x( 'signup', 'block search term', 'jetpack-forms' ),
		],
		icon: {
			foreground: getIconColor(),
			src: people,
		},
		innerBlocks: [
			[
				'jetpack/field-name',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Name', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-email',
				{ required: true },
				[ [ 'jetpack/label', { label: __( 'Email', 'jetpack-forms' ) } ], [ 'jetpack/input' ] ],
			],
			[
				'jetpack/field-consent',
				{},
				[ [ 'jetpack/label' ], [ 'jetpack/input', { type: 'checkbox' } ] ],
			],
			[
				'jetpack/button',
				{
					text: __( 'Subscribe', 'jetpack-forms' ),
					element: 'button',
					lock: { remove: true },
				},
			],
		],
		attributes: {},
		example: {
			innerBlocks: [
				{
					name: 'jetpack/field-name',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Name', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-email',
					attributes: { required: true },
					innerBlocks: [
						{ name: 'jetpack/label', attributes: { label: __( 'Email', 'jetpack-forms' ) } },
						{ name: 'jetpack/input' },
					],
				},
				{
					name: 'jetpack/field-consent',
					attributes: {},
					innerBlocks: [
						{ name: 'jetpack/label' },
						{ name: 'jetpack/input', attributes: { type: 'checkbox' } },
					],
				},
				{
					name: 'jetpack/button',
					attributes: {
						text: __( 'Subscribe', 'jetpack-forms' ),
						element: 'button',
						lock: { remove: true },
					},
				},
			],
		},
	},
] );

export default variations;
