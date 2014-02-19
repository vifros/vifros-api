var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./address-statics');

/*
 * Schema definition.
 */
var AddressSchema = new Schema({
	interface  : {
		type    : String,
		required: true
	},
	address    : {
		type    : String,
		required: true
	},
	peer       : String, // Used for pointopoint interfaces.
	broadcast  : String,
	scope      : String,
	description: String
});

/*
 * Static definitions.
 */
AddressSchema.statics.purgeFromOSandDB = statics.purgeFromOSandDB;
AddressSchema.statics.createFromOStoDB = statics.createFromOStoDB;
AddressSchema.statics.createFromDBtoOS = statics.createFromDBtoOS;

exports.Address = mongoose.model('Address', AddressSchema);