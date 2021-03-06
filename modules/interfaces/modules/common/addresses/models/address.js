var address_scopes = require('iproute').address.utils.scopes;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./address-statics');

/*
 * Schema definition.
 */
var AddressSchema = new Schema({
  // The pair interface:address have to be unique.
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
  broadcast  : String, // Can be '+' or '-' or an address/netmask string.
  // Read-only.
  scope      : {
    type: String,
    enum: [
      address_scopes.host,
      address_scopes.link,
      address_scopes.global,
      address_scopes.nowhere,
      address_scopes.site
    ]
  },
  description: String
});

/*
 * Static definitions.
 */
AddressSchema.statics.purgeFromOSandDB = statics.purgeFromOSandDB;
AddressSchema.statics.createFromOStoDB = statics.createFromOStoDB;
AddressSchema.statics.createFromDBtoOS = statics.createFromDBtoOS;
AddressSchema.statics.validate = statics.validate;

exports.Address = mongoose.model('Address', AddressSchema);