var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var SettingSchema = new Schema({
	module     : {
		type    : String,
		required: true
	},
	name       : {
		type    : String,
		required: true
	},
	value      : {
		type    : Schema.Types.Mixed, // To being able to save a commodity of values (strings & objects).
		required: true
	},
	description: String
});

exports.Setting = mongoose.model('Setting', SettingSchema);

exports.statuses = {
	enabled : 'enabled',
	disabled: 'disabled'
};