var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./rule-statics');

/*
 * Schema definition.
 */
var NATRuleSchema = new Schema({
  chain      : {
    type    : String,
    required: true
  },
  protocol   : {
    inverted: Boolean,
    field   : String
  },
  source     : {
    inverted: Boolean,
    field   : String
  },
  destination: {
    inverted: Boolean,
    field   : String
  },
  to_nat     : {
    random    : Boolean,
    persistent: Boolean,
    field     : String
  },
  matches    : {},
  description: String
});

/*
 * Static definitions.
 */
NATRuleSchema.statics.createFromObjectToOS = statics.createFromObjectToOS;
NATRuleSchema.statics.purgeFromOS = statics.purgeFromOS;

exports.NATRule = mongoose.model('NATRule', NATRuleSchema);