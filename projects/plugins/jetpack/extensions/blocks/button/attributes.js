import colorValidator from '../../shared/colorValidator';

export default {
	element: {
		type: 'string',
		enum: [ 'a', 'button', 'input' ],
	},
	saveInPostContent: {
		type: 'boolean',
		default: false,
	},
	uniqueId: {
		type: 'string',
	},
	passthroughAttributes: {
		type: 'object',
	},
	text: {
		type: 'string',
		role: 'content',
	},
	placeholder: {
		type: 'string',
		role: 'content',
	},
	url: {
		type: 'string',
		role: 'content',
	},
	textColor: {
		type: 'string',
	},
	customTextColor: {
		type: 'string',
		validator: colorValidator,
	},
	backgroundColor: {
		type: 'string',
	},
	customBackgroundColor: {
		type: 'string',
		validator: colorValidator,
	},
	gradient: {
		type: 'string',
	},
	customGradient: {
		type: 'string',
	},
	borderRadius: {
		type: 'number',
	},
	width: {
		type: 'string',
	},
	customVariant: {
		type: 'string',
	},
	metaName: {
		type: 'string',
	},
};
