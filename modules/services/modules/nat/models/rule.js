var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./rule-statics');

/*
 * Schema definition.
 */
var NATRuleSchema = new Schema({
  /*
   * Validate existence against NATChains.
   * Read-only.
   */
  chain      : {
    type    : String,
    required: true
  },
  protocol   : {
    inverted: Boolean,
    value   : String
  },
  source     : {
    inverted: Boolean,
    value   : String
  },
  destination: {
    inverted: Boolean,
    value   : String
  },
  to_nat     : {
    random    : Boolean,
    persistent: Boolean,
    value     : String
  },
  matches    : {}
});

/*
 * Static definitions.
 */
NATRuleSchema.statics.createFromObjectToOS = statics.createFromObjectToOS;
NATRuleSchema.statics.purgeFromOS = statics.purgeFromOS;

exports.NATRule = mongoose.model('NATRule', NATRuleSchema);