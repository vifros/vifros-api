var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./address-statics');

/*
 * Schema definition.
 */
var AddressSchema = new Schema({
  // Read-only.
  interface  : {
    type    : String,
    required: true
  },
  // Read-only.
  address    : {
    type    : String,
    required: true
  },
  // Read-only.
  peer       : String, // Used for pointopoint interfaces.
  // Read-only.
  broadcast  : String,
  // Read-only.
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