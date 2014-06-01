var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./rule-statics');

/*
 * Schema definition.
 */
var StaticRoutingRuleSchema = new Schema({
  type       : {
    type    : String,
    required: true
  },
  from       : String,
  to         : String,
  iif        : String,
  oif        : String,
  tos        : String,
  dsfield    : String,
  fwmark     : String,
  priority   : {
    type    : Number,
    min     : 0,
    max     : 32767,
    unique  : true,
    required: true
  },
  table      : {
    type    : Number,
    min     : 0,
    max     : 2147483648, // 2 ^ 31
    required: true
  },
  realms     : String,
  nat        : String,
  description: String
});

/*
 * Static definitions.
 */
StaticRoutingRuleSchema.statics.purgeFromOSandDB = statics.purgeFromOSandDB;

exports.StaticRoutingRule = mongoose.model('StaticRoutingRule', StaticRoutingRuleSchema);