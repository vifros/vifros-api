var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./chain-statics');

/*
 * Schema definition.
 */
var NATChainSchema = new Schema({
  type       : {
    type    : String,
    enum    : [
      'source',
      'destination'
    ],
    required: true
  },
  name       : { // Must be less than 29 chars.
    type    : String,
    required: true
  },
  interfaces : {
    in : String,
    out: String
  },
  description: String
});

/*
 * Static definitions.
 */
NATChainSchema.statics.purgeFromOS = statics.purgeFromOS;
NATChainSchema.statics.setDefaultPolicy = statics.setDefaultPolicy;
NATChainSchema.statics.createFromObjectToOS = statics.createFromObjectToOS;
NATChainSchema.statics.buildRuleOptions = statics.buildRuleOptions;

exports.NATChain = mongoose.model('NATChain', NATChainSchema);