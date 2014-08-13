var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./rule-statics');

/*
 * Schema definition.
 *
 */
var StaticRoutingRuleSchema = new Schema({
  // Read-only.
  type       : {
    type    : String,
    required: true
  },
  // Read-only.
  from       : String,
  // Read-only.
  to         : String,
  // Read-only.
  iif        : String,
  // Read-only.
  oif        : String,
  // Read-only.
  tos        : String,
  // Read-only.
  dsfield    : String,
  // Read-only.
  fwmark     : String,
  // Read-only.
  priority   : {
    type    : Number,
    min     : 0,
    max     : 32767,
    unique  : true,
    required: true
  },
  // Read-only.
  table      : {
    type    : Number,
    min     : 0,
    max     : 2147483648, // 2 ^ 31
    required: true
  },
  // Read-only.
  realms     : String,
  // Read-only.
  nat        : String,
  description: String
});

/*
 * Static definitions.
 */
StaticRoutingRuleSchema.statics.purgeFromOSandDB = statics.purgeFromOSandDB;

exports.StaticRoutingRule = mongoose.model('StaticRoutingRule', StaticRoutingRuleSchema);