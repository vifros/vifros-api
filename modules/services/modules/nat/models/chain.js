var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./chain-statics');

/*
 * Schema definition.
 */
var NATChainSchema = new Schema({
  // Read-only.
  type       : {
    type    : String,
    enum    : [
      'source',
      'destination'
    ],
    required: true
  },
  // Must be less than 29 chars.
  name       : {
    type    : String,
    required: true
  },
  /*
   * Both are valid & required with type `bidirectional`.
   * `oif` is valid only with type `source`.
   * `iif`  is valid only with type `destination`.
   *
   * Validate existence against Interfaces.
   */
  iif        : String, // in interface.
  oif        : String, // out interface.
  // Must be less than 256 chars.
  description: String
});

/*
 * Static definitions.
 */
NATChainSchema.statics.purgeFromOS = statics.purgeFromOS;
NATChainSchema.statics.setDefaultPolicy = statics.setDefaultPolicy;
NATChainSchema.statics.buildRuleOptions = statics.buildRuleOptions;
NATChainSchema.statics.createFromObjectToOS = statics.createFromObjectToOS;
NATChainSchema.statics.validate = statics.validate;

exports.NATChain = mongoose.model('NATChain', NATChainSchema);